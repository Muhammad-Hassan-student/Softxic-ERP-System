import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/mongodb';
import { verifyToken } from '@/lib/auth/jwt';
import RecordModel from '@/app/financial-tracker/models/record.model';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
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

    const { id } = await params;

    const record = await RecordModel.findById(id);
    if (!record) {
      return NextResponse.json({ error: 'Record not found' }, { status: 404 });
    }

    // Toggle archive
    record.archived = !record.archived;
    record.updatedBy = decoded.userId;
    await record.save();

    return NextResponse.json({
      message: `Record ${record.archived ? 'archived' : 'unarchived'} successfully`,
      archived: record.archived
    });

  } catch (error: any) {
    console.error('Error toggling archive:', error);
    return NextResponse.json(
      { error: 'Failed to toggle archive', details: error.message },
      { status: 500 }
    );
  }
}