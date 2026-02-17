import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/mongodb';
import { verifyToken } from '@/lib/auth/jwt';
import CustomFieldModel from '@/app/financial-tracker/models/custom-field.model';
import ActivityService from '@/app/financial-tracker/services/activity-service';

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const token = request.cookies.get('token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const decoded = verifyToken(token);
    if (!decoded || decoded.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { entityId, fieldOrders } = await request.json();

    const updates = fieldOrders.map(({ fieldId, order }: { fieldId: string; order: number }) =>
      CustomFieldModel.findByIdAndUpdate(
        fieldId,
        { order, updatedBy: decoded.userId },
        { new: true }
      )
    );

    await Promise.all(updates);

    await ActivityService.log({
      userId: decoded.userId,
      module: 'admin',
      entity: 'fields',
      action: 'UPDATE',
      changes: [{ field: 'reorder', oldValue: null, newValue: fieldOrders }]
    });

    return NextResponse.json({ message: 'Fields reordered successfully' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}