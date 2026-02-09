import { NextRequest, userAgent } from "next/server";
import { verifyToken } from "../auth/jwt";
import { connectDB } from "../db/mongodb";
import User from "@/models/User";
import AuditLog from "@/models/AuditLog";
import { timeStamp } from "console";
import Role from "@/models/Role";


export interface PermissionGuardOptions {
    requiredPermission?: string;
    requiredAnalyticsPermission?: string;
    requireAll?: boolean;
    dataScope?: 'self' | 'department' | 'all';
    sensitiveData?: boolean;
    module: string;
    logAccess?: boolean;
    customCheck?: (guard: PermissionGuard) => Promise<boolean>;
}

export class PermissionGuard {
    private request: NextRequest;
    private userId: string;
    private extractedUserRole: string; // Renamed to avoid confusion
    private userCache: any = null;
    private roleCache: any = null;

    constructor(request: NextRequest) {
        this.request = request;

        // Extract user info from headers or cookie
        let userId = request.headers.get('x-user-id');
        let userRole = request.headers.get('x-user-role');

        // Fallback to cookies if headers not present
        if (!userId || !userRole) {
            const token = request.cookies.get('token')?.value;
            if (token) {
                try {
                    const decoded = verifyToken(token);

                    if (decoded) {
                        userId = decoded.userId || userId;
                        userRole = decoded.role || userRole;
                    }
                } catch (error) {
                    console.error('Token verification failed', error)
                }
            }
        }

        if (!userId || !userRole) {
            throw new Error('User authentication required');
        }

        this.userId = userId;
        this.extractedUserRole = userRole; // Store extracted role
    }

    async initialize(): Promise<void> {
        if (!this.userCache || !this.roleCache) {
            await connectDB()

            // Get user with role and permissions - verify against extracted role
            this.userCache = await User.findById(this.userId).select('role directPermissions dataScopes department isActive status fullName email').lean();

            if (!this.userCache) {
                throw new Error('User not found');
            }

            // Verify extracted role matches database role (security check)
            if (this.userCache.role !== this.extractedUserRole) {
                console.warn(`Role missmatch: DB-${this.userCache.role}, Headers=${this.extractedUserRole}`);
                
                // You might want to log this as a security incident 
                // TODO: LOGsECURITYiNCIDENT 
        //        await this.logSecurityIncident('ROLE_MISMATCH', {
        //   dbRole: this.userCache.role,
        //   headerRole: this.extractedUserRole,
        //   userId: this.userId
        // });
            }

            // Check if user is active
            if (!this.userCache.isActive || this.userCache.status !== 'active') {
                throw new Error('user account is inactive')
            }

            // Get role permissions from database (not from headers)
            this.roleCache = await Role.findOne({
                name: this.userCache.role, // User role from DB, not headers
                isActive: true
                
            }).select('PermissionCodes analyticsPermissions dataAccessLevel isDefault name').lean();

            if (!this.roleCache) {
                throw new Error('Role configuration not found');
            }
        }
    }

    // async logAccess(
    //     action: string,
    //     resourceType: string,
    //     resourceType?: string,
    //     details?: any
    // ): Promise<void> {
    //     try {
    //         await AuditLog.create({
    //             userId: this.userId,
    //             userRole: this.userRole,
    //             action,
    //             resourceType,
    //             details,
    //             ipAddress: this.extractedUserRole.request.headers.get('x-forwarded-for') || this.request.headers.get('x-real-ip') || 'unknown',
    //             userAgent: this.request.headers.get('user-agent'),
    //             timestamp: new Date()
    //         })
    //     } catch (error) {
    //         console.error('Faled to log access:', error)
    //     }
    // }
}



