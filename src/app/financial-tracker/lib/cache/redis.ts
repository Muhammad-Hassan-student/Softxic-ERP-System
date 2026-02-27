// src/app/financial-tracker/lib/cache/redis.ts
import Redis from 'ioredis';

export interface CacheOptions {
  ttl?: number;
  namespace?: string;
}

export class RedisCache {
  private static instance: Redis;
  private static defaultTTL = 300; // 5 minutes default
  private static isConnected = false;

  /**
   * Get Redis instance (singleton)
   */
  static getInstance(): Redis {
    if (!RedisCache.instance) {
      RedisCache.instance = new Redis({
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379'),
        password: process.env.REDIS_PASSWORD,
        db: parseInt(process.env.REDIS_DB || '0'),
        retryStrategy: (times) => {
          const delay = Math.min(times * 50, 2000);
          return delay;
        },
        maxRetriesPerRequest: 3,
        lazyConnect: true,
        enableReadyCheck: true,
        connectTimeout: 10000
      });

      // Connection event handlers
      RedisCache.instance.on('connect', () => {
        RedisCache.isConnected = true;
        if (process.env.NODE_ENV !== 'test') {
          console.log('✅ Redis Cache Connected');
        }
      });

      RedisCache.instance.on('ready', () => {
        RedisCache.isConnected = true;
      });

      RedisCache.instance.on('error', (err) => {
        RedisCache.isConnected = false;
        console.error('❌ Redis Cache Error:', err.message);
      });

      RedisCache.instance.on('close', () => {
        RedisCache.isConnected = false;
        console.log('📴 Redis Cache Connection Closed');
      });

      RedisCache.instance.on('reconnecting', () => {
        console.log('🔄 Redis Cache Reconnecting...');
      });
    }
    return RedisCache.instance;
  }

  /**
   * Check if Redis is connected
   */
  static isReady(): boolean {
    return RedisCache.isConnected && RedisCache.instance?.status === 'ready';
  }

  /**
   * Get value from cache
   */
  static async get<T>(key: string): Promise<T | null> {
    try {
      if (!RedisCache.isReady()) {
        console.warn('⚠️ Redis not connected, skipping cache get');
        return null;
      }

      const data = await RedisCache.getInstance().get(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('❌ Redis get error:', error);
      return null;
    }
  }

  /**
   * ✅ FIXED: Set value in cache with TTL - Properly typed
   */
  static async set(key: string, value: any, ttl?: number): Promise<boolean> {
    try {
      if (!RedisCache.isReady()) {
        console.warn('⚠️ Redis not connected, skipping cache set');
        return false;
      }

      const redis = RedisCache.getInstance();
      const stringValue = JSON.stringify(value);

      if (ttl !== undefined) {
        // Use setex for TTL - Note: setex expects (key, seconds, value)
        await redis.setex(key, ttl, stringValue);
      } else {
        // Use set without expiration
        await redis.set(key, stringValue);
      }
      
      return true;
    } catch (error) {
      console.error('❌ Redis set error:', error);
      return false;
    }
  }

  /**
   * Set value with custom TTL (alias for set with TTL)
   */
  static async setex(key: string, ttl: number, value: any): Promise<boolean> {
    return this.set(key, value, ttl);
  }

  /**
   * Set value without expiration
   */
  static async setForever(key: string, value: any): Promise<boolean> {
    return this.set(key, value);
  }

  /**
   * Delete key from cache
   */
  static async del(key: string): Promise<boolean> {
    try {
      if (!RedisCache.isReady()) return false;
      await RedisCache.getInstance().del(key);
      return true;
    } catch (error) {
      console.error('❌ Redis del error:', error);
      return false;
    }
  }

  /**
   * Delete keys matching pattern
   */
  static async delPattern(pattern: string): Promise<number> {
    try {
      if (!RedisCache.isReady()) return 0;
      
      const redis = RedisCache.getInstance();
      const keys = await redis.keys(pattern);
      
      if (keys.length > 0) {
        // Use spread operator to pass all keys to del
        const result = await redis.del(...keys);
        return result;
      }
      return 0;
    } catch (error) {
      console.error('❌ Redis delPattern error:', error);
      return 0;
    }
  }

  /**
   * Check if key exists
   */
  static async exists(key: string): Promise<boolean> {
    try {
      if (!RedisCache.isReady()) return false;
      const result = await RedisCache.getInstance().exists(key);
      return result === 1;
    } catch (error) {
      console.error('❌ Redis exists error:', error);
      return false;
    }
  }

  /**
   * Get TTL of key
   */
  static async ttl(key: string): Promise<number> {
    try {
      if (!RedisCache.isReady()) return -2;
      return await RedisCache.getInstance().ttl(key);
    } catch (error) {
      console.error('❌ Redis ttl error:', error);
      return -2;
    }
  }

  /**
   * Increment a value
   */
  static async incr(key: string): Promise<number> {
    try {
      if (!RedisCache.isReady()) return 0;
      return await RedisCache.getInstance().incr(key);
    } catch (error) {
      console.error('❌ Redis incr error:', error);
      return 0;
    }
  }

  /**
   * Set expiration on key
   */
  static async expire(key: string, seconds: number): Promise<boolean> {
    try {
      if (!RedisCache.isReady()) return false;
      const result = await RedisCache.getInstance().expire(key, seconds);
      return result === 1;
    } catch (error) {
      console.error('❌ Redis expire error:', error);
      return false;
    }
  }

  /**
   * Get multiple keys at once
   */
  static async mget<T>(keys: string[]): Promise<(T | null)[]> {
    try {
      if (!RedisCache.isReady() || keys.length === 0) return keys.map(() => null);
      
      const redis = RedisCache.getInstance();
      const results = await redis.mget(keys);
      
      return results.map(result => result ? JSON.parse(result) : null);
    } catch (error) {
      console.error('❌ Redis mget error:', error);
      return keys.map(() => null);
    }
  }

  /**
   * Set multiple keys at once
   */
  static async mset(keyValuePairs: Record<string, any>, ttl?: number): Promise<boolean> {
    try {
      if (!RedisCache.isReady()) return false;
      
      const redis = RedisCache.getInstance();
      const pipeline = redis.pipeline();
      
      for (const [key, value] of Object.entries(keyValuePairs)) {
        const stringValue = JSON.stringify(value);
        if (ttl !== undefined) {
          pipeline.setex(key, ttl, stringValue);
        } else {
          pipeline.set(key, stringValue);
        }
      }
      
      await pipeline.exec();
      return true;
    } catch (error) {
      console.error('❌ Redis mset error:', error);
      return false;
    }
  }

  /**
   * Clear all cache
   */
  static async flush(): Promise<boolean> {
    try {
      if (!RedisCache.isReady()) return false;
      await RedisCache.getInstance().flushall();
      return true;
    } catch (error) {
      console.error('❌ Redis flush error:', error);
      return false;
    }
  }

  /**
   * Get cache stats
   */
  static async getStats(): Promise<Record<string, any>> {
    try {
      if (!RedisCache.isReady()) {
        return { status: 'disconnected' };
      }

      const redis = RedisCache.getInstance();
      const info = await redis.info();
      const memory = await redis.info('memory');
      const stats = await redis.info('stats');

      return {
        status: 'connected',
        version: info.match(/redis_version:([^\r\n]+)/)?.[1]?.trim(),
        uptime: info.match(/uptime_in_seconds:([^\r\n]+)/)?.[1]?.trim(),
        connectedClients: info.match(/connected_clients:([^\r\n]+)/)?.[1]?.trim(),
        usedMemory: memory.match(/used_memory_human:([^\r\n]+)/)?.[1]?.trim(),
        totalCommands: stats.match(/total_commands_processed:([^\r\n]+)/)?.[1]?.trim(),
        keyspaceHits: stats.match(/keyspace_hits:([^\r\n]+)/)?.[1]?.trim(),
        keyspaceMisses: stats.match(/keyspace_misses:([^\r\n]+)/)?.[1]?.trim(),
        hitRate: await RedisCache.calculateHitRate()
      };
    } catch (error:any) {
      console.error('❌ Redis stats error:', error);
      return { status: 'error', error: error.message };
    }
  }

  /**
   * Calculate cache hit rate
   */
  private static async calculateHitRate(): Promise<number> {
    try {
      const redis = RedisCache.getInstance();
      const stats = await redis.info('stats');
      const hits = parseInt(stats.match(/keyspace_hits:(\d+)/)?.[1] || '0');
      const misses = parseInt(stats.match(/keyspace_misses:(\d+)/)?.[1] || '0');
      const total = hits + misses;
      
      return total > 0 ? (hits / total) * 100 : 0;
    } catch {
      return 0;
    }
  }

  // ==================== CACHE KEY GENERATORS ====================

  static dashboardKey(module: string, entity: string, dateRange: string): string {
    return `dashboard:${module}:${entity}:${dateRange}`;
  }

  static permissionsKey(userId: string): string {
    return `permissions:${userId}`;
  }

  static fieldsKey(module: string, entityId: string): string {
    return `fields:${module}:${entityId}`;
  }

  static recordsKey(module: string, entity: string, page: number): string {
    return `records:${module}:${entity}:page:${page}`;
  }

  static recordKey(recordId: string): string {
    return `record:${recordId}`;
  }

  static reportKey(reportId: string): string {
    return `report:${reportId}`;
  }

  static entitiesKey(module?: string): string {
    return module ? `entities:${module}` : 'entities:all';
  }

  static activityKey(limit: number): string {
    return `activity:recent:${limit}`;
  }

  static analyticsKey(module: string, entity: string, range: string): string {
    return `analytics:${module}:${entity}:${range}`;
  }

  static sessionKey(sessionId: string): string {
    return `session:${sessionId}`;
  }

  static rateLimitKey(identifier: string, endpoint: string): string {
    return `ratelimit:${identifier}:${endpoint}`;
  }
}

// Export both the class and a default instance
export default RedisCache;