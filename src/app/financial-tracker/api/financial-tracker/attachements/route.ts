// src/app/financial-tracker/api/financial-tracker/attachments/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/mongodb';
import { verifyToken, JwtPayload } from '@/lib/auth/jwt';
import AttachmentModel from '@/app/financial-tracker/models/attachment.model';
import RecordModel from '@/app/financial-tracker/models/record.model';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
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
    const fieldKey = searchParams.get('fieldKey');
    const type = searchParams.get('type');
    const limit = parseInt(searchParams.get('limit') || '50');
    const includeDeleted = searchParams.get('includeDeleted') === 'true';

    if (!recordId) {
      return NextResponse.json({ error: 'recordId is required' }, { status: 400 });
    }

    const query: any = { 
      recordId: new mongoose.Types.ObjectId(recordId),
      ...(!includeDeleted && { isDeleted: false })
    };
    
    if (fieldKey) query.fieldKey = fieldKey;
    if (type && type !== 'all') {
      query.fileType = { $regex: type, $options: 'i' };
    }

    const attachments = await AttachmentModel.find(query)
      .populate('uploadedBy', 'fullName email')
      .sort({ createdAt: -1 })
      .limit(limit);

    // Get storage stats - FIXED: properly handle the stats
    let stats = { totalSize: 0, totalFiles: 0 };
    try {
      const storageStats = await AttachmentModel.getStorageStats(recordId);
      stats = {
        totalSize: storageStats?.totalSize || 0,
        totalFiles: storageStats?.totalFiles || 0
      };
    } catch (statsError) {
      console.warn('Could not fetch storage stats:', statsError);
    }

    return NextResponse.json({ 
      attachments,
      stats: {
        totalSize: stats.totalSize,
        totalFiles: stats.totalFiles,
        sizeFormatted: formatBytes(stats.totalSize)
      }
    });
  } catch (error: any) {
    console.error('Error fetching attachments:', error);
    return NextResponse.json(
      { error: 'Failed to fetch attachments', details: error.message },
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

    const decoded = verifyToken(token) as JwtPayload & { fullName?: string };
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const recordId = formData.get('recordId') as string;
    const fieldKey = formData.get('fieldKey') as string;
    const description = formData.get('description') as string;

    if (!file || !recordId) {
      return NextResponse.json(
        { error: 'File and recordId are required' },
        { status: 400 }
      );
    }

    // Verify record exists
    const record = await RecordModel.findById(recordId);
    if (!record) {
      return NextResponse.json({ error: 'Record not found' }, { status: 404 });
    }

    // Get user info
    const user = await mongoose.model('User').findById(decoded.userId).select('fullName');

    // Create uploads directory
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'attachments');
    await mkdir(uploadDir, { recursive: true });

    // Generate unique filename
    const fileExt = path.extname(file.name);
    const fileName = `${uuidv4()}${fileExt}`;
    const filePath = path.join(uploadDir, fileName);

    // Save file
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filePath, buffer);

    // Create attachment record
    const attachment = new AttachmentModel({
      recordId: new mongoose.Types.ObjectId(recordId),
      fieldKey: fieldKey || null,
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
      fileUrl: `/uploads/attachments/${fileName}`,
      thumbnailUrl: file.type.startsWith('image/') ? `/uploads/attachments/${fileName}` : null,
      dimensions: null,
      uploadedBy: new mongoose.Types.ObjectId(decoded.userId),
      uploadedByUser: user?.fullName || decoded.fullName || 'Unknown',
      description: description || '',
      tags: [],
      version: 1,
      isPublic: false,
      isDeleted: false,
      downloads: 0,
      views: 0
    });

    await attachment.save();
    await attachment.populate('uploadedBy', 'fullName email');

    return NextResponse.json({ 
      attachment,
      message: 'File uploaded successfully'
    }, { status: 201 });
    
  } catch (error: any) {
    console.error('Error uploading attachment:', error);
    return NextResponse.json(
      { error: 'Failed to upload attachment', details: error.message },
      { status: 500 }
    );
  }
}

// Helper function
function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}