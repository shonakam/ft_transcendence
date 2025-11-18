import type { Redis } from 'ioredis';
import { getRedis } from '../db.ts';
import VolatileData from '../vo/VolatileData.ts';

export class VolatileDataRepositoryRedis {
  private get redis(): Redis {
    return getRedis();
  }

  async get(key: string): Promise<VolatileData | null> {
    const pipeline = this.redis.pipeline();
    pipeline.get(key);
    pipeline.ttl(key);

    // [ [Error | null, string | null], [Error | null, number] ] の形式で結果が返る
    const results = await pipeline.exec();

    const value = results?.[0]?.[1] as string | null;
    const ttl = results?.[1]?.[1] as number; // TTLは秒数 (-1: 永続, -2: キーなし)

    if (value === null) {
      return null;
    }

    const effectiveTtl = (ttl === -1) ? null : ttl;
    return VolatileData.create(value, effectiveTtl);
  }

  async set(key: string, value: string, ttl: number): Promise<void> {
    if (ttl > 0) {
      await this.redis.set(key, value, 'EX', ttl);
    } else {
      await this.redis.set(key, value);
    }
  }

  async setNx(key: string, value: string, ttl: number): Promise<boolean> {
    // result は 'OK' (成功) または null (失敗/キーが存在していた)
    const result = await this.redis.set(key, value, 'EX', ttl, 'NX');
    return result === 'OK';
  }

  async delete(key: string): Promise<void> {
    await this.redis.del(key);
  }
}
