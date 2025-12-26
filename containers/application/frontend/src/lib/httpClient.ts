const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api/v1';

let isRefreshing = false;
let refreshSubscribers: (() => void)[] = [];

function onRefreshed() {
  refreshSubscribers.forEach((callback) => callback());
  refreshSubscribers = [];
}

async function httpClient<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${BASE_URL}/${endpoint}`
  const headers = new Headers(options.headers || {})

  if (!headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json')
  }

  const fetchOptions: RequestInit = {
    ...options,
    headers,
    credentials: 'include',
  };

  try {
    const response = await fetch(url, fetchOptions)
    if (response.ok) {
      if (response.status === 204) return {} as T
      return response.json()
    }

    if (response.status === 401 || response.status === 400) {
      if (endpoint === "auth/login" || endpoint === "auth/refresh") {
        console.log("HERE")
        return Promise.reject(new Error("Authentication failed"));
      }

      if (isRefreshing) {
        return new Promise((resolve) => {
          refreshSubscribers.push(() => {
            resolve(httpClient<T>(endpoint, options))
          })
        })
      }

      isRefreshing = true;
      try {
        const refreshRes = await fetch(`${BASE_URL}/auth/refresh`, {
          method: 'POST',
          credentials: 'include',
        })

        if (!refreshRes.ok) throw new Error("Refresh failed");

        isRefreshing = false;
        onRefreshed()
        return await httpClient<T>(endpoint, options)
      } catch (error) {
        isRefreshing = false
        handleForceLogout()
        return Promise.reject(error)
      }
    }

    const errorData = await response.json().catch(() => ({
      message: `HTTP Error ${response.status}: ${response.statusText}`
    }))
    return Promise.reject(errorData)

  } catch (networkError) {
    return Promise.reject(networkError)
  }
}

function handleForceLogout() {
  console.warn("Session expired. Redirecting to login...")
  window.location.href = '/login'
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
}
