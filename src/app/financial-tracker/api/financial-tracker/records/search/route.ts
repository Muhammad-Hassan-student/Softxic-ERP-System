import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/mongodb';
import { verifyToken } from '@/lib/auth/jwt';
import RecordModel from '@/app/financial-tracker/models/record.model';
import PermissionService from '@/app/financial-tracker/services/permission-service';

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
    const search = searchParams.get('search');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');

    if (!module || !entity) {
      return NextResponse.json(
        { error: 'Module and entity are required' },
        { status: 400 }
      );
    }

    if (!search) {
      return NextResponse.json(
        { error: 'Search term is required' },
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

    // Build search query
    const query: any = {
      module,
      entity,
      isDeleted: false,
      $text: { $search: search }
    };

    // Apply scope
    if (scope === 'own') {
      query.createdBy = decoded.userId;
    }

    const skip = (page - 1) * limit;

    const [records, total] = await Promise.all([
      RecordModel.find(query)
        .populate('createdBy', 'fullName email')
        .populate('updatedBy', 'fullName email')
        .sort({ score: { $meta: 'textScore' } })
        .skip(skip)
        .limit(limit)
        .lean(),
      RecordModel.countDocuments(query)
    ]);

    // Convert Maps to objects
    const formattedRecords = records.map(record => ({
      ...record,
      data: Object.fromEntries(record.data || new Map())
    }));

    return NextResponse.json({
      records: formattedRecords,
      total,
      page,
      totalPages: Math.ceil(total / limit)
    });

  } catch (error: any) {
    console.error('Error searching records:', error);
    return NextResponse.json(
      { error: 'Failed to search records', details: error.message },
      { status: 500 }
    );
  }
}