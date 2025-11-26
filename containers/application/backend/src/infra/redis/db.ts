import { Redis } from 'ioredis';
import { config } from '../../conf.ts';

let redis: Redis;

export async function initializeRedis(): Promise<void> {
  const redisOptions = {
    host: config.redis.host,
    port: parseInt(config.redis.port, 10),
    maxRetriesPerRequest: parseInt(config.redis.retries, 10),
  };

  redis = new Redis(redisOptions);

  redis.on('connect', () => {
    console.log('Redis connected successfully.');
  });

  redis.on('error', (err) => {
    console.error('Redis connection error:', err);
    process.exit(1);
  });

  try {
    await redis.ping();
  } catch (err) {
    console.error('Failed to ping Redis on startup:', err);
    process.exit(1);
  }
}

export function getRedis(): Redis {
  if (!redis) {
    throw new Error("Redis is not initialized. Call initializeRedis() first.");
  }
  return redis;
}

export async function closeRedis(): Promise<void> {
  if (redis) {
    await redis.quit();
    console.log('Redis connection closed.');
  }
}
