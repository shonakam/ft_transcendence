import { UserRelationshipRepository } from '../../domain/user/repository/UserRelationshipRepository.ts';
import { UserRelationship } from '../../domain/user/entity/UserRelationship.ts';

export class UserRelationshipUseCase {
  constructor(private userRelationshipRepo: UserRelationshipRepository) {}

  async requestFriend(userId: string, targetId: string): Promise<void> {
    if (userId === targetId) {
      throw new Error('Cannot add yourself as a friend');
    }

    const existing = await this.userRelationshipRepo.findByUserIdAndTargetId(
      userId,
      targetId,
    );
    if (existing) {
      if (existing.status === 'accepted') {
        throw new Error('Already friends');
      }
      // If pending, just ignore or re-send? Let's assume re-send is fine to update timestamp if we wanted, but for now just return
      return;
    }

    // Check if the other user has already requested
    const reverse = await this.userRelationshipRepo.findByUserIdAndTargetId(
      targetId,
      userId,
    );
    if (reverse && reverse.status === 'pending') {
      // Auto-accept if both requested
      await this.acceptFriend(userId, targetId);
      return;
    }

    const relationship = new UserRelationship({
      userId,
      targetId,
      type: 'friend',
      status: 'pending',
      createdAt: Math.floor(Date.now() / 1000),
      updatedAt: Math.floor(Date.now() / 1000),
    });

    await this.userRelationshipRepo.save(relationship);
  }

  async acceptFriend(userId: string, targetId: string): Promise<void> {
    // userId is the one accepting, so the request must have come from targetId
    // So we look for a record where user_id = targetId AND target_id = userId
    const request = await this.userRelationshipRepo.findByUserIdAndTargetId(
      targetId,
      userId,
    );

    if (!request || request.status !== 'pending') {
      throw new Error('No pending friend request found');
    }

    // Update the request to accepted
    await this.userRelationshipRepo.updateStatus(targetId, userId, 'accepted');

    // Create the reverse relationship as accepted too
    const reverse = new UserRelationship({
      userId: userId, // The one accepting
      targetId: targetId, // The one who sent request
      type: 'friend',
      status: 'accepted',
      createdAt: Math.floor(Date.now() / 1000),
      updatedAt: Math.floor(Date.now() / 1000),
    });
    await this.userRelationshipRepo.save(reverse);
  }

  async removeFriend(userId: string, targetId: string): Promise<void> {
    // Remove both directions
    await this.userRelationshipRepo.delete(userId, targetId);
    await this.userRelationshipRepo.delete(targetId, userId);
  }

  async getFriends(userId: string): Promise<string[]> {
    const relationships = await this.userRelationshipRepo.findByUserIdAndStatus(
      userId,
      'accepted',
    );
    return relationships.map((r) => r.targetId);
  }

  async getPendingRequests(userId: string): Promise<string[]> {
    // Users who requested THIS user
    // So search where target_id = userId AND status = 'pending'
    const requests = await this.userRelationshipRepo.findByTargetIdAndStatus(
      userId,
      'pending',
    );
    return requests.map((r) => r.userId);
  }
}
