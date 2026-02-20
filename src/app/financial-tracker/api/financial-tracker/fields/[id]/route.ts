// src/app/api/financial-tracker/fields/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/mongodb';
import { verifyToken } from '@/lib/auth/jwt';
import CustomFieldModel from '@/app/financial-tracker/models/custom-field.model';
import ActivityService from '@/app/financial-tracker/services/activity-service';

// GET /api/financial-tracker/fields/[id] - Get single field
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const token = request.cookies.get('token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const { id } = await params;

    const field = await CustomFieldModel.findById(id)
      .populate('createdBy', 'fullName email')
      .populate('updatedBy', 'fullName email');

    if (!field) {
      return NextResponse.json({ error: 'Field not found' }, { status: 404 });
    }

    return NextResponse.json({ field });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PUT /api/financial-tracker/fields/[id] - Update field
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const token = request.cookies.get('token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded || decoded.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();

    const field = await CustomFieldModel.findById(id);
    if (!field) {
      return NextResponse.json({ error: 'Field not found' }, { status: 404 });
    }

    // System fields have restricted updates
    if (field.isSystem) {
      const allowedUpdates = ['label', 'visible', 'order', 'required'];
      Object.keys(body).forEach(key => {
        if (!allowedUpdates.includes(key)) {
          delete body[key];
        }
      });
    }

    // Validate fieldKey format if being updated
    if (body.fieldKey && !/^[a-z0-9-]+$/.test(body.fieldKey)) {
      return NextResponse.json(
        { error: 'fieldKey must be lowercase alphanumeric with hyphens only' },
        { status: 400 }
      );
    }

    const oldData = { ...field.toObject() };
    Object.assign(field, body);
    field.updatedBy = decoded.userId;
    await field.save();

    // Calculate changes
    const changes = Object.keys(body).map(key => ({
      field: key,
      oldValue: (oldData as any)[key],
      newValue: body[key]
    }));

    if (changes.length > 0) {
      await ActivityService.log({
        userId: decoded.userId,
        module: field.module,
        entity: 'fields',
        recordId: field._id,
        action: 'UPDATE',
        changes
      });
    }

    return NextResponse.json({ 
      message: 'Field updated successfully',
      field 
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE /api/financial-tracker/fields/[id] - Delete field
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const token = request.cookies.get('token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded || decoded.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { id } = await params;

    const field = await CustomFieldModel.findById(id);
    if (!field) {
      return NextResponse.json({ error: 'Field not found' }, { status: 404 });
    }

    if (field.isSystem) {
      return NextResponse.json(
        { error: 'System fields cannot be deleted' },
        { status: 403 }
      );
    }

    await field.deleteOne();

    await ActivityService.log({
      userId: decoded.userId,
      module: field.module,
      entity: 'fields',
      action: 'DELETE',
      changes: [{ 
        field: 'field', 
        oldValue: field.fieldKey,
        newValue: null 
      }]
    });

    return NextResponse.json({ 
      message: 'Field deleted successfully' 
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}