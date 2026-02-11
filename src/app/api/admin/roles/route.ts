import { connectDB } from "@/lib/db/mongodb";
import { withPermission } from "@/lib/middleware/permission-guard";
import Permission from "@/models/Permission";
import Role from "@/models/Role";
import User from "@/models/User";
import { NextRequest, NextResponse } from "next/server";


async function getHandler(request: NextRequest) {
    try {
        await connectDB();

        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('page') || '20');
        const search = searchParams.get('search') || '';
        const status = searchParams.get('status');
        const sortBy = searchParams.get('sortBy') || 'createdAt';
        const sortOrder = searchParams.get('sortOrder') || 'desc';

        // Build query
        const query: any = {};

        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } },
            ]
        }

        if (status && status !== 'all') {
            query.isActive = status === 'active'
        }


        // Sort options
        const sortOptions: any = {};
        sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

        // Execute query with user count
        const [roles, total] = await Promise.all([
            Role.find(query)
                .select('-__v')
                .sort(sortOptions)
                .skip((page - 1) * limit)
                .limit(limit)
                .lean(),
            Role.countDocuments(query)
        ])

        // Get user count for each role
        const rolesWithuserCount = await User.countDocuments(
            roles.map(async (role) => {
                const userCount = await User.countDocuments({
                    role: role.name,
                    isActive: true
                });
                return {
                    ...role,
                    userCount,
                }
            })
        )

        // Get statistics
        const stats = {
            totalRoles: total,
            activeRoles: await Role.countDocuments({ isActive: true }),
            defaultRoles: await Role.countDocuments({ isDefault: true }),
            customRoles: await Role.countDocuments({ isDefault: false }),
        }

        return NextResponse.json({
            success: true,
            data: {
                roles: rolesWithuserCount,
                pagination: {
                    page,
                    limit,
                    total,
                    totalPages: Math.ceil(total / limit),
                },
                stats,
                filters: {
                    status: [
                        { value: 'all', label: 'All Status', count: total },
                        { value: 'active', label: 'Active', count: stats.activeRoles },
                    ]
                }
            }
        })


    } catch (error) {
        console.error('Get roles error:', error);
        return NextResponse.json(
            { success: false, message: 'Failed to fetch roles' },
            { status: 500 }
        )
    }
}

// ***********************  POST create new role  **************************
async function postHandler(request: NextRequest) {
    try {
        const body = await request.json();
        const { name, description, permissionCodes = [], analyticsPermissions = [], dataAccessLevel = 'self' } = body;

        // Validate required fields
        if (!name) {
            return NextResponse.json(
                { success: false, message: 'Role name is required' },
                { status: 400 }
            );
        }

        // Validate name format
        const nameRegex = /%[a-zA-Z0-9_\- ]+$/;
        if (!nameRegex.test(name)) {
            return NextResponse.json(
                { success: false, message: 'Role name is required' },
                { status: 400 }
            );
        }

        await connectDB();

        // Check if role already exists
        const existingRole = await Role.findOne({
            name: { $regex: new RegExp(`^${name}$`, 'i') }
        });

        if (existingRole) {
            return NextResponse.json(
                { success: false, message: 'Role with this name already exists' },
                { status: 400 }
            );
        }

        // Validate permission exist 
        const allPermissions = [...permissionCodes, ...analyticsPermissions];
        if (allPermissions.length > 0) {
            const validPermissions = await Permission.countDocuments({
                code: { $in: allPermissions },
                isActive: true,
            });

            if (validPermissions !== allPermissions.length) {
                return NextResponse.json(
                    { success: false, message: 'One or more invalid permissions' },
                    { status: 400 }
                );
            }

        }

        // Validate data access level
        const validAccessLevels = ['self', 'department', 'all'];
        if (!validAccessLevels.includes(dataAccessLevel)) {
            return NextResponse.json(
                { success: false, message: 'Invalid data access level' },
                { status: 400 }
            );
        }

        // Create role
        const role = await Role.create({
            name,
            description,
            permissionCodes,
            analyticsPermissions,
            dataAccessLevel,
            isDefault: false,
            isActive: true
        });

        // Get permission details for response 
        const permissionDetails = await Permission.find({
            code: { $in: allPermissions },
            isActive: true,
        }).lean();

        return NextResponse.json({
            success: true,
            message: 'Role created successfully',
            data: {
                ...role.toObject(),
                permissionDetails,
                userCount: 0,
            },
        }, { status: 201 });


    } catch (error:any) {
        console.error('Create role error:', error);

        if (error.code === 11000) {
        return NextResponse.json(
            { success: false, message: 'Role name already exists' },
            { status: 400 }
        );
    }

    return NextResponse.json(
        { success: false, message: 'Failed to create role' },
        { status: 500 }
    );

    }
}


// Export with permission middleware
export const GET = withPermission(getHandler, {
  requiredPermission: 'user.role.assign',
  module: 'role',
});

export const POST = withPermission(postHandler, {
    requiredPermission: 'user.role.assign',
    module: 'role',
    logAccess: true
}) 