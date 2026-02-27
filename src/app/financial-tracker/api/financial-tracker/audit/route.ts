// src/app/financial-tracker/api/financial-tracker/audit/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/mongodb';
import { verifyToken } from '@/lib/auth/jwt';
import AuditModel from '@/app/financial-tracker/models/audit.model';

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

    // Only admins can view audit logs
    if (decoded.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const entityId = searchParams.get('entityId');
    const limit = parseInt(searchParams.get('limit') || '100');
    const action = searchParams.get('action');
    const userId = searchParams.get('userId');

    if (!entityId) {
      return NextResponse.json({ error: 'entityId is required' }, { status: 400 });
    }

    const query: any = { entityId };
    if (action) query.action = action;
    if (userId) query.userId = userId;

    const logs = await AuditModel.find(query)
      .populate('userId', 'fullName email')
      .sort({ timestamp: -1 })
      .limit(limit);

    return NextResponse.json({ logs });
  } catch (error: any) {
    console.error('Error fetching audit logs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch audit logs', details: error.message },
      { status: 500 }
    );
  }
}