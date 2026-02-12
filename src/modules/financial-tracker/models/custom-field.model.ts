import mongoose, { Schema, Document } from 'mongoose';

export interface ICustomField extends Document {
  module: string;
  entityId: mongoose.Types.ObjectId;
  fieldKey: string;           // Unique within entity
  label: string;
  type: 'text' | 'number' | 'date' | 'select' | 'textarea' | 
        'file' | 'image' | 'checkbox' | 'radio';
  isSystem: boolean;          // Protected - cannot disable/delete
  isEnabled: boolean;         // Soft delete via disabled
  required: boolean;
  readOnly: boolean;
  visible: boolean;
  order: number;
  defaultValue?: any;
  options?: string[];         // For select/radio
  validation?: {
    min?: number;
    max?: number;
    regex?: string;
    allowedFileTypes?: string[];
    maxFileSize?: number;
  };
  createdBy: mongoose.Types.ObjectId;
}

const CustomFieldSchema = new Schema<ICustomField>({
  module: { type: String, required: true, enum: ['re', 'expense'] },
  entityId: { type: Schema.Types.ObjectId, ref: 'Entity', required: true },
  fieldKey: { type: String, required: true },
  label: { type: String, required: true },
  type: { 
    type: String, 
    required: true,
    enum: ['text', 'number', 'date', 'select', 'textarea', 'file', 'image', 'checkbox', 'radio']
  },
  isSystem: { type: Boolean, default: false },
  isEnabled: { type: Boolean, default: true },
  required: { type: Boolean, default: false },
  readOnly: { type: Boolean, default: false },
  visible: { type: Boolean, default: true },
  order: { type: Number, default: 0 },
  defaultValue: Schema.Types.Mixed,
  options: [String],
  validation: {
    min: Number,
    max: Number,
    regex: String,
    allowedFileTypes: [String],
    maxFileSize: Number
  },
  createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true }
}, {
  timestamps: true
});

// Unique fieldKey per entity
CustomFieldSchema.index({ entityId: 1, fieldKey: 1 }, { unique: true });
CustomFieldSchema.index({ entityId: 1, order: 1 });

export default mongoose.models.CustomField || 
  mongoose.model<ICustomField>('CustomField', CustomFieldSchema, 'financial_custom_fields');