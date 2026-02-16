import { createClient } from 'redis';
import { createAdapter } from '@socket.io/redis-adapter';
import { ServerOptions } from 'socket.io';

export const configureRedisAdapter = async () => {
  const REDIS_CONFIG = {
    url: process.env.REDIS_URL || 'redis://localhost:6379',
    socket: {
      reconnectStrategy: (retries: number) => {
        if (retries > 10) {
          console.error('Redis max reconnection attempts reached');
          return new Error('Redis max retries');
        }
        return Math.min(retries * 100, 3000);
      }
    }
  };

  const pubClient = createClient(REDIS_CONFIG);
  const subClient = pubClient.duplicate();

  await Promise.all([pubClient.connect(), subClient.connect()]);

  pubClient.on('error', (err) => console.error('Redis Pub Error:', err));
  subClient.on('error', (err) => console.error('Redis Sub Error:', err));

  return createAdapter(pubClient, subClient);
};