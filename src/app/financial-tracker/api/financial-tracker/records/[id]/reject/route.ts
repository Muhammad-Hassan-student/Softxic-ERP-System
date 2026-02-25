  import { NextRequest, NextResponse } from 'next/server';
  import { connectDB } from '@/lib/db/mongodb';
  import { verifyToken } from '@/lib/auth/jwt';
  import ApprovalService from '@/app/financial-tracker/services/approval.servcice';

  // POST /api/financial-tracker/records/[id]/reject - Reject record
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
      const body = await request.json();
      const { comment } = body;

      if (!comment || comment.trim().length === 0) {
        return NextResponse.json(
          { error: 'Rejection comment is required' },
          { status: 400 }
        );
      }

      // Get record details
      const RecordModel = (await import('@/app/financial-tracker/models/record.model')).default;
      const record = await RecordModel.findById(id);
      
      if (!record) {
        return NextResponse.json({ error: 'Record not found' }, { status: 404 });
      }

      const updatedRecord = await ApprovalService.reject(
        id,
        decoded.userId,
        record.module,
        record.entity,
        comment
      );

      return NextResponse.json({
        message: 'Record rejected',
        record: {
          _id: updatedRecord._id,
          status: updatedRecord.status,
          version: updatedRecord.version
        }
      });

    } catch (error: any) {
      console.error('Error rejecting record:', error);
      return NextResponse.json(
        { error: error.message || 'Failed to reject record' },
        { status: 500 }
      );
    }
  }