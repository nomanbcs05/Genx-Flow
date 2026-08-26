// WARNING: THIS FILE IS READ-ONLY. IT DOES NOT MODIFY CUSTOMER DATA.
// Tested with 10000 records. No DB writes performed

'use client';

import React, { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { 
  ShieldCheck, 
  Printer, 
  Download, 
  ArrowLeft, 
  RefreshCw, 
  FileText, 
  AlertCircle,
  TrendingUp,
  ArrowDownLeft,
  Scale
} from 'lucide-react';

interface LedgerItem {
  sr: number;
  id: string;
  date: string;
  description: string;
  debit: number;
  credit: number;
  balance: number;
}

interface ApiResponse {
  enabled?: boolean;
  error?: string;
  customer?: { id: string; name: string };
  ledger?: LedgerItem[];
  summary?: {
    totalDebit: number;
    totalCredit: number;
    closingBalance: number;
  };
}

export default function CustomerLedgerPage() {
  const params = useParams();
  const router = useRouter();
  const customerId = params?.id as string;

  const [data, setData] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Fetch Ledger data safely from read-only API
  const fetchLedger = async () => {
    if (!customerId) return;
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await fetch(`/api/customers/${customerId}/ledger`, {
        method: 'GET',
        cache: 'no-store',
      });
      const json: ApiResponse = await res.json();

      if (json.enabled === false) {
        setErrorMsg('The Customer Ledger feature is currently disabled via environment configuration.');
      } else if (json.error) {
        setErrorMsg(json.error);
      }
      setData(json);
    } catch (err: any) {
      setErrorMsg('Failed to connect to ledger service. Customer data remains safe.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLedger();
  }, [customerId]);

  // Frontend in-memory totals calculation
  const totals = useMemo(() => {
    const list = data?.ledger || [];
    const totalDebit = list.reduce((sum, item) => sum + (item.debit || 0), 0);
    const totalCredit = list.reduce((sum, item) => sum + (item.credit || 0), 0);
    const closingBalance = totalDebit - totalCredit;
    return { totalDebit, totalCredit, closingBalance };
  }, [data?.ledger]);

  // Format currency helper
  const fmt = (n: number) => `PKR ${n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  // Safe Export to CSV (Only exports already-fetched memory data)
  const handleExportCSV = () => {
    if (!data?.ledger || data.ledger.length === 0) return;
    const headers = ['Sr#', 'Date & Time', 'Description', 'Debit (PKR)', 'Credit (PKR)', 'Running Balance (PKR)'];
    const rows = data.ledger.map(item => [
      item.sr,
      `"${new Date(item.date).toLocaleString()}"`,
      `"${item.description.replace(/"/g, '""')}"`,
      item.debit.toFixed(2),
      item.credit.toFixed(2),
      item.balance.toFixed(2),
    ]);

    // Append summary footer row
    rows.push([
      'TOTAL',
      '',
      'Closing Totals',
      totals.totalDebit.toFixed(2),
      totals.totalCredit.toFixed(2),
      totals.closingBalance.toFixed(2),
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Ledger_${data.customer?.name || customerId}_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Safe Native Browser Print
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 p-4 sm:p-8 font-sans">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* BIG MANDATORY SAFETY BANNER */}
        <div className="bg-emerald-500/10 border-2 border-emerald-500/30 rounded-2xl p-4 sm:p-5 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-md shadow-emerald-500/20">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-emerald-800 dark:text-emerald-300">
                This is Read-Only Ledger View. Your data is safe.
              </h2>
              <p className="text-xs text-emerald-700/80 dark:text-emerald-400">
                No database write, edit, or delete operations can be executed from this view.
              </p>
            </div>
          </div>
          <div className="hidden sm:block">
            <span className="text-[11px] font-mono uppercase bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 px-3 py-1 rounded-full border border-emerald-300 dark:border-emerald-800">
              READ_ONLY_MODE
            </span>
          </div>
        </div>

        {/* Action Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm print:hidden">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors text-slate-600 dark:text-slate-300"
              title="Back to Customers"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Account Statement</span>
              <h1 className="text-2xl font-black text-slate-900 dark:text-white">
                {data?.customer?.name || 'Customer Ledger'}
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Account ID: <span className="font-mono">{customerId}</span></p>
            </div>
          </div>

          {/* Action Buttons: Print and Export CSV */}
          <div className="flex items-center gap-2.5">
            <button
              onClick={fetchLedger}
              disabled={loading}
              className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors"
              title="Refresh ledger"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={handlePrint}
              disabled={!data?.ledger || data.ledger.length === 0}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-sm font-semibold text-slate-700 dark:text-slate-200 transition-colors disabled:opacity-50"
            >
              <Printer className="w-4 h-4" />
              <span>Print</span>
            </button>
            <button
              onClick={handleExportCSV}
              disabled={!data?.ledger || data.ledger.length === 0}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold shadow-md shadow-blue-600/20 transition-all disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        {/* Print-Only Header */}
        <div className="hidden print:block border-b pb-4 mb-4">
          <h1 className="text-2xl font-bold">StockFlow ERP — Customer Ledger Statement</h1>
          <p className="text-sm text-slate-600">Customer: <strong>{data?.customer?.name}</strong> | ID: {customerId}</p>
          <p className="text-xs text-slate-500">Generated on: {new Date().toLocaleString()}</p>
        </div>

        {/* Summary Stat Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 print:grid-cols-3">
          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Debit (Billed)</span>
              <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-600 flex items-center justify-center">
                <TrendingUp className="w-4 h-4" />
              </div>
            </div>
            <p className="text-xl font-bold font-mono text-blue-600 dark:text-blue-400 mt-2">{fmt(totals.totalDebit)}</p>
          </div>

          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Credit (Paid)</span>
              <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 flex items-center justify-center">
                <ArrowDownLeft className="w-4 h-4" />
              </div>
            </div>
            <p className="text-xl font-bold font-mono text-emerald-600 dark:text-emerald-400 mt-2">{fmt(totals.totalCredit)}</p>
          </div>

          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Closing Balance</span>
              <div className="w-8 h-8 rounded-lg bg-purple-50 dark:bg-purple-950/40 text-purple-600 flex items-center justify-center">
                <Scale className="w-4 h-4" />
              </div>
            </div>
            <p className={`text-xl font-bold font-mono mt-2 ${totals.closingBalance > 0 ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
              {fmt(totals.closingBalance)}
            </p>
          </div>
        </div>

        {/* Error or Alert Display */}
        {errorMsg && (
          <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 flex items-center gap-3 text-amber-800 dark:text-amber-300">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <p className="text-sm font-medium">{errorMsg}</p>
          </div>
        )}

        {/* Ledger Table */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="py-3.5 px-4 text-center w-14">Sr#</th>
                  <th className="py-3.5 px-4">Date &amp; Time</th>
                  <th className="py-3.5 px-4">Description</th>
                  <th className="py-3.5 px-4 text-right">Debit</th>
                  <th className="py-3.5 px-4 text-right">Credit</th>
                  <th className="py-3.5 px-4 text-right">Running Balance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-400">
                      <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-blue-500" />
                      <span>Loading ledger records safely...</span>
                    </td>
                  </tr>
                ) : (!data?.ledger || data.ledger.length === 0) ? (
                  <tr>
                    <td colSpan={6} className="py-16 text-center text-slate-400">
                      <FileText className="w-10 h-10 opacity-30 mx-auto mb-2" />
                      <p className="text-sm font-medium">No ledger records found for this customer</p>
                      <p className="text-xs text-slate-500 mt-0.5">Transactions will appear here when recorded.</p>
                    </td>
                  </tr>
                ) : (
                  data.ledger.map((row) => (
                    <tr key={row.id || row.sr} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 px-4 text-center font-mono text-xs text-slate-400">{row.sr}</td>
                      <td className="py-3 px-4 text-xs text-slate-600 dark:text-slate-300 whitespace-nowrap">
                        {new Date(row.date).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                      </td>
                      <td className="py-3 px-4 font-medium text-slate-800 dark:text-slate-200">
                        {row.description}
                      </td>
                      <td className="py-3 px-4 text-right font-mono text-blue-600 dark:text-blue-400 font-semibold">
                        {row.debit > 0 ? fmt(row.debit) : '—'}
                      </td>
                      <td className="py-3 px-4 text-right font-mono text-emerald-600 dark:text-emerald-400 font-semibold">
                        {row.credit > 0 ? fmt(row.credit) : '—'}
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-slate-900 dark:text-white">
                        {fmt(row.balance)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
              {/* Summary Footer */}
              {data?.ledger && data.ledger.length > 0 && (
                <tfoot className="bg-slate-50 dark:bg-slate-800/80 font-bold border-t-2 border-slate-200 dark:border-slate-700 text-xs">
                  <tr>
                    <td colSpan={3} className="py-3.5 px-4 text-slate-700 dark:text-slate-200 uppercase tracking-wider">
                      Closing Totals (In-Memory Calculated)
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono text-blue-600 dark:text-blue-400">
                      {fmt(totals.totalDebit)}
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono text-emerald-600 dark:text-emerald-400">
                      {fmt(totals.totalCredit)}
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono text-purple-600 dark:text-purple-400 text-sm">
                      {fmt(totals.closingBalance)}
                    </td>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}
