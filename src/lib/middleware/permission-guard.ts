import { NextRequest, NextResponse, userAgent } from "next/server";
import { verifyToken } from "../auth/jwt";
import { connectDB } from "../db/mongodb";
import User from "@/models/User";
import AuditLog from "@/models/AuditLog";
import { timeStamp } from "console";
import Role from "@/models/Role";
import { includes, string, success } from "zod";
import Permission from "@/models/Permission";


export interface PermissionGuardOptions {
  requiredPermission?: string | string[];
  requiredAnalyticsPermission?: string | string[];
  requireAll?: boolean;
  dataScope?: 'self' | 'department' | 'all';
  sensitiveData?: boolean;
  module?: string;
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
    
    // Extract user info from headers or cookies
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
          console.error('Token verification failed:', error);
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
      await connectDB();
      
      // Get user with role and permissions - verify against extracted role
      this.userCache = await User.findById(this.userId)
        .select('role directPermissions dataScopes department isActive status fullName email')
        .lean();

      if (!this.userCache) {
        throw new Error('User not found');
      }

      // Verify extracted role matches database role (security check)
      if (this.userCache.role !== this.extractedUserRole) {
        console.warn(`Role mismatch: DB=${this.userCache.role}, Headers=${this.extractedUserRole}`);
        // You might want to log this as a security incident
        await this.logSecurityIncident('ROLE_MISMATCH', {
          dbRole: this.userCache.role,
          headerRole: this.extractedUserRole,
          userId: this.userId
        });
      }

      // Check if user is active
      if (!this.userCache.isActive || this.userCache.status !== 'active') {
        throw new Error('User account is inactive');
      }

      // Get role permissions from database (not from headers)
      this.roleCache = await Role.findOne({ 
        name: this.userCache.role, // Use role from DB, not headers
        isActive: true 
      })
      .select('permissionCodes analyticsPermissions dataAccessLevel isDefault name')
      .lean();

      if (!this.roleCache) {
        throw new Error('Role configuration not found');
      }
    }
  }

  // Getter for user role (from database, not headers)
  get userRole(): string {
    return this.userCache?.role || this.extractedUserRole;
  }

// Getter for user ID
  get UserId(): string {
    return this.userId;
  }  

  async checkPermission(requiredPermission: string | string[]): Promise<boolean> {
    try {
      await this.initialize();
      
      // Admin has all permissions
      if (this.userRole === 'admin') {
        return true;
      }

      const permissions = Array.isArray(requiredPermission) 
        ? requiredPermission 
        : [requiredPermission];

      // Check direct permissions first (overrides)
      for (const perm of permissions) {
        if (this.userCache.directPermissions?.includes(perm)) {
          return true;
        }
      }

      // Check role permissions
      const allRolePermissions = [
        ...(this.roleCache.permissionCodes || []),
        ...(this.roleCache.analyticsPermissions || [])
      ];

      for (const perm of permissions) {
        if (!allRolePermissions.includes(perm)) {
          return false;
        }
      }

      return true;
    } catch (error) {
      console.error('Permission check error:', error);
      return false;
    }
  }

  async checkAnyPermission(requiredPermissions: string[]): Promise<boolean> {
    for (const perm of requiredPermissions) {
      if (await this.checkPermission(perm)) {
        return true;
      }
    }
    return false;
  }

  async checkAnalyticsPermission(requiredPermission: string | string[]): Promise<boolean> {
    const permissions = Array.isArray(requiredPermission) 
      ? requiredPermission 
      : [requiredPermission];
    
    // Verify these are analytics permissions
    const allAnalytics = permissions.every(perm => perm.startsWith('analytics.'));
    if (!allAnalytics) {
      return false;
    }
    
    return this.checkPermission(permissions);
  }

  async filterData<T extends Record<string, any>>(
    data: T,
    permissionRules: Record<string, string[]> // field -> required permissions
  ): Promise<T> {
    await this.initialize();
    
    const filteredData = JSON.parse(JSON.stringify(data));
    
    for (const [field, requiredPermissions] of Object.entries(permissionRules)) {
      if (field in filteredData) {
        const hasAccess = await this.checkAnyPermission(requiredPermissions);
        
        if (!hasAccess) {
          delete filteredData[field];
          
          // Log sensitive data access attempt
          await this.logSensitiveAccessAttempt(field);
        }
      }
    }
    
    return filteredData;
  }

  async filterDataArray<T extends Record<string, any>>(
    dataArray: T[],
    permissionRules: Record<string, string[]>
  ): Promise<T[]> {
    return Promise.all(
      dataArray.map(item => this.filterData(item, permissionRules))
    );
  }

  async getUserDataScope(): Promise<{
    level: 'self' | 'department' | 'all';
    department?: string;
    accessibleDepartments?: string[];
    userId: string;
    userRole: string;
  }> {
    await this.initialize();
    
    if (this.userRole === 'admin') {
      return { 
        level: 'all', 
        department: this.userCache.department,
        userId: this.userId,
        userRole: this.userRole
      };
    }

    const dataAccessLevel = this.roleCache?.dataAccessLevel || 'self';

    return {
      level: dataAccessLevel,
      department: this.userCache.department,
      accessibleDepartments: this.userCache.dataScopes?.accessibleDepartments,
      userId: this.userId,
      userRole: this.userRole,
    };
  }

  async buildQueryFilter(): Promise<Record<string, any>> {
    const dataScope = await this.getUserDataScope();
    
    switch (dataScope.level) {
      case 'all':
        return {};
      case 'department':
        if (dataScope.department) {
          return { 
            department: dataScope.department,
            $or: [
              { dataAccessLevel: 'department' },
              { dataAccessLevel: 'self' },
              { dataAccessLevel: { $exists: false } }
            ]
          };
        }
        return { _id: this.userId };
      case 'self':
        return { _id: this.userId };
      default:
        return { _id: this.userId };
    }
  }

  async buildAggregationPipeline(basePipeline: any[] = []): Promise<any[]> {
    const dataScope = await this.getUserDataScope();
    
    let matchStage: any = {};
    
    switch (dataScope.level) {
      case 'all':
        matchStage = {};
        break;
      case 'department':
        if (dataScope.department) {
          matchStage = {
            $or: [
              { department: dataScope.department },
              { createdBy: this.userId },
              { _id: this.userId }
            ]
          };
        } else {
          matchStage = { _id: this.userId };
        }
        break;
      case 'self':
        matchStage = { _id: this.userId };
        break;
    }
    
    if (Object.keys(matchStage).length > 0) {
      return [{ $match: matchStage }, ...basePipeline];
    }
    
    return basePipeline;
  }

  async getAccessibleModules(): Promise<{
    crud: string[];
    analytics: string[];
    all: string[];
  }> {
    await this.initialize();
    
    const allPermissions = [
      ...(this.roleCache.permissionCodes || []),
      ...(this.roleCache.analyticsPermissions || []),
      ...(this.userCache.directPermissions || [])
    ];
    
    const modules = new Set<string>();
    const crudModules = new Set<string>();
    const analyticsModules = new Set<string>();
    
    // Get permission details to extract modules
    const permissionDetails = await Permission.find({
      code: { $in: allPermissions },
      isActive: true
    }).select('module category').lean();
    
    permissionDetails.forEach(perm => {
      modules.add(perm.module);
      if (perm.category === 'analytics') {
        analyticsModules.add(perm.module);
      } else {
        crudModules.add(perm.module);
      }
    });
    
    return {
      crud: Array.from(crudModules),
      analytics: Array.from(analyticsModules),
      all: Array.from(modules)
    };
  }

  async checkDataAccess(resource: any): Promise<boolean> {
    const dataScope = await this.getUserDataScope();
    
    // Admin can access everything
    if (dataScope.level === 'all') {
      return true;
    }
    
    // Check if resource belongs to user
    if (resource._id?.toString() === this.userId) {
      return true;
    }
    
    // Check department access
    if (dataScope.level === 'department' && dataScope.department) {
      if (resource.department === dataScope.department) {
        return true;
      }
      
      // Check accessible departments
      if (dataScope.accessibleDepartments?.includes(resource.department)) {
        return true;
      }
    }
    
    // Check created by
    if (resource.createdBy?.toString() === this.userId) {
      return true;
    }
    
    return false;
  }

  async logAccess(
    action: string,
    resourceType: string,
    resourceId?: string,
    details?: any
  ): Promise<void> {
    try {
      await AuditLog.create({
        userId: this.userId,
        userRole: this.userRole,
        action,
        resourceType,
        resourceId,
        details,
        ipAddress: this.request.headers.get('x-forwarded-for') || 
                   this.request.headers.get('x-real-ip') ||
                   'unknown',
        userAgent: this.request.headers.get('user-agent'),
        timestamp: new Date()
      });
    } catch (error) {
      console.error('Failed to log access:', error);
    }
  }

  private async logSecurityIncident(
    incidentType: string,
    details: any
  ): Promise<void> {
    try {
      await AuditLog.create({
        userId: this.userId,
        userRole: this.userRole,
        action: 'SECURITY_INCIDENT',
        resourceType: 'system',
        details: {
          incidentType,
          ...details,
          severity: 'high'
        },
        ipAddress: this.request.headers.get('x-forwarded-for'),
        userAgent: this.request.headers.get('user-agent'),
        status: 'error',
        timestamp: new Date()
      });
    } catch (error) {
      console.error('Failed to log security incident:', error);
    }
  }

  private async logSensitiveAccessAttempt(field: string): Promise<void> {
    await this.logAccess(
      'SENSITIVE_DATA_ACCESS_ATTEMPT',
      'data_field',
      undefined,
      { field, userId: this.userId }
    );
  }

   async getEffectivePermissions(): Promise<{
     permissions: string[];
     analyticsPermissions: string[];
     dataAccessLevel: string;
     modules: string[];
     user: {
       id: string;
       role: string;
       department?: string;
       fullName?: string;
     };
   }> {
     await this.initialize();
     
     const allPermissions = new Set<string>([
       ...(this.roleCache.permissionCodes || []),
       ...(this.userCache.directPermissions || [])
     ]);
     
     const allAnalyticsPermissions = new Set<string>(
       this.roleCache.analyticsPermissions || []
     );
     
     // Get modules from permissions
     const permissionCodes = [...allPermissions, ...allAnalyticsPermissions];
     const permissionDetails = await Permission.find({
       code: { $in: permissionCodes },
       isActive: true
     }).select('module').lean();
     
     const modules = [...new Set(permissionDetails.map(p => p.module))];
     
     return {
       permissions: Array.from(allPermissions),
       analyticsPermissions: Array.from(allAnalyticsPermissions),
       dataAccessLevel: this.roleCache.dataAccessLevel || 'self',
       modules,
       user: {
         id: this.userId,
         role: this.userRole,
         department: this.userCache.department,
         fullName: this.userCache.fullName
       }
     };
   }
  // Get user info for frontend
  async getUserInfo(): Promise<{
    id: string;
    role: string;
    department?: string;
    fullName: string;
    email?: string;
    permissions: string[];
    analyticsPermissions: string[];
  }> {
    await this.initialize();
    
    const effectivePermissions = await this.getEffectivePermissions();
    
    return {
      id: this.userId,
      role: this.userRole,
      department: this.userCache.department,
      fullName: this.userCache.fullName,
      email: this.userCache.email,
      permissions: effectivePermissions.permissions,
      analyticsPermissions: effectivePermissions.analyticsPermissions
    };
  }
}



// Enhanced middleware wrapper
export function requirePermission(options: PermissionGuardOptions) {
  return async function (request: NextRequest): Promise<NextResponse | null> {
    try {
      const guard = new PermissionGuard(request);
      
      // Initialize guard
      await guard.initialize();
      
      // Check CRUD permission
      if (options.requiredPermission) {
        const hasPermission = Array.isArray(options.requiredPermission)
          ? await guard.checkAnyPermission(options.requiredPermission)
          : await guard.checkPermission(options.requiredPermission);
        
        if (!hasPermission) {
          // Log denied access
          await guard.logAccess(
            'PERMISSION_DENIED',
            options.module || 'unknown',
            undefined,
            { 
              requiredPermission: options.requiredPermission,
              path: request.nextUrl.pathname,
              method: request.method,
              userRole: guard.userRole
            }
          );
          
          return NextResponse.json(
            { 
              success: false, 
              message: 'Insufficient permissions',
              error: 'PERMISSION_DENIED',
              code: 'PERMISSION_DENIED',
              userRole: guard.userRole
            },
            { status: 403 }
          );
        }
      }
      
      // Check analytics permission
      if (options.requiredAnalyticsPermission) {
        const hasAnalyticsPermission = Array.isArray(options.requiredAnalyticsPermission)
          ? await guard.checkAnyPermission(options.requiredAnalyticsPermission)
          : await guard.checkAnalyticsPermission(options.requiredAnalyticsPermission);
        
        if (!hasAnalyticsPermission) {
          await guard.logAccess(
            'ANALYTICS_ACCESS_DENIED',
            'analytics',
            undefined,
            { 
              requiredPermission: options.requiredAnalyticsPermission,
              path: request.nextUrl.pathname,
              userRole: guard.userRole
            }
          );
          
          return NextResponse.json(
            { 
              success: false, 
              message: 'Analytics access denied',
              error: 'ANALYTICS_PERMISSION_DENIED',
              code: 'ANALYTICS_PERMISSION_DENIED',
              userRole: guard.userRole
            },
            { status: 403 }
          );
        }
      }
      
      // Check data scope for sensitive data
      if (options.sensitiveData && options.dataScope) {
        const userScope = await guard.getUserDataScope();
        if (userScope.level !== 'all' && userScope.level !== options.dataScope) {
          await guard.logAccess(
            'DATA_SCOPE_VIOLATION',
            'sensitive_data',
            undefined,
            { 
              userScope: userScope.level,
              requiredScope: options.dataScope,
              userRole: guard.userRole
            }
          );
          
          return NextResponse.json(
            { 
              success: false, 
              message: 'Data scope restriction',
              error: 'DATA_SCOPE_VIOLATION',
              code: 'DATA_SCOPE_VIOLATION',
              userRole: guard.userRole
            },
            { status: 403 }
          );
        }
      }
      
      // Custom check function
      if (options.customCheck) {
        const customResult = await options.customCheck(guard);
        if (!customResult) {
          return NextResponse.json(
            { 
              success: false, 
              message: 'Custom permission check failed',
              error: 'CUSTOM_PERMISSION_DENIED',
              userRole: guard.userRole
            },
            { status: 403 }
          );
        }
      }
      
      // Log successful access if requested
      if (options.logAccess) {
        await guard.logAccess(
          'ACCESS_GRANTED',
          options.module || 'api',
          undefined,
          { 
            path: request.nextUrl.pathname,
            method: request.method,
            permissions: options.requiredPermission,
            userRole: guard.userRole
          }
        );
      }
      
      // Add user info to headers for downstream use
      const requestHeaders = new Headers(request.headers);
      requestHeaders.set('x-permission-check', 'passed');
      requestHeaders.set('x-user-role', guard.userRole);
      requestHeaders.set('x-user-id', guard.UserId);
      requestHeaders.set('x-user-permissions', JSON.stringify(
        await guard.getEffectivePermissions()
      ));
      
      return NextResponse.next({
        request: {
          headers: requestHeaders,
        },
      });
      
    } catch (error: any) {
      console.error('Permission guard error:', error);
      
      // Handle specific errors
      if (error.message.includes('User authentication required')) {
        return NextResponse.json(
          { 
            success: false, 
            message: 'Authentication required',
            error: 'AUTHENTICATION_REQUIRED',
            code: 'AUTHENTICATION_REQUIRED'
          },
          { status: 401 }
        );
      }
      
      if (error.message.includes('User not found')) {
        return NextResponse.json(
          { 
            success: false, 
            message: 'User not found',
            error: 'USER_NOT_FOUND',
            code: 'USER_NOT_FOUND'
          },
          { status: 404 }
        );
      }
      
      if (error.message.includes('User account is inactive')) {
        return NextResponse.json(
          { 
            success: false, 
            message: 'User account is inactive',
            error: 'USER_INACTIVE',
            code: 'USER_INACTIVE'
          },
          { status: 403 }
        );
      }
      
      if (error.message.includes('Role configuration not found')) {
        return NextResponse.json(
          { 
            success: false, 
            message: 'Role configuration error',
            error: 'ROLE_CONFIG_ERROR',
            code: 'ROLE_CONFIG_ERROR'
          },
          { status: 500 }
        );
      }
      
      return NextResponse.json(
        { 
          success: false, 
          message: 'Permission check failed',
          error: 'PERMISSION_CHECK_ERROR',
          code: 'PERMISSION_CHECK_ERROR',
          details: process.env.NODE_ENV === 'development' ? error.message : undefined
        },
        { status: 500 }
      );
    }
  };
}


// Helper function for API routes
export function withPermission(
  handler: Function,
  options: PermissionGuardOptions = {}
) {
  return async function (request: NextRequest, ...args: any[]) {
    const permissionCheck = await requirePermission(options)(request);
    if (permissionCheck && permissionCheck.status !== 200) {
      return permissionCheck;
    }
    return handler(request, ...args);
  };
}

// Quick permission check for inline use
export async function quickPermissionCheck(
  request: NextRequest,
  permission: string
): Promise<boolean> {
  try {
    const guard = new PermissionGuard(request);
    await guard.initialize();
    return await guard.checkPermission(permission);
  } catch (error) {
    return false;
  }
}

// Get user info helper
export async function getUserInfoFromRequest(request: NextRequest) {
  try {
    const guard = new PermissionGuard(request);
    await guard.initialize();
    return await guard.getUserInfo();
  } catch (error) {
    return null;
  }
}