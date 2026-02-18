import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/mongodb';
import { verifyToken } from '@/lib/auth/jwt';
import User from '@/models/User';
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
    const role = searchParams.get('role');
    const status = searchParams.get('status');

    const query: any = {};
    if (role && role !== 'all') query.role = role;
    if (status && status !== 'all') query.status = status;

    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .lean();

    const exportData = users.map(user => ({
      'Full Name': user.fullName || '',
      'Email': user.email || '',
      'Role': user.role || '',
      'Department': user.department || '',
      'Designation': user.designation || '',
      'Mobile': user.mobile || '',
      'Employee ID': user.employeeId || '',
      'Status': user.status || '',
      'Last Login': user.lastLogin ? new Date(user.lastLogin).toLocaleString() : '',
      'Created At': user.createdAt ? new Date(user.createdAt).toLocaleString() : ''
    }));

    const fields = ['Full Name', 'Email', 'Role', 'Department', 'Designation', 
                    'Mobile', 'Employee ID', 'Status', 'Last Login', 'Created At'];
    const parser = new Parser({ fields });
    const csv = parser.parse(exportData);

    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename=users-export-${new Date().toISOString().split('T')[0]}.csv`
      }
    });

  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to export users', details: error.message },
      { status: 500 }
    );
  }
}