// SAFETY: THIS DOES NOT MODIFY EXISTING DATA
// WARNING: ALL NEW DATA GOES TO StockVarianceAudit TABLE ONLY.
// ZERO UPDATES OR DELETES ON PRODUCTS, SALES, OR STOCK TABLES.

export { StockVarianceModal, VARIANCE_REASONS } from '../../../components/StockVarianceModal';
export type { VarianceProductData, VarianceReason } from '../../../components/StockVarianceModal';
