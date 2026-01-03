import { config } from "../../../conf.ts";

export class Pagination {
  public readonly offset: number;
  public readonly limit: number;

  private constructor(
    offset?: number,
    limit?: number,
  ) {
    this.offset = offset ?? config.api.user.pagination.offset;
    this.limit = limit ?? config.api.user.pagination.limit;

    if (this.offset < 0) {
      throw new Error('Offset cannot be a negative number.');
    }
    if (this.limit <= 0) {
      throw new Error('Limit must be a positive number.');
    }
  }

  // A factory method is a good practice for creating value objects
  public static from(offset?: number, limit?: number): Pagination {
    return new Pagination(offset, limit);
  }

  getOffset(): number {
    return this.offset;
  }

  getLimit(): number {
    return this.limit;
  }
}
