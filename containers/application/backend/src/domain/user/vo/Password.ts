import { scryptSync, randomBytes, timingSafeEqual } from 'crypto';

export default class Password {
  private constructor(private readonly hash: string) {}

  static create(raw: string): Password {
    const min = 12;
    const max = 255;

    if (raw.length < min) {
      throw new Error(
        `Password too short: ${raw.length} characters provided, minimum is ${min}`,
      );
    }
    if (raw.length > max) {
      throw new Error(
        `Password too long: ${raw.length} characters provided, maximum is ${max}`,
      );
    }
    // Check if it includes letters, numbers, and symbols (standard policy)
    const pattern = /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[\W_]).+$/;
    if (!pattern.test(raw)) {
      throw new Error('Password must include letters, numbers, and symbols');
    }

    const salt = randomBytes(16).toString('hex');
    const key = scryptSync(raw, salt, 64).toString('hex');
    return new Password(`${salt}:${key}`);
  }

  compare(raw: string, stored: string): boolean {
    const [salt, key] = stored.split(':') as [string, string];
    const hash = scryptSync(raw, salt, 64).toString('hex');
    return hash === key;
  }

  getHash(): string {
    return this.hash;
  }
}
