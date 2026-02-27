// src/app/financial-tracker/api/financial-tracker/entities/[id]/versions/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/mongodb';
import { verifyToken } from '@/lib/auth/jwt';
import VersionModel from '@/app/financial-tracker/models/version.model';

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

    const versions = await VersionModel.find({ entityId: id })
      .populate('createdBy', 'fullName email')
      .sort({ number: -1 })
      .limit(50);

    return NextResponse.json({ versions });
  } catch (error: any) {
    console.error('Error fetching versions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch versions', details: error.message },
      { status: 500 }
    );
  }
}