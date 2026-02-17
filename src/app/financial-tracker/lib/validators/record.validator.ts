import { z } from 'zod';
import { ICustomField } from '../../models/custom-field.model';

export class RecordValidator {
  /**
   * Build Zod schema from field definitions
   */
  static buildSchema(fields: ICustomField[]) {
    const schemaShape: Record<string, any> = {};

    fields.forEach(field => {
      if (!field.isEnabled) return;

      let fieldSchema: any;

      switch (field.type) {
        case 'text':
        case 'textarea':
          fieldSchema = z.string();
          if (field.required) fieldSchema = fieldSchema.min(1, 'Required');
          if (field.validation?.min) fieldSchema = fieldSchema.min(field.validation.min);
          if (field.validation?.max) fieldSchema = fieldSchema.max(field.validation.max);
          if (field.validation?.regex) {
            fieldSchema = fieldSchema.regex(new RegExp(field.validation.regex));
          }
          break;

        case 'number':
          fieldSchema = z.number();
          if (field.required) fieldSchema = fieldSchema.min(1, 'Required');
          if (field.validation?.min !== undefined) {
            fieldSchema = fieldSchema.min(field.validation.min);
          }
          if (field.validation?.max !== undefined) {
            fieldSchema = fieldSchema.max(field.validation.max);
          }
          break;

        case 'date':
          fieldSchema = z.date();
          if (field.required) fieldSchema = fieldSchema.min(new Date('1900-01-01'));
          break;

        case 'checkbox':
          fieldSchema = z.boolean();
          break;

        case 'select':
        case 'radio':
          fieldSchema = z.string();
          if (field.required) fieldSchema = fieldSchema.min(1, 'Required');
          if (field.options?.length) {
            fieldSchema = fieldSchema.refine(
              (val:any) => field.options?.includes(val),
              { message: 'Invalid option' }
            );
          }
          break;

        case 'file':
        case 'image':
          fieldSchema = z.any();
          if (field.required) {
            fieldSchema = fieldSchema.refine(
              (val:any) => val !== null && val !== undefined,
              { message: 'Required' }
            );
          }
          break;

        default:
          fieldSchema = z.any();
      }

      if (!field.required) {
        fieldSchema = fieldSchema.optional();
      }

      schemaShape[field.fieldKey] = fieldSchema;
    });

    return z.object(schemaShape);
  }

  /**
   * Validate record data
   */
  static validate(data: any, fields: ICustomField[]) {
    const schema = this.buildSchema(fields);
    return schema.safeParse(data);
  }

  /**
   * Sanitize data based on field types
   */
  static sanitize(data: any, fields: ICustomField[]) {
    const sanitized: any = {};

    fields.forEach(field => {
      const value = data[field.fieldKey];
      
      if (value === undefined || value === null) {
        if (field.defaultValue !== undefined) {
          sanitized[field.fieldKey] = field.defaultValue;
        }
        return;
      }

      switch (field.type) {
        case 'number':
          sanitized[field.fieldKey] = Number(value);
          break;
        case 'date':
          sanitized[field.fieldKey] = new Date(value);
          break;
        case 'checkbox':
          sanitized[field.fieldKey] = Boolean(value);
          break;
        default:
          sanitized[field.fieldKey] = value;
      }
    });

    return sanitized;
  }
}