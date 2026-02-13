import User from "@/models/User";
import RedisCache from "../lib/cache/redis";
import { Types } from "mongoose";
import { string } from "zod";

export interface PermissionScope {
    access: boolean;
    create: boolean;
    edit: boolean;
    delete: boolean;
    scope: 'own'| 'all';
    columns?: Record<string, { view: boolean, edit: boolean }>;
}

export interface UserPermissions {
    [module: string]: {
        [entity: string]: PermissionScope;
    };
}

class PermissionService {
    /** 
     * Get user permission from Redis cache or database
    */
   static async getUserPermissions(userId: string | Types.ObjectId): Promise<UserPermissions> {
    const userIdStr = userId.toString();

    // Try cache first 
    const cached = await RedisCache.get<UserPermissions>(
        RedisCache.permissionsKey(userIdStr)
    );

    if (cached) {
        return cached;
    }

    // Get user from DB (ERP core model - reused)
    const user = await User.findById(userId).lean();
    if (!user) {
        throw new Error('User not found')
    }

    // Admin has full access 
    if (user.role === 'admin') {
        const adminPermissions = this.getAdminPermissions();
        await RedisCache.set(RedisCache.permissionsKey(userIdStr), adminPermissions, 3600);
        return adminPermissions;
    }

    // Get permissons from user metadata or custom permissions collection
    // This is where you'd  fetch entity-specific permissions
    const permissions = user.permissions || await this.fetchPermissionsFromDB(userIdStr);
    
    // Cache for 1 hour
    await RedisCache.set(RedisCache.permissionsKey(userIdStr), permissions, 3600);

    return permissions;
   }

   /**
    * Check if user has access to module/entity
    * @returns  permission in (boolean)
    */
   static async hasAccess(
    userId: string | Types.ObjectId,
    module: string,
    entity: string
   ): Promise<boolean> {
    const permissions = await this.getUserPermissions(userId);
    return permissions[module]?.[entity]?.access || false;
   }

   /**
    * Check if user can create records 
    * @returns user can create records or not in boolean return 
    */
   static async canCreate(
    userId: string | Types.ObjectId,
    module: string,
    entity: string
   ): Promise<boolean> {
    const permissions = await this.getUserPermissions(userId);
    return permissions[module]?.[entity]?.create || false 
   }

   /**
    * Check if user can edit a specific record
    * @returns user have permission to update records return boolean
    */
   static async canEdit(
    userId: string | Types.ObjectId,
    module: string,
    entity: string,
    recordCreatedBy: string | Types.ObjectId
   ): Promise<boolean> {
    const permissions = await this.getUserPermissions(userId);
    const entityPerms = permissions[module]?.[entity];

    if (!entityPerms?.edit) return false;

    // Check scope 
    if (entityPerms.scope === 'own') {
        return recordCreatedBy.toString() === userId.toString();
    }

    return true;

   }

   /**
    * Check if user can delete a specific record
    * @returns boolean to user has permission to delete specific record (boolean)
    */
   static async canDelete(
    userId: string | Types.ObjectId,
    module: string,
    entity: string,
    recordCreatedBy: string | Types.ObjectId
   ): Promise<boolean> {
    const permissons = await this.getUserPermissions(userId);
    const entityPerms = permissons[module]?.[entity];

    if (!entityPerms?.delete) return false;

    if (entityPerms.scope === 'own') {
        return recordCreatedBy.toString() === userId.toString();
    }

    return true;
   }

   /**
    * Get column permissions for user
    * @returns Get specific columns which user has permissions (Record<string, {view: boolean, edit: booleam })
    */
    static async getColumnPermissions(
        userId: string | Types.ObjectId,
        module: string,
        entity: string
    ): Promise<Record<string, { view: boolean, edit: boolean }>> {
        const permissios = await this.getUserPermissions(userId);
        return permissios[module]?.[entity]?.columns || {}
    }

    /**
     * Check if user can view specific column
     * @returns User has permission to view specifc column
     */
    static async canViewColumn(
        userId: string | Types.ObjectId,
        module: string,
        entity: string,
        column: string
    ): Promise<boolean> {
        const columns = await this.getColumnPermissions(userId, module, entity);
        return columns[column]?.view ?? true; // Default to true if not specified
    }

    /**
     * Check if user can edit specific column
     * @returns User has permission to edit column (boolean)
     */
    static async canEditColumn(
        userId: string | Types.ObjectId,
        module: string,
        entity: string,
        column: string
    ): Promise<boolean> {
        const columns = await this.getColumnPermissions(userId, module, entity);
        return columns[column]?.edit ?? false
    }

    /**
     * Clear permissions cache for user
     */
    static async clearCache(userId: string | Types.ObjectId): Promise<void> {
        await RedisCache.del(RedisCache.permissionsKey(userId.toString()));
    }

   private static getAdminPermissions(): UserPermissions {
    return {
        re: {
            dealer: {
                access: true,
                create: true,
                edit: true,
                delete: true,
                scope: 'all'
            },
            'fhh-client': {
                access: true,
                create: true,
                edit: true,
                delete: true,
                scope: 'all'
            },
            'cp-client': {
                access: true,
                create: true,
                edit: true,
                delete: true,
                scope: 'all'
            }
        },
        expense: {
            dealer: {
                access: true,
                create: true,
                edit: true,
                delete: true,
                scope: 'all'
            },
            'fhh-client': {
                access: true,
                create: true,
                edit: true,
                delete: true,
                scope: 'all'
            },
            'cp-client': {
                access: true,
                create: true,
                edit: true,
                delete: true,
                scope: 'all'
            }
        }
    }
   }

   private static async fetchPermissionsFromDB(userId: string): Promise<UserPermissions> {
    // Implement fetching from your permissions collection 
    // This is where you'd store granular permissions per user/role
    return {
        re: {
            dealer: {
                access: true,
                create: true,
                edit: true,
                delete: true,
                scope: 'own',
                columns: {
                    amount: { view: true, edit: true },
                    commision: { view: true, edit: false }
                }
            }
        },
        expense: {}
    }
   }

}

export default PermissionService;

