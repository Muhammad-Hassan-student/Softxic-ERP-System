// app/financial-tracker/models/category.model.ts
import mongoose, { Schema, Document } from "mongoose";

export interface ICategory extends Document {
  module: "re" | "expense";
  entity: string; // ❌ No enum restriction - dynamic!
  name: string;
  description?: string;
  type: "income" | "expense" | "both";
  isActive: boolean;
  isSystem: boolean;
  color?: string;
  icon?: string;
  parentCategory?: mongoose.Types.ObjectId;
  createdBy: mongoose.Types.ObjectId;
  updatedBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;

  // Enterprise features
  metadata?: Map<string, any>; // For future extensions
  tags?: string[]; // For categorization
  priority?: number; // For sorting
}

const CategorySchema = new Schema<ICategory>(
  {
    module: {
      type: String,
      required: true,
      enum: ["re", "expense"],
      index: true,
    },
    entity: {
      type: String,
      required: true,
      index: true,
      // ❌ REMOVED: enum restriction - now dynamic!
    },
    name: { type: String, required: true },
    description: String,
    type: {
      type: String,
      required: true,
      enum: ["income", "expense", "both"],
      default: "both",
    },
    isActive: { type: Boolean, default: true },
    isSystem: { type: Boolean, default: false },
    color: { type: String, default: "#3B82F6" },
    icon: String,
    parentCategory: { type: Schema.Types.ObjectId, ref: "Category" },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    updatedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },

    // Enterprise features
    metadata: { type: Map, of: Schema.Types.Mixed },
    tags: [String],
    priority: { type: Number, default: 0 },
  },
  {
    timestamps: true,
  },
);

// Compound index for uniqueness
CategorySchema.index({ module: 1, entity: 1, name: 1 }, { unique: true });

// Full-text search index
CategorySchema.index({
  name: "text",
  description: "text",
  entity: "text",
});

export default mongoose.models.Category ||
  mongoose.model<ICategory>("Category", CategorySchema, "financial_categories");

// import mongoose, { Schema, Document } from 'mongoose';

// export interface ICategory extends Document {
//   module: 're' | 'expense';
//   entity: string; // 'dealer', 'fhh-client', 'cp-client', 'builder', 'project'
//   name: string;
//   description?: string;
//   type: 'income' | 'expense' | 'both';
//   isActive: boolean;
//   isSystem: boolean; // System categories cannot be deleted
//   color?: string; // For UI display
//   icon?: string;
//   parentCategory?: mongoose.Types.ObjectId; // For nested categories
//   createdBy: mongoose.Types.ObjectId;
//   updatedBy: mongoose.Types.ObjectId;
//   createdAt: Date;
//   updatedAt: Date;
// }

// const CategorySchema = new Schema<ICategory>({
//   module: {
//     type: String,
//     required: true,
//     enum: ['re', 'expense'],
//     index: true
//   },
//   entity: {
//     type: String,
//     required: true,
//     enum: ['dealer', 'fhh-client', 'cp-client', 'builder', 'project', 'all'],
//     index: true
//   },
//   name: { type: String, required: true },
//   description: String,
//   type: {
//     type: String,
//     required: true,
//     enum: ['income', 'expense', 'both'],
//     default: 'both'
//   },
//   isActive: { type: Boolean, default: true },
//   isSystem: { type: Boolean, default: false },
//   color: { type: String, default: '#3B82F6' },
//   icon: String,
//   parentCategory: { type: Schema.Types.ObjectId, ref: 'Category' },
//   createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
//   updatedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true }
// }, {
//   timestamps: true
// });

// // Unique constraint per module + entity + name
// CategorySchema.index({ module: 1, entity: 1, name: 1 }, { unique: true });

// export default mongoose.models.Category ||
//   mongoose.model<ICategory>('Category', CategorySchema, 'financial_categories');
