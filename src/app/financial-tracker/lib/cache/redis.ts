import Redis from 'ioredis';

class RedisCache {
  private static instance: Redis;
  private static TTL = 300; // 5 minutes default

  static getInstance(): Redis {
    if (!RedisCache.instance) {
      RedisCache.instance = new Redis({
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379'),
        password: process.env.REDIS_PASSWORD,
        retryStrategy: (times) => {
          const delay = Math.min(times * 50, 2000);
          return delay;
        },
        maxRetriesPerRequest: 3,
        lazyConnect: true
      });

      RedisCache.instance.on('connect', () => {
        console.log('✅ Redis Cache Connected');
      });

      RedisCache.instance.on('error', (err) => {
        console.error('❌ Redis Cache Error:', err);
      });
    }
    return RedisCache.instance;
  }

  static async get<T>(key: string): Promise<T | null> {
    try {
      const data = await RedisCache.getInstance().get(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Redis get error:', error);
      return null;
    }
  }

  static async set(key: string, value: any, ttl: number = this.TTL): Promise<void> {
    try {
      await RedisCache.getInstance().setex(key, ttl, JSON.stringify(value));
    } catch (error) {
      console.error('Redis set error:', error);
    }
  }

  static async del(key: string): Promise<void> {
    try {
      await RedisCache.getInstance().del(key);
    } catch (error) {
      console.error('Redis del error:', error);
    }
  }

  static async delPattern(pattern: string): Promise<void> {
    try {
      const keys = await RedisCache.getInstance().keys(pattern);
      if (keys.length > 0) {
        await RedisCache.getInstance().del(...keys);
      }
    } catch (error) {
      console.error('Redis delPattern error:', error);
    }
  }

  static async flush(): Promise<void> {
    try {
      await RedisCache.getInstance().flushall();
    } catch (error) {
      console.error('Redis flush error:', error);
    }
  }

  // Cache key generators
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

  static reportKey(reportId: string): string {
    return `report:${reportId}`;
  }
}

export default RedisCache;