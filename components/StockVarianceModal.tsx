// SAFETY: THIS DOES NOT MODIFY EXISTING DATA
// WARNING: ALL NEW DATA GOES TO StockVarianceAudit TABLE ONLY.
// ZERO UPDATES OR DELETES ON PRODUCTS, SALES, OR STOCK TABLES.

'use client';

import React, { useState } from 'react';
import { ShieldAlert, AlertTriangle, Check, X, Scale, FileText, AlertCircle } from 'lucide-react';

export interface VarianceProductData {
  productId: string;
  productName: string;
  openingQty: number;
  soldQty: number;
  expectedQty: number;
  saleId?: string;
  unit?: string;
}

export const VARIANCE_REASONS = [
  'Theft',
  'Wastage',
  'Damage',
  'Free Sample',
  'Other',
] as const;

export type VarianceReason = (typeof VARIANCE_REASONS)[number];

interface StockVarianceModalProps {
  open: boolean;
  varianceData: VarianceProductData | null;
  userEmail?: string;
  onClose: () => void;
  /**
   * Called when reconciliation is confirmed.
   * Inserts into StockVarianceAudit table only, then proceeds to old sale flow.
   */
  onConfirmReconciliation: (auditRecord: {
    productId: string;
    productName: string;
    openingQty: number;
    soldQty: number;
    expectedQty: number;
    actualQty: number;
    varianceQty: number;
    reason: string;
    notes?: string;
    recordedBy?: string;
    saleId?: string;
  }) => Promise<void>;
}

export function StockVarianceModal({
  open,
  varianceData,
  userEmail = 'admin@stockflow.com',
  onClose,
  onConfirmReconciliation,
}: StockVarianceModalProps) {
  const [actualQtyInput, setActualQtyInput] = useState<string>('');
  const [reason, setReason] = useState<VarianceReason>('Theft');
  const [notes, setNotes] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!open || !varianceData) return null;

  const expected = varianceData.expectedQty;
  const actualQty = actualQtyInput !== '' ? parseFloat(actualQtyInput) : expected;
  const varianceQty = Number((expected - (isNaN(actualQty) ? 0 : actualQty)).toFixed(2));
  const hasVariance = varianceQty !== 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const actual = parseFloat(actualQtyInput);
    if (isNaN(actual) || actual < 0) {
      setErrorMessage('Please enter a valid actual stock count (0 or greater).');
      return;
    }

    setIsSubmitting(true);
    try {
      // 1. Prepare Audit Record for StockVarianceAudit table ONLY
      const auditPayload = {
        productId: varianceData.productId,
        productName: varianceData.productName,
        openingQty: varianceData.openingQty,
        soldQty: varianceData.soldQty,
        expectedQty: varianceData.expectedQty,
        actualQty: actual,
        varianceQty: Number((varianceData.expectedQty - actual).toFixed(2)),
        reason,
        notes: notes.trim() || undefined,
        recordedBy: userEmail,
        saleId: varianceData.saleId || undefined,
      };

      // 2. Safe isolated insert into StockVarianceAudit table ONLY
      try {
        await fetch('/api/variance', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(auditPayload),
        }).catch((err) => {
          // Log error but never throw — fail-safe ensures old sale proceeds
          console.warn('[STOCK_VARIANCE_INSERT_SAFE_CATCH]', err);
        });
      } catch (err) {
        console.warn('[STOCK_VARIANCE_NON_BLOCKING_ERROR]', err);
      }

      // 3. Complete reconciliation & trigger old sale function
      await onConfirmReconciliation(auditPayload);
      onClose();
    } catch (err: any) {
      console.error('[VARIANCE_MODAL_ERROR]', err);
      // Still proceed with sale to maintain 100% uptime of existing features
      await onConfirmReconciliation({
        productId: varianceData.productId,
        productName: varianceData.productName,
        openingQty: varianceData.openingQty,
        soldQty: varianceData.soldQty,
        expectedQty: varianceData.expectedQty,
        actualQty: actual,
        varianceQty,
        reason,
      });
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity" onClick={onClose} />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl border-2 border-amber-500/40 shadow-2xl overflow-hidden z-10 animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="px-6 py-4 bg-amber-500/10 border-b border-amber-500/20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500 text-white flex items-center justify-center font-bold shadow-md shadow-amber-500/30">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                Stock Reconciliation Lock
              </h2>
              <p className="text-xs text-amber-700 dark:text-amber-400 font-medium">
                Theft &amp; Variance Prevention Check
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          
          {/* Safety Notice Banner */}
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-start gap-3">
            <Scale className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
            <div className="text-xs text-slate-600 dark:text-slate-300">
              <p className="font-bold text-slate-900 dark:text-white">Item: {varianceData.productName}</p>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Expected physical stock after selling <strong>{varianceData.soldQty}</strong> units is{' '}
                <strong className="text-slate-800 dark:text-slate-200">{expected}</strong>.
              </p>
            </div>
          </div>

          {/* Metric Comparison Cards */}
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Opening</span>
              <span className="text-sm font-mono font-bold text-slate-800 dark:text-slate-200">{varianceData.openingQty}</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Selling</span>
              <span className="text-sm font-mono font-bold text-blue-600 dark:text-blue-400">-{varianceData.soldQty}</span>
            </div>
            <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60">
              <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider block">Expected</span>
              <span className="text-sm font-mono font-bold text-amber-700 dark:text-amber-300">{expected}</span>
            </div>
          </div>

          {/* Actual Stock Input */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1.5">
              Actual Physical Stock Count <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="number"
                step="any"
                required
                placeholder={`Expected: ${expected}`}
                value={actualQtyInput}
                onChange={(e) => setActualQtyInput(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500"
              />
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Please enter the physical count currently on shelf / in storage.
            </p>
          </div>

          {/* Reason Selection */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1.5">
              Variance Classification Reason
            </label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value as VarianceReason)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500/40"
            >
              {VARIANCE_REASONS.map((r) => (
                <option key={r} value={r}>
                  {r === 'Theft' ? '🚨 Theft (Missing / Unaccounted)' : r}
                </option>
              ))}
            </select>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1.5">
              Audit Notes (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. Shelf recount by cashier, shift handoff variance"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500/40"
            />
          </div>

          {/* Calculated Variance Badge */}
          {actualQtyInput !== '' && hasVariance && (
            <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 flex items-center justify-between text-xs">
              <span className="font-semibold text-red-700 dark:text-red-300 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4" /> Detected Variance:
              </span>
              <span className="font-mono font-bold text-red-600 dark:text-red-400">
                {varianceQty > 0 ? `-${varianceQty} (Missing/Short)` : `+${Math.abs(varianceQty)} (Surplus)`}
              </span>
            </div>
          )}

          {errorMessage && (
            <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 text-xs text-red-600 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Submit / Cancel Buttons */}
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              Cancel Sale
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white text-xs font-bold shadow-md shadow-amber-500/20 transition-all flex items-center gap-2 disabled:opacity-50"
            >
              <Check className="w-4 h-4" />
              <span>{isSubmitting ? 'Logging Audit...' : 'Reconcile & Complete Sale'}</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
