import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getRestaurantId, isStaffV2Enabled, staffDbClient } from '../../../../../lib/staff-v2-db';

const MarkAttendanceSchema = z.object({
  employee_id: z.string().min(1, 'employee_id is required'),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'date must be in YYYY-MM-DD format'),
  status: z.enum(['present', 'absent', 'halfday', 'leave'], {
    errorMap: () => ({ message: 'status must be present, absent, halfday, or leave' }),
  }),
  check_in: z.string().optional().nullable(),
  check_out: z.string().optional().nullable(),
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
    const parsed = MarkAttendanceSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: 'Validation failed', details: parsed.error.format() },
        { status: 400 }
      );
    }

    const { employee_id, date, status, check_in, check_out } = parsed.data;

    // Upsert into attendance_logs using restaurant_id + employee_id + date constraint
    const { data, error } = await staffDbClient
      .from('attendance_logs')
      .upsert(
        {
          restaurant_id: restaurantId,
          employee_id,
          date,
          status,
          check_in: check_in || (status === 'present' ? new Date().toISOString() : null),
          check_out: check_out || null,
          created_by: 'manager',
        },
        {
          onConflict: 'restaurant_id,employee_id,date',
        }
      )
      .select()
      .single();

    if (error) {
      console.error('[ATTENDANCE_MARK_ERROR]', error);
      return NextResponse.json(
        { success: false, error: 'Failed to record attendance', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: `Attendance marked as ${status} for ${date}`,
        record: data,
      },
      { status: 200 }
    );
  } catch (err: any) {
    console.error('[ATTENDANCE_MARK_UNHANDLED]', err);
    return NextResponse.json(
      { success: false, error: err?.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
