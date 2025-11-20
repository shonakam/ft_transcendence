import { URL } from 'url';

export class FetchError extends Error {
  public status: number;
  public data: any; 

  constructor(status: number, message: string, data: any) {
    super(message);
    this.status = status;
    this.data = data;
    this.name = 'FetchError';
  }
}

export class HttpClient {
  private readonly baseURL: string;
  private readonly defaultTimeout: number = 10000; // 10秒

  constructor(baseURL: string) {
    this.baseURL = baseURL.endsWith('/') ? baseURL.slice(0, -1) : baseURL;
  }

  private async fetch(
    fullUrl: string,
    init: RequestInit = {},
  ): Promise<Response> {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), this.defaultTimeout);

    try {
      const response = await fetch(fullUrl, {
        ...init,
        signal: controller.signal,
      });
      clearTimeout(id);
      return response;
    } catch (error) {
      clearTimeout(id);
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error(`Request timed out after ${this.defaultTimeout}ms.`);
      }
      throw error;
    }
  }

  private async request<T = any>(
    method: string,
    path: string,
    data?: any,
    config: RequestInit = {}
  ): Promise<T> {
    const fullUrl = this.baseURL + path;
    const headers = {
        'Content-Type': 'application/json',
        ...config.headers,
    };

    const init: RequestInit = {
      method,
      headers,
      body: (data && method !== 'GET' && method !== 'HEAD') ? JSON.stringify(data) : undefined,
      ...config,
    };

    const response = await this.fetch(fullUrl, init);

    if (!response.ok) {
      let errorData: any = {};
      try {
        errorData = await response.json();
      } catch (e) {
        errorData = await response.text();
      }
      
      throw new FetchError(
          response.status, 
          `HTTP Request Failed: ${response.status} ${response.statusText}`, 
          errorData
      );
    }

    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
        return response.json();
    }
    return response.text() as Promise<T>;
  }

  public get<T = any>(path: string, config?: RequestInit): Promise<T> {
    return this.request<T>('GET', path, undefined, config);
  }

  public async postForm<T = any>(
    path: string, 
    data: Record<string, any>,
    config: RequestInit = {}
  ): Promise<T> {
    const formBody = new URLSearchParams(data).toString();
    const headers = {
        'Content-Type': 'application/x-www-form-urlencoded', 
        ...config.headers,
    };

    const init: RequestInit = {
      method: 'POST',
      headers,
      body: formBody,
      ...config,
    };

    const fullUrl = this.baseURL + path;
    const response = await this.fetch(fullUrl, init);
    if (!response.ok) {
      let errorData: any = {};
      try {
        errorData = await response.json();
      } catch (e) {
        errorData = await response.text();
      }
      
      throw new FetchError(
          response.status, 
          `HTTP Request Failed: ${response.status} ${response.statusText}`, 
          errorData
      );
    }

    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
        return response.json();
    }
    return response.text() as Promise<T>;
  }
}
