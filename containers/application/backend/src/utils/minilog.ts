import * as fs from 'fs';
import * as path from 'path';

export const TAG = {
  SYSTEM: 'SYSTEM',
  DB: 'DB',
  REDIS: 'REDIS',
  AUTH: 'AUTH',
  USER: 'USER',
  HTTP: 'HTTP',
  WEBSOCKET: 'WEBSOCKET',
  GAME: 'GAME',
  CHAT: 'CHAT',
} as const;

class MiniLog {
  private logDir: string;
  private logFile: string;
  private maxSizeBytes: number = 10 * 1024 * 1024; // 10MB
  private maxFiles: number = 5;
  private writeStream: fs.WriteStream | null = null;

  constructor() {
    this.logDir = path.join(process.cwd(), 'logs');
    this.logFile = path.join(this.logDir, 'app.log');
    this.init();
  }

  private init() {
    if (!fs.existsSync(this.logDir)) {
      fs.mkdirSync(this.logDir, { recursive: true });
    }
    this.rotateIfNeeded();
    this.writeStream = fs.createWriteStream(this.logFile, { flags: 'a' });
  }

  private updateStream() {
    if (this.writeStream) this.writeStream.end();
    this.writeStream = fs.createWriteStream(this.logFile, { flags: 'a' });
  }

  private rotateIfNeeded() {
    if (fs.existsSync(this.logFile)) {
      const stats = fs.statSync(this.logFile);
      if (stats.size >= this.maxSizeBytes) {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const archivedPath = path.join(this.logDir, `app-${timestamp}.log`);
        fs.renameSync(this.logFile, archivedPath);
        fs.renameSync(this.logFile, archivedPath);
        this.updateStream();
        this.purgeOldLogs();
      }
    }
  }

  private purgeOldLogs() {
    const files = fs
      .readdirSync(this.logDir)
      .filter((f: any) => f.startsWith('app-') && f.endsWith('.log'))
      .map((f: any) => ({
        name: f,
        time: fs.statSync(path.join(this.logDir, f)).mtime.getTime(),
      }))
      .sort((a: any, b: any) => b.time - a.time);

    if (files.length > this.maxFiles) {
      const toDelete = files.slice(this.maxFiles);
      toDelete.forEach((f: any) => {
        fs.unlinkSync(path.join(this.logDir, f.name));
      });
    }
  }

  public log(tag: string, msg: string, level = 'INFO') {
    const logEntry = {
      '@timestamp': new Date().toISOString(),
      level: level,
      tag: tag.toUpperCase(),
      message: msg,
    };

    const logString = JSON.stringify(logEntry) + '\n';
    process.stdout.write(logString);
    this.rotateIfNeeded();
    if (this.writeStream) {
      this.writeStream.write(logString);
    }
  }

  public i(tag: string, msg: string) {
    this.log(tag, msg, 'INFO');
  }
  public e(tag: string, msg: string) {
    this.log(tag, msg, 'ERROR');
  }
  public d(tag: string, msg: string) {
    this.log(tag, msg, 'DEBUG');
  }
  public w(tag: string, msg: string) {
    this.log(tag, msg, 'WARN');
  }
}

const minilog = new MiniLog();
export default minilog;
