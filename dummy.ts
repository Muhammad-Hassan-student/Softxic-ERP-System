

// // lib/middleware/permission-guard.ts
// import { NextRequest, NextResponse } from 'next/server';
// import { verifyToken } from '@/lib/auth/jwt';
// import { connectDB } from '@/lib/db/mongodb';
// import User from '@/lib/db/schemas/user';
// import Role from '@/lib/db/schemas/role';

// export interface PermissionGuardOptions {
//   requiredPermission?: string;
//   requiredAnalyticsPermission?: string;
//   requireAll?: boolean;
//   dataScope?: 'self' | 'department' | 'all';
//   sensitiveData?: boolean;
// }

// export class PermissionGuard {
//   private request: NextRequest;
//   private userId: string;
//   private userRole: string;

//   constructor(request: NextRequest) {
//     this.request = request;
    
//     // Extract user info from headers
//     const userId = request.headers.get('x-user-id');
//     const userRole = request.headers.get('x-user-role');
    
//     if (!userId || !userRole) {
//       throw new Error('User authentication required');
//     }
    
//     this.userId = userId;
//     this.userRole = userRole;
//   }

//   async checkPermission(requiredPermission: string): Promise<boolean> {
//     await connectDB();
    
//     // Admin has all permissions
//     if (this.userRole === 'admin') {
//       return true;
//     }

//     // Get user with role and permissions
//     const user = await User.findById(this.userId)
//       .select('role directPermissions dataScopes')
//       .lean();

//     if (!user) return false;

//     // Check direct permissions first (overrides)
//     if (user.directPermissions?.includes(requiredPermission)) {
//       return true;
//     }

//     // Check role permissions
//     const role = await Role.findOne({ name: user.role, isActive: true })
//       .select('permissionCodes analyticsPermissions dataAccessLevel')
//       .lean();

//     if (!role) return false;

//     // Check if permission exists in role
//     const hasPermission = role.permissionCodes.includes(requiredPermission) ||
//                          role.analyticsPermissions.includes(requiredPermission);

//     return hasPermission;
//   }

//   async checkAnalyticsPermission(requiredPermission: string): Promise<boolean> {
//     // Analytics permissions require specific check
//     if (requiredPermission.startsWith('analytics.')) {
//       return this.checkPermission(requiredPermission);
//     }
//     return false;
//   }

//   async filterData<T extends Record<string, any>>(
//     data: T,
//     permissionRules: Record<string, string[]> // field -> required permissions
//   ): Promise<T> {
//     const filteredData = { ...data };
    
//     for (const [field, requiredPermissions] of Object.entries(permissionRules)) {
//       if (field in filteredData) {
//         let hasAccess = false;
        
//         for (const permission of requiredPermissions) {
//           if (await this.checkPermission(permission)) {
//             hasAccess = true;
//             break;
//           }
//         }
        
//         if (!hasAccess) {
//           delete filteredData[field];
//         }
//       }
//     }
    
//     return filteredData;
//   }

//   async getUserDataScope(): Promise<{
//     level: 'self' | 'department' | 'all';
//     department?: string;
//     accessibleDepartments?: string[];
//   }> {
//     await connectDB();
    
//     if (this.userRole === 'admin') {
//       return { level: 'all' };
//     }

//     const user = await User.findById(this.userId)
//       .select('dataScopes department')
//       .lean();

//     if (!user) {
//       return { level: 'self' };
//     }

//     const role = await Role.findOne({ name: this.userRole })
//       .select('dataAccessLevel')
//       .lean();

//     const dataAccessLevel = role?.dataAccessLevel || 'self';

//     return {
//       level: dataAccessLevel,
//       department: user.department,
//       accessibleDepartments: user.dataScopes?.accessibleDepartments,
//     };
//   }

//   async buildQueryFilter(): Promise<Record<string, any>> {
//     const dataScope = await this.getUserDataScope();
    
//     switch (dataScope.level) {
//       case 'all':
//         return {};
//       case 'department':
//         if (dataScope.department) {
//           return { department: dataScope.department };
//         }
//         return {};
//       case 'self':
//         return { _id: this.userId };
//       default:
//         return { _id: this.userId };
//     }
//   }
// }

// // Middleware wrapper
// export function requirePermission(options: PermissionGuardOptions) {
//   return async function (request: NextRequest): Promise<NextResponse | null> {
//     try {
//       const guard = new PermissionGuard(request);
      
//       // Check CRUD permission
//       if (options.requiredPermission) {
//         const hasPermission = await guard.checkPermission(options.requiredPermission);
//         if (!hasPermission) {
//           return NextResponse.json(
//             { 
//               success: false, 
//               message: 'Insufficient permissions',
//               error: 'PERMISSION_DENIED'
//             },
//             { status: 403 }
//           );
//         }
//       }
      
//       // Check analytics permission
//       if (options.requiredAnalyticsPermission) {
//         const hasAnalyticsPermission = await guard.checkAnalyticsPermission(
//           options.requiredAnalyticsPermission
//         );
//         if (!hasAnalyticsPermission) {
//           return NextResponse.json(
//             { 
//               success: false, 
//               message: 'Analytics access denied',
//               error: 'ANALYTICS_PERMISSION_DENIED'
//             },
//             { status: 403 }
//           );
//         }
//       }
      
//       // Check data scope for sensitive data
//       if (options.sensitiveData && options.dataScope) {
//         const userScope = await guard.getUserDataScope();
//         if (userScope.level !== 'all' && userScope.level !== options.dataScope) {
//           return NextResponse.json(
//             { 
//               success: false, 
//               message: 'Data scope restriction',
//               error: 'DATA_SCOPE_VIOLATION'
//             },
//             { status: 403 }
//           );
//         }
//       }
      
//       return null; // Permission granted
//     } catch (error) {
//       console.error('Permission guard error:', error);
//       return NextResponse.json(
//         { 
//           success: false, 
//           message: 'Permission check failed',
//           error: 'PERMISSION_CHECK_ERROR'
//         },
//         { status: 500 }
//       );
//     }
//   };
// }