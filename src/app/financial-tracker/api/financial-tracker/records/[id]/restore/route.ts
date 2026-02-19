import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/mongodb';
import { verifyToken } from '@/lib/auth/jwt';
import RecordService from '@/app/financial-tracker/services/record-service';
import PermissionService from '@/app/financial-tracker/services/permission-service';
import { RecordSocketHandler } from '@/app/financial-tracker/lib/socket/handlers/record.handler';

// POST /api/financial-tracker/records/[id]/restore - Restore soft-deleted record
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
    if (!decoded || decoded.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden - Admin only' }, { status: 403 });
    }

    const { id } = await params;

    // Get existing record (including deleted)
    const existingRecord = await RecordService.getRecord(id, true);
    if (!existingRecord) {
      return NextResponse.json({ error: 'Record not found' }, { status: 404 });
    }

    if (!existingRecord.isDeleted) {
      return NextResponse.json(
        { error: 'Record is not deleted' },
        { status: 400 }
      );
    }

    const restoredRecord = await RecordService.restoreRecord(
      id,
      decoded.userId,
      existingRecord.module,
      existingRecord.entity
    );

    // Emit real-time event
    RecordSocketHandler.emitRecordRestored(existingRecord.module, existingRecord.entity, id);

    return NextResponse.json({
      message: 'Record restored successfully',
      record: {
        _id: restoredRecord._id,
        data: Object.fromEntries(restoredRecord.data),
        version: restoredRecord.version,
        status: restoredRecord.status
      }
    });

  } catch (error: any) {
    console.error('Error restoring record:', error);
    return NextResponse.json(
      { error: 'Failed to restore record', details: error.message },
      { status: 500 }
    );
  }
}