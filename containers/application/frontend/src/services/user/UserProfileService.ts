import { api } from '../../lib/httpClient';
import { PublicProfile } from '../../types/user';

export class UserProfileService {
  private cache = new Map<string, PublicProfile | null>();
  private pendingRequests = new Map<string, Promise<PublicProfile | null>>();

  async getProfile(userId: string): Promise<PublicProfile | null> {
    // Check cache
    if (this.cache.has(userId)) {
      return this.cache.get(userId) ?? null;
    }

    // Check if there is already a pending request for this user
    const pending = this.pendingRequests.get(userId);
    if (pending) return pending;

    // Create a new request
    const request = (async () => {
      try {
        const profile = await api.get<PublicProfile>(`users/${userId}/profile`);
        this.cache.set(userId, profile);
        return profile;
      } catch (error) {
        console.error(`Failed to load profile for ${userId}`, error);
        this.cache.set(userId, null);
        return null;
      } finally {
        this.pendingRequests.delete(userId);
      }
    })();

    this.pendingRequests.set(userId, request);
    return request;
  }

  getCachedProfile(userId: string): PublicProfile | null | undefined {
    return this.cache.get(userId);
  }

  // Optional: Pre-fill cache if needed (e.g. from a list)
  setProfile(profile: PublicProfile) {
    this.cache.set(profile.id, profile);
  }
}

export const userProfileService = new UserProfileService();
