import * as XLSX from "xlsx";

export interface ParsedCustomerRecord {
  id?: string;
  name: string;
  phone: string;
  city: string;
  product: string;
  debit: number;
  credit: number;
  balance: number;
  status: "active" | "at_risk" | "inactive" | string;
  isValid: boolean;
  error?: string;
}

const cleanStr = (val: unknown): string => {
  if (val === null || val === undefined) return "";
  return String(val).trim();
};

const cleanNum = (val: unknown): number => {
  if (val === null || val === undefined) return 0;
  if (typeof val === "number") return isNaN(val) ? 0 : val;
  const cleaned = String(val).replace(/[^0-9.-]/g, "");
  const num = parseFloat(cleaned);
  return isNaN(num) ? 0 : num;
};

const resolveStatus = (val: unknown): string => {
  const s = cleanStr(val).toLowerCase();
  if (s.includes("risk") || s.includes("pending") || s.includes("overdue") || s.includes("partial")) return "at_risk";
  if (s.includes("inactive") || s.includes("block") || s.includes("closed")) return "inactive";
  return "active";
};

// Column header matching — returns index in a string-array of lowercase header cells
const findCol = (headers: string[], ...keywords: string[]): number =>
  headers.findIndex(h => keywords.some(k => h.includes(k)));

async function parseExcel(file: File): Promise<ParsedCustomerRecord[]> {
  const buffer = await file.arrayBuffer();
  const wb = XLSX.read(buffer, { type: "array" });
  const sheetName = wb.SheetNames[0];
  if (!sheetName) throw new Error("No worksheets found in the uploaded file.");
  const sheet = wb.Sheets[sheetName];
  const rows = XLSX.utils.sheet_to_json<unknown[]>(sheet, { header: 1, defval: "" });
  if (!rows || rows.length === 0) throw new Error("File is empty.");

  // Detect header row
  let headerRowIdx = 0;
  let colMap = { name: 0, phone: 1, city: 2, product: 3, debit: 4, credit: 5, status: 6 };

  for (let i = 0; i < Math.min(rows.length, 15); i++) {
    const r = (rows[i] as unknown[]).map(c => cleanStr(c).toLowerCase());
    const ni = findCol(r, "name", "customer", "client", "party");
    const pi = findCol(r, "phone", "mobile", "contact", "cell");
    const di = findCol(r, "debit", "billed", "invoice");
    const ci = findCol(r, "credit", "paid", "payment", "received");
    if (ni !== -1 || di !== -1 || ci !== -1) {
      headerRowIdx = i;
      colMap = {
        name: ni !== -1 ? ni : 0,
        phone: pi !== -1 ? pi : 1,
        city: findCol(r, "city", "location", "address", "town") !== -1 ? findCol(r, "city", "location", "address", "town") : 2,
        product: findCol(r, "product", "item", "purchased", "goods") !== -1 ? findCol(r, "product", "item", "purchased", "goods") : 3,
        debit: di !== -1 ? di : 4,
        credit: ci !== -1 ? ci : 5,
        status: findCol(r, "status", "state") !== -1 ? findCol(r, "status", "state") : 6,
      };
      break;
    }
  }

  const results: ParsedCustomerRecord[] = [];
  for (let r = headerRowIdx + 1; r < rows.length; r++) {
    const row = rows[r] as unknown[];
    if (!row || row.join("").trim() === "") continue;
    const name = cleanStr(row[colMap.name]);
    if (!name || name.length < 2) continue;
    if (name.toLowerCase().includes("total") || name.toLowerCase().includes("customer name")) continue;

    const phone = cleanStr(row[colMap.phone]);
    const city = cleanStr(row[colMap.city]);
    const product = cleanStr(row[colMap.product]);
    const debit = cleanNum(row[colMap.debit]);
    const credit = cleanNum(row[colMap.credit]);
    const status = resolveStatus(row[colMap.status]);
    results.push({ name, phone, city, product, debit, credit, balance: debit - credit, status, isValid: true });
  }
  return results;
}

async function parsePDF(file: File): Promise<ParsedCustomerRecord[]> {
  // Dynamic import so pdfjs chunk is only loaded when needed
  const pdfjsLib = await import("pdfjs-dist");
  // Use a CDN worker to avoid bundler issues
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

  const buffer = await file.arrayBuffer();
  const pdfDoc = await pdfjsLib.getDocument({ data: buffer }).promise;
  const lines: string[] = [];

  for (let p = 1; p <= pdfDoc.numPages; p++) {
    const page = await pdfDoc.getPage(p);
    const tc = await page.getTextContent();
    const items = tc.items as Array<{ str: string; transform: number[] }>;
    // Group by Y coordinate (round to 4px buckets)
    const yMap = new Map<number, Array<{ text: string; x: number }>>();
    for (const item of items) {
      if (!item.str.trim()) continue;
      const y = Math.round(item.transform[5] / 4) * 4;
      if (!yMap.has(y)) yMap.set(y, []);
      yMap.get(y)!.push({ text: item.str.trim(), x: item.transform[4] });
    }
    // Sort top→bottom, build line strings
    Array.from(yMap.keys())
      .sort((a, b) => b - a)
      .forEach(y => {
        const sorted = yMap.get(y)!.sort((a, b) => a.x - b.x);
        lines.push(sorted.map(i => i.text).join(" "));
      });
  }

  // Try to detect header line
  let headerLineIdx = -1;
  for (let i = 0; i < Math.min(lines.length, 20); i++) {
    const l = lines[i].toLowerCase();
    if ((l.includes("name") || l.includes("customer")) && (l.includes("debit") || l.includes("credit") || l.includes("phone"))) {
      headerLineIdx = i;
      break;
    }
  }

  const results: ParsedCustomerRecord[] = [];
  const startIdx = headerLineIdx !== -1 ? headerLineIdx + 1 : 0;

  for (let i = startIdx; i < lines.length; i++) {
    const line = lines[i].trim();
    if (line.length < 4) continue;
    const lower = line.toLowerCase();
    if (lower.includes("total") || lower.includes("page") || lower.includes("customer name") || lower.includes("report")) continue;

    // Extract phone
    const phoneMatch = line.match(/(?:\+92|03\d{2}|0\d{2,3})[- ]?\d{7,8}|\b\d{4}[- ]?\d{7}\b|\b\d{3,4}-\d{6,7}\b/);
    const phone = phoneMatch ? phoneMatch[0] : "";

    // Extract all numbers
    const numMatches = line.match(/\b\d{1,3}(?:,\d{3})*(?:\.\d{1,2})?\b|\b\d+\b/g) || [];
    const nums = numMatches.map(n => cleanNum(n)).filter(n => n >= 0);

    let debit = 0;
    let credit = 0;
    if (nums.length >= 2) { debit = nums[nums.length - 2]; credit = nums[nums.length - 1]; }
    else if (nums.length === 1) { debit = nums[0]; }

    const status = resolveStatus(line);
    // Remove phone and numbers from line to get name/city/product
    let remaining = line
      .replace(phone, "")
      .replace(/(?:\b\d{1,3}(?:,\d{3})*(?:\.\d{1,2})?|\b\d+)\b/g, "")
      .replace(/active|at_risk|inactive|paid|pending|billed|debit|credit/gi, "")
      .replace(/\s{2,}/g, " ")
      .trim();

    const parts = remaining.split(/\s{2,}|,|\|/).map(s => s.trim()).filter(Boolean);
    const name = parts[0] || "";
    if (!name || name.length < 2) continue;

    const city = parts[1] || "";
    const product = parts.slice(2).join(" ") || "";

    results.push({ name, phone, city, product, debit, credit, balance: debit - credit, status, isValid: true });
  }

  if (results.length === 0) throw new Error("No customer records found in PDF. Please ensure the file contains tabular customer data.");
  return results;
}

export async function parseCustomerFile(file: File): Promise<ParsedCustomerRecord[]> {
  const name = file.name.toLowerCase();
  if (name.endsWith(".pdf")) return parsePDF(file);
  if (name.endsWith(".xlsx") || name.endsWith(".xls") || name.endsWith(".csv")) return parseExcel(file);
  throw new Error("Unsupported format. Upload a PDF (.pdf) or Excel (.xlsx, .xls, .csv) file.");
}
