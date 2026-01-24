import { Redis } from 'ioredis';
import minilog, { TAG } from '../../utils/minilog.ts';
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
    minilog.i(TAG.REDIS, 'Redis connected successfully.');
  });

  redis.on('error', (err) => {
    minilog.e(TAG.REDIS, `Redis connection error: ${err}`);
    process.exit(1);
  });

  try {
    await redis.ping();
  } catch (err) {
    minilog.e(TAG.REDIS, `Failed to ping Redis on startup: ${err}`);
    process.exit(1);
  }
}

export function getRedis(): Redis {
  if (!redis) {
    throw new Error('Redis is not initialized. Call initializeRedis() first.');
  }
  return redis;
}

export async function closeRedis(): Promise<void> {
  if (redis) {
    await redis.quit();
    minilog.i(TAG.REDIS, 'Redis connection closed.');
  }
}
