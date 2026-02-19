// src/app/api/financial-tracker/dashboard/recent-activities/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/mongodb';
import { verifyToken } from '@/lib/auth/jwt';
import ActivityLogModel from '@/app/financial-tracker/models/activity-log.model';

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

    const query: any = {};
    if (module) query.module = module;
    if (entity) query.entity = entity;

    const activities = await ActivityLogModel.find(query)
      .populate('userId', 'fullName email profilePhoto')
      .sort({ timestamp: -1 })
      .limit(limit)
      .lean();

    const formattedActivities = activities.map(activity => ({
      id: activity._id,
      user: activity.userId?.fullName || 'System',
      userAvatar: activity.userId?.profilePhoto,
      action: activity.action,
      module: activity.module,
      entity: activity.entity,
      recordId: activity.recordId,
      changes: activity.changes,
      timestamp: activity.timestamp,
      timeAgo: getTimeAgo(activity.timestamp)
    }));

    return NextResponse.json({ activities: formattedActivities });

  } catch (error: any) {
    console.error('Recent activities error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch activities', details: error.message },
      { status: 500 }
    );
  }
}

function getTimeAgo(date: Date): string {
  const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000);
  
  if (seconds < 60) return `${seconds} seconds ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  const days = Math.floor(hours / 24);
  return `${days} day${days > 1 ? 's' : ''} ago`;
}