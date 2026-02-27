// src/app/financial-tracker/api/financial-tracker/comments/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/mongodb';
import { verifyToken, JwtPayload } from '@/lib/auth/jwt';
import CommentModel from '@/app/financial-tracker/models/comment.model';
import mongoose from 'mongoose';

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
    const recordId = searchParams.get('recordId');
    const parentId = searchParams.get('parentId');
    const limit = parseInt(searchParams.get('limit') || '50');
    const sort = searchParams.get('sort') || 'desc';

    if (!recordId) {
      return NextResponse.json({ error: 'recordId is required' }, { status: 400 });
    }

    const query: any = { 
      recordId: new mongoose.Types.ObjectId(recordId),
      isDeleted: false 
    };
    
    if (parentId) {
      query.parentCommentId = new mongoose.Types.ObjectId(parentId);
    } else {
      query.parentCommentId = null;
    }

    const comments = await CommentModel.find(query)
      .populate('userId', 'fullName email avatar')
      .populate('replies')
      .sort({ createdAt: sort === 'desc' ? -1 : 1 })
      .limit(limit);

    return NextResponse.json({ comments });
  } catch (error: any) {
    console.error('Error fetching comments:', error);
    return NextResponse.json(
      { error: 'Failed to fetch comments', details: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    const token = request.cookies.get('token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = verifyToken(token) as JwtPayload & { fullName?: string; avatar?: string };
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const body = await request.json();
    const { recordId, content, parentCommentId, mentions, attachments } = body;

    if (!recordId || !content) {
      return NextResponse.json(
        { error: 'recordId and content are required' },
        { status: 400 }
      );
    }

    // Get user details from database to ensure we have latest info
    const user = await mongoose.model('User').findById(decoded.userId).select('fullName profilePhoto');
    
    const comment = new CommentModel({
      recordId: new mongoose.Types.ObjectId(recordId),
      userId: new mongoose.Types.ObjectId(decoded.userId),
      userName: user?.fullName || decoded.fullName || 'Unknown User',
      userAvatar: user?.profilePhoto || decoded.avatar,
      content,
      parentCommentId: parentCommentId ? new mongoose.Types.ObjectId(parentCommentId) : null,
      mentions: mentions || [],
      attachments: attachments || [],
      edited: false,
      isDeleted: false,
      reactions: new Map()
    });

    await comment.save();

    // If this is a reply, add to parent's replies array
    if (parentCommentId) {
      await CommentModel.findByIdAndUpdate(parentCommentId, {
        $push: { replies: comment._id }
      });
    }

    await comment.populate('userId', 'fullName email avatar');

    return NextResponse.json({ comment }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating comment:', error);
    return NextResponse.json(
      { error: 'Failed to create comment', details: error.message },
      { status: 500 }
    );
  }
}