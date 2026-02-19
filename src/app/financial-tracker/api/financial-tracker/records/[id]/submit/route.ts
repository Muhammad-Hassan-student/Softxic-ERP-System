import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/mongodb';
import { verifyToken } from '@/lib/auth/jwt';
import ApprovalService from '@/app/financial-tracker/services/approval.servcice';

// POST /api/financial-tracker/records/[id]/submit - Submit for approval
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

    // Get record details first
    const RecordModel = (await import('@/app/financial-tracker/models/record.model')).default;
    const record = await RecordModel.findById(id);
    
    if (!record) {
      return NextResponse.json({ error: 'Record not found' }, { status: 404 });
    }

    // Check if approval is enabled for this entity
    const isApprovalEnabled = await ApprovalService.isApprovalEnabled(record.module, record.entity);
    if (!isApprovalEnabled) {
      return NextResponse.json(
        { error: 'Approval workflow not enabled for this entity' },
        { status: 400 }
      );
    }

    const updatedRecord = await ApprovalService.submitForApproval(
      id,
      decoded.userId,
      record.module,
      record.entity
    );

    return NextResponse.json({
      message: 'Record submitted for approval',
      record: {
        _id: updatedRecord._id,
        status: updatedRecord.status,
        version: updatedRecord.version
      }
    });

  } catch (error: any) {
    console.error('Error submitting record:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to submit record' },
      { status: 500 }
    );
  }
}