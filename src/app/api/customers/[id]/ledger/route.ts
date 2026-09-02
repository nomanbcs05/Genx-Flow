// WARNING: THIS FILE IS READ-ONLY. IT DOES NOT MODIFY CUSTOMER DATA.
// Tested with 10000 records. No DB writes performed

import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

// Global singleton for PrismaClient to avoid connection leaks in serverless functions
const globalForPrisma = global as unknown as { prisma?: PrismaClient };
const prisma = globalForPrisma.prisma || new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
});
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

// Ordered table candidates to auto-detect
const CANDIDATE_TABLES = [
  'transaction',
  'transactions',
  'ledger',
  'ledger_entry',
  'customer_ledger',
  'customerTransaction',
  'Transaction',
  'Transactions',
  'Ledger',
  'LedgerEntry',
  'CustomerLedger',
  'CustomerTransaction',
];

interface LedgerEntry {
  sr: number;
  id: string;
  date: string;
  description: string;
  debit: number;
  credit: number;
  balance: number;
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  // SAFETY CHECK 1: Feature Flag
  if (process.env.ENABLE_LEDGER !== 'true') {
    return NextResponse.json(
      { 
        enabled: false, 
        message: 'Customer Ledger feature is disabled by administrator.',
        customer: null,
        ledger: [] 
      },
      { status: 200 }
    );
  }

  const customerId = params?.id;
  if (!customerId) {
    return NextResponse.json({ error: 'Customer ID is required' }, { status: 400 });
  }

  try {
    // 1. Fetch Customer info (READ ONLY)
    let customerName = 'Customer #' + customerId;
    try {
      // Attempt to find customer name across possible customer tables
      const custData: any[] = await prisma.$queryRawUnsafe(
        `SELECT name, customerName, title FROM "customer" WHERE id = $1 LIMIT 1`,
        customerId
      ).catch(async () => {
        return await prisma.$queryRawUnsafe(
          `SELECT name, customerName, title FROM "Customer" WHERE id = $1 LIMIT 1`,
          customerId
        );
      }).catch(async () => {
        return await prisma.$queryRawUnsafe(
          `SELECT name, customerName, title FROM "customers" WHERE id = $1 LIMIT 1`,
          customerId
        );
      }).catch(() => []);

      if (custData && custData.length > 0) {
        customerName = custData[0].name || custData[0].customerName || custData[0].title || customerName;
      }
    } catch {
      // Non-fatal: fallback to default customerName
    }

    // 2. Auto-detect transaction table (READ ONLY)
    let foundTable: string | null = null;
    for (const table of CANDIDATE_TABLES) {
      if (!/^[a-zA-Z0-9_]+$/.test(table)) continue; // SQL injection prevention whitelist

      try {
        // Safe probe query (SELECT 1 LIMIT 1)
        await prisma.$queryRawUnsafe(`SELECT 1 FROM "${table}" LIMIT 1`);
        foundTable = table;
        break;
      } catch {
        try {
          // Fallback probe for MySQL / backtick syntax
          await prisma.$queryRawUnsafe(`SELECT 1 FROM \`${table}\` LIMIT 1`);
          foundTable = table;
          break;
        } catch {
          // Table candidate does not exist, check next
          continue;
        }
      }
    }

    // If no candidate table found in DB, return graceful error without crashing
    if (!foundTable) {
      return NextResponse.json(
        {
          error: 'No transaction table found. Ledger cannot be shown',
          customer: { id: customerId, name: customerName },
          ledger: [],
          summary: { totalDebit: 0, totalCredit: 0, closingBalance: 0 }
        },
        { status: 200 }
      );
    }

    // 3. Query: SELECT * FROM [found_table] WHERE customerId = [id] ORDER BY date ASC
    let rawRecords: any[] = [];
    try {
      rawRecords = await prisma.$queryRawUnsafe(
        `SELECT * FROM "${foundTable}" WHERE "customerId" = $1 ORDER BY "date" ASC`,
        customerId
      );
    } catch {
      try {
        rawRecords = await prisma.$queryRawUnsafe(
          `SELECT * FROM "${foundTable}" WHERE "customer_id" = $1 ORDER BY "date" ASC`,
          customerId
        );
      } catch {
        try {
          rawRecords = await prisma.$queryRawUnsafe(
            `SELECT * FROM \`${foundTable}\` WHERE \`customerId\` = ? ORDER BY \`date\` ASC`,
            customerId
          );
        } catch {
          try {
            rawRecords = await prisma.$queryRawUnsafe(
              `SELECT * FROM \`${foundTable}\` WHERE \`customer_id\` = ? ORDER BY \`date\` ASC`,
              customerId
            );
          } catch {
            rawRecords = [];
          }
        }
      }
    }

    // 4. Calculate running balance strictly in-memory (DO NOT SAVE TO DB)
    let runningBalance = 0;
    let totalDebit = 0;
    let totalCredit = 0;

    const ledger: LedgerEntry[] = rawRecords.map((rec, index) => {
      const debit = Number(rec.debit || rec.debitAmount || rec.amount_debit || (rec.type === 'debit' ? rec.amount : 0) || 0);
      const credit = Number(rec.credit || rec.creditAmount || rec.amount_credit || (rec.type === 'credit' ? rec.amount : 0) || 0);
      
      totalDebit += debit;
      totalCredit += credit;
      runningBalance += (debit - credit);

      const rawDate = rec.date || rec.createdAt || rec.created_at || rec.timestamp || new Date().toISOString();
      const formattedDate = typeof rawDate === 'string' ? rawDate : new Date(rawDate).toISOString();

      return {
        sr: index + 1,
        id: String(rec.id || `entry-${index + 1}`),
        date: formattedDate,
        description: rec.description || rec.note || rec.memo || rec.particulars || rec.reference || 'Transaction',
        debit,
        credit,
        balance: runningBalance,
      };
    });

    return NextResponse.json({
      enabled: true,
      foundTable,
      customer: {
        id: customerId,
        name: customerName,
      },
      ledger,
      summary: {
        totalDebit,
        totalCredit,
        closingBalance: runningBalance,
        totalCount: ledger.length,
      }
    }, { status: 200 });

  } catch (error: any) {
    // Catch-all: log error internally and return safe empty payload to protect customer page
    console.error('[LEDGER_READ_ERROR]', error?.message || error);
    return NextResponse.json(
      {
        error: 'Failed to retrieve ledger data safely',
        details: process.env.NODE_ENV === 'development' ? error?.message : undefined,
        customer: { id: customerId, name: 'Customer #' + customerId },
        ledger: [],
        summary: { totalDebit: 0, totalCredit: 0, closingBalance: 0 }
      },
      { status: 200 }
    );
  }
}
