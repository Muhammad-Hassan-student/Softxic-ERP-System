// src/app/financial-tracker/api/financial-tracker/records/users/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/mongodb';
import { verifyToken } from '@/lib/auth/jwt';
import RecordModel from '@/app/financial-tracker/models/record.model';
import UserModel from '@/models/User';

export async function GET(request: NextRequest) {
  console.log('🔵 RECORDS/USERS API CALLED');
  
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
    const module = searchParams.get('module');
    const entity = searchParams.get('entity');

    console.log('📋 Users query:', { module, entity });

    if (!module || !entity) {
      return NextResponse.json({ 
        total: 0, 
        active: 0,
        users: [] 
      });
    }

    // Get unique user IDs from records
    const userIds = await RecordModel.distinct('createdBy', {
      module,
      entity,
      isDeleted: { $ne: true }
    });

    console.log(`👥 Found ${userIds.length} unique users`);

    // Get user details
    const users = await UserModel.find({
      _id: { $in: userIds }
    }).select('fullName email lastLogin').lean();

    const activeUsers = users.filter(u => {
      if (!u.lastLogin) return false;
      const lastLogin = new Date(u.lastLogin);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return lastLogin > weekAgo;
    });

    return NextResponse.json({
      total: users.length,
      active: activeUsers.length,
      users: users.map(u => ({
        id: u._id,
        name: u.fullName,
        email: u.email,
        lastActive: u.lastLogin
      }))
    });

  } catch (error: any) {
    console.error('❌ Users API error:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}