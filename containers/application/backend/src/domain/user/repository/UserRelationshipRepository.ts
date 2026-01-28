import { UserRelationship } from '../entity/UserRelationship.ts';

export interface UserRelationshipRepository {
  save(relationship: UserRelationship): Promise<void>;
  findByUserIdAndTargetId(
    userId: string,
    targetId: string,
  ): Promise<UserRelationship | null>;
  findByUserIdAndStatus(
    userId: string,
    status: 'pending' | 'accepted',
  ): Promise<UserRelationship[]>;
  findByTargetIdAndStatus(
    targetId: string,
    status: 'pending' | 'accepted',
  ): Promise<UserRelationship[]>;
  updateStatus(
    userId: string,
    targetId: string,
    status: 'accepted',
  ): Promise<void>;
  delete(userId: string, targetId: string): Promise<void>;
}
