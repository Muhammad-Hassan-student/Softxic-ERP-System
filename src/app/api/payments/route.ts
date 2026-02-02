import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/mongodb";
import Payment from "@/models/Payment";
import User from "@/models/User";
import { verifyToken } from "@/lib/auth/jwt";

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    // Verify authentication
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { success: false, message: "Authentication required" },
        { status: 401 },
      );
    }

    const token = authHeader.split(" ")[1];
    const decoded = verifyToken(token);

    if (!decoded) {
      return NextResponse.json(
        { success: false, message: "Invalid token" },
        { status: 401 },
      );
    }

    const formData = await request.formData();

    // Parse form data
    const paymentData = {
      employeeId: formData.get("employeeId"),
      amount: parseFloat(formData.get("amount") as string),
      paymentMode: formData.get("paymentMode"),
      bankName: formData.get("bankName"),
      accountNumber: formData.get("accountNumber"),
      transactionId: formData.get("transactionId"),
      paymentDetails: formData.get("paymentDetails"),
      slipNo: formData.get("slipNo"),
      paymentDate: new Date(formData.get("paymentDate") as string),
      deductionType: formData.get("deductionType"),
      deductionAmount:
        parseFloat(formData.get("deductionAmount") as string) || 0,
      deductionReason: formData.get("deductionReason"),
      isAdvance: formData.get("isAdvance") === "true",
      advanceAmount: parseFloat(formData.get("advanceAmount") as string) || 0,
      status: "completed",
      processedBy: decoded.userId,
    };

    // Create payment record
    const payment = await Payment.create(paymentData);

    // Update employee's last payment date
    await User.findByIdAndUpdate(paymentData.employeeId, {
      lastPaymentDate: new Date(),
    });

    return NextResponse.json(
      {
        success: true,
        message: "Payment recorded successfully",
        data: payment,
        slipNo: payment.slipNo,
      },
      { status: 201 },
    );
  } catch (error: any) {
    console.error("Payment error:", error);
    return NextResponse.json(
      { success: false, message: "Server error", error: error.message },
      { status: 500 },
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    // Verify authentication
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { success: false, message: "Authentication required" },
        { status: 401 },
      );
    }

    const token = authHeader.split(" ")[1];
    const decoded = verifyToken(token);

    if (!decoded) {
      return NextResponse.json(
        { success: false, message: "Invalid token" },
        { status: 401 },
      );
    }

    const { searchParams } = new URL(request.url);
    const employeeId = searchParams.get("employeeId");
    const month = searchParams.get("month");
    const year = searchParams.get("year");

    const query: any = {};
    if (employeeId) query.employeeId = employeeId;
    if (month && year) {
      const startDate = new Date(parseInt(year), parseInt(month) - 1, 1);
      const endDate = new Date(parseInt(year), parseInt(month), 0);
      query.paymentDate = { $gte: startDate, $lte: endDate };
    }

    const payments = await Payment.find(query)
      .populate("employeeId", "fullName rollNo")
      .sort({ paymentDate: -1 })
      .lean();

    return NextResponse.json({
      success: true,
      data: payments,
      count: payments.length,
    });
  } catch (error: any) {
    console.error("Get payments error:", error);
    return NextResponse.json(
      { success: false, message: "Server error", error: error.message },
      { status: 500 },
    );
  }
}
