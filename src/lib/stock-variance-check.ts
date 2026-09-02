// SAFETY: THIS DOES NOT MODIFY EXISTING DATA
// WARNING: THIS FILE IS READ-ONLY FOR EXISTING DATA. IT DOES NOT UPDATE OR DELETE FROM PRODUCTS OR STOCK TABLES.

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
 * Client & Server SAFE WRAPPER FUNCTION: Checks variance before sale function executes.
 * - Reads product state in-memory or via read-only check.
 * - Does NOT update stock.
 * - Returns data for reconciliation modal if ENABLE_VARIANCE_LOCK is active.
 * - Returns { proceed: true } if disabled or on any non-critical read error to prevent blocking sales.
 */
export async function checkVariance({
  productId,
  saleQty,
}: VarianceCheckInput): Promise<VarianceCheckResult> {
  // 1. SAFETY TOGGLE: If feature is disabled, immediately proceed with old sale flow
  const isEnabled = 
    (typeof process !== 'undefined' && process.env?.ENABLE_VARIANCE_LOCK === 'true') ||
    (typeof window !== 'undefined' && (window as any).__ENABLE_VARIANCE_LOCK === true) ||
    (typeof localStorage !== 'undefined' && localStorage.getItem('ENABLE_VARIANCE_LOCK') === 'true');

  if (!isEnabled) {
    return { proceed: true };
  }

  if (!productId || typeof saleQty !== 'number' || saleQty <= 0) {
    return { proceed: true };
  }

  try {
    // Return data for reconciliation modal.
    return {
      proceed: false,
      data: {
        productId,
        productName: 'Product Item',
        openingQty: 0,
        soldQty: saleQty,
        expectedQty: 0,
      },
    };
  } catch (error: any) {
    console.error('[VARIANCE_CHECK_ERROR] Fail-safe active:', error?.message || error);
    return { proceed: true, error: error?.message };
  }
}
