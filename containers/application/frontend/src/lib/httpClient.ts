import { toaster } from '../components/common/Toaster';
import { router } from '../router/router';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api/';

let isRefreshing = false;
let refreshSubscribers: ((fail?: boolean) => void)[] = [];

function onRefreshed(fail = false) {
  refreshSubscribers.forEach((callback) => callback(fail));
  refreshSubscribers = [];
}

interface CustomOptions extends RequestInit {
  _retry?: boolean;
}

async function httpClient<T>(
  endpoint: string,
  options: CustomOptions = {}
): Promise<T> {
  const url = `${BASE_URL}${endpoint}`;
  const headers = new Headers(options.headers || {});

  const isFormData = options.body instanceof FormData;
  const hasBody = options.body !== undefined && options.body !== null;
  
  if (!headers.has('Content-Type') && hasBody && !isFormData) {
    headers.set('Content-Type', 'application/json');
  }

  const fetchOptions: RequestInit = {
    ...options,
    headers,
    credentials: 'include',
  };

  try {
    const response = await fetch(url, fetchOptions);

    // 1. 成功時の処理
    if (response.ok) {
      if (response.status === 204) return {} as T;
      return response.json();
    }

    // 2. 認証エラー (401) 時の処理
    if (response.status === 401) {
      // 認証系エンドポイント自体が401を返した場合、または既にリトライ済みの場合はループ防止のため終了
      const isAuthEndpoint = [
        'auth/login',
        'auth/refresh',
        'auth/verify-mfa/totp',
      ].some((path) => endpoint.includes(path));

      if (isAuthEndpoint || options._retry) {
        if (!isAuthEndpoint) handleForceLogout();
        return Promise.reject(new Error('Authentication failed'));
      }

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          refreshSubscribers.push((fail) => {
            if (fail) {
              reject(new Error('Session expired'));
            } else {
              resolve(httpClient<T>(endpoint, { ...options, _retry: true }));
            }
          });
        });
      }

      isRefreshing = true;
      try {
        const refreshRes = await fetch(`${BASE_URL}auth/refresh`, {
          method: 'POST',
          credentials: 'include',
        });

        if (!refreshRes.ok) throw new Error('Refresh token expired');

        isRefreshing = false;
        onRefreshed(false);

        const result = await httpClient<T>(endpoint, {
          ...options,
          _retry: true,
        });
        return result;
      } catch (error) {
        isRefreshing = false;
        onRefreshed(true);
        handleForceLogout();
        return Promise.reject(error);
      }
    }

    const errorData = await response.json().catch(() => ({
      message: `HTTP Error ${response.status}: ${response.statusText}`,
    }));
    return Promise.reject(errorData);
  } catch (networkError) {
    return Promise.reject(networkError);
  }
}

async function handleForceLogout() {
  if (window.location.pathname.startsWith('/auth')) return;

  await api.delete('auth/logout').catch(() => {});
  localStorage.clear();
  sessionStorage.clear();

  console.warn('Session expired. Redirecting to login...');
  toaster.show('Session expired. Redirecting to login...', 'error');
  router.navigateTo('/auth?view=login');
}

// --- 公開API ---
export const api = {
  get: <T>(endpoint: string, options?: Omit<CustomOptions, 'method'>) => 
    httpClient<T>(endpoint, { ...options, method: 'GET' }),

  post: <T>(
    endpoint: string,
    body: unknown,
    options?: Omit<CustomOptions, 'method' | 'body'>
  ) => {
    const formattedBody = body instanceof FormData ? body : JSON.stringify(body);
    return httpClient<T>(endpoint, {
      ...options,
      method: 'POST',
      body: formattedBody,
    });
  },

  put: <T>(
    endpoint: string,
    body: unknown,
    options?: Omit<CustomOptions, 'method' | 'body'>
  ) => {
    const formattedBody = body instanceof FormData ? body : JSON.stringify(body);
    return httpClient<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: formattedBody,
    });
  },

  delete: <T>(endpoint: string, options?: Omit<CustomOptions, 'method'>) =>
    httpClient<T>(endpoint, { ...options, method: 'DELETE' }),
};
