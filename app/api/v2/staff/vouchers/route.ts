import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getRestaurantId, isStaffV2Enabled, staffDbClient } from '../../../lib/staff-v2-db';

const VouchersQuerySchema = z.object({
  month: z.string().regex(/^\d{4}-\d{2}$/, 'month must be in YYYY-MM format').optional(),
  status: z.enum(['generated', 'paid']).optional(),
  employee_id: z.string().optional(),
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
    const rawMonth = url.searchParams.get('month') || undefined;
    const rawStatus = url.searchParams.get('status') || undefined;
    const rawEmployeeId = url.searchParams.get('employee_id') || undefined;

    const parsed = VouchersQuerySchema.safeParse({
      month: rawMonth,
      status: rawStatus,
      employee_id: rawEmployeeId,
    });

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: 'Invalid query parameters', details: parsed.error.format() },
        { status: 400 }
      );
    }

    // 1. Fetch employees map for names & details
    const { data: employees } = await staffDbClient
      .from('employees')
      .select('id, name, designation, department, cnic, bank_account')
      .eq('restaurant_id', restaurantId);

    const empMap = new Map((employees || []).map((e: any) => [e.id, e]));

    // 2. Query salary_vouchers
    let query = staffDbClient
      .from('salary_vouchers')
      .select('*')
      .eq('restaurant_id', restaurantId)
      .order('created_at', { ascending: false });

    if (parsed.data.month) {
      const monthFirstDay = `${parsed.data.month}-01`;
      query = query.eq('month', monthFirstDay);
    }

    if (parsed.data.status) {
      query = query.eq('status', parsed.data.status);
    }

    if (parsed.data.employee_id) {
      query = query.eq('employee_id', parsed.data.employee_id);
    }

    const { data: vouchers, error } = await query;

    if (error) {
      console.error('[SALARY_VOUCHERS_FETCH_ERROR]', error);
      return NextResponse.json(
        { success: false, error: 'Failed to retrieve vouchers', details: error.message },
        { status: 500 }
      );
    }

    let totalAmount = 0;
    let paidAmount = 0;
    let pendingAmount = 0;

    const list = (vouchers || []).map((v: any) => {
      const emp = empMap.get(v.employee_id) || { name: 'Unknown Employee', designation: 'Staff' };
      const net = Number(v.net_salary || 0);

      totalAmount += net;
      if (v.status === 'paid') paidAmount += net;
      else pendingAmount += net;

      return {
        id: v.id,
        restaurant_id: v.restaurant_id,
        employee_id: v.employee_id,
        employee_name: emp.name,
        designation: emp.designation,
        cnic: emp.cnic || '-',
        bank_account: emp.bank_account || '-',
        month: typeof v.month === 'string' ? v.month.slice(0, 7) : v.month,
        net_salary: net,
        voucher_no: v.voucher_no,
        pdf_url: v.pdf_url,
        status: v.status,
        paid_date: v.paid_date,
        created_at: v.created_at,
      };
    });

    return NextResponse.json(
      {
        success: true,
        restaurant_id: restaurantId,
        month_filter: parsed.data.month || 'all',
        total_count: list.length,
        summary: {
          total_amount: totalAmount,
          paid_amount: paidAmount,
          pending_amount: pendingAmount,
        },
        vouchers: list,
      },
      { status: 200 }
    );
  } catch (err: any) {
    console.error('[SALARY_VOUCHERS_UNHANDLED]', err);
    return NextResponse.json(
      { success: false, error: err?.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
