import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getRestaurantId, isStaffV2Enabled, staffDbClient } from '../../../../lib/staff-v2-db';

const AddAdvanceSchema = z.object({
  employee_id: z.string().min(1, 'employee_id is required'),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'date must be in YYYY-MM-DD format'),
  amount: z.number().positive('amount must be greater than zero'),
  reason: z.string().optional().default(''),
  deducted_in_month: z.string().regex(/^\d{4}-\d{2}(-\d{2})?$/, 'deducted_in_month must be YYYY-MM or YYYY-MM-DD'),
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
    const parsed = AddAdvanceSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: 'Validation failed', details: parsed.error.format() },
        { status: 400 }
      );
    }

    const { employee_id, date, amount, reason, deducted_in_month } = parsed.data;
    // Normalize deducted_in_month to first day of month: YYYY-MM-01
    const normalizedMonth = deducted_in_month.length === 7 ? `${deducted_in_month}-01` : deducted_in_month;

    const { data, error } = await staffDbClient
      .from('salary_advances')
      .insert({
        restaurant_id: restaurantId,
        employee_id,
        date,
        amount,
        reason: reason || '',
        deducted_in_month: normalizedMonth,
        created_by: 'manager',
      })
      .select()
      .single();

    if (error) {
      console.error('[SALARY_ADVANCE_ADD_ERROR]', error);
      return NextResponse.json(
        { success: false, error: 'Failed to record salary advance', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: `Salary advance of PKR ${amount.toLocaleString()} recorded successfully`,
        record: data,
      },
      { status: 201 }
    );
  } catch (err: any) {
    console.error('[SALARY_ADVANCE_ADD_UNHANDLED]', err);
    return NextResponse.json(
      { success: false, error: err?.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
