import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/mongodb';
import { verifyToken } from '@/lib/auth/jwt';
import RecordModel from '@/app/financial-tracker/models/record.model';

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
    const module = searchParams.get('module') as 're' | 'expense';
    const entity = searchParams.get('entity');

    if (!module || !entity) {
      return NextResponse.json(
        { error: 'Module and entity are required' },
        { status: 400 }
      );
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);

    const monthAgo = new Date();
    monthAgo.setMonth(monthAgo.getMonth() - 1);

    // Get record IDs for this module/entity
    const recordIds = await RecordModel.find({ module, entity }).distinct('_id');

    // Get all stats in parallel
    const [
      totalRecords,
      todayRecords,
      weekRecords,
      monthRecords,
      pendingApprovals,
      deletedRecords,
      starredRecords,
      archivedRecords,
    ] = await Promise.all([
      RecordModel.countDocuments({ module, entity, isDeleted: false }),
      RecordModel.countDocuments({ 
        module, 
        entity, 
        createdAt: { $gte: today },
        isDeleted: false 
      }),
      RecordModel.countDocuments({ 
        module, 
        entity, 
        createdAt: { $gte: weekAgo },
        isDeleted: false 
      }),
      RecordModel.countDocuments({ 
        module, 
        entity, 
        createdAt: { $gte: monthAgo },
        isDeleted: false 
      }),
      RecordModel.countDocuments({ 
        module, 
        entity, 
        status: 'submitted',
        isDeleted: false 
      }),
      RecordModel.countDocuments({ module, entity, isDeleted: true }),
      RecordModel.countDocuments({ module, entity, starred: true, isDeleted: false }),
      RecordModel.countDocuments({ module, entity, archived: true, isDeleted: false }),
    ]);

    // Get comment and attachment counts
    let totalComments = 0;
    let totalAttachments = 0;

    try {
      // Try to import models if they exist
      const CommentModel = (await import('@/app/financial-tracker/models/comment.model')).default;
      const AttachmentModel = (await import('@/app/financial-tracker/models/attachement.model')).default;

      const [comments, attachments] = await Promise.all([
        CommentModel.countDocuments({ 
          recordId: { $in: recordIds },
          isDeleted: false 
        }),
        AttachmentModel.countDocuments({ 
          recordId: { $in: recordIds },
          isDeleted: false 
        })
      ]);

      totalComments = comments || 0;
      totalAttachments = attachments || 0;
    } catch (error) {
      console.warn('Comment/Attachment models not available:', error);
    }

    return NextResponse.json({
      totalRecords,
      todayRecords,
      weekRecords,
      monthRecords,
      pendingApprovals,
      deletedRecords,
      archivedRecords,
      starredRecords,
      totalComments,
      totalAttachments,
      lastUpdated: new Date().toISOString(),
      usersActive: 0, // You can implement this
      storageUsed: totalAttachments * 1024 * 1024, // Approximate storage
    });

  } catch (error: any) {
    console.error('Error fetching stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch stats', details: error.message },
      { status: 500 }
    );
  }
}