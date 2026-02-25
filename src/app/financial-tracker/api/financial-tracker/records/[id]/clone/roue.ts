import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/mongodb';
import { verifyToken } from '@/lib/auth/jwt';
import RecordModel from '@/app/financial-tracker/models/record.model';
import ActivityService from '@/app/financial-tracker/services/activity-service';

export async function POST(
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

    // Find original record
    const originalRecord = await RecordModel.findById(id);
    if (!originalRecord) {
      return NextResponse.json({ error: 'Record not found' }, { status: 404 });
    }

    // Clone the record
    const clonedData = {
      module: originalRecord.module,
      entity: originalRecord.entity,
      data: originalRecord.data,
      version: 1,
      status: 'draft',
      createdBy: decoded.userId,
      updatedBy: decoded.userId,
      branchId: originalRecord.branchId,
      isDeleted: false,
    };

    const clonedRecord = new RecordModel(clonedData);
    await clonedRecord.save();

    // Log activity
    await ActivityService.log({
      userId: decoded.userId,
      module: originalRecord.module,
      entity: originalRecord.entity,
      recordId: clonedRecord._id,
      action: 'CREATE',
      changes: [{
        field: 'clone',
        oldValue: null,
        newValue: `Cloned from ${id}`
      }]
    });

    return NextResponse.json({
      message: 'Record cloned successfully',
      record: {
        _id: clonedRecord._id,
        data: Object.fromEntries(clonedRecord.data),
        version: clonedRecord.version,
        status: clonedRecord.status,
        createdAt: clonedRecord.createdAt
      }
    });

  } catch (error: any) {
    console.error('Error cloning record:', error);
    return NextResponse.json(
      { error: 'Failed to clone record', details: error.message },
      { status: 500 }
    );
  }
}