import { getMe } from '../services/user/dashboard';
import { to } from '../lib/to';

type AuthListener = (state: AuthState) => void;

export interface AuthState {
  isLoggedIn: boolean;
  username: string | null;
  id: string | null;
}

class AuthStore {
  private state: AuthState = {
    isLoggedIn: false,
    username: null,
    id: null,
  };
  private listeners: AuthListener[] = [];

  getState(): AuthState {
    return this.state;
  }

  isLoggedIn(): boolean {
    return this.state.isLoggedIn;
  }

  getUsername(): string | null {
    return this.state.username;
  }

  getUserId(): string | null {
    return this.state.id;
  }

  setLoggedIn(username: string, id?: string): void {
    this.state = {
      isLoggedIn: true,
      username,
      id: id || this.state.id,
    };
    localStorage.setItem('username', username);
    if (id) localStorage.setItem('userId', id);
    this.notify();
  }

  setLoggedOut(): void {
    this.state = { isLoggedIn: false, username: null, id: null };
    localStorage.removeItem('username');
    localStorage.removeItem('userId');
    this.notify();
  }

  subscribe(listener: AuthListener): () => void {
    this.listeners.push(listener);
    listener(this.state);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private notify(): void {
    this.listeners.forEach((listener) => listener(this.state));
  }

  // サーバーから認証状態を確認
  async checkAuthStatus(): Promise<boolean> {
    // サーバーで最新情報を取得
    const [user, err] = await to(getMe());
    if (err || !user) {
      // サーバーで失敗した場合、localStorageから復元を試みる（オフライン対応など）
      const cachedUsername = localStorage.getItem('username');
      const cachedUserId = localStorage.getItem('userId');
      if (cachedUsername && cachedUserId) {
        this.state = {
          isLoggedIn: true,
          username: cachedUsername,
          id: cachedUserId,
        };
        this.notify();
        return true;
      }
      this.setLoggedOut();
      return false;
    }

    this.setLoggedIn(user.username, user.id);
    return true;
  }

  async getMe() {
    const [user, err] = await to(getMe());
    if (err || !user) return null;
    return user;
  }
}

export const authStore = new AuthStore();
