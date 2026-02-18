import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/mongodb';
import { verifyToken } from '@/lib/auth/jwt';
import ActivityLogModel from '@/app/financial-tracker/models/activity-log.model';
import { Parser } from 'json2csv';

export async function GET(request: NextRequest) {
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

    const { searchParams } = new URL(request.url);
    const module = searchParams.get('module');
    const entity = searchParams.get('entity');
    const action = searchParams.get('action');
    const userId = searchParams.get('userId');
    const recordId = searchParams.get('recordId');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    const query: any = {};

    if (module) query.module = module;
    if (entity) query.entity = entity;
    if (action) query.action = action;
    if (userId) query.userId = userId;
    if (recordId) query.recordId = recordId;
    
    if (startDate || endDate) {
      query.timestamp = {};
      if (startDate) query.timestamp.$gte = new Date(startDate);
      if (endDate) query.timestamp.$lte = new Date(endDate);
    }

    const logs = await ActivityLogModel.find(query)
      .populate('userId', 'fullName email')
      .sort({ timestamp: -1 })
      .lean();

    const exportData = logs.map((log:any) => ({
      Timestamp: new Date(log.timestamp).toISOString(),
      User: log.userId?.fullName || 'System',
      Email: log.userId?.email || '',
      Action: log.action,
      Module: log.module,
      Entity: log.entity,
      'Record ID': log.recordId || '',
      Changes: log.changes ? JSON.stringify(log.changes) : '',
      'IP Address': log.ipAddress || ''
    }));

    const fields = ['Timestamp', 'User', 'Email', 'Action', 'Module', 'Entity', 'Record ID', 'Changes', 'IP Address'];
    const parser = new Parser({ fields });
    const csv = parser.parse(exportData);

    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename=audit-logs-${new Date().toISOString().split('T')[0]}.csv`
      }
    });

  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}