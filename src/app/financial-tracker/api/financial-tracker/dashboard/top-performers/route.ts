// src/app/api/financial-tracker/dashboard/top-performers/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/mongodb';
import { verifyToken } from '@/lib/auth/jwt';
import RecordModel from '@/app/financial-tracker/models/record.model';
import User from '@/models/User';

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
    const limit = parseInt(searchParams.get('limit') || '5');
    const days = parseInt(searchParams.get('days') || '30');

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Aggregate records by user
    const performers = await RecordModel.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate },
          isDeleted: false
        }
      },
      {
        $group: {
          _id: '$createdBy',
          records: { $sum: 1 },
          reAmount: {
            $sum: {
              $cond: [
                { $eq: ['$module', 're'] },
                { $toDouble: { $ifNull: [{ $getField: 'amount', input: '$data' }, 0] } },
                0
              ]
            }
          },
          expenseAmount: {
            $sum: {
              $cond: [
                { $eq: ['$module', 'expense'] },
                { $toDouble: { $ifNull: [{ $getField: 'amount', input: '$data' }, 0] } },
                0
              ]
            }
          }
        }
      },
      { $sort: { records: -1 } },
      { $limit: limit }
    ]);

    // Get user details
    const userIds = performers.map(p => p._id);
    const users = await User.find({ _id: { $in: userIds } })
      .select('fullName email role profilePhoto')
      .lean();

    // Combine data
    const topPerformers = performers.map(performer => {
      const user = users.find(u => u._id.toString() === performer._id.toString());
      return {
        id: performer._id,
        name: user?.fullName || 'Unknown User',
        email: user?.email,
        role: user?.role || 'employee',
        avatar: user?.profilePhoto,
        records: performer.records,
        reAmount: performer.reAmount,
        expenseAmount: performer.expenseAmount,
        trend: performer.records > 10 ? 'up' : performer.records > 5 ? 'stable' : 'down'
      };
    });

    return NextResponse.json({ performers: topPerformers });

  } catch (error: any) {
    console.error('Top performers error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch top performers', details: error.message },
      { status: 500 }
    );
  }
}