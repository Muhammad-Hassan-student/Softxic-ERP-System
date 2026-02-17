import { Types } from 'mongoose';
import EntityModel, { IEntity } from '../models/entity-model'; // Fixed import path
import CustomFieldModel from '../models/custom-field.model';
import ActivityService from './activity-service'; // Fixed import

class EntityService {
  /**
   * Create a new entity
   */
  static async createEntity(
    data: Partial<IEntity>,
    userId: string | Types.ObjectId
  ): Promise<IEntity> {
    // Check if entity already exists
    const existing = await EntityModel.findOne({
      module: data.module,
      entityKey: data.entityKey,
      branchId: data.branchId
    });

    if (existing) {
      throw new Error('Entity already exists');
    }

    const entity = new EntityModel({
      ...data,
      createdBy: userId,
      updatedBy: userId
    });

    await entity.save();

    // Log activity - Fixed to include both oldValue and newValue
    await ActivityService.log({
      userId,
      module: data.module! as 're' | 'expense', // Type assertion
      entity: data.entityKey!,
      action: 'CREATE',
      changes: [{ 
        field: 'entity', 
        oldValue: null,
        newValue: data.entityKey 
      }]
    });

    return entity;
  }

  /**
   * Get all entities for a module
   */
  static async getEntities(module: 're' | 'expense', branchId?: string) { // Fixed type
    const query: any = { module };
    if (branchId) query.branchId = branchId;

    return EntityModel.find(query)
      .populate('createdBy', 'fullName')
      .populate('updatedBy', 'fullName')
      .sort({ createdAt: -1 });
  }

  /**
   * Get entity by ID
   */
  static async getEntityById(id: string | Types.ObjectId) {
    return EntityModel.findById(id)
      .populate('createdBy', 'fullName')
      .populate('updatedBy', 'fullName');
  }

  /**
   * Update entity
   */
  static async updateEntity(
    id: string | Types.ObjectId,
    data: Partial<IEntity>,
    userId: string | Types.ObjectId
  ) {
    const entity = await EntityModel.findById(id);
    if (!entity) {
      throw new Error('Entity not found');
    }

    const oldData = { ...entity.toObject() };
    const allowedUpdates = ['name', 'description', 'isEnabled', 'enableApproval'];
    
    allowedUpdates.forEach(field => {
      if (data[field as keyof IEntity] !== undefined) {
        (entity as any)[field] = data[field as keyof IEntity];
      }
    });

    entity.updatedBy = userId as any;
    await entity.save();

    // Log changes
    const changes = allowedUpdates
      .filter(field => (data as any)[field] !== undefined && 
                      (oldData as any)[field] !== (data as any)[field])
      .map(field => ({
        field,
        oldValue: (oldData as any)[field],
        newValue: (data as any)[field]
      }));

    if (changes.length > 0) {
      await ActivityService.log({
        userId,
        module: entity.module as 're' | 'expense', // Type assertion
        entity: entity.entityKey,
        recordId: entity._id,
        action: 'UPDATE',
        changes
      });
    }

    return entity;
  }

  /**
   * Delete entity (soft delete by disabling)
   */
  static async deleteEntity(
    id: string | Types.ObjectId,
    userId: string | Types.ObjectId
  ) {
    const entity = await EntityModel.findById(id);
    if (!entity) {
      throw new Error('Entity not found');
    }

    // Check if entity has records
    const RecordModel = (await import('../models/record.model')).default;
    const hasRecords = await RecordModel.exists({
      module: entity.module,
      entity: entity.entityKey
    });

    if (hasRecords) {
      // Soft delete - just disable
      entity.isEnabled = false;
      entity.updatedBy = userId as any;
      await entity.save();
    } else {
      // Hard delete if no records
      await entity.deleteOne();
    }

    // Log activity - Fixed to include both oldValue and newValue
    await ActivityService.log({
      userId,
      module: entity.module as 're' | 'expense', // Type assertion
      entity: entity.entityKey,
      action: 'DELETE',
      changes: [{ 
        field: 'entity', 
        oldValue: entity.entityKey,
        newValue: null 
      }]
    });

    return { success: true, softDeleted: !!hasRecords };
  }
}

export default EntityService;