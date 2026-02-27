// src/app/financial-tracker/api/financial-tracker/activities/export/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/mongodb';
import { verifyToken } from '@/lib/auth/jwt';
import ActivityService, { ActivityFilters, ActivityModule, ActivityAction } from '@/app/financial-tracker/services/activity-service';

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
    if (!decoded || decoded.role !== 'admin') {
      return NextResponse.json({ 
        success: false,
        error: 'Forbidden - Admin access required' 
      }, { status: 403 });
    }

    // ==================== PARSE QUERY PARAMETERS ====================
    const { searchParams } = new URL(request.url);
    
    // ✅ FIX: Type-safe parsing of module parameter
    const moduleParam = searchParams.get('module');
    const module: ActivityModule | undefined = 
      moduleParam && ['re', 'expense', 'admin', 'auth', 'system'].includes(moduleParam)
        ? moduleParam as ActivityModule
        : undefined;

    // ✅ FIX: Type-safe parsing of action parameter
    const actionParam = searchParams.get('action');
    const validActions: ActivityAction[] = [
      'CREATE', 'UPDATE', 'DELETE', 'DELETE_PERMANENT', 'RESTORE', 
      'SUBMIT', 'APPROVE', 'REJECT', 'BULK_CREATE', 'BULK_UPDATE',
      'BULK_DELETE', 'EXPORT', 'IMPORT', 'VIEW', 'LOGIN', 'LOGOUT'
    ];
    const action: ActivityAction | undefined = 
      actionParam && validActions.includes(actionParam as ActivityAction)
        ? actionParam as ActivityAction
        : undefined;

    // Parse date parameters
    const startDateParam = searchParams.get('startDate');
    const endDateParam = searchParams.get('endDate');
    
    const startDate = startDateParam ? new Date(startDateParam) : undefined;
    const endDate = endDateParam ? new Date(endDateParam) : undefined;

    // Validate dates
    if (startDate && isNaN(startDate.getTime())) {
      return NextResponse.json({
        success: false,
        error: 'Invalid startDate format'
      }, { status: 400 });
    }

    if (endDate && isNaN(endDate.getTime())) {
      return NextResponse.json({
        success: false,
        error: 'Invalid endDate format'
      }, { status: 400 });
    }

    // Build filters with proper types
    const filters: ActivityFilters = {
      module,
      entity: searchParams.get('entity') || undefined,
      action,
      userId: searchParams.get('userId') || undefined,
      startDate,
      endDate,
      // Add pagination params if needed
      page: searchParams.get('page') ? parseInt(searchParams.get('page')!) : undefined,
      limit: searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : undefined,
      search: searchParams.get('search') || undefined
    };

    // Remove undefined values
    Object.keys(filters).forEach(key => 
      filters[key as keyof ActivityFilters] === undefined && delete filters[key as keyof ActivityFilters]
    );

    // Generate CSV
    const csv = await ActivityService.exportToCSV(filters);

    // Return CSV file
    return new NextResponse(csv, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename=activity-logs-${new Date().toISOString().split('T')[0]}.csv`,
        'Cache-Control': 'no-cache'
      }
    });

  } catch (error: any) {
    console.error('❌ Error exporting activities:', error);
    
    return NextResponse.json({ 
      success: false,
      error: 'Failed to export activities',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    }, { status: 500 });
  }
}