import { Session } from './Session.ts';

export class LoginSession extends Session {
  static create(token: string, ttlMs: number): LoginSession {
    return new LoginSession(token, Date.now() + ttlMs);
  }
}
