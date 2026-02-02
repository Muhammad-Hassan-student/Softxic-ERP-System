import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/mongodb";
import User from "@/models/User";
import Payment from "@/models/Payment";

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    // Get total counts
    const [
      totalEmployees,
      activeEmployees,
      hrStaff,
      totalSalaryResult,
      pendingPayments,
      thisMonthJoining,
    ] = await Promise.all([
      User.countDocuments({ role: "employee" }),
      User.countDocuments({ role: "employee", status: "active" }),
      User.countDocuments({ role: "hr", status: "active" }),
      User.aggregate([
        { $match: { role: "employee", status: "active" } },
        { $group: { _id: null, total: { $sum: "$salary" } } },
      ]),
      Payment.countDocuments({ status: "pending" }),
      User.countDocuments({
        role: "employee",
        dateOfJoining: {
          $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
          $lte: new Date(
            new Date().getFullYear(),
            new Date().getMonth() + 1,
            0,
          ),
        },
      }),
    ]);

    const stats = {
      totalEmployees,
      activeEmployees,
      hrStaff,
      totalSalary: totalSalaryResult[0]?.total || 0,
      pendingPayments,
      thisMonthJoining,
      updatedAt: new Date(),
    };

    return NextResponse.json({
      success: true,
      data: stats,
    });
  } catch (error: any) {
    console.error("Get stats error:", error);
    return NextResponse.json(
      { success: false, message: "Server error", error: error.message },
      { status: 500 },
    );
  }
}
