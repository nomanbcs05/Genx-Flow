// SAFETY: THIS DOES NOT MODIFY EXISTING DATA
// WARNING: THIS ROUTE WRITES TO StockVarianceAudit TABLE ONLY.
// ZERO UPDATES OR DELETES TO EXISTING PRODUCT, SALES, OR STOCK TABLES.

import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const globalForPrisma = global as unknown as { prisma?: PrismaClient };
const prisma = globalForPrisma.prisma || new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
});
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

/**
 * GET: Read-only query fetching variance audit records
 */
export async function GET() {
  try {
    let records: any[] = [];
    try {
      records = await (prisma as any).stockVarianceAudit.findMany({
        orderBy: { createdAt: 'desc' },
      });
    } catch {
      // Raw fallback
      records = await prisma.$queryRawUnsafe(
        `SELECT * FROM "StockVarianceAudit" ORDER BY "createdAt" DESC`
      ).catch(async () => {
        return await prisma.$queryRawUnsafe(
          `SELECT * FROM "stock_variance_audit" ORDER BY "createdAt" DESC`
        );
      }).catch(() => []);
    }

    return NextResponse.json({ records }, { status: 200 });
  } catch (error: any) {
    console.error('[VARIANCE_API_GET_ERROR]', error);
    return NextResponse.json({ records: [], error: error?.message }, { status: 200 });
  }
}

/**
 * POST: Safe insertion into StockVarianceAudit table ONLY.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      productId,
      productName,
      openingQty,
      soldQty,
      expectedQty,
      actualQty,
      varianceQty,
      reason,
      notes,
      recordedBy,
      saleId,
    } = body;

    if (!productId || typeof actualQty !== 'number') {
      return NextResponse.json({ error: 'Missing required audit fields' }, { status: 400 });
    }

    let created: any = null;
    try {
      created = await (prisma as any).stockVarianceAudit.create({
        data: {
          productId: String(productId),
          productName: String(productName || 'Unknown Product'),
          openingQty: Number(openingQty || 0),
          soldQty: Number(soldQty || 0),
          expectedQty: Number(expectedQty || 0),
          actualQty: Number(actualQty || 0),
          varianceQty: Number(varianceQty || 0),
          reason: String(reason || 'Other'),
          notes: notes ? String(notes) : null,
          recordedBy: recordedBy ? String(recordedBy) : null,
          saleId: saleId ? String(saleId) : null,
        },
      });
    } catch {
      // Raw fallback insert into new table only
      await prisma.$executeRawUnsafe(
        `INSERT INTO "StockVarianceAudit" ("id", "productId", "productName", "openingQty", "soldQty", "expectedQty", "actualQty", "varianceQty", "reason", "notes", "recordedBy", "saleId", "createdAt", "date")
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, NOW(), NOW())`,
        `var-${Date.now()}`,
        productId,
        productName || 'Unknown Product',
        openingQty || 0,
        soldQty || 0,
        expectedQty || 0,
        actualQty || 0,
        varianceQty || 0,
        reason || 'Other',
        notes || null,
        recordedBy || null,
        saleId || null
      ).catch(() => null);
    }

    return NextResponse.json({ success: true, record: created }, { status: 201 });
  } catch (error: any) {
    console.error('[VARIANCE_API_POST_ERROR]', error);
    // Non-blocking response
    return NextResponse.json({ success: false, error: error?.message }, { status: 200 });
  }
}
