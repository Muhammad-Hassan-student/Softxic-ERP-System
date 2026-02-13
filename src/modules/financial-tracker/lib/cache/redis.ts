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
        maxRetriesPerRequest: 3
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
    const data = await RedisCache.getInstance().get(key);
    return data ? JSON.parse(data) : null;
  }

  static async set(key: string, value: any, ttl: number = this.TTL): Promise<void> {
    await RedisCache.getInstance().setex(key, ttl, JSON.stringify(value));
  }

  static async del(key: string): Promise<void> {
    await RedisCache.getInstance().del(key);
  }

  static async delPattern(pattern: string): Promise<void> {
    const keys = await RedisCache.getInstance().keys(pattern);
    if (keys.length > 0) {
      await RedisCache.getInstance().del(...keys);
    }
  }

  // Dashboard cache keys
  static dashboardKey(module: string, entity: string, dateRange: string): string {
    return `dashboard:${module}:${entity}:${dateRange}`;
  }

  static permissionsKey(userId: string): string {
    return `permissions:${userId}`;
  }
}

export default RedisCache;