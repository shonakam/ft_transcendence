import type { Redis } from 'ioredis';
import { getRedis } from './db.ts';
import minilog, { TAG } from '../../utils/minilog.ts';

const ONLINE_KEY_PREFIX = 'user:online:';
const ONLINE_TTL_SECONDS = 120; // 2 minutes - will be refreshed on each activity

export class OnlineStatusService {
  private static instance: OnlineStatusService;

  private constructor() {}

  public static getInstance(): OnlineStatusService {
    if (!OnlineStatusService.instance) {
      OnlineStatusService.instance = new OnlineStatusService();
    }
    return OnlineStatusService.instance;
  }

  private get redis(): Redis {
    return getRedis();
  }

  private getKey(userId: string): string {
    return `${ONLINE_KEY_PREFIX}${userId}`;
  }

  /**
   * Mark user as online with TTL
   */
  async setOnline(userId: string): Promise<void> {
    try {
      const key = this.getKey(userId);
      await this.redis.set(
        key,
        Date.now().toString(),
        'EX',
        ONLINE_TTL_SECONDS,
      );
      minilog.d(TAG.REDIS, `User ${userId} marked as online`);
    } catch (err) {
      minilog.e(TAG.REDIS, `Failed to set online status for ${userId}: ${err}`);
    }
  }

  /**
   * Mark user as offline (immediate removal)
   */
  async setOffline(userId: string): Promise<void> {
    try {
      const key = this.getKey(userId);
      await this.redis.del(key);
      minilog.d(TAG.REDIS, `User ${userId} marked as offline`);
    } catch (err) {
      minilog.e(
        TAG.REDIS,
        `Failed to set offline status for ${userId}: ${err}`,
      );
    }
  }

  /**
   * Check if a single user is online
   */
  async isOnline(userId: string): Promise<boolean> {
    try {
      const key = this.getKey(userId);
      const result = await this.redis.exists(key);
      return result === 1;
    } catch (err) {
      minilog.e(
        TAG.REDIS,
        `Failed to check online status for ${userId}: ${err}`,
      );
      return false;
    }
  }

  /**
   * Get online status for multiple users at once
   */
  async getOnlineStatuses(userIds: string[]): Promise<Record<string, boolean>> {
    if (userIds.length === 0) {
      return {};
    }

    try {
      const keys = userIds.map((id) => this.getKey(id));
      const pipeline = this.redis.pipeline();

      for (const key of keys) {
        pipeline.exists(key);
      }

      const results = await pipeline.exec();
      const statuses: Record<string, boolean> = {};

      userIds.forEach((userId, index) => {
        const result = results?.[index]?.[1] as number;
        statuses[userId] = result === 1;
      });

      return statuses;
    } catch (err) {
      minilog.e(TAG.REDIS, `Failed to get online statuses: ${err}`);
      return userIds.reduce((acc, id) => ({ ...acc, [id]: false }), {});
    }
  }

  /**
   * Refresh online status (extend TTL)
   */
  async refreshOnline(userId: string): Promise<void> {
    await this.setOnline(userId);
  }
}

export const onlineStatusService = OnlineStatusService.getInstance();
