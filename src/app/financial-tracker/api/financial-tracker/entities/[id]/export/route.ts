// src/app/financial-tracker/api/financial-tracker/entities/[id]/export/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/mongodb';
import { verifyToken } from '@/lib/auth/jwt';
import EntityModel from '@/app/financial-tracker/models/entity-model';
import { Parser } from 'json2csv';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

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

    const { searchParams } = new URL(request.url);
    const format = searchParams.get('format') || 'json';

    const { id } = await params;
    const entity = await EntityModel.findById(id)
      .populate('createdBy', 'fullName email')
      .populate('updatedBy', 'fullName email');

    if (!entity) {
      return NextResponse.json({ error: 'Entity not found' }, { status: 404 });
    }

    const entityData = entity.toObject();

    switch (format) {
      case 'json': {
        const jsonStr = JSON.stringify(entityData, null, 2);
        return new NextResponse(jsonStr, {
          headers: {
            'Content-Type': 'application/json',
            'Content-Disposition': `attachment; filename="entity-${entity.entityKey}.json"`
          }
        });
      }

      case 'csv': {
        const fields = ['_id', 'name', 'entityKey', 'module', 'isEnabled', 'enableApproval', 'branchId', 'createdAt', 'updatedAt'];
        const json2csvParser = new Parser({ fields });
        const csv = json2csvParser.parse(entityData);
        return new NextResponse(csv, {
          headers: {
            'Content-Type': 'text/csv',
            'Content-Disposition': `attachment; filename="entity-${entity.entityKey}.csv"`
          }
        });
      }

      case 'pdf': {
        const doc = new jsPDF();
        doc.text(`Entity: ${entity.name}`, 14, 15);
        
        const data = [
          ['ID', entity._id],
          ['Name', entity.name],
          ['Key', entity.entityKey],
          ['Module', entity.module],
          ['Status', entity.isEnabled ? 'Active' : 'Inactive'],
          ['Approval', entity.enableApproval ? 'Yes' : 'No'],
          ['Branch', entity.branchId || 'N/A'],
          ['Created', new Date(entity.createdAt).toLocaleString()],
          ['Created By', entity.createdBy?.fullName || 'Unknown'],
          ['Updated', new Date(entity.updatedAt).toLocaleString()],
          ['Updated By', entity.updatedBy?.fullName || 'Unknown']
        ];

        autoTable(doc, {
          body: data,
          startY: 25,
          theme: 'striped',
          styles: { fontSize: 10 },
          columnStyles: { 0: { fontStyle: 'bold' } }
        });

        const pdfBuffer = Buffer.from(doc.output('arraybuffer'));
        return new NextResponse(pdfBuffer, {
          headers: {
            'Content-Type': 'application/pdf',
            'Content-Disposition': `attachment; filename="entity-${entity.entityKey}.pdf"`
          }
        });
      }

      case 'excel': {
        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.json_to_sheet([entityData]);
        XLSX.utils.book_append_sheet(wb, ws, 'Entity');
        const excelBuffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
        
        return new NextResponse(excelBuffer, {
          headers: {
            'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'Content-Disposition': `attachment; filename="entity-${entity.entityKey}.xlsx"`
          }
        });
      }

      default:
        return NextResponse.json({ error: 'Unsupported format' }, { status: 400 });
    }
  } catch (error: any) {
    console.error('Error exporting entity:', error);
    return NextResponse.json(
      { error: 'Failed to export entity', details: error.message },
      { status: 500 }
    );
  }
}