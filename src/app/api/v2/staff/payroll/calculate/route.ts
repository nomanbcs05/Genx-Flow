import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import {
  getRestaurantId,
  isStaffV2Enabled,
  staffDbClient,
  calculatePerDaySalary,
  calculateNetSalary,
} from '../../../../../lib/staff-v2-db';

const PayrollCalcQuerySchema = z.object({
  month: z.string().regex(/^\d{4}-\d{2}$/, 'month must be in YYYY-MM format').optional(),
});

export async function GET(req: NextRequest) {
  try {
    const restaurantId = getRestaurantId(req);
    const enabled = await isStaffV2Enabled(restaurantId);

    if (!enabled) {
      return NextResponse.json(
        { success: false, error: 'Staff Management v2 is currently disabled for this restaurant' },
        { status: 403 }
      );
    }

    const url = new URL(req.url);
    const rawMonth = url.searchParams.get('month') || new Date().toISOString().slice(0, 7);

    const parsed = PayrollCalcQuerySchema.safeParse({ month: rawMonth });
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: 'Invalid month format', details: parsed.error.format() },
        { status: 400 }
      );
    }

    const month = parsed.data.month || new Date().toISOString().slice(0, 7);
    const [yearStr, monthStr] = month.split('-');
    const year = parseInt(yearStr, 10);
    const monthNum = parseInt(monthStr, 10);

    const startDate = `${month}-01`;
    const daysInMonth = new Date(year, monthNum, 0).getDate();
    const endDate = `${month}-${String(daysInMonth).padStart(2, '0')}`;

    // 1. Fetch active employees
    const { data: employees, error: empErr } = await staffDbClient
      .from('employees')
      .select('id, name, designation, department, base_salary, salary_type, cnic, bank_account, status')
      .eq('restaurant_id', restaurantId)
      .eq('status', 'active');

    if (empErr) {
      console.error('[PAYROLL_EMP_FETCH_ERROR]', empErr);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch employees', details: empErr.message },
        { status: 500 }
      );
    }

    // 2. Fetch monthly attendance
    const { data: attendanceLogs, error: attErr } = await staffDbClient
      .from('attendance_logs')
      .select('employee_id, status, date')
      .eq('restaurant_id', restaurantId)
      .gte('date', startDate)
      .lte('date', endDate);

    if (attErr) {
      console.warn('[PAYROLL_ATTENDANCE_FETCH_WARN]', attErr);
    }

    // 3. Fetch advances for this deduction month
    const { data: advancesLogs, error: advErr } = await staffDbClient
      .from('salary_advances')
      .select('id, employee_id, amount, reason, date')
      .eq('restaurant_id', restaurantId)
      .gte('deducted_in_month', startDate)
      .lte('deducted_in_month', endDate);

    if (advErr) {
      console.warn('[PAYROLL_ADVANCES_FETCH_WARN]', advErr);
    }

    // 4. Fetch existing payroll history for saved bonus/deductions/vouchers
    const { data: savedHistory } = await staffDbClient
      .from('payroll_history')
      .select('*')
      .eq('restaurant_id', restaurantId)
      .eq('month', startDate);

    const savedMap = new Map((savedHistory || []).map((h: any) => [h.employee_id, h]));

    // 5. Fetch vouchers for this month
    const { data: vouchers } = await staffDbClient
      .from('salary_vouchers')
      .select('*')
      .eq('restaurant_id', restaurantId)
      .eq('month', startDate);

    const voucherMap = new Map((vouchers || []).map((v: any) => [v.employee_id, v]));

    // Map logs
    const attendanceMap = new Map<string, { present: number; absent: number; halfday: number; leave: number }>();
    (attendanceLogs || []).forEach((log: any) => {
      const curr = attendanceMap.get(log.employee_id) || { present: 0, absent: 0, halfday: 0, leave: 0 };
      const s = log.status?.toLowerCase();
      if (s === 'present') curr.present++;
      else if (s === 'absent') curr.absent++;
      else if (s === 'halfday') curr.halfday++;
      else if (s === 'leave') curr.leave++;
      attendanceMap.set(log.employee_id, curr);
    });

    const advancesMap = new Map<string, number>();
    (advancesLogs || []).forEach((adv: any) => {
      const curr = advancesMap.get(adv.employee_id) || 0;
      advancesMap.set(adv.employee_id, curr + Number(adv.amount || 0));
    });

    // 6. Build response rows
    let totalBaseSalary = 0;
    let totalAdvances = 0;
    let totalAbsentDeductions = 0;
    let totalBonus = 0;
    let totalCustomDeductions = 0;
    let totalNetSalary = 0;

    const rows = (employees || []).map((emp: any) => {
      const att = attendanceMap.get(emp.id) || { present: 0, absent: 0, halfday: 0, leave: 0 };
      const advTotal = advancesMap.get(emp.id) || 0;
      const baseSalary = Number(emp.base_salary || 0);

      const saved = savedMap.get(emp.id);
      const bonus = saved ? Number(saved.bonus || 0) : 0;
      const customDeductions = saved ? Number(saved.deductions || 0) : 0;

      // Formula: PerDay = Base / 30
      const perDaySalary = calculatePerDaySalary(baseSalary);
      // Halfday counts as 0.5 absent day
      const effectiveAbsentDays = att.absent + (att.halfday * 0.5);
      const absentDeduction = Number((effectiveAbsentDays * perDaySalary).toFixed(2));

      // Net = Base + Bonus - Advances - (Absent * PerDay) - Deductions
      const netCalc = calculateNetSalary({
        baseSalary,
        bonus,
        advances: advTotal,
        absentDays: effectiveAbsentDays,
        customDeductions,
      });

      const voucher = voucherMap.get(emp.id);

      totalBaseSalary += baseSalary;
      totalAdvances += advTotal;
      totalAbsentDeductions += absentDeduction;
      totalBonus += bonus;
      totalCustomDeductions += customDeductions;
      totalNetSalary += netCalc.netSalary;

      return {
        employee_id: emp.id,
        employee_name: emp.name,
        designation: emp.designation || 'Staff',
        department: emp.department || 'General',
        cnic: emp.cnic || '-',
        bank_account: emp.bank_account || '-',
        salary_type: emp.salary_type || 'monthly',
        base_salary: baseSalary,
        per_day_salary: perDaySalary,
        present_days: att.present,
        absent_days: att.absent,
        halfday_days: att.halfday,
        leave_days: att.leave,
        effective_absent_days: effectiveAbsentDays,
        absent_deduction: absentDeduction,
        advances: advTotal,
        bonus,
        custom_deductions: customDeductions,
        net_salary: netCalc.netSalary,
        voucher_no: voucher ? voucher.voucher_no : null,
        voucher_status: voucher ? voucher.status : 'not_generated',
        voucher_pdf_url: voucher ? voucher.pdf_url : null,
      };
    });

    return NextResponse.json(
      {
        success: true,
        restaurant_id: restaurantId,
        month,
        days_in_month: daysInMonth,
        totals: {
          employees_count: rows.length,
          total_base_salary: totalBaseSalary,
          total_advances: totalAdvances,
          total_absent_deductions: totalAbsentDeductions,
          total_bonus: totalBonus,
          total_custom_deductions: totalCustomDeductions,
          total_net_salary: totalNetSalary,
        },
        payroll: rows,
      },
      { status: 200 }
    );
  } catch (err: any) {
    console.error('[PAYROLL_CALCULATE_UNHANDLED]', err);
    return NextResponse.json(
      { success: false, error: err?.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
