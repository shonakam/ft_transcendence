
export class SessionStorage<T> {
  constructor(private readonly key: string) {}
  
  save(data: T): void {
    try {
      sessionStorage.setItem(this.key, JSON.stringify(data));
    } catch (error) {
      console.error(`SessionStorage Save Error [${this.key}]:`, error);
    }
  }

  get(): T | null {
    try {
      const data = sessionStorage.getItem(this.key);
      return data ? (JSON.parse(data) as T) : null;
    } catch (error) {
      console.error(`SessionStorage Get Error [${this.key}]:`, error);
      return null;
    }
  }

  delete(): void {
    sessionStorage.removeItem(this.key);
  }
}
