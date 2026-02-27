// src/app/financial-tracker/api/financial-tracker/records/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/mongodb';
import { verifyToken } from '@/lib/auth/jwt';
import RecordService from '@/app/financial-tracker/services/record-service';
import PermissionService from '@/app/financial-tracker/services/permission-service';
import { RecordSocketHandler } from '@/app/financial-tracker/lib/socket/handlers/record.handler';

// ==================== TYPES ====================
interface QueryFilters {
  module?: 're' | 'expense';
  entity?: string;
  status?: string;
  dateFrom?: string;
  dateTo?: string;
  createdBy?: string;
  minAmount?: number;
  maxAmount?: number;
  search?: string;
  tags?: string[];
  priority?: string[];
  starred?: boolean;
  archived?: boolean;
}

// ==================== GET RECORDS ====================
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    // ==================== AUTHENTICATION ====================
    const token = request.cookies.get('token')?.value;
    if (!token) {
      return NextResponse.json({ 
        success: false,
        error: 'Unauthorized' 
      }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ 
        success: false,
        error: 'Invalid token' 
      }, { status: 401 });
    }

    // ==================== PARSE QUERY PARAMETERS ====================
    const { searchParams } = new URL(request.url);
    
    // ✅ FIX: Support for 'all' module in frontend
    const moduleParam = searchParams.get('module');
    const module = moduleParam && moduleParam !== 'all' ? moduleParam as 're' | 'expense' : undefined;
    
    const entity = searchParams.get('entity') || undefined;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const sortField = searchParams.get('sortField') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';
    const includeDeleted = searchParams.get('includeDeleted') === 'true';
    const branchId = searchParams.get('branchId') || undefined;

    // ==================== BUILD FILTERS ====================
    const filters: QueryFilters = {};
    
    if (module) filters.module = module;
    if (entity) filters.entity = entity;
    if (searchParams.get('status')) filters.status = searchParams.get('status')!;
    if (searchParams.get('dateFrom')) filters.dateFrom = searchParams.get('dateFrom')!;
    if (searchParams.get('dateTo')) filters.dateTo = searchParams.get('dateTo')!;
    if (searchParams.get('createdBy')) filters.createdBy = searchParams.get('createdBy')!;
    if (searchParams.get('minAmount')) filters.minAmount = parseFloat(searchParams.get('minAmount')!);
    if (searchParams.get('maxAmount')) filters.maxAmount = parseFloat(searchParams.get('maxAmount')!);
    if (searchParams.get('search')) filters.search = searchParams.get('search')!;
    if (searchParams.get('tags')) filters.tags = searchParams.get('tags')!.split(',');
    if (searchParams.get('priority')) filters.priority = searchParams.get('priority')!.split(',');
    if (searchParams.get('starred')) filters.starred = searchParams.get('starred') === 'true';
    if (searchParams.get('archived')) filters.archived = searchParams.get('archived') === 'true';

    // ==================== PERMISSION CHECK ====================
    // If specific entity is requested, check access
    if (module && entity) {
      const hasAccess = await PermissionService.hasAccess(decoded.userId, module, entity);
      if (!hasAccess) {
        return NextResponse.json({ 
          success: false,
          error: 'Access denied' 
        }, { status: 403 });
      }
    }

    // Get user's scope for filtering
    let scope: 'own' | 'all' | 'department' = 'all';
    if (module && entity) {
      const permissions = await PermissionService.getUserPermissions(decoded.userId);
      scope = permissions[module]?.[entity]?.scope || 'own';
    }

    // ==================== FETCH RECORDS ====================
// To this (passing as separate params, not object):
const result = await RecordService.getRecords(
  module || 're',  // Provide default if undefined
  entity || '',    // Provide default if undefined
  {
    page,
    limit,
    includeDeleted,
    filters,
    userId: decoded.userId,
    scope,
    branchId,
    sortBy: sortField,
    sortOrder: sortOrder as 'asc' | 'desc'
  }
);

    // ==================== CALCULATE STATS ====================
    const stats = {
      re: result.records.filter((r: any) => r.module === 're').length,
      expense: result.records.filter((r: any) => r.module === 'expense').length,
      draft: result.records.filter((r: any) => r.status === 'draft').length,
      submitted: result.records.filter((r: any) => r.status === 'submitted').length,
      approved: result.records.filter((r: any) => r.status === 'approved').length,
      rejected: result.records.filter((r: any) => r.status === 'rejected').length,
      today: result.records.filter((r: any) => {
        const today = new Date();
        const recordDate = new Date(r.createdAt);
        return recordDate.toDateString() === today.toDateString();
      }).length,
      week: result.records.filter((r: any) => {
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        return new Date(r.createdAt) >= weekAgo;
      }).length,
      month: result.records.filter((r: any) => {
        const monthAgo = new Date();
        monthAgo.setMonth(monthAgo.getMonth() - 1);
        return new Date(r.createdAt) >= monthAgo;
      }).length
    };

    return NextResponse.json({
      success: true,
      records: result.records,
      total: result.total,
      page: result.page,
      totalPages: result.totalPages,
      stats,
      filters: filters
    });

  } catch (error: any) {
    console.error('❌ Error fetching records:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to fetch records',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    );
  }
}

// ==================== CREATE RECORD ====================
export async function POST(request: NextRequest) {
  try {
    await connectDB();

    // ==================== AUTHENTICATION ====================
    const token = request.cookies.get('token')?.value;
    if (!token) {
      return NextResponse.json({ 
        success: false,
        error: 'Unauthorized' 
      }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ 
        success: false,
        error: 'Invalid token' 
      }, { status: 401 });
    }

    // ==================== PARSE BODY ====================
    const body = await request.json();
    const { module, entity, data, branchId } = body;

    if (!module || !entity) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Module and entity are required' 
        },
        { status: 400 }
      );
    }

    if (!data) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Data is required' 
        },
        { status: 400 }
      );
    }

    // ==================== PERMISSION CHECK ====================
    const canCreate = await PermissionService.canCreate(decoded.userId, module, entity);
    if (!canCreate) {
      return NextResponse.json({ 
        success: false,
        error: 'Permission denied' 
      }, { status: 403 });
    }

    // ==================== CREATE RECORD ====================
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
      success: true,
      message: 'Record created successfully',
      record: {
        _id: record._id,
        module: record.module,
        entity: record.entity,
        data: Object.fromEntries(record.data),
        version: record.version,
        status: record.status,
        createdBy: record.createdBy,
        createdAt: record.createdAt,
        updatedAt: record.updatedAt
      }
    }, { status: 201 });

  } catch (error: any) {
    console.error('❌ Error creating record:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to create record',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    );
  }
}