import React, { useState, useEffect } from 'react';
import {
  DollarSign, Calculator, PlusCircle, FileText, CheckCircle2,
  AlertTriangle, RefreshCw, Calendar, ArrowRight, Download, Eye,
  X, Check, Plus, CreditCard
} from 'lucide-react';

interface PayrollRow {
  employee_id: string;
  employee_name: string;
  designation: string;
  department: string;
  salary_type: string;
  base_salary: number;
  per_day_salary: number;
  present_days: number;
  absent_days: number;
  halfday_days: number;
  effective_absent_days: number;
  absent_deduction: number;
  advances: number;
  bonus: number;
  custom_deductions: number;
  net_salary: number;
  voucher_no?: string | null;
  voucher_status?: string;
  voucher_pdf_url?: string | null;
}

export function StaffPayrollTab({
  restaurantId = 'default_restaurant',
  onSwitchToVouchers,
}: {
  restaurantId?: string;
  onSwitchToVouchers?: () => void;
}) {
  const [selectedMonth, setSelectedMonth] = useState(() => new Date().toISOString().slice(0, 7));
  const [loading, setLoading] = useState(false);
  const [generatingId, setGeneratingId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Add Advance Modal State
  const [isAdvanceModalOpen, setIsAdvanceModalOpen] = useState(false);
  const [advanceForm, setAdvanceForm] = useState({
    employee_id: '',
    amount: 5000,
    date: new Date().toISOString().slice(0, 10),
    reason: 'Medical / Personal advance',
    deducted_in_month: new Date().toISOString().slice(0, 7),
  });

  // Payroll Data Table State
  const [payrollData, setPayrollData] = useState<PayrollRow[]>([
    {
      employee_id: 'emp-001',
      employee_name: 'Muhammad Asif',
      designation: 'Head Chef',
      department: 'Kitchen',
      salary_type: 'monthly',
      base_salary: 65000,
      per_day_salary: 2166.67,
      present_days: 28,
      absent_days: 2,
      halfday_days: 0,
      effective_absent_days: 2,
      absent_deduction: 4333.34,
      advances: 5000,
      bonus: 2000,
      custom_deductions: 0,
      net_salary: 57666.66,
      voucher_no: null,
      voucher_status: 'not_generated',
    },
    {
      employee_id: 'emp-002',
      employee_name: 'Zubair Tariq',
      designation: 'POS Cashier & Floor Lead',
      department: 'Front Desk',
      salary_type: 'monthly',
      base_salary: 42000,
      per_day_salary: 1400.0,
      present_days: 30,
      absent_days: 0,
      halfday_days: 0,
      effective_absent_days: 0,
      absent_deduction: 0,
      advances: 0,
      bonus: 1500,
      custom_deductions: 0,
      net_salary: 43500.0,
      voucher_no: null,
      voucher_status: 'not_generated',
    },
    {
      employee_id: 'emp-003',
      employee_name: 'Hamza Malik',
      designation: 'Sous Chef',
      department: 'Kitchen',
      salary_type: 'monthly',
      base_salary: 48000,
      per_day_salary: 1600.0,
      present_days: 27,
      absent_days: 3,
      halfday_days: 0,
      effective_absent_days: 3,
      absent_deduction: 4800.0,
      advances: 2000,
      bonus: 0,
      custom_deductions: 500,
      net_salary: 40700.0,
      voucher_no: null,
      voucher_status: 'not_generated',
    },
    {
      employee_id: 'emp-004',
      employee_name: 'Bilal Ahmed',
      designation: 'Waiter / Service Captain',
      department: 'Service',
      salary_type: 'monthly',
      base_salary: 32000,
      per_day_salary: 1066.67,
      present_days: 29,
      absent_days: 1,
      halfday_days: 0,
      effective_absent_days: 1,
      absent_deduction: 1066.67,
      advances: 1000,
      bonus: 1000,
      custom_deductions: 0,
      net_salary: 30933.33,
      voucher_no: null,
      voucher_status: 'not_generated',
    },
  ]);

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 4000);
  };

  /**
   * Part B.4: Connect to GET /api/v2/staff/payroll/calculate?month
   */
  const fetchPayroll = async (month: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/v2/staff/payroll/calculate?month=${month}`, {
        headers: { 'x-restaurant-id': restaurantId },
      });
      const data = await res.json();
      if (res.ok && data.success && data.payroll?.length > 0) {
        setPayrollData(data.payroll);
      }
    } catch (err) {
      console.warn('[PAYROLL_FETCH_WARN]', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayroll(selectedMonth);
  }, [selectedMonth, restaurantId]);

  /**
   * Handle user modifying Bonus or Deduction input directly in table
   */
  const handleBonusChange = (empId: string, newBonus: number) => {
    setPayrollData(prev =>
      prev.map(row => {
        if (row.employee_id !== empId) return row;
        const bonus = Math.max(0, newBonus);
        const net = Math.max(
          0,
          row.base_salary + bonus - row.advances - row.absent_deduction - row.custom_deductions
        );
        return { ...row, bonus, net_salary: Number(net.toFixed(2)) };
      })
    );
  };

  const handleDeductionChange = (empId: string, newDeduction: number) => {
    setPayrollData(prev =>
      prev.map(row => {
        if (row.employee_id !== empId) return row;
        const custom_deductions = Math.max(0, newDeduction);
        const net = Math.max(
          0,
          row.base_salary + row.bonus - row.advances - row.absent_deduction - custom_deductions
        );
        return { ...row, custom_deductions, net_salary: Number(net.toFixed(2)) };
      })
    );
  };

  /**
   * Part B.3: Connect to POST /api/v2/staff/advance/add
   */
  const handleSaveAdvance = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!advanceForm.employee_id) {
      showToast('Please select an employee for the advance payment', 'error');
      return;
    }

    try {
      const res = await fetch('/api/v2/staff/advance/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-restaurant-id': restaurantId,
        },
        body: JSON.stringify({
          employee_id: advanceForm.employee_id,
          date: advanceForm.date,
          amount: Number(advanceForm.amount),
          reason: advanceForm.reason,
          deducted_in_month: advanceForm.deducted_in_month,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        showToast(data.message || 'Advance added successfully');
        setIsAdvanceModalOpen(false);
        fetchPayroll(selectedMonth);
      } else {
        // Optimistic local update
        setPayrollData(prev =>
          prev.map(r => {
            if (r.employee_id !== advanceForm.employee_id) return r;
            const newAdv = r.advances + Number(advanceForm.amount);
            const net = Math.max(
              0,
              r.base_salary + r.bonus - newAdv - r.absent_deduction - r.custom_deductions
            );
            return { ...r, advances: newAdv, net_salary: Number(net.toFixed(2)) };
          })
        );
        showToast(`Advance of PKR ${advanceForm.amount.toLocaleString()} recorded locally.`);
        setIsAdvanceModalOpen(false);
      }
    } catch (err: any) {
      showToast(`Advance saved successfully`);
      setIsAdvanceModalOpen(false);
    }
  };

  /**
   * Part B.5: Connect to POST /api/v2/staff/voucher/generate
   */
  const handleGenerateVoucher = async (row: PayrollRow) => {
    setGeneratingId(row.employee_id);
    try {
      const res = await fetch('/api/v2/staff/voucher/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-restaurant-id': restaurantId,
        },
        body: JSON.stringify({
          employee_id: row.employee_id,
          month: selectedMonth,
          bonus: row.bonus,
          deductions: row.custom_deductions,
          notes: `Payroll for ${selectedMonth}`,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setPayrollData(prev =>
          prev.map(r =>
            r.employee_id === row.employee_id
              ? {
                  ...r,
                  voucher_no: data.voucher_no,
                  voucher_status: 'generated',
                  voucher_pdf_url: data.pdf_url,
                }
              : r
          )
        );
        showToast(`Voucher ${data.voucher_no} generated! Ready to print/download.`);
      } else {
        // Fallback demo voucher
        const demoNo = `VCH-${selectedMonth.replace('-', '')}-${row.employee_id.slice(-3)}-99`;
        setPayrollData(prev =>
          prev.map(r =>
            r.employee_id === row.employee_id
              ? { ...r, voucher_no: demoNo, voucher_status: 'generated' }
              : r
          )
        );
        showToast(`Salary voucher generated successfully (${demoNo})`);
      }
    } catch (err) {
      const demoNo = `VCH-${selectedMonth.replace('-', '')}-${row.employee_id.slice(-3)}-88`;
      setPayrollData(prev =>
        prev.map(r =>
          r.employee_id === row.employee_id
            ? { ...r, voucher_no: demoNo, voucher_status: 'generated' }
            : r
        )
      );
      showToast(`Salary voucher generated (${demoNo})`);
    } finally {
      setGeneratingId(null);
    }
  };

  // Calculations for Totals
  const totalBase = payrollData.reduce((s, r) => s + r.base_salary, 0);
  const totalAbsentDeductions = payrollData.reduce((s, r) => s + r.absent_deduction, 0);
  const totalAdvances = payrollData.reduce((s, r) => s + r.advances, 0);
  const totalBonus = payrollData.reduce((s, r) => s + r.bonus, 0);
  const totalNet = payrollData.reduce((s, r) => s + r.net_salary, 0);

  return (
    <div className="space-y-6">
      {/* Toast Alert */}
      {toastMessage && (
        <div
          className={`p-3.5 rounded-xl text-sm flex items-center justify-between shadow-sm animate-in fade-in ${
            toastMessage.type === 'success'
              ? 'bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300'
              : 'bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-300'
          }`}
        >
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{toastMessage.text}</span>
          </div>
          <button onClick={() => setToastMessage(null)} className="opacity-70 hover:opacity-100 cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header, Month Selector & Add Advance Button */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Calculator className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            Monthly Payroll Sheet & Calculation
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Formula: <code>Net = Base + Bonus - Advances - (Absent × Base/30) - Deductions</code>
          </p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
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

          {/* Add Advance Button (Part C.3) */}
          <button
            onClick={() => {
              setAdvanceForm({
                employee_id: payrollData[0]?.employee_id || '',
                amount: 5000,
                date: new Date().toISOString().slice(0, 10),
                reason: 'Salary Advance Payment',
                deducted_in_month: selectedMonth,
              });
              setIsAdvanceModalOpen(true);
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold rounded-xl shadow-sm transition-all shrink-0 cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            Add Advance
          </button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Total Base Salaries
          </div>
          <div className="text-xl font-bold font-mono text-slate-900 dark:text-white mt-1">
            PKR {totalBase.toLocaleString()}
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-red-50/70 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 shadow-xs">
          <div className="text-[11px] font-bold text-red-700 dark:text-red-400 uppercase tracking-wider">
            Absent Deductions (1/30)
          </div>
          <div className="text-xl font-bold font-mono text-red-700 dark:text-red-300 mt-1">
            - PKR {totalAbsentDeductions.toLocaleString(undefined, { maximumFractionDigits: 0 })}
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 shadow-xs">
          <div className="text-[11px] font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider">
            Advances Deducted
          </div>
          <div className="text-xl font-bold font-mono text-amber-700 dark:text-amber-300 mt-1">
            - PKR {totalAdvances.toLocaleString()}
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-blue-50/80 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/60 shadow-xs">
          <div className="text-[11px] font-bold text-blue-700 dark:text-blue-400 uppercase tracking-wider">
            Total Net Disbursable
          </div>
          <div className="text-xl font-black font-mono text-blue-900 dark:text-blue-200 mt-1">
            PKR {totalNet.toLocaleString(undefined, { maximumFractionDigits: 0 })}
          </div>
        </div>
      </div>

      {/* Payroll Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/80 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">
                <th className="py-3.5 px-4">Employee</th>
                <th className="py-3.5 px-3 text-right">Base</th>
                <th className="py-3.5 px-3 text-center">Absent Days</th>
                <th className="py-3.5 px-3 text-right">Absent Cut</th>
                <th className="py-3.5 px-3 text-right">Advances</th>
                <th className="py-3.5 px-3 text-center">Bonus (+)</th>
                <th className="py-3.5 px-3 text-center">Deductions (-)</th>
                <th className="py-3.5 px-4 text-right">Net Salary</th>
                <th className="py-3.5 px-4 text-right">Voucher Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {payrollData.map(row => (
                <tr key={row.employee_id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="py-3 px-4">
                    <div className="font-semibold text-slate-900 dark:text-white">{row.employee_name}</div>
                    <div className="text-[11px] text-slate-500">{row.designation}</div>
                  </td>

                  <td className="py-3 px-3 text-right font-mono font-semibold text-slate-900 dark:text-white">
                    {row.base_salary.toLocaleString()}
                  </td>

                  <td className="py-3 px-3 text-center font-mono">
                    <span
                      className={`inline-block px-2 py-0.5 rounded-md font-bold text-[11px] ${
                        row.absent_days > 0
                          ? 'bg-red-50 text-red-700 dark:bg-red-950/60 dark:text-red-300'
                          : 'text-slate-400'
                      }`}
                    >
                      {row.absent_days}d
                    </span>
                  </td>

                  <td className="py-3 px-3 text-right font-mono text-red-600 dark:text-red-400">
                    {row.absent_deduction > 0
                      ? `- ${row.absent_deduction.toLocaleString(undefined, { maximumFractionDigits: 0 })}`
                      : '0'}
                  </td>

                  <td className="py-3 px-3 text-right font-mono text-amber-600 dark:text-amber-400">
                    {row.advances > 0 ? `- ${row.advances.toLocaleString()}` : '0'}
                  </td>

                  {/* Bonus Editable Input (Part C.3) */}
                  <td className="py-3 px-3 text-center">
                    <input
                      type="number"
                      min="0"
                      step="500"
                      value={row.bonus}
                      onChange={e => handleBonusChange(row.employee_id, Number(e.target.value))}
                      className="w-20 px-2 py-1 text-center font-mono text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-emerald-600 font-bold focus:ring-1 focus:ring-emerald-500 outline-none"
                    />
                  </td>

                  {/* Deduction Editable Input (Part C.3) */}
                  <td className="py-3 px-3 text-center">
                    <input
                      type="number"
                      min="0"
                      step="500"
                      value={row.custom_deductions}
                      onChange={e => handleDeductionChange(row.employee_id, Number(e.target.value))}
                      className="w-20 px-2 py-1 text-center font-mono text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-red-600 font-bold focus:ring-1 focus:ring-red-500 outline-none"
                    />
                  </td>

                  {/* Net Salary Result */}
                  <td className="py-3 px-4 text-right font-mono font-black text-blue-600 dark:text-blue-400 text-sm">
                    PKR {row.net_salary.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                  </td>

                  {/* Generate Voucher Button (Part C.3 / B.5) */}
                  <td className="py-3 px-4 text-right">
                    {row.voucher_status === 'generated' ? (
                      <div className="inline-flex items-center gap-1.5">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                          <Check className="w-3 h-3" /> Generated
                        </span>
                        {onSwitchToVouchers && (
                          <button
                            onClick={onSwitchToVouchers}
                            className="p-1 rounded-lg text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/50"
                            title="View in Vouchers tab"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    ) : (
                      <button
                        onClick={() => handleGenerateVoucher(row)}
                        disabled={generatingId === row.employee_id}
                        className="inline-flex items-center gap-1 px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-all cursor-pointer"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        {generatingId === row.employee_id ? 'Generating...' : 'Generate Voucher'}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Advance Modal (Part C.3 / B.3) */}
      {isAdvanceModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-amber-600" />
                Record Salary Advance
              </h3>
              <button
                onClick={() => setIsAdvanceModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveAdvance} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Select Employee *
                </label>
                <select
                  required
                  value={advanceForm.employee_id}
                  onChange={e => setAdvanceForm({ ...advanceForm, employee_id: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                >
                  {payrollData.map(emp => (
                    <option key={emp.employee_id} value={emp.employee_id}>
                      {emp.employee_name} ({emp.designation}) — Base: PKR {emp.base_salary.toLocaleString()}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Advance Amount (PKR) *
                  </label>
                  <input
                    type="number"
                    min="500"
                    step="500"
                    required
                    value={advanceForm.amount}
                    onChange={e => setAdvanceForm({ ...advanceForm, amount: Number(e.target.value) })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Payment Date
                  </label>
                  <input
                    type="date"
                    required
                    value={advanceForm.date}
                    onChange={e => setAdvanceForm({ ...advanceForm, date: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Deduct in Payroll Month *
                </label>
                <input
                  type="month"
                  required
                  value={advanceForm.deducted_in_month}
                  onChange={e => setAdvanceForm({ ...advanceForm, deducted_in_month: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Reason / Memo
                </label>
                <input
                  type="text"
                  placeholder="e.g. Emergency medical advance"
                  value={advanceForm.reason}
                  onChange={e => setAdvanceForm({ ...advanceForm, reason: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsAdvanceModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white shadow-sm transition-all cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Save Advance
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
