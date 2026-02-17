import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/mongodb';
import { verifyToken } from '@/lib/auth/jwt';
import EntityModel from '@/modules/financial-tracker/models/entity-model';
import ActivityService from '@/modules/financial-tracker/services/activity-service';

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

    const entity = await EntityModel.findById(params.id);
    if (!entity) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    const oldStatus = entity.isEnabled;
    entity.isEnabled = !entity.isEnabled;
    entity.updatedBy = decoded.userId;
    await entity.save();

    await ActivityService.log({
      userId: decoded.userId,
      module: entity.module,
      entity: entity.entityKey,
      recordId: entity._id,
      action: 'UPDATE',
      changes: [{
        field: 'isEnabled',
        oldValue: oldStatus,
        newValue: entity.isEnabled
      }]
    });

    return NextResponse.json({ isEnabled: entity.isEnabled });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}