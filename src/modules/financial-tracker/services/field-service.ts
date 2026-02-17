import { Types } from 'mongoose';
import CustomFieldModel, { ICustomField } from '../models/custom-field.model';
import EntityModel from '../models/entity-model'; // Fixed import path
import ActivityService from './activity-service'; // Fixed import

class FieldService {
  /**
   * Create custom field
   */
  static async createField(
    data: Partial<ICustomField>,
    userId: string | Types.ObjectId
  ): Promise<ICustomField> {
    // Verify entity exists
    const entity = await EntityModel.findById(data.entityId);
    if (!entity) {
      throw new Error('Entity not found');
    }

    // Check if field key already exists
    const existing = await CustomFieldModel.findOne({
      entityId: data.entityId,
      fieldKey: data.fieldKey
    });

    if (existing) {
      throw new Error('Field with this key already exists');
    }

    const field = new CustomFieldModel({
      ...data,
      createdBy: userId
    });

    await field.save();

    // Log activity - Fixed to include both oldValue and newValue
    await ActivityService.log({
      userId,
      module: data.module! as 're' | 'expense', // Type assertion
      entity: entity.entityKey,
      action: 'CREATE',
      changes: [{ 
        field: 'field', 
        oldValue: null,
        newValue: data.fieldKey 
      }]
    });

    return field;
  }

  /**
   * Get fields for entity
   */
  static async getFields(
    module: 're' | 'expense', // Fixed type
    entityId: string | Types.ObjectId,
    includeDisabled: boolean = false
  ) {
    const query: any = { module, entityId };
    if (!includeDisabled) {
      query.isEnabled = true;
    }

    return CustomFieldModel.find(query)
      .sort({ order: 1, createdAt: 1 })
      .lean();
  }

  /**
   * Update field
   */
  static async updateField(
    fieldId: string | Types.ObjectId,
    data: Partial<ICustomField>,
    userId: string | Types.ObjectId
  ) {
    const field = await CustomFieldModel.findById(fieldId);
    if (!field) {
      throw new Error('Field not found');
    }

    // System fields have restricted updates
    if (field.isSystem) {
      const allowedUpdates = ['label', 'visible', 'order', 'required'];
      Object.keys(data).forEach(key => {
        if (!allowedUpdates.includes(key)) {
          delete (data as any)[key];
        }
      });
    }

    const oldData = { ...field.toObject() };
    Object.assign(field, data);
    await field.save();

    // Log changes
    const changes = Object.keys(data).map(key => ({
      field: key,
      oldValue: (oldData as any)[key],
      newValue: (data as any)[key]
    }));

    if (changes.length > 0) {
      const entity = await EntityModel.findById(field.entityId);
      await ActivityService.log({
        userId,
        module: field.module as 're' | 'expense', // Type assertion
        entity: entity?.entityKey || 'unknown',
        recordId: field._id,
        action: 'UPDATE',
        changes
      });
    }

    return field;
  }

  /**
   * Toggle field enabled/disabled
   */
  static async toggleField(
    fieldId: string | Types.ObjectId,
    userId: string | Types.ObjectId
  ) {
    const field = await CustomFieldModel.findById(fieldId);
    if (!field) {
      throw new Error('Field not found');
    }

    // System fields cannot be disabled
    if (field.isSystem) {
      throw new Error('System fields cannot be disabled');
    }

    field.isEnabled = !field.isEnabled;
    await field.save();

    const entity = await EntityModel.findById(field.entityId);
    await ActivityService.log({
      userId,
      module: field.module as 're' | 'expense', // Type assertion
      entity: entity?.entityKey || 'unknown',
      recordId: field._id,
      action: 'UPDATE',
      changes: [{
        field: 'isEnabled',
        oldValue: !field.isEnabled,
        newValue: field.isEnabled
      }]
    });

    return field;
  }

  /**
   * Reorder fields
   */
  static async reorderFields(
    entityId: string | Types.ObjectId,
    fieldOrders: Array<{ fieldId: string; order: number }>,
    userId: string | Types.ObjectId
  ) {
    const updates = fieldOrders.map(({ fieldId, order }) =>
      CustomFieldModel.findByIdAndUpdate(
        fieldId,
        { order, updatedBy: userId },
        { new: true }
      )
    );

    const updatedFields = await Promise.all(updates);
    
    const entity = await EntityModel.findById(entityId);
    await ActivityService.log({
      userId,
      module: (entity?.module as 're' | 'expense') || 're',
      entity: entity?.entityKey || 'unknown',
      action: 'UPDATE',
      changes: [{ 
        field: 'fields_reordered', 
        oldValue: null,
        newValue: fieldOrders 
      }]
    });

    return updatedFields;
  }

  /**
   * Validate field data against field definition
   */
  static validateFieldValue(field: ICustomField, value: any): { valid: boolean; error?: string } {
    if (field.required && (value === undefined || value === null || value === '')) {
      return { valid: false, error: `${field.label} is required` };
    }

    if (!field.required && (value === undefined || value === null || value === '')) {
      return { valid: true };
    }

    switch (field.type) {
      case 'number':
        if (isNaN(Number(value))) {
          return { valid: false, error: `${field.label} must be a number` };
        }
        const num = Number(value);
        if (field.validation?.min !== undefined && num < field.validation.min) {
          return { valid: false, error: `${field.label} must be at least ${field.validation.min}` };
        }
        if (field.validation?.max !== undefined && num > field.validation.max) {
          return { valid: false, error: `${field.label} must be at most ${field.validation.max}` };
        }
        break;

      case 'date':
        if (isNaN(Date.parse(value))) {
          return { valid: false, error: `${field.label} must be a valid date` };
        }
        break;

      case 'select':
      case 'radio':
        if (value && field.options && !field.options.includes(value)) {
          return { valid: false, error: `${field.label} must be one of: ${field.options.join(', ')}` };
        }
        break;

      case 'text':
        if (field.validation?.regex) {
          const regex = new RegExp(field.validation.regex);
          if (!regex.test(value)) {
            return { valid: false, error: `${field.label} has invalid format` };
          }
        }
        if (field.validation?.min && value.length < field.validation.min) {
          return { valid: false, error: `${field.label} must be at least ${field.validation.min} characters` };
        }
        if (field.validation?.max && value.length > field.validation.max) {
          return { valid: false, error: `${field.label} must be at most ${field.validation.max} characters` };
        }
        break;
    }

    return { valid: true };
  }
}

export default FieldService;