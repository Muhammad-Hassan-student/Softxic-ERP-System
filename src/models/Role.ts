import mongoose, { Schema, Document, HydratedDocument } from "mongoose";

export interface IPermission {
  module: string;
  view: boolean;
  create: boolean;
  edit: boolean;
  delete: boolean;
  export?: boolean;
  approve?: boolean;
}

export interface IRole extends Document {
  name: string;
  description?: string;
  permissions: IPermission[];
  isDefault: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// All available modules in the ERP
const ERP_MODULES = [
  "dashboard",
  "employee_management",
  "payments",
  "payroll",
  "reports",
  "attendance",
  "leaves",
  "tax",
  "inventory",
  "vendors",
  "invoices",
  "complaints",
  "credit_debit",
  "role_management",
  "user_management",
  "settings",
] as const;
type RoleName =
  | "admin"
  | "hr"
  | "employee"
  | "accounts"
  | "support"
  | "marketing";

const PermissionSchema: Schema = new Schema({
  module: {
    type: String,
    required: true,
    enum: ERP_MODULES,
  },
  view: {
    type: Boolean,
    default: false,
    required: true,
  },
  create: {
    type: Boolean,
    default: false,
    required: true,
  },
  edit: {
    type: Boolean,
    default: false,
    required: true,
  },
  delete: {
    type: Boolean,
    default: false,
    required: true,
  },
  export: {
    type: Boolean,
    default: false,
  },
  approve: {
    type: Boolean,
    default: false,
  },
});

const RoleSchema: Schema = new Schema(
  {
    name: {
      type: String,
      required: [true, "Role name is required"],
      unique: true,
      trim: true,
      enum: ["admin", "hr", "employee", "accounts", "support", "marketing"],
    },
    description: {
      type: String,
      trim: true,
    },
    permissions: [PermissionSchema],
    isDefault: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  },
);

RoleSchema.pre("save", async function (this: mongoose.HydratedDocument<IRole>) {
  if (this.isNew && this.permissions.length === 0) {
    const defaultPermissions: Record<
      "admin" | "hr" | "employee" | "accounts" | "support" | "marketing",
      IPermission[]
    > = {
      admin: ERP_MODULES.map((module) => ({
        module,
        view: true,
        create: true,
        edit: true,
        delete: true,
        export: true,
        approve: true,
      })),

      hr: [
        {
          module: "dashboard",
          view: true,
          create: false,
          edit: false,
          delete: false,
          export: true,
        },
        {
          module: "employee_management",
          view: true,
          create: true,
          edit: true,
          delete: false,
          export: true,
        },
        {
          module: "payments",
          view: true,
          create: true,
          edit: true,
          delete: false,
          export: true,
        },
        {
          module: "payroll",
          view: true,
          create: true,
          edit: true,
          delete: false,
          export: true,
        },
        {
          module: "reports",
          view: true,
          create: false,
          edit: false,
          delete: false,
          export: true,
        },
        {
          module: "attendance",
          view: true,
          create: true,
          edit: true,
          delete: false,
        },
        {
          module: "leaves",
          view: true,
          create: true,
          edit: true,
          delete: false,
          approve: true,
        },
        {
          module: "tax",
          view: true,
          create: false,
          edit: false,
          delete: false,
        },
        {
          module: "settings",
          view: false,
          create: false,
          edit: false,
          delete: false,
        },
      ],

      employee: [
        {
          module: "dashboard",
          view: true,
          create: false,
          edit: false,
          delete: false,
        },
        {
          module: "attendance",
          view: true,
          create: true,
          edit: false,
          delete: false,
        },
        {
          module: "leaves",
          view: true,
          create: true,
          edit: false,
          delete: false,
        },
      ],

      accounts: [
        {
          module: "dashboard",
          view: true,
          create: false,
          edit: false,
          delete: false,
          export: true,
        },
        {
          module: "payments",
          view: true,
          create: true,
          edit: true,
          delete: false,
          export: true,
        },
        {
          module: "payroll",
          view: true,
          create: true,
          edit: true,
          delete: false,
          export: true,
        },
        {
          module: "reports",
          view: true,
          create: false,
          edit: false,
          delete: false,
          export: true,
        },
        {
          module: "tax",
          view: true,
          create: true,
          edit: true,
          delete: false,
          export: true,
        },
        {
          module: "invoices",
          view: true,
          create: true,
          edit: true,
          delete: false,
          export: true,
        },
      ],

      support: [
        {
          module: "dashboard",
          view: true,
          create: false,
          edit: false,
          delete: false,
        },
        {
          module: "complaints",
          view: true,
          create: true,
          edit: true,
          delete: false,
        },
      ],

      marketing: [
        {
          module: "dashboard",
          view: true,
          create: false,
          edit: false,
          delete: false,
          export: true,
        },
        {
          module: "reports",
          view: true,
          create: false,
          edit: false,
          delete: false,
          export: true,
        },
      ],
    };

    if (this.name && this.name in defaultPermissions) {
      this.permissions =
        defaultPermissions[this.name as keyof typeof defaultPermissions];
    }
  }
});

export default mongoose.models.Role ||
  mongoose.model<IRole>("Role", RoleSchema);
