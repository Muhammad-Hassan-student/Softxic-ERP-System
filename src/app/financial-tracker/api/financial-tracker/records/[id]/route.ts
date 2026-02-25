  import { NextRequest, NextResponse } from 'next/server';
  import { connectDB } from '@/lib/db/mongodb';
  import { verifyToken } from '@/lib/auth/jwt';
  import RecordService from '@/app/financial-tracker/services/record-service';
  import PermissionService from '@/app/financial-tracker/services/permission-service';
  import { RecordSocketHandler } from '@/app/financial-tracker/lib/socket/handlers/record.handler';

  // GET /api/financial-tracker/records/[id] - Get single record
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

      const record = await RecordService.getRecord(id);
      if (!record) {
        return NextResponse.json({ error: 'Record not found' }, { status: 404 });
      }

      // Check permissions
      const hasAccess = await PermissionService.hasAccess(decoded.userId, record.module, record.entity);
      if (!hasAccess) {
        return NextResponse.json({ error: 'Access denied' }, { status: 403 });
      }

      // Check scope
      const permissions = await PermissionService.getUserPermissions(decoded.userId);
      const scope = permissions[record.module]?.[record.entity]?.scope || 'own';
      
      if (scope === 'own' && record.createdBy.toString() !== decoded.userId) {
        return NextResponse.json({ error: 'Access denied' }, { status: 403 });
      }

      return NextResponse.json({ record });

    } catch (error: any) {
      console.error('Error fetching record:', error);
      return NextResponse.json(
        { error: 'Failed to fetch record', details: error.message },
        { status: 500 }
      );
    }
  }

  // PUT /api/financial-tracker/records/[id] - Update record
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
      if (!decoded) {
        return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
      }

      const { id } = await params;
      const body = await request.json();
      const { data, version } = body;

      if (!data || version === undefined) {
        return NextResponse.json(
          { error: 'Data and version are required' },
          { status: 400 }
        );
      }

      // Get existing record to check permissions
      const existingRecord = await RecordService.getRecord(id);
      if (!existingRecord) {
        return NextResponse.json({ error: 'Record not found' }, { status: 404 });
      }

      // Check edit permission
      const canEdit = await PermissionService.canEdit(
        decoded.userId,
        existingRecord.module,
        existingRecord.entity,
        existingRecord.createdBy.toString()
      );
      if (!canEdit) {
        return NextResponse.json({ error: 'Permission denied' }, { status: 403 });
      }

      // Convert to Map
      const dataMap = new Map(Object.entries(data));

      const updatedRecord = await RecordService.updateRecord(
        id,
        dataMap,
        version,
        decoded.userId,
        existingRecord.module,
        existingRecord.entity
      );

      // Emit real-time event
      RecordSocketHandler.emitRecordUpdated(
        existingRecord.module,
        existingRecord.entity,
        updatedRecord,
        [] // Changes would be calculated in service
      );

      return NextResponse.json({
        message: 'Record updated successfully',
        record: {
          _id: updatedRecord._id,
          data: Object.fromEntries(updatedRecord.data),
          version: updatedRecord.version,
          updatedAt: updatedRecord.updatedAt
        }
      });

    } catch (error: any) {
      // Handle concurrency conflict
      if (error.name === 'ConcurrencyError') {
        return NextResponse.json(
          { 
            error: 'Version conflict', 
            message: error.message,
            latestRecord: error.latestRecord 
          },
          { status: 409 }
        );
      }

      console.error('Error updating record:', error);
      return NextResponse.json(
        { error: 'Failed to update record', details: error.message },
        { status: 500 }
      );
    }
  }

  // DELETE /api/financial-tracker/records/[id] - Soft delete record
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
      if (!decoded) {
        return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
      }

      const { id } = await params;

      // Get existing record to check permissions
      const existingRecord = await RecordService.getRecord(id);
      if (!existingRecord) {
        return NextResponse.json({ error: 'Record not found' }, { status: 404 });
      }

      // Check delete permission
      const canDelete = await PermissionService.canDelete(
        decoded.userId,
        existingRecord.module,
        existingRecord.entity,
        existingRecord.createdBy.toString()
      );
      if (!canDelete) {
        return NextResponse.json({ error: 'Permission denied' }, { status: 403 });
      }

      await RecordService.deleteRecord(
        id,
        decoded.userId,
        existingRecord.module,
        existingRecord.entity
      );

      // Emit real-time event
      RecordSocketHandler.emitRecordDeleted(existingRecord.module, existingRecord.entity, id);

      return NextResponse.json({
        message: 'Record deleted successfully'
      });

    } catch (error: any) {
      console.error('Error deleting record:', error);
      return NextResponse.json(
        { error: 'Failed to delete record', details: error.message },
        { status: 500 }
      );
    }
  }