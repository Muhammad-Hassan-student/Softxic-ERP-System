import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/mongodb';
import { verifyToken } from '@/lib/auth/jwt';
import CategoryModel from '@/app/financial-tracker/models/category.model';
import ActivityService from '@/app/financial-tracker/services/activity-service'; // Fixed import

// GET /api/financial-tracker/categories/[id]
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    // Verify authentication
    const token = request.cookies.get('token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const category = await CategoryModel.findById(params.id)
      .populate('parentCategory', 'name')
      .populate('createdBy', 'fullName')
      .populate('updatedBy', 'fullName');

    if (!category) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 });
    }

    return NextResponse.json({ category });

  } catch (error: any) {
    console.error('Error fetching category:', error);
    return NextResponse.json(
      { error: 'Failed to fetch category', details: error.message },
      { status: 500 }
    );
  }
}

// PUT /api/financial-tracker/categories/[id]
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    // Verify authentication
    const token = request.cookies.get('token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // Only admin can update categories
    if (decoded.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const category = await CategoryModel.findById(params.id);
    if (!category) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 });
    }

    // System categories have restricted updates
    if (category.isSystem) {
      return NextResponse.json(
        { error: 'System categories cannot be modified' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const oldData = { ...category.toObject() };

    // Update allowed fields
    const allowedUpdates = ['name', 'description', 'type', 'color', 'icon', 'isActive'];
    allowedUpdates.forEach(field => {
      if (body[field] !== undefined) {
        (category as any)[field] = body[field];
      }
    });

    category.updatedBy = decoded.userId;
    await category.save();

    // Log activity
    const changes = allowedUpdates
      .filter(field => body[field] !== undefined && body[field] !== (oldData as any)[field])
      .map(field => ({
        field,
        oldValue: (oldData as any)[field],
        newValue: body[field]
      }));

    if (changes.length > 0) {
      await ActivityService.log({
        userId: decoded.userId,
        module: category.module,
        entity: category.entity,
        recordId: category._id,
        action: 'UPDATE',
        changes
      });
    }

    return NextResponse.json({
      message: 'Category updated successfully',
      category
    });

  } catch (error: any) {
    console.error('Error updating category:', error);
    return NextResponse.json(
      { error: 'Failed to update category', details: error.message },
      { status: 500 }
    );
  }
}

// DELETE /api/financial-tracker/categories/[id]
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    // Verify authentication
    const token = request.cookies.get('token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // Only admin can delete categories
    if (decoded.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const category = await CategoryModel.findById(params.id);
    if (!category) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 });
    }

    // System categories cannot be deleted
    if (category.isSystem) {
      return NextResponse.json(
        { error: 'System categories cannot be deleted' },
        { status: 403 }
      );
    }

    // Check if category is in use
    const RecordModel = (await import('@/app/financial-tracker/models/record.model')).default;
    const inUse = await RecordModel.exists({
      module: category.module,
      entity: category.entity,
      [`data.${category.name}`]: { $exists: true }
    });

    if (inUse) {
      return NextResponse.json(
        { error: 'Cannot delete category that is in use. Deactivate it instead.' },
        { status: 409 }
      );
    }

    await category.deleteOne();

    // Log activity - Fixed to include newValue (null for delete)
    await ActivityService.log({
      userId: decoded.userId,
      module: category.module,
      entity: category.entity,
      action: 'DELETE',
      changes: [{ 
        field: 'category', 
        oldValue: category.name,
        newValue: null  // Added newValue
      }]
    });

    return NextResponse.json({
      message: 'Category deleted successfully'
    });

  } catch (error: any) {
    console.error('Error deleting category:', error);
    return NextResponse.json(
      { error: 'Failed to delete category', details: error.message },
      { status: 500 }
    );
  }
}