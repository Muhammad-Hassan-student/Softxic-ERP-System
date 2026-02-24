// src/app/api/financial-tracker/admin/activity-logs/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/mongodb';
import { verifyToken } from '@/lib/auth/jwt';
import ActivityLog from '@/app/financial-tracker/models/activity-log.model';

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const token = request.cookies.get('token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const decoded = verifyToken(token);
    if (!decoded || decoded.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const entity = searchParams.get('entity');
    const limit = parseInt(searchParams.get('limit') || '50');

    const query: any = {};
    if (entity) query.entity = entity;

    const logs = await ActivityLog.find(query)
      .populate('userId', 'fullName email')
      .sort({ createdAt: -1 })
      .limit(limit);

    const formattedLogs = logs.map(log => ({
      id: log._id,
      userId: log.userId._id,
      userName: log.userId.fullName,
      action: log.action,
      entity: log.entity,
      changes: log.changes,
      timestamp: log.createdAt
    }));

    return NextResponse.json({ logs: formattedLogs });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}