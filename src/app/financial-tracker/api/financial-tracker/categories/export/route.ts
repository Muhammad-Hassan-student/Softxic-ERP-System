// src/app/api/financial-tracker/categories/export/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/mongodb';
import { verifyToken } from '@/lib/auth/jwt';
import CategoryModel from '@/app/financial-tracker/models/category.model';
import { Parser } from 'json2csv';

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const token = request.cookies.get('token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded || decoded.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const module = searchParams.get('module');
    const entity = searchParams.get('entity');
    const active = searchParams.get('active') === 'true';

    const query: any = {};
    if (module && module !== 'all') query.module = module;
    if (entity && entity !== 'all') query.entity = entity;
    if (active) query.isActive = true;

    const categories = await CategoryModel.find(query)
      .populate('createdBy', 'fullName email')
      .populate('updatedBy', 'fullName email')
      .sort({ module: 1, entity: 1, name: 1 })
      .lean();

    const exportData = categories.map(cat => ({
      'Module': cat.module.toUpperCase(),
      'Entity': cat.entity,
      'Name': cat.name,
      'Description': cat.description || '',
      'Type': cat.type,
      'Color': cat.color,
      'Icon': cat.icon || '',
      'Is System': cat.isSystem ? 'Yes' : 'No',
      'Active': cat.isActive ? 'Yes' : 'No',
      'Created By': (cat.createdBy as any)?.fullName || '',
      'Created At': new Date(cat.createdAt).toLocaleDateString(),
      'Updated By': (cat.updatedBy as any)?.fullName || '',
      'Updated At': new Date(cat.updatedAt).toLocaleDateString()
    }));

    const fields = [
      'Module', 'Entity', 'Name', 'Description', 'Type', 'Color', 'Icon',
      'Is System', 'Active', 'Created By', 'Created At', 'Updated By', 'Updated At'
    ];
    
    const parser = new Parser({ fields });
    const csv = parser.parse(exportData);

    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename=categories-${new Date().toISOString().split('T')[0]}.csv`
      }
    });

  } catch (error: any) {
    console.error('Error exporting categories:', error);
    return NextResponse.json(
      { error: 'Failed to export categories', details: error.message },
      { status: 500 }
    );
  }
}