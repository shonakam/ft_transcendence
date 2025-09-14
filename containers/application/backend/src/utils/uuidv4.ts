import { randomBytes } from 'crypto';

// https://tex2e.github.io/rfc-translater/html/rfc9562.html
export function uuidv4(): string {
  const b: Buffer = randomBytes(16);

  b[6]! = (b[6]! & 0x0f) | 0x40; // version (4)
  b[8]! = (b[8]! & 0x3f) | 0x80; // variant (10xx...)

  const hex = b.toString('hex');
  return (
    hex.substring(0, 8) +
    '-' +
    hex.substring(8, 12) +
    '-' +
    hex.substring(12, 16) +
    '-' +
    hex.substring(16, 20) +
    '-' +
    hex.substring(20)
  );
}
