import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getRestaurantId, isStaffV2Enabled, staffDbClient } from '../../../../../lib/staff-v2-db';

const MonthlyQuerySchema = z.object({
  employee_id: z.string().optional(),
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
    const employee_id = url.searchParams.get('employee_id') || undefined;
    const rawMonth = url.searchParams.get('month') || new Date().toISOString().slice(0, 7);

    const parsed = MonthlyQuerySchema.safeParse({ employee_id, month: rawMonth });
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: 'Invalid query parameters', details: parsed.error.format() },
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

    let query = staffDbClient
      .from('attendance_logs')
      .select('id, employee_id, date, status, check_in, check_out')
      .eq('restaurant_id', restaurantId)
      .gte('date', startDate)
      .lte('date', endDate);

    if (employee_id) {
      query = query.eq('employee_id', employee_id);
    }

    const { data: logs, error } = await query;

    if (error) {
      console.error('[ATTENDANCE_MONTHLY_ERROR]', error);
      return NextResponse.json(
        { success: false, error: 'Failed to retrieve attendance logs', details: error.message },
        { status: 500 }
      );
    }

    // Aggregate counts
    let presentCount = 0;
    let absentCount = 0;
    let halfdayCount = 0;
    let leaveCount = 0;

    const employeeMap: Record<string, { present: number; absent: number; halfday: number; leave: number; logs: any[] }> = {};

    (logs || []).forEach((log: any) => {
      const status = log.status?.toLowerCase();
      if (status === 'present') presentCount++;
      else if (status === 'absent') absentCount++;
      else if (status === 'halfday') halfdayCount++;
      else if (status === 'leave') leaveCount++;

      if (!employeeMap[log.employee_id]) {
        employeeMap[log.employee_id] = { present: 0, absent: 0, halfday: 0, leave: 0, logs: [] };
      }
      if (status === 'present') employeeMap[log.employee_id].present++;
      else if (status === 'absent') employeeMap[log.employee_id].absent++;
      else if (status === 'halfday') employeeMap[log.employee_id].halfday++;
      else if (status === 'leave') employeeMap[log.employee_id].leave++;
      employeeMap[log.employee_id].logs.push(log);
    });

    return NextResponse.json(
      {
        success: true,
        restaurant_id: restaurantId,
        month,
        total_days: daysInMonth,
        summary: {
          present_days: presentCount,
          absent_days: absentCount,
          halfday_days: halfdayCount,
          leave_days: leaveCount,
          total_records: (logs || []).length,
        },
        by_employee: employeeMap,
        records: logs || [],
      },
      { status: 200 }
    );
  } catch (err: any) {
    console.error('[ATTENDANCE_MONTHLY_UNHANDLED]', err);
    return NextResponse.json(
      { success: false, error: err?.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
