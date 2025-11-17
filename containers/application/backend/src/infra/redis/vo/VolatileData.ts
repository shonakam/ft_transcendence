export default class VolatileData {
  private constructor(
    private readonly value: string,
    private readonly ttl: number | null
  ) {}

  static create(value: string, ttl: number | null = null): VolatileData {
    if (value === null || value === undefined) {
      throw new Error("Value cannot be null or undefined.");
    }
    const effectiveTtl = (ttl !== null && ttl < 0) ? null : ttl;
    return new VolatileData(value, effectiveTtl);
  }

  get(): string {
    return this.value;
  }

  getTtl(): number | null {
    return this.ttl;
  }

  equals(other: VolatileData): boolean {
    return this.value === other.value && this.ttl === other.ttl;
  }
}
