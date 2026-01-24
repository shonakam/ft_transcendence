import fs from 'node:fs';
import path from 'node:path';
import { pipeline } from 'node:stream/promises';
import { Readable } from 'stream';
import { Buffer } from 'node:buffer';

export class LocalFileStorage {
  private readonly fullUploadDir: string;

  constructor(uploadDirName: string = 'uploads') {
    this.fullUploadDir = path.join(process.cwd(), uploadDirName);
    this.init();
  }

  private init() {
    if (!fs.existsSync(this.fullUploadDir)) {
      fs.mkdirSync(this.fullUploadDir, { recursive: true });
    }
  }

  async save(fileName: string, data: Buffer): Promise<string> {
    const savePath = path.join(this.fullUploadDir, fileName);
    await pipeline(Readable.from(data), fs.createWriteStream(savePath));
    return `/uploads/${fileName}`;
  }

  async delete(fileName: string): Promise<void> {
    const filePath = path.join(this.fullUploadDir, fileName);
    if (fs.existsSync(filePath)) {
      await fs.promises.unlink(filePath);
    }
  }
}
