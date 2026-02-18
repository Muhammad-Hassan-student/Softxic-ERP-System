import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/mongodb';
import { verifyToken } from '@/lib/auth/jwt';
import CategoryModel from '@/app/financial-tracker/models/category.model'; // ✅ FIXED: modules path
import ActivityService from '@/app/financial-tracker/services/activity-service'; // ✅ FIXED: modules path + .service

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> } // ✅ FIXED: Promise wrap
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

    if (decoded.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { id } = await params; // ✅ FIXED: await params

    const category = await CategoryModel.findById(id);
    if (!category) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 });
    }

    const oldStatus = category.isActive;
    category.isActive = !category.isActive;
    category.updatedBy = decoded.userId;
    await category.save();

    await ActivityService.log({
      userId: decoded.userId,
      module: category.module,
      entity: category.entity,
      recordId: category._id,
      action: 'UPDATE',
      changes: [{
        field: 'isActive',
        oldValue: oldStatus,
        newValue: category.isActive
      }]
    });

    return NextResponse.json({
      message: `Category ${category.isActive ? 'activated' : 'deactivated'} successfully`,
      isActive: category.isActive
    });

  } catch (error: any) {
    console.error('Error toggling category:', error);
    return NextResponse.json(
      { error: 'Failed to toggle category', details: error.message },
      { status: 500 }
    );
  }
}