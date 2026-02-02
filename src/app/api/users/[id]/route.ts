import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/mongodb";
import User from "@/models/User";
import { verifyToken } from "@/lib/auth/jwt";

// Helper to get token from request
function getTokenFromRequest(request: NextRequest): string | null {
  // First try Authorization header
  const authHeader = request.headers.get("authorization");
  if (authHeader?.startsWith("Bearer ")) {
    return authHeader.split(" ")[1];
  }

  // Then try cookies
  const token = request.cookies.get("token")?.value;
  if (token) return token;

  return null;
}

/* =========================
   GET user profile
========================= */
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    await connectDB();

    const { id } = await context.params;

    // Get token from request
    const token = getTokenFromRequest(request);
    if (!token) {
      return NextResponse.json(
        { success: false, message: "Authentication required" },
        { status: 401 },
      );
    }

    // Verify token
    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json(
        { success: false, message: "Invalid token" },
        { status: 401 },
      );
    }

    // Find requesting user
    const requestingUser = await User.findById(decoded.userId);
    if (!requestingUser) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 },
      );
    }

    // Find target user
    const targetUser = await User.findById(id);
    if (!targetUser) {
      return NextResponse.json(
        { success: false, message: "Target user not found" },
        { status: 404 },
      );
    }

    // Check permissions
    const canView =
      requestingUser.role === "admin" ||
      (requestingUser.role === "hr" && targetUser.role === "employee") ||
      requestingUser._id.toString() === id;

    if (!canView) {
      return NextResponse.json(
        { success: false, message: "Access denied" },
        { status: 403 },
      );
    }

    // Prepare response
    let userData: any = {
      id: targetUser._id,
      fullName: targetUser.fullName,
      profilePhoto: targetUser.profilePhoto,
      role: targetUser.role,
      department: targetUser.department,
      status: targetUser.status,
      createdAt: targetUser.createdAt,
    };

    if (targetUser.role === "employee") {
      userData = {
        ...userData,
        rollNo: targetUser.rollNo,
        cnic: targetUser.cnic,
        fatherName: targetUser.fatherName,
        dateOfBirth: targetUser.dateOfBirth,
        gender: targetUser.gender,
        maritalStatus: targetUser.maritalStatus,
        address: targetUser.address,
        qualification: targetUser.qualification,
        reference: targetUser.reference,
        jobTitle: targetUser.jobTitle,
        responsibility: targetUser.responsibility,
        timing: targetUser.timing,
        monthOff: targetUser.monthOff,
        dateOfJoining: targetUser.dateOfJoining,
        salary: targetUser.salary,
        incentive: targetUser.incentive,
        taxDeduction: targetUser.taxDeduction,
        taxAmount: targetUser.taxAmount,
      };
    }

    if (
      requestingUser.role === "admin" ||
      requestingUser.role === "hr" ||
      requestingUser._id.toString() === id
    ) {
      userData.email = targetUser.email;
      userData.mobile = targetUser.mobile;
      userData.alternateMobile = targetUser.alternateMobile;
    }

    return NextResponse.json({
      success: true,
      data: userData,
    });
  } catch (error: any) {
    console.error("Get user error:", error);
    return NextResponse.json(
      { success: false, message: "Server error", error: error.message },
      { status: 500 },
    );
  }
}

/* =========================
   PUT update user profile
========================= */
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    await connectDB();

    const { id } = await context.params;

    // Get token from request
    const token = getTokenFromRequest(request);
    if (!token) {
      return NextResponse.json(
        { success: false, message: "Authentication required" },
        { status: 401 },
      );
    }

    // Verify token
    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json(
        { success: false, message: "Invalid token" },
        { status: 401 },
      );
    }

    const body = await request.json();

    const requestingUser = await User.findById(decoded.userId);
    if (!requestingUser) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 },
      );
    }

    const targetUser = await User.findById(id);
    if (!targetUser) {
      return NextResponse.json(
        { success: false, message: "Target user not found" },
        { status: 404 },
      );
    }

    const canUpdate =
      requestingUser.role === "admin" ||
      (requestingUser.role === "hr" && targetUser.role === "employee") ||
      requestingUser._id.toString() === id;

    if (!canUpdate) {
      return NextResponse.json(
        { success: false, message: "Access denied" },
        { status: 403 },
      );
    }

    let allowedFields: string[] = [];

    if (requestingUser._id.toString() === id) {
      allowedFields = ["fullName", "mobile", "alternateMobile", "address"];
    }

    if (requestingUser.role === "hr" && targetUser.role === "employee") {
      allowedFields.push(
        "jobTitle",
        "department",
        "responsibility",
        "timing",
        "monthOff",
        "salary",
        "incentive",
      );
    }

    if (requestingUser.role === "admin") {
      allowedFields = [
        "fullName",
        "email",
        "mobile",
        "alternateMobile",
        "address",
        "jobTitle",
        "department",
        "responsibility",
        "timing",
        "monthOff",
        "salary",
        "incentive",
        "taxDeduction",
        "taxAmount",
      ];
    }

    const filteredUpdates: any = {};
    Object.keys(body).forEach((key) => {
      if (allowedFields.includes(key)) {
        filteredUpdates[key] = body[key];
      }
    });

    Object.assign(targetUser, filteredUpdates);
    await targetUser.save();

    return NextResponse.json({
      success: true,
      message: "Profile updated successfully",
      data: {
        id: targetUser._id,
        ...filteredUpdates,
      },
    });
  } catch (error: any) {
    console.error("Update user error:", error);
    return NextResponse.json(
      { success: false, message: "Server error", error: error.message },
      { status: 500 },
    );
  }
}
