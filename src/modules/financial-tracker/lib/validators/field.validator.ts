import { z } from 'zod';

export const FieldTypeSchema = z.enum([
  'text', 'number', 'date', 'select', 'textarea', 
  'file', 'image', 'checkbox', 'radio'
]);

export const FieldSchema = z.object({
  module: z.enum(['re', 'expense']),
  entityId: z.string(),
  fieldKey: z.string().min(1).max(50).regex(/^[a-z0-9-]+$/),
  label: z.string().min(1).max(100),
  type: FieldTypeSchema,
  isSystem: z.boolean().default(false),
  isEnabled: z.boolean().default(true),
  required: z.boolean().default(false),
  readOnly: z.boolean().default(false),
  visible: z.boolean().default(true),
  order: z.number().int().min(0).default(0),
  defaultValue: z.any().optional(),
  options: z.array(z.string()).optional(),
  validation: z.object({
    min: z.number().optional(),
    max: z.number().optional(),
    regex: z.string().optional(),
    allowedFileTypes: z.array(z.string()).optional(),
    maxFileSize: z.number().optional()
  }).optional()
});

export class FieldValidator {
  static validate(data: any) {
    return FieldSchema.safeParse(data);
  }

  static validateFieldKey(key: string): boolean {
    return /^[a-z0-9-]+$/.test(key);
  }

  static validateOptions(type: string, options?: string[]): boolean {
    if (type === 'select' || type === 'radio') {
      return !!options && options.length > 0;
    }
    return true;
  }

  static validateFileType(type: string, fileTypes?: string[]): boolean {
    if (type === 'file' || type === 'image') {
      return !!fileTypes && fileTypes.length > 0;
    }
    return true;
  }
}