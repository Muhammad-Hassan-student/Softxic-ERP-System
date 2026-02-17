import mongoose, { Schema, Document } from 'mongoose';

// ==================== TYPE DEFINITIONS ====================

export interface IColumnPermission {
  view: boolean;
  edit: boolean;
}

export interface IEntityPermission {
  access: boolean;
  create: boolean;
  edit: boolean;
  delete: boolean;
  scope: 'own' | 'all' | 'department';
  columns?: Map<string, IColumnPermission>;
}

export interface IModulePermission {
  [entity: string]: IEntityPermission;
}

export interface IRole extends Document {
  name: string;
  description: string;
  isSystem: boolean; // System roles cannot be deleted
  permissions: {
    re: IModulePermission;
    expense: IModulePermission;
  };
  createdBy: mongoose.Types.ObjectId;
  updatedBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

// ==================== SCHEMA DEFINITIONS ====================

const ColumnPermissionSchema = new Schema<IColumnPermission>({
  view: { type: Boolean, default: true },
  edit: { type: Boolean, default: false }
}, { _id: false });

const EntityPermissionSchema = new Schema<IEntityPermission>({
  access: { type: Boolean, default: false },
  create: { type: Boolean, default: false },
  edit: { type: Boolean, default: false },
  delete: { type: Boolean, default: false },
  scope: { 
    type: String, 
    enum: ['own', 'all', 'department'],
    default: 'own'
  },
  columns: { type: Map, of: ColumnPermissionSchema, default: {} }
}, { _id: false });

const RoleSchema = new Schema<IRole>({
  name: { 
    type: String, 
    required: true, 
    unique: true,
    trim: true 
  },
  description: { 
    type: String, 
    trim: true 
  },
  isSystem: { 
    type: Boolean, 
    default: false 
  },
  permissions: {
    re: { 
      type: Map, 
      of: EntityPermissionSchema, 
      default: {} 
    },
    expense: { 
      type: Map, 
      of: EntityPermissionSchema, 
      default: {} 
    }
  },
  createdBy: { 
    type: Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  updatedBy: { 
    type: Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  }
}, {
  timestamps: true
});

// ==================== INDEXES ====================

// Index for faster queries
RoleSchema.index({ name: 1 });
RoleSchema.index({ isSystem: 1 });
RoleSchema.index({ createdAt: -1 });

// ==================== METHODS ====================

// Check if role has permission for a specific module/entity
RoleSchema.methods.hasPermission = function(
  module: 're' | 'expense',
  entity: string,
  action: 'access' | 'create' | 'edit' | 'delete'
): boolean {
  const modulePerms = this.permissions[module];
  const entityPerm = modulePerms?.[entity];
  
  if (!entityPerm || !entityPerm.access) return false;
  
  switch (action) {
    case 'access':
      return true;
    case 'create':
      return entityPerm.create || false;
    case 'edit':
      return entityPerm.edit || false;
    case 'delete':
      return entityPerm.delete || false;
    default:
      return false;
  }
};

// Get column permissions for a specific entity
RoleSchema.methods.getColumnPermissions = function(
  module: 're' | 'expense',
  entity: string
): Map<string, IColumnPermission> {
  const modulePerms = this.permissions[module];
  const entityPerm = modulePerms?.[entity];
  
  return entityPerm?.columns || new Map();
};

// Check if can view specific column
RoleSchema.methods.canViewColumn = function(
  module: 're' | 'expense',
  entity: string,
  column: string
): boolean {
  const columns = this.getColumnPermissions(module, entity);
  const columnPerm = columns.get(column);
  
  return columnPerm ? columnPerm.view : true; // Default to true
};

// Check if can edit specific column
RoleSchema.methods.canEditColumn = function(
  module: 're' | 'expense',
  entity: string,
  column: string
): boolean {
  const columns = this.getColumnPermissions(module, entity);
  const columnPerm = columns.get(column);
  
  return columnPerm ? columnPerm.edit : false; // Default to false
};

// ==================== STATICS ====================

// Find default roles
RoleSchema.statics.findDefaultRoles = function() {
  return this.find({ isSystem: true }).sort({ name: 1 });
};

// Find by name (case insensitive)
RoleSchema.statics.findByName = function(name: string) {
  return this.findOne({ name: new RegExp(`^${name}$`, 'i') });
};

// ==================== EXPORT ====================

// Check if model exists to prevent overwrite error
export default mongoose.models.Role || 
  mongoose.model<IRole>('Role', RoleSchema, 'financial_roles');