// src/app/financial-tracker/api/financial-tracker/activities/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/mongodb';
import { verifyToken } from '@/lib/auth/jwt';
import ActivityModel from '@/app/financial-tracker/models/activity-log.model';

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
    const limit = parseInt(searchParams.get('limit') || '10');
    const module = searchParams.get('module');
    const entity = searchParams.get('entity');
    const action = searchParams.get('action');

    const query: any = {};
    if (module) query.module = module;
    if (entity) query.entity = entity;
    if (action) query.action = action;

    const activities = await ActivityModel.find(query)
      .sort({ timestamp: -1 })
      .limit(limit)
      .populate('userId', 'fullName email avatar')
      .lean();

    // Format activities for frontend
    const formattedActivities = activities.map((activity:any) => ({
      id: activity._id,
      user: activity.userId?.fullName || 'System',
      userAvatar: activity.userId?.avatar,
      action: activity.action,
      module: activity.module,
      entity: activity.entity,
      recordId: activity.recordId,
      timestamp: activity.timestamp,
      details: activity.details,
      changes: activity.changes
    }));

    return NextResponse.json({ 
      success: true,
      activities: formattedActivities,
      total: activities.length
    });

  } catch (error: any) {
    console.error('Error fetching activities:', error);
    return NextResponse.json(
      { error: 'Failed to fetch activities', details: error.message },
      { status: 500 }
    );
  }
}