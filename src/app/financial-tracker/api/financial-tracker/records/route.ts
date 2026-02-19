import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/mongodb';
import { verifyToken } from '@/lib/auth/jwt';
import RecordService from '@/app/financial-tracker/services/record-service';
import PermissionService from '@/app/financial-tracker/services/permission-service';
import { RecordSocketHandler } from '@/app/financial-tracker/lib/socket/handlers/record.handler';

// GET /api/financial-tracker/records - List records with pagination
export async function GET(request: NextRequest) {
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

    const { searchParams } = new URL(request.url);
    const module = searchParams.get('module') as 're' | 'expense';
    const entity = searchParams.get('entity');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const includeDeleted = searchParams.get('includeDeleted') === 'true';
    const branchId = searchParams.get('branchId');

    if (!module || !entity) {
      return NextResponse.json(
        { error: 'Module and entity are required' },
        { status: 400 }
      );
    }

    // Check permissions
    const hasAccess = await PermissionService.hasAccess(decoded.userId, module, entity);
    if (!hasAccess) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Get user's scope
    const permissions = await PermissionService.getUserPermissions(decoded.userId);
    const scope = permissions[module]?.[entity]?.scope || 'own';

    // Build filters from query params
    const filters: any = {};
    searchParams.forEach((value, key) => {
      if (!['module', 'entity', 'page', 'limit', 'includeDeleted', 'branchId'].includes(key)) {
        filters[key] = value;
      }
    });

    const result = await RecordService.getRecords(module, entity, {
      page,
      limit,
      includeDeleted,
      filters,
      userId: decoded.userId,
      scope,
      branchId: branchId || undefined
    });

    return NextResponse.json(result);

  } catch (error: any) {
    console.error('Error fetching records:', error);
    return NextResponse.json(
      { error: 'Failed to fetch records', details: error.message },
      { status: 500 }
    );
  }
}

// POST /api/financial-tracker/records - Create new record
export async function POST(request: NextRequest) {
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

    const body = await request.json();
    const { module, entity, data, branchId } = body;

    if (!module || !entity || !data) {
      return NextResponse.json(
        { error: 'Module, entity, and data are required' },
        { status: 400 }
      );
    }

    // Check permissions
    const canCreate = await PermissionService.canCreate(decoded.userId, module, entity);
    if (!canCreate) {
      return NextResponse.json({ error: 'Permission denied' }, { status: 403 });
    }

    // Convert plain object to Map
    const dataMap = new Map(Object.entries(data));

    const record = await RecordService.createRecord(
      module,
      entity,
      dataMap,
      decoded.userId,
      branchId
    );

    // Emit real-time event
    RecordSocketHandler.emitRecordCreated(module, entity, record);

    return NextResponse.json({
      message: 'Record created successfully',
      record: {
        _id: record._id,
        data: Object.fromEntries(record.data),
        version: record.version,
        status: record.status,
        createdAt: record.createdAt
      }
    }, { status: 201 });

  } catch (error: any) {
    console.error('Error creating record:', error);
    return NextResponse.json(
      { error: 'Failed to create record', details: error.message },
      { status: 500 }
    );
  }
}