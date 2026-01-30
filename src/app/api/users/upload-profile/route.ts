import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/mongodb';
import User from '@/models/User';
import { uploadImage, deleteImage } from '@/lib/cloudinary';
import { verifyToken } from '@/lib/auth/jwt';

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    // Verify authentication
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, message: 'Authentication required' },
        { status: 401 }
      );
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);
    
    if (!decoded) {
      return NextResponse.json(
        { success: false, message: 'Invalid token' },
        { status: 401 }
      );
    }

    // Get form data
    const formData = await request.formData();
    const file = formData.get('profilePhoto') as File;
    const userId = formData.get('userId') as string;

    if (!file) {
      return NextResponse.json(
        { success: false, message: 'No file provided' },
        { status: 400 }
      );
    }

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { success: false, message: 'File size must be less than 5MB' },
        { status: 400 }
      );
    }

    // Check file type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        { success: false, message: 'Please upload an image file' },
        { status: 400 }
      );
    }

    // Check permissions
    const requestingUser = await User.findById(decoded.userId);
    if (!requestingUser) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }

    // Users can only upload their own photo unless admin/hr
    let targetUserId = decoded.userId;
    if (userId && ['admin', 'hr'].includes(requestingUser.role)) {
      targetUserId = userId;
    } else if (userId && userId !== decoded.userId) {
      return NextResponse.json(
        { success: false, message: 'You can only upload your own profile photo' },
        { status: 403 }
      );
    }

    // Find target user
    const targetUser = await User.findById(targetUserId);
    if (!targetUser) {
      return NextResponse.json(
        { success: false, message: 'Target user not found' },
        { status: 404 }
      );
    }

    // Delete old photo if exists
    if (targetUser.profilePhoto) {
      const publicId = targetUser.profilePhoto.split('/').pop()?.split('.')[0];
      if (publicId) {
        await deleteImage(`erp-profiles/${publicId}`);
      }
    }

    // Upload new photo
    const uploadResult = await uploadImage(file, 'erp-profiles');
    
    if (!uploadResult.success) {
      return NextResponse.json(
        { success: false, message: 'Failed to upload image', error: uploadResult.error },
        { status: 500 }
      );
    }

    // Update user with new photo URL
    targetUser.profilePhoto = uploadResult.url;
    await targetUser.save();

    return NextResponse.json({
      success: true,
      message: 'Profile photo uploaded successfully',
      data: {
        profilePhoto: uploadResult.url,
      },
    });

  } catch (error: any) {
    console.error('Profile upload error:', error);
    return NextResponse.json(
      { success: false, message: 'Server error', error: error.message },
      { status: 500 }
    );
  }
}