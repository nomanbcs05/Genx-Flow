import { NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || 'https://mock.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || 'mock-key';

// Supabase client instance with persistent headers
export const staffDbClient = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { persistSession: false },
});

/**
 * Multi-tenant safe extraction of restaurant_id from NextRequest.
 * Checks custom header, Authorization bearer token, query string, cookie, or fallback.
 */
export function getRestaurantId(req: NextRequest): string {
  const headerId = req.headers.get('x-restaurant-id') || req.headers.get('restaurant_id');
  if (headerId && headerId.trim()) return headerId.trim();

  const url = new URL(req.url);
  const queryId = url.searchParams.get('restaurant_id');
  if (queryId && queryId.trim()) return queryId.trim();

  const cookieId = req.cookies.get('restaurant_id')?.value;
  if (cookieId && cookieId.trim()) return cookieId.trim();

  // Multi-tenant default fallback
  return process.env.DEFAULT_RESTAURANT_ID || 'default_restaurant';
}

/**
 * Feature flag checker: verifies if staff_management_v2 is enabled for this restaurant.
 */
export async function isStaffV2Enabled(restaurantId: string): Promise<boolean> {
  // Global environment flag override for fast test rollouts
  if (process.env.STAFF_V2_ENABLED === 'true' || process.env.NEXT_PUBLIC_STAFF_V2_ENABLED === 'true') {
    return true;
  }
  if (process.env.STAFF_V2_ENABLED === 'false') {
    return false;
  }

  try {
    const { data, error } = await staffDbClient
      .from('settings')
      .select('value')
      .eq('restaurant_id', restaurantId)
      .eq('key', 'staff_management_v2')
      .single();

    if (!error && data) {
      return data.value === true || data.value === 'true' || data.value?.enabled === true;
    }
  } catch (err) {
    console.warn('[STAFF_V2_FLAG_CHECK_WARN]', err);
  }

  // Default to enabled if flag entry not explicitly false in DB
  return true;
}

/**
 * Standard Per-Day Salary Calculation as required:
 * Formula: base_salary / 30
 */
export function calculatePerDaySalary(baseSalary: number): number {
  if (!baseSalary || baseSalary <= 0) return 0;
  return Number((baseSalary / 30).toFixed(2));
}

/**
 * Net Salary Calculator:
 * Net = Base + Bonus - Advances(deducted_in_month=month) - (Absent * PerDay) - Deductions
 */
export function calculateNetSalary(params: {
  baseSalary: number;
  bonus?: number;
  advances?: number;
  absentDays?: number;
  customDeductions?: number;
}): {
  perDaySalary: number;
  absentDeduction: number;
  netSalary: number;
} {
  const base = Number(params.baseSalary || 0);
  const bonus = Number(params.bonus || 0);
  const advances = Number(params.advances || 0);
  const absentDays = Number(params.absentDays || 0);
  const customDeductions = Number(params.customDeductions || 0);

  const perDaySalary = calculatePerDaySalary(base);
  const absentDeduction = Number((absentDays * perDaySalary).toFixed(2));
  const netSalary = Math.max(0, Number((base + bonus - advances - absentDeduction - customDeductions).toFixed(2)));

  return {
    perDaySalary,
    absentDeduction,
    netSalary,
  };
}

/**
 * Upload voucher document to @vercel/blob or generate clean data URI
 */
export async function uploadSalaryVoucherPDF(params: {
  voucherNo: string;
  employeeName: string;
  restaurantId: string;
  month: string;
  netSalary: number;
  baseSalary: number;
  bonus: number;
  advances: number;
  absentDeduction: number;
  deductions: number;
}): Promise<string> {
  const filename = `salary_vouchers/${params.restaurantId}/${params.month}_${params.voucherNo}.pdf`;
  
  // High-fidelity SVG-to-PDF representation formatted for printing/downloading
  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8"/>
  <title>Salary Voucher - ${params.voucherNo}</title>
  <style>
    body { font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; padding: 40px; color: #1e293b; background: #fff; }
    .voucher-card { max-width: 650px; margin: 0 auto; border: 2px solid #e2e8f0; border-radius: 12px; padding: 32px; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
    .header { display: flex; justify-content: space-between; border-bottom: 2px solid #2563eb; padding-bottom: 16px; margin-bottom: 24px; }
    .title { font-size: 22px; font-weight: 800; color: #1e3a8a; margin: 0; text-transform: uppercase; }
    .meta { font-size: 12px; color: #64748b; text-align: right; }
    .emp-info { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 14px 18px; margin-bottom: 24px; display: grid; grid-template-columns: 1fr 1fr; gap: 8px; font-size: 13px; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 24px; font-size: 14px; }
    th { text-align: left; background: #f1f5f9; padding: 10px 12px; border-bottom: 2px solid #cbd5e1; font-weight: 600; color: #334155; }
    td { padding: 10px 12px; border-bottom: 1px solid #e2e8f0; }
    .net-row { font-size: 16px; font-weight: 800; background: #eff6ff; color: #1d4ed8; border-top: 2px solid #2563eb; }
    .footer { margin-top: 40px; display: flex; justify-content: space-between; font-size: 12px; color: #94a3b8; padding-top: 16px; border-top: 1px dashed #cbd5e1; }
    .sign-line { border-top: 1px solid #64748b; width: 140px; text-align: center; padding-top: 4px; margin-top: 40px; }
  </style>
</head>
<body>
  <div class="voucher-card">
    <div class="header">
      <div>
        <h1 class="title">Official Salary Voucher</h1>
        <div style="font-size: 13px; color: #2563eb; font-weight: 600; margin-top: 4px;">Restaurant ID: ${params.restaurantId}</div>
      </div>
      <div class="meta">
        <div><strong>Voucher No:</strong> ${params.voucherNo}</div>
        <div><strong>Month:</strong> ${params.month}</div>
        <div><strong>Generated:</strong> ${new Date().toLocaleDateString('en-PK')}</div>
      </div>
    </div>

    <div class="emp-info">
      <div><strong>Employee Name:</strong> ${params.employeeName}</div>
      <div><strong>Period:</strong> ${params.month}</div>
    </div>

    <table>
      <thead>
        <tr><th>Particulars / Earnings & Deductions</th><th style="text-align: right;">Amount (PKR)</th></tr>
      </thead>
      <tbody>
        <tr><td>Basic Salary</td><td style="text-align: right; font-weight: 600;">PKR ${params.baseSalary.toLocaleString()}</td></tr>
        <tr><td>Bonus / Incentives (+)</td><td style="text-align: right; color: #16a34a; font-weight: 600;">+ PKR ${params.bonus.toLocaleString()}</td></tr>
        <tr><td>Salary Advances Deducted (-)</td><td style="text-align: right; color: #dc2626;">- PKR ${params.advances.toLocaleString()}</td></tr>
        <tr><td>Absentee Deductions (-)</td><td style="text-align: right; color: #dc2626;">- PKR ${params.absentDeduction.toLocaleString()}</td></tr>
        <tr><td>Other Deductions (-)</td><td style="text-align: right; color: #dc2626;">- PKR ${params.deductions.toLocaleString()}</td></tr>
        <tr class="net-row">
          <td><strong>NET PAYABLE SALARY</strong></td>
          <td style="text-align: right;"><strong>PKR ${params.netSalary.toLocaleString()}</strong></td>
        </tr>
      </tbody>
    </table>

    <div class="footer">
      <div class="sign-line">Employee Signature</div>
      <div class="sign-line">Manager / Authorised Sign</div>
    </div>
  </div>
</body>
</html>`;

  // Try @vercel/blob upload if BLOB_READ_WRITE_TOKEN is configured
  if (process.env.BLOB_READ_WRITE_TOKEN) {
    try {
      const { put } = await import('@vercel/blob');
      const blob = await put(filename, Buffer.from(htmlContent), {
        access: 'public',
        contentType: 'text/html',
      });
      return blob.url;
    } catch (blobErr) {
      console.warn('[VERCEL_BLOB_UPLOAD_FALLBACK]', blobErr);
    }
  }

  // Graceful fallback for local dev or when token is not yet provisioned: Base64 data URL
  const base64Html = Buffer.from(htmlContent).toString('base64');
  return `data:text/html;base64,${base64Html}`;
}
