import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/mongodb";
import { verifyToken } from "@/lib/auth/jwt";
import CategoryModel from "@/app/financial-tracker/models/category.model";
import ActivityService from "@/app/financial-tracker/services/activity-service"; // Fixed import path
import mongoose from "mongoose";

// GET /api/financial-tracker/categories
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    // Verify authentication
    const token = request.cookies.get("token")?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const module = searchParams.get("module");
    const entity = searchParams.get("entity");
    const active = searchParams.get("active") === "true";

    // Build query
    const query: any = {};
    if (module && module !== "all") query.module = module;
    if (entity && entity !== "all") query.entity = entity;
    if (active) query.isActive = true;

    // Fetch categories
    const categories = await CategoryModel.find(query)
      .populate("parentCategory", "name")
      .populate("createdBy", "fullName")
      .populate("updatedBy", "fullName")
      .sort({ module: 1, entity: 1, name: 1 });

    return NextResponse.json({
      categories,
      total: categories.length,
    });
  } catch (error: any) {
    console.error("Error fetching categories:", error);
    return NextResponse.json(
      { error: "Failed to fetch categories", details: error.message },
      { status: 500 },
    );
  }
}

// app/api/financial-tracker/categories/route.ts (POST method only)
export async function POST(request: NextRequest) {
  try {
    await connectDB();

    // Verify authentication
    const token = request.cookies.get("token")?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    // Only admin can create categories
    if (decoded.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();

    // Validate required fields
    if (!body.module || !body.entity || !body.name) {
      return NextResponse.json(
        { error: "Module, entity, and name are required" },
        { status: 400 },
      );
    }

    // Validate module (only this is fixed)
    if (!["re", "expense"].includes(body.module)) {
      return NextResponse.json(
        { error: 'Invalid module. Must be "re" or "expense"' },
        { status: 400 },
      );
    }

    // 🔥 ENTERPRISE APPROACH: Check if entity exists in EntityModel
    const entityExists = await mongoose.model("Entity").exists({
      module: body.module,
      entityKey: body.entity.toLowerCase(),
      isEnabled: true,
    });

    if (!entityExists) {
      return NextResponse.json(
        {
          error: "Invalid entity",
          details: `Entity "${body.entity}" does not exist in ${body.module} module`,
          suggestion: "Please create the entity first in Entity Management",
        },
        { status: 400 },
      );
    }

    // Check if category already exists
    const existingCategory = await CategoryModel.findOne({
      module: body.module,
      entity: body.entity,
      name: body.name,
    });

    if (existingCategory) {
      return NextResponse.json(
        { error: "Category with this name already exists" },
        { status: 409 },
      );
    }

    // Create category
    const category = new CategoryModel({
      ...body,
      createdBy: decoded.userId,
      updatedBy: decoded.userId,
    });

    await category.save();

    // Log activity
    await ActivityService.log({
      userId: decoded.userId,
      module: body.module,
      entity: body.entity,
      action: "CREATE",
      changes: [
        {
          field: "category",
          oldValue: null,
          newValue: body.name,
        },
      ],
    });

    return NextResponse.json({
      message: "Category created successfully",
      category,
    });
  } catch (error: any) {
    console.error("Error creating category:", error);
    return NextResponse.json(
      { error: "Failed to create category", details: error.message },
      { status: 500 },
    );
  }
}
