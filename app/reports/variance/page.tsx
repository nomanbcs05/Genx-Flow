// SAFETY: THIS DOES NOT MODIFY EXISTING DATA
// WARNING: THIS PAGE IS 100% READ-ONLY.
// IT ONLY READS FROM THE StockVarianceAudit TABLE.

'use client';

import React, { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { 
  ShieldAlert, 
  Download, 
  Printer, 
  ArrowLeft, 
  RefreshCw, 
  Filter, 
  AlertTriangle,
  FileSpreadsheet,
  Calendar,
  Search,
  CheckCircle2
} from 'lucide-react';

interface AuditRecord {
  id: string;
  productId: string;
  productName: string;
  date: string;
  openingQty: number;
  soldQty: number;
  expectedQty: number;
  actualQty: number;
  varianceQty: number;
  reason: string;
  notes?: string;
  recordedBy?: string;
  saleId?: string;
  createdAt: string;
}

export default function StockVarianceReportPage() {
  const [records, setRecords] = useState<AuditRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedReason, setSelectedReason] = useState<string>('all');

  const fetchRecords = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/variance');
      const data = await res.json();
      setRecords(data.records || []);
    } catch (err) {
      console.error('[VARIANCE_REPORT_FETCH_ERROR]', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, []);

  // Filtered in memory
  const filtered = useMemo(() => {
    return records.filter((r) => {
      const matchSearch =
        !searchQuery ||
        r.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (r.notes && r.notes.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (r.recordedBy && r.recordedBy.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchReason = selectedReason === 'all' || r.reason.toLowerCase() === selectedReason.toLowerCase();
      return matchSearch && matchReason;
    });
  }, [records, searchQuery, selectedReason]);

  // In-memory summary metrics
  const metrics = useMemo(() => {
    const totalTheft = filtered
      .filter((r) => r.reason.toLowerCase() === 'theft')
      .reduce((sum, r) => sum + Math.max(0, r.varianceQty), 0);

    const totalWastage = filtered
      .filter((r) => ['wastage', 'damage'].includes(r.reason.toLowerCase()))
      .reduce((sum, r) => sum + Math.max(0, r.varianceQty), 0);

    const totalIncidents = filtered.length;

    return { totalTheft, totalWastage, totalIncidents };
  }, [filtered]);

  const handleExportCSV = () => {
    if (filtered.length === 0) return;
    const headers = [
      'ID',
      'Date',
      'Product Name',
      'Opening Qty',
      'Sold Qty',
      'Expected Qty',
      'Actual Qty',
      'Variance Qty',
      'Reason',
      'Recorded By',
      'Notes',
    ];
    const rows = filtered.map((r) => [
      `"${r.id}"`,
      `"${new Date(r.date || r.createdAt).toLocaleString()}"`,
      `"${r.productName.replace(/"/g, '""')}"`,
      r.openingQty,
      r.soldQty,
      r.expectedQty,
      r.actualQty,
      r.varianceQty,
      `"${r.reason}"`,
      `"${r.recordedBy || ''}"`,
      `"${(r.notes || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Stock_Variance_Audit_Report_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 p-4 sm:p-8 font-sans">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* BIG MANDATORY SAFETY BANNER */}
        <div className="bg-emerald-500/10 border-2 border-emerald-500/30 rounded-2xl p-4 sm:p-5 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-md shadow-emerald-500/20">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-emerald-800 dark:text-emerald-300">
                Stock Variance Audit Report — 100% Read-Only
              </h2>
              <p className="text-xs text-emerald-700/80 dark:text-emerald-400">
                Data is queried exclusively from the isolated StockVarianceAudit table. No updates or deletes can occur.
              </p>
            </div>
          </div>
          <span className="hidden sm:inline-block text-[11px] font-mono uppercase bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 px-3 py-1 rounded-full border border-emerald-300 dark:border-emerald-800">
            AUDIT_MODE
          </span>
        </div>

        {/* Action Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm print:hidden">
          <div className="flex items-center gap-4">
            <Link
              href="/dashboard"
              className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors text-slate-600 dark:text-slate-300"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Theft &amp; Loss Prevention</span>
              <h1 className="text-2xl font-black text-slate-900 dark:text-white">Stock Variance Audit Log</h1>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={fetchRecords}
              disabled={loading}
              className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors"
              title="Refresh audits"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={() => window.print()}
              disabled={filtered.length === 0}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-sm font-semibold text-slate-700 dark:text-slate-200 transition-colors disabled:opacity-50"
            >
              <Printer className="w-4 h-4" />
              <span>Print</span>
            </button>
            <button
              onClick={handleExportCSV}
              disabled={filtered.length === 0}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold shadow-md shadow-blue-600/20 transition-all disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        {/* Metrics Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Total Audits Logged</span>
            <p className="text-2xl font-bold font-mono text-slate-900 dark:text-white mt-1">{metrics.totalIncidents}</p>
          </div>
          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-red-200/80 dark:border-red-900/40 bg-red-50/30 dark:bg-red-950/20 shadow-sm">
            <span className="text-xs font-bold text-red-600 dark:text-red-400 uppercase tracking-wider block">🚨 Total Theft Qty</span>
            <p className="text-2xl font-bold font-mono text-red-600 dark:text-red-400 mt-1">{metrics.totalTheft.toFixed(2)} units</p>
          </div>
          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-amber-200/80 dark:border-amber-900/40 bg-amber-50/30 dark:bg-amber-950/20 shadow-sm">
            <span className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider block">Wastage &amp; Damage Qty</span>
            <p className="text-2xl font-bold font-mono text-amber-600 dark:text-amber-400 mt-1">{metrics.totalWastage.toFixed(2)} units</p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search by product name, user email, or audit notes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/40"
            />
          </div>
          <div className="sm:w-48">
            <select
              value={selectedReason}
              onChange={(e) => setSelectedReason(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/40"
            >
              <option value="all">All Reasons</option>
              <option value="theft">🚨 Theft</option>
              <option value="wastage">Wastage</option>
              <option value="damage">Damage</option>
              <option value="free sample">Free Sample</option>
              <option value="other">Other</option>
            </select>
          </div>
        </div>

        {/* Audit Records Table */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 dark:bg-slate-800/70 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="py-3 px-4">Date &amp; Time</th>
                  <th className="py-3 px-4">Product Name</th>
                  <th className="py-3 px-4 text-center">Reason</th>
                  <th className="py-3 px-4 text-right">Opening</th>
                  <th className="py-3 px-4 text-right">Sold</th>
                  <th className="py-3 px-4 text-right">Expected</th>
                  <th className="py-3 px-4 text-right">Actual Count</th>
                  <th className="py-3 px-4 text-right">Variance</th>
                  <th className="py-3 px-4">Logged By</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {loading ? (
                  <tr>
                    <td colSpan={9} className="py-12 text-center text-slate-400">
                      <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-blue-500" />
                      <span>Loading audit logs...</span>
                    </td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-16 text-center text-slate-400">
                      <ShieldAlert className="w-8 h-8 opacity-30 mx-auto mb-2" />
                      <p className="text-xs font-semibold">No stock variance audit records found</p>
                      <p className="text-[11px] text-slate-500 mt-0.5">Audits logged during sales will appear here.</p>
                    </td>
                  </tr>
                ) : (
                  filtered.map((r) => (
                    <tr key={r.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                      <td className="py-3 px-4 font-mono text-slate-500 whitespace-nowrap">
                        {new Date(r.date || r.createdAt).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                      </td>
                      <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">
                        {r.productName}
                        {r.notes && <p className="text-[10px] font-normal text-slate-400 italic mt-0.5">&ldquo;{r.notes}&rdquo;</p>}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className={`px-2 py-0.5 rounded-md font-bold uppercase text-[9px] tracking-wider ${
                          r.reason.toLowerCase() === 'theft' 
                            ? 'bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300' 
                            : 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300'
                        }`}>
                          {r.reason}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right font-mono text-slate-600 dark:text-slate-300">{r.openingQty}</td>
                      <td className="py-3 px-4 text-right font-mono text-blue-600 dark:text-blue-400">-{r.soldQty}</td>
                      <td className="py-3 px-4 text-right font-mono text-slate-600 dark:text-slate-300">{r.expectedQty}</td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-slate-800 dark:text-slate-200">{r.actualQty}</td>
                      <td className="py-3 px-4 text-right font-mono font-bold">
                        <span className={r.varianceQty > 0 ? 'text-red-500' : r.varianceQty < 0 ? 'text-emerald-500' : 'text-slate-400'}>
                          {r.varianceQty > 0 ? `-${r.varianceQty}` : r.varianceQty < 0 ? `+${Math.abs(r.varianceQty)}` : '0'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-500 text-[11px] truncate max-w-[120px]">{r.recordedBy || 'System'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}
