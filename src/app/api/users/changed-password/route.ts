import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/mongodb";
import User from "@/models/User";
import { verifyToken } from "@/lib/auth/jwt";
import bcrypt from "bcryptjs";

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

export async function POST(request: NextRequest) {
  try {
    await connectDB();

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
    const { userId, currentPassword, newPassword } = body;

    if (!newPassword || newPassword.length < 6) {
      return NextResponse.json(
        {
          success: false,
          message: "New password must be at least 6 characters",
        },
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
    const targetUserId = userId || decoded.userId;
    const targetUser = await User.findById(targetUserId);
    if (!targetUser) {
      return NextResponse.json(
        { success: false, message: "Target user not found" },
        { status: 404 },
      );
    }

    // Check permissions
    const canChangePassword =
      requestingUser.role === "admin" ||
      requestingUser._id.toString() === targetUserId;

    if (!canChangePassword) {
      return NextResponse.json(
        {
          success: false,
          message: "You are not allowed to change this password",
        },
        { status: 403 },
      );
    }

    // If user is changing their own password, verify current password
    if (requestingUser._id.toString() === targetUserId) {
      if (!currentPassword) {
        return NextResponse.json(
          { success: false, message: "Current password is required" },
          { status: 400 },
        );
      }

      const isPasswordValid = await bcrypt.compare(
        currentPassword,
        targetUser.password,
      );
      if (!isPasswordValid) {
        return NextResponse.json(
          { success: false, message: "Current password is incorrect" },
          { status: 400 },
        );
      }
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update password
    targetUser.password = hashedPassword;
    await targetUser.save();

    return NextResponse.json({
      success: true,
      message: "Password changed successfully",
    });
  } catch (error: any) {
    console.error("Change password error:", error);
    return NextResponse.json(
      { success: false, message: "Server error", error: error.message },
      { status: 500 },
    );
  }
}
