import { NextRequest, NextResponse } from "next/server";
import PermissionService from "../services/permission-service";


export async function requirePermission(req: NextRequest, module: string, entity: string, action: 'access' | 'create' | 'edit' | 'delete') {
    try {
        // Get user from request (set by auth middleware)
        const user = (req as any).user;
        if (!user) {
            NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        // Admin bypass
        if (user.role === 'admin') {
            return null; // Continue
        }

        // Check permission
        let hasPermission = false;

        switch (action) {
            case 'access':
                hasPermission = await PermissionService.hasAccess(user.userId, module, entity);
                break;
            case 'create':
                hasPermission = await PermissionService.canCreate(user.userId, module, entity);
                break;
            case 'edit': 
                // For edit: we need record creator - handle in route
                return null;
            case 'delete':
                // For delete, we need record creator - handled in route
                return null;
        }

        if (!hasPermission) {
            return NextResponse.json(
                { error: 'Access denied' },
                { status: 403 }
            );
        }

        return null; // Continue

    } catch (error) {
        return NextResponse.json(
            { error: 'Permission check failed' },
            { status: 500 }
        )
    }
}