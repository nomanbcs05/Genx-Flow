// SAFETY: THIS DOES NOT MODIFY EXISTING DATA
// WARNING: THIS FILE IS READ-ONLY FOR EXISTING DATA. IT DOES NOT UPDATE OR DELETE FROM PRODUCTS OR STOCK TABLES.

import { PrismaClient } from '@prisma/client';

// Global singleton for Prisma to avoid serverless connection exhaustion
const globalForPrisma = global as unknown as { prisma?: PrismaClient };
const prisma = globalForPrisma.prisma || new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
});
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export interface VarianceCheckInput {
  productId: string;
  saleQty: number;
}

export interface VarianceCheckResult {
  proceed: boolean;
  error?: string;
  data?: {
    productId: string;
    productName: string;
    openingQty: number;
    soldQty: number;
    expectedQty: number;
  };
}

/**
 * SAFE WRAPPER FUNCTION: Checks variance before existing sale function executes.
 * - READ-ONLY on Product table.
 * - Does NOT update stock.
 * - Returns data for reconciliation modal if ENABLE_VARIANCE_LOCK is active.
 * - Returns { proceed: true } if disabled or on any non-critical read error to prevent blocking sales.
 */
export async function checkVariance({
  productId,
  saleQty,
}: VarianceCheckInput): Promise<VarianceCheckResult> {
  // 1. SAFETY TOGGLE: If feature is disabled, immediately proceed with old sale flow
  if (process.env.ENABLE_VARIANCE_LOCK !== 'true') {
    return { proceed: true };
  }

  if (!productId || typeof saleQty !== 'number' || saleQty <= 0) {
    return { proceed: true };
  }

  try {
    // 2. READ-ONLY query on existing Product table (no write, update, or delete)
    let product: any = null;
    try {
      product = await (prisma as any).product.findUnique({
        where: { id: productId },
      });
    } catch {
      // Fallback query via raw SQL in case model is named differently
      const rows: any[] = await prisma.$queryRawUnsafe(
        `SELECT id, name, qty, stock FROM "Product" WHERE id = $1 LIMIT 1`,
        productId
      ).catch(async () => {
        return await prisma.$queryRawUnsafe(
          `SELECT id, name, qty, stock FROM "products" WHERE id = $1 LIMIT 1`,
          productId
        );
      }).catch(() => []);

      if (rows && rows.length > 0) {
        product = rows[0];
      }
    }

    // If product not found, fail open (proceed: true) so existing app never breaks
    if (!product) {
      console.warn(`[VARIANCE_CHECK] Product ${productId} not found. Proceeding with standard flow.`);
      return { proceed: true };
    }

    const openingQty = Number(product.stock ?? product.qty ?? 0);
    const expectedQty = openingQty - Number(saleQty);

    // 3. Return data for reconciliation modal. (Zero DB modifications performed)
    return {
      proceed: false,
      data: {
        productId: String(product.id),
        productName: String(product.name || 'Product #' + productId),
        openingQty,
        soldQty: Number(saleQty),
        expectedQty,
      },
    };
  } catch (error: any) {
    // 4. FAIL-SAFE: On any error, log it and return proceed: true so the sale is never blocked
    console.error('[VARIANCE_CHECK_ERROR] Fail-safe active:', error?.message || error);
    return { proceed: true, error: error?.message };
  }
}
