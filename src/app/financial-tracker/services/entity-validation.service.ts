// app/financial-tracker/services/entity-validation.service.ts
import { connectDB } from "@/lib/db/mongodb";
import EntityModel from "@/app/financial-tracker/models/entity-model";

export class EntityValidationService {
  /**
   * Validate if entity exists for a module
   */
  static async validateEntity(
    module: string,
    entityKey: string,
  ): Promise<boolean> {
    try {
      await connectDB();

      const exists = await EntityModel.exists({
        module,
        entityKey: entityKey.toLowerCase(),
        isEnabled: true,
      });

      return !!exists;
    } catch (error) {
      console.error("Entity validation error:", error);
      return false;
    }
  }

  /**
   * Get all valid entities for a module
   */
  static async getValidEntities(module?: string): Promise<string[]> {
    try {
      await connectDB();

      const query: any = { isEnabled: true };
      if (module) query.module = module;

      const entities = await EntityModel.find(query).select("entityKey").lean();
      return entities.map((e) => e.entityKey);
    } catch (error) {
      console.error("Error fetching valid entities:", error);
      return [];
    }
  }

  /**
   * Get entity details with caching
   */
  private static cache = new Map<string, { data: any; timestamp: number }>();
  private static CACHE_TTL = 5 * 60 * 1000; // 5 minutes

  static async getEntityDetails(entityKey: string, module: string) {
    const cacheKey = `${module}:${entityKey}`;
    const cached = this.cache.get(cacheKey);

    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
      return cached.data;
    }

    await connectDB();

    const entity = await EntityModel.findOne({
      module,
      entityKey: entityKey.toLowerCase(),
    }).lean();

    if (entity) {
      this.cache.set(cacheKey, {
        data: entity,
        timestamp: Date.now(),
      });
    }

    return entity;
  }

  /**
   * Clear cache for testing
   */
  static clearCache() {
    this.cache.clear();
  }
}
