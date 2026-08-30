import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import {
  getRestaurantId,
  isStaffV2Enabled,
  staffDbClient,
  calculatePerDaySalary,
  calculateNetSalary,
  uploadSalaryVoucherPDF,
} from '../../../../../lib/staff-v2-db';

const GenerateVoucherSchema = z.object({
  employee_id: z.string().min(1, 'employee_id is required'),
  month: z.string().regex(/^\d{4}-\d{2}(-\d{2})?$/, 'month must be in YYYY-MM or YYYY-MM-DD format'),
  bonus: z.number().min(0).optional().default(0),
  deductions: z.number().min(0).optional().default(0),
  notes: z.string().optional().default(''),
});

export async function POST(req: NextRequest) {
  try {
    const restaurantId = getRestaurantId(req);
    const enabled = await isStaffV2Enabled(restaurantId);

    if (!enabled) {
      return NextResponse.json(
        { success: false, error: 'Staff Management v2 is currently disabled for this restaurant' },
        { status: 403 }
      );
    }

    const body = await req.json();
    const parsed = GenerateVoucherSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: 'Validation failed', details: parsed.error.format() },
        { status: 400 }
      );
    }

    const { employee_id, bonus, deductions } = parsed.data;
    const monthRaw = parsed.data.month.slice(0, 7);
    const monthFirstDay = `${monthRaw}-01`;

    const [yearStr, monthStr] = monthRaw.split('-');
    const year = parseInt(yearStr, 10);
    const monthNum = parseInt(monthStr, 10);
    const daysInMonth = new Date(year, monthNum, 0).getDate();
    const monthEndDay = `${monthRaw}-${String(daysInMonth).padStart(2, '0')}`;

    // 1. Fetch employee details
    const { data: employee, error: empErr } = await staffDbClient
      .from('employees')
      .select('id, name, base_salary, designation, department')
      .eq('restaurant_id', restaurantId)
      .eq('id', employee_id)
      .single();

    if (empErr || !employee) {
      return NextResponse.json(
        { success: false, error: 'Employee not found', details: empErr?.message },
        { status: 404 }
      );
    }

    // 2. Fetch monthly attendance
    const { data: attLogs } = await staffDbClient
      .from('attendance_logs')
      .select('status')
      .eq('restaurant_id', restaurantId)
      .eq('employee_id', employee_id)
      .gte('date', monthFirstDay)
      .lte('date', monthEndDay);

    let presentDays = 0;
    let absentDays = 0;
    let halfdayDays = 0;
    (attLogs || []).forEach((log: any) => {
      const s = log.status?.toLowerCase();
      if (s === 'present') presentDays++;
      else if (s === 'absent') absentDays++;
      else if (s === 'halfday') halfdayDays++;
    });
    const effectiveAbsentDays = absentDays + (halfdayDays * 0.5);

    // 3. Fetch advances for this deduction month
    const { data: advLogs } = await staffDbClient
      .from('salary_advances')
      .select('amount')
      .eq('restaurant_id', restaurantId)
      .eq('employee_id', employee_id)
      .gte('deducted_in_month', monthFirstDay)
      .lte('deducted_in_month', monthEndDay);

    const totalAdvances = (advLogs || []).reduce((acc: number, curr: any) => acc + Number(curr.amount || 0), 0);

    const baseSalary = Number(employee.base_salary || 0);
    const { perDaySalary, absentDeduction, netSalary } = calculateNetSalary({
      baseSalary,
      bonus,
      advances: totalAdvances,
      absentDays: effectiveAbsentDays,
      customDeductions: deductions,
    });

    // 4. Generate unique voucher number
    const cleanId = employee_id.replace(/[^a-zA-Z0-9]/g, '').slice(-4);
    const voucherNo = `VCH-${monthRaw.replace('-', '')}-${cleanId}-${Date.now().toString().slice(-4)}`;

    // 5. Upload / generate PDF voucher via @vercel/blob
    const pdfUrl = await uploadSalaryVoucherPDF({
      voucherNo,
      employeeName: employee.name,
      restaurantId,
      month: monthRaw,
      netSalary,
      baseSalary,
      bonus: bonus || 0,
      advances: totalAdvances,
      absentDeduction,
      deductions: deductions || 0,
    });

    // 6. Save or update salary_vouchers row
    const { data: voucherData, error: voucherErr } = await staffDbClient
      .from('salary_vouchers')
      .upsert(
        {
          restaurant_id: restaurantId,
          employee_id,
          month: monthFirstDay,
          net_salary: netSalary,
          voucher_no: voucherNo,
          pdf_url: pdfUrl,
          status: 'generated',
          created_at: new Date().toISOString(),
        },
        { onConflict: 'restaurant_id,employee_id,month' }
      )
      .select()
      .single();

    if (voucherErr) {
      console.error('[VOUCHER_INSERT_ERROR]', voucherErr);
    }

    // 7. Save payroll_history snapshot
    await staffDbClient
      .from('payroll_history')
      .upsert(
        {
          restaurant_id: restaurantId,
          employee_id,
          month: monthFirstDay,
          base_salary: baseSalary,
          present_days: presentDays,
          absent_days: absentDays,
          bonus: bonus || 0,
          advances: totalAdvances,
          deductions: deductions || 0,
          net_salary: netSalary,
          created_at: new Date().toISOString(),
        },
        { onConflict: 'restaurant_id,employee_id,month' }
      );

    return NextResponse.json(
      {
        success: true,
        message: `Salary voucher ${voucherNo} generated successfully`,
        voucher_no: voucherNo,
        pdf_url: pdfUrl,
        net_salary: netSalary,
        record: voucherData || { voucher_no: voucherNo, pdf_url: pdfUrl, net_salary: netSalary },
      },
      { status: 201 }
    );
  } catch (err: any) {
    console.error('[GENERATE_VOUCHER_UNHANDLED]', err);
    return NextResponse.json(
      { success: false, error: err?.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
