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

// GET all employees with filtering and pagination
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    // Get token
    const token = getTokenFromRequest(request);

    console.log("🔍 API Employees - Auth check:", {
      hasToken: !!token,
      method: "GET",
      url: request.url,
    });

    if (!token) {
      console.log("❌ No token found");
      return NextResponse.json(
        {
          success: false,
          message: "Authentication required",
          error: "UNAUTHORIZED",
        },
        { status: 401 },
      );
    }

    // Verify token
    const decoded = verifyToken(token);
    if (!decoded) {
      console.log("❌ Token verification failed");
      return NextResponse.json(
        {
          success: false,
          message: "Invalid or expired token",
          error: "INVALID_TOKEN",
        },
        { status: 401 },
      );
    }

    console.log(
      `✅ User authenticated: ${decoded.userId}, role: ${decoded.role}`,
    );

    // Check permissions - Admin can see all, HR can see employees, users can see only themselves
    const requestingUser = await User.findById(decoded.userId);
    if (!requestingUser) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 },
      );
    }

    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const search = searchParams.get("search") || "";
    const department = searchParams.get("department") || "";
    const status = searchParams.get("status") || "";
    const roleFilter = searchParams.get("role") || "all"; // 'all', 'employee', 'hr'
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const sortOrder = searchParams.get("sortOrder") || "desc";

    const skip = (page - 1) * limit;

    // Build filter query based on user role
    let filter: any = {};

    // Admin can see all users except other admin
    if (requestingUser.role === "admin") {
      filter = { role: { $in: ["employee", "hr"] } }; // Admin sees employees and HR
    }
    // HR can see employees only (not other HR or admin)
    else if (requestingUser.role === "hr") {
      filter = { role: "employee" };
    }
    // Employees can only see themselves
    else {
      filter = { _id: requestingUser._id };
    }

    // Apply role filter if specified
    if (roleFilter !== "all") {
      filter.role = roleFilter;
    }

    // Search in multiple fields
    if (search) {
      filter.$or = [
        { fullName: { $regex: search, $options: "i" } },
        { rollNo: { $regex: search, $options: "i" } },
        { cnic: { $regex: search, $options: "i" } },
        { mobile: { $regex: search, $options: "i" } },
        { jobTitle: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    if (department && department !== "all") {
      filter.department = department;
    }

    if (status && status !== "all") {
      filter.status = status;
    }

    // Exclude the requesting user themselves for HR role (HR shouldn't see themselves in employee list)
    if (requestingUser.role === "hr") {
      filter._id = { $ne: requestingUser._id };
    }

    console.log("📊 Filter being applied:", JSON.stringify(filter, null, 2));

    // Get total count
    const total = await User.countDocuments(filter);

    // Get employees with pagination
    const employees = await User.find(filter)
      .select("-password -__v")
      .sort({ [sortBy]: sortOrder === "desc" ? -1 : 1 })
      .skip(skip)
      .limit(limit)
      .lean();

    // Format response
    const formattedEmployees = employees.map((emp) => ({
      id: emp._id,
      rollNo: emp.rollNo,
      fullName: emp.fullName,
      cnic: emp.cnic,
      mobile: emp.mobile,
      email: emp.email,
      profilePhoto: emp.profilePhoto,
      jobTitle: emp.jobTitle,
      department: emp.department,
      role: emp.role,
      salary: emp.salary,
      incentive: emp.incentive,
      taxAmount: emp.taxAmount,
      taxDeduction: emp.taxDeduction,
      status: emp.status,
      dateOfJoining: emp.dateOfJoining,
      createdAt: emp.createdAt,
    }));

    console.log(`📦 Returning ${formattedEmployees.length} employees`);

    return NextResponse.json({
      success: true,
      data: formattedEmployees,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      filters: {
        search,
        department,
        status,
        role: roleFilter,
      },
    });
  } catch (error: any) {
    console.error("❌ Get employees error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Server error",
        error: error.message,
        stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
      },
      { status: 500 },
    );
  }
}

// POST create new employee (Admin/HR only)
export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();

    // Get token
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

    // Check permissions
    const requestingUser = await User.findById(decoded.userId);
    if (!requestingUser) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 },
      );
    }

    // Only admin and HR can create employees
    if (!["admin", "hr"].includes(requestingUser.role)) {
      return NextResponse.json(
        { success: false, message: "Access denied" },
        { status: 403 },
      );
    }

    // Validate required fields
    const requiredFields = [
      "fullName",
      "cnic",
      "mobile",
      "fatherName",
      "dateOfBirth",
      "gender",
      "maritalStatus",
      "address",
      "qualification",
      "jobTitle",
      "department",
      "responsibility",
      "timing",
      "monthOff",
      "dateOfJoining",
      "salary",
    ];

    const missingFields = requiredFields.filter((field) => !body[field]);
    if (missingFields.length > 0) {
      return NextResponse.json(
        {
          success: false,
          message: `Missing required fields: ${missingFields.join(", ")}`,
        },
        { status: 400 },
      );
    }

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [
        { cnic: body.cnic },
        { mobile: body.mobile },
        ...(body.email ? [{ email: body.email }] : []),
      ],
    });

    if (existingUser) {
      return NextResponse.json(
        {
          success: false,
          message: "Employee already exists with same CNIC, mobile, or email",
        },
        { status: 400 },
      );
    }

    // Determine role - Admin can create HR, HR can only create employees
    let userRole = "employee";
    if (requestingUser.role === "admin" && body.role === "hr") {
      userRole = "hr";
    }

    // Create employee with default values
    const employeeData = {
      ...body,
      role: userRole,
      createdBy: requestingUser._id,
      status: "active",
      isActive: true,
      incentive: body.incentive || 0,
      taxDeduction: body.taxDeduction || false,
      taxAmount: body.taxAmount || 0,
    };

    // Set default password if not provided (last 6 digits of CNIC)
    if (!employeeData.password) {
      employeeData.password = body.cnic.replace(/-/g, "").slice(-6);
    }

    const employee = await User.create(employeeData);

    // Return without sensitive data
    const responseData = {
      id: employee._id,
      rollNo: employee.rollNo,
      fullName: employee.fullName,
      cnic: employee.cnic,
      mobile: employee.mobile,
      email: employee.email,
      jobTitle: employee.jobTitle,
      department: employee.department,
      role: employee.role,
      salary: employee.salary,
      status: employee.status,
      dateOfJoining: employee.dateOfJoining,
      createdAt: employee.createdAt,
    };

    return NextResponse.json(
      {
        success: true,
        message: `${userRole === "hr" ? "HR Staff" : "Employee"} created successfully`,
        data: responseData,
        credentials: {
          rollNo: employee.rollNo,
          cnic: employee.cnic,
          password: employeeData.password,
        },
      },
      { status: 201 },
    );
  } catch (error: any) {
    console.error("Create employee error:", error);

    if (error.code === 11000) {
      return NextResponse.json(
        { success: false, message: "Duplicate entry found" },
        { status: 400 },
      );
    }

    return NextResponse.json(
      { success: false, message: "Server error", error: error.message },
      { status: 500 },
    );
  }
}
