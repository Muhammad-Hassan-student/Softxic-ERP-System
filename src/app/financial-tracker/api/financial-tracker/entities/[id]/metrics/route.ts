// src/app/financial-tracker/api/financial-tracker/entities/[id]/metrics/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/mongodb';
import { verifyToken } from '@/lib/auth/jwt';
import EntityModel from '@/app/financial-tracker/models/entity-model';
import RecordModel from '@/app/financial-tracker/models/record.model';
import { subDays, subWeeks, subMonths } from 'date-fns';

// Define Metric interface
interface Metric {
  label: string;
  value: number;
  change: number;
  trend: 'up' | 'down' | 'stable';
  color: string;
  icon: string;
  format: string;
  labels?: string[];
  data?: number[];
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }  // ✅ FIXED: params is Promise
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

    // ✅ FIXED: await params to get id
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const range = searchParams.get('range') || 'month';

    const entity = await EntityModel.findById(id);
    if (!entity) {
      return NextResponse.json({ error: 'Entity not found' }, { status: 404 });
    }

    // Calculate date range
    const now = new Date();
    let startDate: Date;
    switch (range) {
      case 'day':
        startDate = subDays(now, 1);
        break;
      case 'week':
        startDate = subWeeks(now, 1);
        break;
      case 'month':
        startDate = subMonths(now, 1);
        break;
      case 'year':
        startDate = subMonths(now, 12);
        break;
      default:
        startDate = subMonths(now, 1);
    }

    // Get record counts
    const totalRecords = await RecordModel.countDocuments({
      module: entity.module,
      entity: entity.entityKey
    });

    const recentRecords = await RecordModel.countDocuments({
      module: entity.module,
      entity: entity.entityKey,
      createdAt: { $gte: startDate }
    });

    const activeRecords = await RecordModel.countDocuments({
      module: entity.module,
      entity: entity.entityKey,
      status: 'active'
    });

    const pendingRecords = await RecordModel.countDocuments({
      module: entity.module,
      entity: entity.entityKey,
      status: 'pending'
    });

    // Calculate trends
    const previousPeriod = await RecordModel.countDocuments({
      module: entity.module,
      entity: entity.entityKey,
      createdAt: { $lt: startDate }
    });

    // Create metrics array with proper typing
    const metrics: Metric[] = [
      {
        label: 'Total Records',
        value: totalRecords,
        change: previousPeriod ? Math.round(((totalRecords - previousPeriod) / previousPeriod) * 100) : 0,
        trend: totalRecords > previousPeriod ? 'up' : totalRecords < previousPeriod ? 'down' : 'stable',
        color: 'blue',
        icon: 'Database',
        format: 'number'
      },
      {
        label: 'Recent Activity',
        value: recentRecords,
        change: 0,
        trend: 'stable',
        color: 'green',
        icon: 'Activity',
        format: 'number'
      },
      {
        label: 'Active Records',
        value: activeRecords,
        change: 0,
        trend: 'stable',
        color: 'purple',
        icon: 'CheckCircle',
        format: 'number'
      },
      {
        label: 'Pending Approval',
        value: pendingRecords,
        change: 0,
        trend: 'stable',
        color: 'orange',
        icon: 'Clock',
        format: 'number'
      }
    ];

    // Add historical data for charts
    const historicalData = await RecordModel.aggregate([
      {
        $match: {
          module: entity.module,
          entity: entity.entityKey,
          createdAt: { $gte: subMonths(now, 6) }
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Add labels and data to the first metric only
    if (historicalData.length > 0) {
      metrics[0] = {
        ...metrics[0],
        labels: historicalData.map(d => d._id),
        data: historicalData.map(d => d.count)
      };
    }

    return NextResponse.json({ metrics });
  } catch (error: any) {
    console.error('Error fetching metrics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch metrics', details: error.message },
      { status: 500 }
    );
  }
}