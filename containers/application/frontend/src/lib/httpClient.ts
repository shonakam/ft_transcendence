const AUTH_TOKEN_KEY = 'auth_token';
const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api/v1';

async function httpClient<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${BASE_URL}/${endpoint}`;
  const headers = new Headers(options.headers || {});

  if (!headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(url, {
    ...options, headers: headers, credentials: 'include',
  });
  console.log(response.headers)

  if (!response.ok) {
    if (response.status === 401) {
      console.error('認証エラー: トークンが無効です。強制ログアウト処理を実行します。');
      // 💡 ここでログアウト処理をキック（例: Cookie削除、ストアのリセット、リダイレクト）
      // 例: eraseCookie(AUTH_TOKEN_KEY);
      // 例: window.location.href = '/login';
    }

    let errorData = null;
    try {
      errorData = await response.json();
    } catch (e) {
      errorData = { message: `HTTP Error ${response.status}: ${response.statusText}` };
    }
    return Promise.reject(errorData);
  }

  if (response.status === 204) {
    return {} as T;
  }

  return response.json();
}

export const api = {
  get: <T>(endpoint: string, options?: Omit<RequestInit, 'method'>) =>
    httpClient<T>(endpoint, { ...options, method: 'GET' }),

  post: <T>(endpoint: string, body: unknown, options?: Omit<RequestInit, 'method' | 'body'>) =>
    httpClient<T>(endpoint, { ...options, method: 'POST', body: JSON.stringify(body) }),

  put: <T>(endpoint: string, body: unknown, options?: Omit<RequestInit, 'method' | 'body'>) =>
    httpClient<T>(endpoint, { ...options, method: 'PUT', body: JSON.stringify(body) }),

  delete: <T>(endpoint: string, options?: Omit<RequestInit, 'method'>) =>
    httpClient<T>(endpoint, { ...options, method: 'DELETE' }),
};