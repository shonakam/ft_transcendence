import { api } from '../../lib/httpClient';

export class UserRelationshipService {
  async requestFriend(targetUserId: string): Promise<void> {
    return api.post('users/friends/request', { targetId: targetUserId });
  }

  async acceptFriend(targetUserId: string): Promise<void> {
    return api.post('users/friends/accept', { targetId: targetUserId });
  }

  async removeFriend(targetUserId: string): Promise<void> {
    return api.delete(`users/friends/${targetUserId}`);
  }

  async getFriends(): Promise<string[]> {
    return api.get<string[]>('users/friends');
  }

  async getPendingRequests(): Promise<string[]> {
    return api.get<string[]>('users/friends/pending');
  }
}

export const userRelationshipService = new UserRelationshipService();
