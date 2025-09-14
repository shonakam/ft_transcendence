import type { User } from '../entity/User.ts';

export interface UserRepository {
  save(user: User): Promise<void>;
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  list(offset: number, limit: number): Promise<User[] | null>;
  delete(id: string): Promise<void>;
}
