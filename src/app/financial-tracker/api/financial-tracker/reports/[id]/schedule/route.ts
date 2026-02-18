import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/mongodb';
import { verifyToken } from '@/lib/auth/jwt';
import ReportModel from '@/app/financial-tracker/models/report-model'; // ✅ FIXED: modules path + .model

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> } // ✅ FIXED: Promise wrap
) {
  try {
    await connectDB();
    const token = request.cookies.get('token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const decoded = verifyToken(token);
    if (!decoded) return NextResponse.json({ error: 'Invalid token' }, { status: 401 });

    const { id } = await params; // ✅ FIXED: await params
    const { schedule } = await request.json();
    
    const report = await ReportModel.findOneAndUpdate(
      { _id: id, createdBy: decoded.userId },
      { schedule, updatedBy: decoded.userId },
      { new: true }
    );

    if (!report) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    return NextResponse.json({ report });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}