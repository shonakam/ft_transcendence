import { scryptSync, randomBytes, timingSafeEqual } from 'crypto';
import { Buffer } from 'node:buffer';

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

  static compare(raw: string, stored: string): boolean {
    if (!raw || !stored) { return false }
    const [salt, keyHex] = stored.split(':') as [string, string];
  
    const hashBuffer = scryptSync(raw, salt, 64); // 生パスワードからハッシュを生成 (Buffer 形式)
    const keyBuffer = Buffer.from(keyHex, 'hex'); // 保存されたハッシュ（Hex文字列）を Buffer に戻す

    // 長さが違うと timingSafeEqual が throw する可能性があるため、バッファの長さが異なる場合、timingSafeEqual の前に弾く
    // タイミング攻撃耐性のある比較を実行 (比較にかかる時間がデータの内容によって変化しないことが保証される)
    return (hashBuffer.length !== keyBuffer.length) 
      ? false 
      : timingSafeEqual(hashBuffer, keyBuffer);
  }

  getHash(): string {
    return this.hash;
  }
}
