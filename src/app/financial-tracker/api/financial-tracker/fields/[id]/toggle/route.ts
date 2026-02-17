import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/mongodb';
import { verifyToken } from '@/lib/auth/jwt';
import CustomFieldModel from '@/app/financial-tracker/models/custom-field.model';
import ActivityService from '@/app/financial-tracker/services/activity-service';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    const token = request.cookies.get('token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const decoded = verifyToken(token);
    if (!decoded || decoded.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const field = await CustomFieldModel.findById(params.id);
    if (!field) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    if (field.isSystem) {
      return NextResponse.json({ error: 'System fields cannot be toggled' }, { status: 403 });
    }

    const oldStatus = field.isEnabled;
    field.isEnabled = !field.isEnabled;
    field.updatedBy = decoded.userId;
    await field.save();

    await ActivityService.log({
      userId: decoded.userId,
      module: field.module,
      entity: 'fields',
      recordId: field._id,
      action: 'UPDATE',
      changes: [{
        field: 'isEnabled',
        oldValue: oldStatus,
        newValue: field.isEnabled
      }]
    });

    return NextResponse.json({ isEnabled: field.isEnabled });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}