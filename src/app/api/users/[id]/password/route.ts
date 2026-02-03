import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/mongodb";
import User from "@/models/User";
import { verifyToken } from "@/lib/auth/jwt";

// Helper to get token from request
function getTokenFromRequest(request: NextRequest): string | null {
  const authHeader = request.headers.get("authorization");
  if (authHeader?.startsWith("Bearer ")) {
    return authHeader.split(" ")[1];
  }

  const token = request.cookies.get("token")?.value;
  return token || null;
}

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    const { id } = await context.params;
    const token = getTokenFromRequest(request);
    
    if (!token) {
      return NextResponse.json(
        { success: false, message: "Authentication required" },
        { status: 401 },
      );
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json(
        { success: false, message: "Invalid token" },
        { status: 401 },
      );
    }

    const body = await request.json();
    const { currentPassword, newPassword, confirmPassword } = body;

    // Validate new password
    if (!newPassword || newPassword.length < 6) {
      return NextResponse.json(
        { success: false, message: "New password must be at least 6 characters" },
        { status: 400 },
      );
    }

    if (newPassword !== confirmPassword) {
      return NextResponse.json(
        { success: false, message: "Passwords do not match" },
        { status: 400 },
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

    // Check permissions based on your requirements:
    let canChangePassword = false;
    let requiresCurrentPassword = false;

    // 1. Admin can change anyone's password
    if (requestingUser.role === "admin") {
      canChangePassword = true;
      requiresCurrentPassword = false; // Admin doesn't need current password
    }
    // 2. HR can change employee passwords only (not other HR or admin)
    else if (requestingUser.role === "hr" && targetUser.role === "employee") {
      canChangePassword = true;
      requiresCurrentPassword = false; // HR doesn't need current password for employees
    }
    // 3. Users can change their own password (except employees cannot)
    else if (requestingUser._id.toString() === id) {
      // Employees cannot change their own password
      if (requestingUser.role === "employee") {
        return NextResponse.json(
          { 
            success: false, 
            message: "Employees cannot change their own password. Please contact HR or Admin." 
          },
          { status: 403 },
        );
      }
      // HR/Admin changing their own password
      canChangePassword = true;
      requiresCurrentPassword = true;
    }

    if (!canChangePassword) {
      return NextResponse.json(
        { 
          success: false, 
          message: "You are not authorized to change this password" 
        },
        { status: 403 },
      );
    }

    // Verify current password if required
    if (requiresCurrentPassword) {
      if (!currentPassword) {
        return NextResponse.json(
          { success: false, message: "Current password is required" },
          { status: 400 },
        );
      }

      // Use the model's comparePassword method
      const isPasswordValid = await targetUser.comparePassword(currentPassword);
      
      if (!isPasswordValid) {
        return NextResponse.json(
          { success: false, message: "Current password is incorrect" },
          { status: 400 },
        );
      }
    }

    // ✅ CRITICAL FIX: Set the plain password and let Mongoose handle hashing
    targetUser.password = newPassword;
    
    // ✅ This will trigger the pre-save hook in User model which hashes the password once
    await targetUser.save();

    return NextResponse.json({
      success: true,
      message: "Password changed successfully"
      // ✅ REMOVED: Don't return sensitive data
    });
  } catch (error: any) {
    console.error("Change password error:", error);
    return NextResponse.json(
      { success: false, message: "Server error", error: error.message },
      { status: 500 },
    );
  }
}