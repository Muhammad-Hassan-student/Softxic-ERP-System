import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/mongodb';
import User from '@/models/User';
import { verifyToken } from '@/lib/auth/jwt';
import { Parser } from 'json2csv';

export async function GET(request: NextRequest) {
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

    // Only admin and HR can export
    if (!['admin', 'hr'].includes(decoded.role)) {
      return NextResponse.json(
        { success: false, message: 'Access denied' },
        { status: 403 }
      );
    }

    // Get all employees
    const employees = await User.find({ role: 'employee' })
      .select('-password -__v')
      .lean();

    // Format for CSV
    const formattedData = employees.map(emp => ({
      RollNo: emp.rollNo,
      FullName: emp.fullName,
      CNIC: emp.cnic,
      Mobile: emp.mobile,
      Email: emp.email || '',
      Department: emp.department,
      JobTitle: emp.jobTitle,
      Salary: emp.salary,
      Incentive: emp.incentive,
      TaxAmount: emp.taxAmount,
      Status: emp.status,
      DateOfJoining: new Date(emp.dateOfJoining).toLocaleDateString(),
      CreatedAt: new Date(emp.createdAt).toLocaleDateString(),
    }));

    // Convert to CSV
    const json2csvParser = new Parser();
    const csv = json2csvParser.parse(formattedData);

    // Return CSV file
    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="employees_${new Date().toISOString().split('T')[0]}.csv"`,
      },
    });

  } catch (error: any) {
    console.error('Export error:', error);
    return NextResponse.json(
      { success: false, message: 'Server error', error: error.message },
      { status: 500 }
    );
  }
}