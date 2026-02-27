// src/app/financial-tracker/api/financial-tracker/analytics/status/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/mongodb';
import { verifyToken } from '@/lib/auth/jwt';
import EntityModel from '@/app/financial-tracker/models/entity-model';

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
    const entityId = searchParams.get('entityId');

    if (!entityId) {
      return NextResponse.json({ error: 'entityId is required' }, { status: 400 });
    }

    const entity = await EntityModel.findById(entityId);
    if (!entity) {
      return NextResponse.json({ error: 'Entity not found' }, { status: 404 });
    }

    // Get status distribution
    const activeCount = await EntityModel.countDocuments({ isEnabled: true });
    const inactiveCount = await EntityModel.countDocuments({ isEnabled: false });

    const labels = ['Active', 'Inactive'];
    const data = [activeCount, inactiveCount];

    return NextResponse.json({ labels, data });
  } catch (error: any) {
    console.error('Error fetching status analytics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch status analytics', details: error.message },
      { status: 500 }
    );
  }
}