import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/mongodb';
import { verifyToken } from '@/lib/auth/jwt';
import EntityModel from '@/app/financial-tracker/models/entity-model';
import ActivityService from '@/app/financial-tracker/services/activity-service';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    const token = request.cookies.get('token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const decoded = verifyToken(token);
    if (!decoded) return NextResponse.json({ error: 'Invalid token' }, { status: 401 });

    const entity = await EntityModel.findById(params.id)
      .populate('createdBy', 'fullName')
      .populate('updatedBy', 'fullName');

    if (!entity) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    return NextResponse.json({ entity });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(
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

    const body = await request.json();
    const entity = await EntityModel.findById(params.id);
    if (!entity) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    const oldData = { ...entity.toObject() };
    const allowedUpdates = ['name', 'description', 'isEnabled', 'enableApproval'];
    
    allowedUpdates.forEach(field => {
      if (body[field] !== undefined) {
        (entity as any)[field] = body[field];
      }
    });

    entity.updatedBy = decoded.userId;
    await entity.save();

    const changes = allowedUpdates
      .filter(field => body[field] !== undefined && body[field] !== (oldData as any)[field])
      .map(field => ({
        field,
        oldValue: (oldData as any)[field],
        newValue: body[field]
      }));

    if (changes.length > 0) {
      await ActivityService.log({
        userId: decoded.userId,
        module: entity.module,
        entity: entity.entityKey,
        recordId: entity._id,
        action: 'UPDATE',
        changes
      });
    }

    return NextResponse.json({ entity });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(
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

    await entity.deleteOne();

    await ActivityService.log({
      userId: decoded.userId,
      module: entity.module,
      entity: entity.entityKey,
      action: 'DELETE',
      changes: [{ field: 'entity', oldValue: entity.entityKey, newValue: null }]
    });

    return NextResponse.json({ message: 'Deleted successfully' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}