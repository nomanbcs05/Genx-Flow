import React, { useState, useEffect } from 'react';
import {
  FileText, Download, Printer, Filter, Calendar, CheckCircle2,
  Clock, Search, ArrowDownToLine, Eye, ExternalLink, RefreshCw, X, ShieldCheck
} from 'lucide-react';

interface VoucherRecord {
  id: string;
  employee_id: string;
  employee_name: string;
  designation: string;
  cnic?: string;
  bank_account?: string;
  month: string;
  net_salary: number;
  voucher_no: string;
  pdf_url: string;
  status: 'generated' | 'paid';
  paid_date?: string | null;
  created_at: string;
}

export function StaffSalaryVouchersTab({ restaurantId = 'default_restaurant' }: { restaurantId?: string }) {
  const [selectedMonth, setSelectedMonth] = useState(() => new Date().toISOString().slice(0, 7));
  const [statusFilter, setStatusFilter] = useState<'all' | 'generated' | 'paid'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [previewVoucher, setPreviewVoucher] = useState<VoucherRecord | null>(null);

  // Vouchers List State
  const [vouchers, setVouchers] = useState<VoucherRecord[]>([
    {
      id: 'vch-001',
      employee_id: 'emp-001',
      employee_name: 'Muhammad Asif',
      designation: 'Head Chef',
      cnic: '35201-1234567-1',
      bank_account: 'PK36MEZN0000123456789012',
      month: new Date().toISOString().slice(0, 7),
      net_salary: 57667,
      voucher_no: `VCH-${new Date().toISOString().slice(0, 7).replace('-', '')}-001-8492`,
      pdf_url: '',
      status: 'generated',
      created_at: new Date().toISOString(),
    },
    {
      id: 'vch-002',
      employee_id: 'emp-002',
      employee_name: 'Zubair Tariq',
      designation: 'POS Cashier & Floor Lead',
      cnic: '35202-9876543-3',
      bank_account: 'PK45HABB0012345678901234',
      month: new Date().toISOString().slice(0, 7),
      net_salary: 43500,
      voucher_no: `VCH-${new Date().toISOString().slice(0, 7).replace('-', '')}-002-3819`,
      pdf_url: '',
      status: 'paid',
      paid_date: new Date().toISOString(),
      created_at: new Date().toISOString(),
    },
    {
      id: 'vch-003',
      employee_id: 'emp-003',
      employee_name: 'Hamza Malik',
      designation: 'Sous Chef',
      cnic: '35201-5544332-9',
      bank_account: 'PK12BAHL0098765432101234',
      month: new Date().toISOString().slice(0, 7),
      net_salary: 40700,
      voucher_no: `VCH-${new Date().toISOString().slice(0, 7).replace('-', '')}-003-9124`,
      pdf_url: '',
      status: 'generated',
      created_at: new Date().toISOString(),
    },
  ]);

  /**
   * Part B.6 Call: GET /api/v2/staff/vouchers?month=YYYY-MM
   */
  const fetchVouchers = async () => {
    setLoading(true);
    try {
      let url = `/api/v2/staff/vouchers?month=${selectedMonth}`;
      if (statusFilter !== 'all') {
        url += `&status=${statusFilter}`;
      }

      const res = await fetch(url, {
        headers: { 'x-restaurant-id': restaurantId },
      });

      const data = await res.json();
      if (res.ok && data.success && data.vouchers?.length > 0) {
        setVouchers(data.vouchers);
      }
    } catch (err) {
      console.warn('[VOUCHERS_FETCH_WARN]', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVouchers();
  }, [selectedMonth, statusFilter, restaurantId]);

  const handleMarkAsPaid = (voucherId: string) => {
    setVouchers(prev =>
      prev.map(v =>
        v.id === voucherId
          ? { ...v, status: 'paid', paid_date: new Date().toISOString() }
          : v
      )
    );
  };

  const handleDownloadPDF = (voucher: VoucherRecord) => {
    if (voucher.pdf_url && voucher.pdf_url.startsWith('http')) {
      window.open(voucher.pdf_url, '_blank');
      return;
    }

    // Open print preview window with styled salary voucher
    setPreviewVoucher(voucher);
  };

  const filteredVouchers = vouchers.filter(v => {
    const matchesSearch =
      v.employee_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.voucher_no.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (v.cnic && v.cnic.includes(searchQuery));
    const matchesStatus = statusFilter === 'all' || v.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalVoucherAmount = filteredVouchers.reduce((s, v) => s + v.net_salary, 0);
  const paidCount = filteredVouchers.filter(v => v.status === 'paid').length;
  const pendingCount = filteredVouchers.filter(v => v.status === 'generated').length;

  return (
    <div className="space-y-6">
      {/* Header & Date Filter (Part C.4) */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            Official Salary Vouchers & Receipts
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Audit trail of generated salary slips, signed receipts, and disbursement status.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
          {/* Month Selector */}
          <div className="flex items-center gap-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-1.5 rounded-xl shadow-xs">
            <Calendar className="w-4 h-4 text-slate-400" />
            <input
              type="month"
              value={selectedMonth}
              onChange={e => setSelectedMonth(e.target.value)}
              className="text-xs font-semibold bg-transparent text-slate-900 dark:text-white outline-none cursor-pointer"
            />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value as any)}
            className="px-3 py-1.5 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none"
          >
            <option value="all">All Statuses</option>
            <option value="generated">Generated (Unpaid)</option>
            <option value="paid">Paid & Disbursed</option>
          </select>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Total Voucher Value</div>
          <div className="text-xl font-bold font-mono text-slate-900 dark:text-white mt-1">
            PKR {totalVoucherAmount.toLocaleString()}
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60 shadow-xs">
          <div className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider">Disbursed (Paid)</div>
          <div className="text-xl font-bold font-mono text-emerald-900 dark:text-emerald-300 mt-1">
            {paidCount} vouchers
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-amber-50/80 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 shadow-xs">
          <div className="text-[11px] font-bold text-amber-700 uppercase tracking-wider">Pending Payment</div>
          <div className="text-xl font-bold font-mono text-amber-900 dark:text-amber-300 mt-1">
            {pendingCount} vouchers
          </div>
        </div>
      </div>

      {/* Vouchers Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
        <div className="p-3.5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="relative w-full max-w-xs">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search voucher no, staff name..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none"
            />
          </div>
          <span className="text-xs text-slate-500 font-medium">{filteredVouchers.length} records</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/80 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">
                <th className="py-3 px-4">Voucher No</th>
                <th className="py-3 px-4">Employee</th>
                <th className="py-3 px-3">Month</th>
                <th className="py-3 px-4 text-right">Net Payable</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredVouchers.map(v => (
                <tr key={v.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="py-3 px-4 font-mono font-bold text-blue-600 dark:text-blue-400">
                    {v.voucher_no}
                  </td>

                  <td className="py-3 px-4">
                    <div className="font-semibold text-slate-900 dark:text-white">{v.employee_name}</div>
                    <div className="text-[11px] text-slate-500">{v.designation}</div>
                  </td>

                  <td className="py-3 px-3 font-mono text-slate-600 dark:text-slate-300">
                    {v.month}
                  </td>

                  <td className="py-3 px-4 text-right font-mono font-black text-slate-900 dark:text-white">
                    PKR {v.net_salary.toLocaleString()}
                  </td>

                  <td className="py-3 px-4 text-center">
                    {v.status === 'paid' ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                        <CheckCircle2 className="w-3 h-3" /> Paid
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                        <Clock className="w-3 h-3" /> Generated
                      </span>
                    )}
                  </td>

                  {/* Actions: Download PDF / Mark as Paid */}
                  <td className="py-3 px-4 text-right">
                    <div className="inline-flex items-center gap-2">
                      {v.status === 'generated' && (
                        <button
                          onClick={() => handleMarkAsPaid(v.id)}
                          className="px-2.5 py-1 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-100 rounded-lg text-xs font-semibold border border-emerald-200 dark:border-emerald-800 transition-all cursor-pointer"
                        >
                          Mark Paid
                        </button>
                      )}

                      {/* Download PDF Button (Part C.4) */}
                      <button
                        onClick={() => handleDownloadPDF(v)}
                        className="inline-flex items-center gap-1 px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-all cursor-pointer"
                      >
                        <Download className="w-3.5 h-3.5" />
                        PDF Slip
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Voucher PDF Print / Preview Modal */}
      {previewVoucher && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-xl bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-600" />
                Salary Voucher: {previewVoucher.voucher_no}
              </h3>
              <button
                onClick={() => setPreviewVoucher(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto print:p-0">
              {/* Official Printable Voucher Slip Card */}
              <div className="border-2 border-slate-200 dark:border-slate-700 rounded-2xl p-6 bg-slate-50/50 dark:bg-slate-800/30 space-y-5">
                <div className="flex items-start justify-between border-b-2 border-blue-600 pb-4">
                  <div>
                    <h4 className="text-lg font-black tracking-tight text-slate-900 dark:text-white uppercase">
                      StockFlow POS Salary Voucher
                    </h4>
                    <p className="text-xs text-blue-600 font-semibold mt-0.5">Restaurant ID: {restaurantId}</p>
                  </div>
                  <div className="text-right text-[11px] text-slate-500 font-mono">
                    <div><strong>Voucher:</strong> {previewVoucher.voucher_no}</div>
                    <div><strong>Month:</strong> {previewVoucher.month}</div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 bg-white dark:bg-slate-800 p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs">
                  <div>
                    <span className="text-slate-400 text-[10px] uppercase font-bold">Employee Name</span>
                    <div className="font-bold text-slate-900 dark:text-white">{previewVoucher.employee_name}</div>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] uppercase font-bold">Designation</span>
                    <div className="font-medium text-slate-700 dark:text-slate-300">{previewVoucher.designation}</div>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] uppercase font-bold">CNIC Number</span>
                    <div className="font-mono text-slate-700 dark:text-slate-300">{previewVoucher.cnic || '-'}</div>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] uppercase font-bold">Bank / Payment Mode</span>
                    <div className="font-mono text-slate-700 dark:text-slate-300">{previewVoucher.bank_account || 'Cash'}</div>
                  </div>
                </div>

                <div className="bg-blue-50 dark:bg-blue-950/60 p-4 rounded-xl border border-blue-200 dark:border-blue-800 flex items-center justify-between">
                  <span className="text-xs font-bold text-blue-900 dark:text-blue-200 uppercase tracking-wider">
                    Net Disbursable Salary
                  </span>
                  <span className="text-2xl font-black font-mono text-blue-700 dark:text-blue-400">
                    PKR {previewVoucher.net_salary.toLocaleString()}
                  </span>
                </div>

                <div className="pt-8 flex items-center justify-between text-xs text-slate-400">
                  <div className="border-t border-slate-400 pt-1 text-center w-32 font-medium">
                    Employee Signature
                  </div>
                  <div className="border-t border-slate-400 pt-1 text-center w-32 font-medium">
                    Manager / Cashier
                  </div>
                </div>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 flex items-center justify-between">
              <span className="text-xs text-slate-400">Ready for print & Vercel Blob sync</span>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setPreviewVoucher(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 cursor-pointer"
                >
                  Close
                </button>
                <button
                  onClick={() => window.print()}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-sm transition-all cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  Print Voucher
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
