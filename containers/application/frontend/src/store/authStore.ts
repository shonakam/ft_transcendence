import { getMe } from '../services/user/dashboard';
import { to } from '../lib/to';

type AuthListener = (state: AuthState) => void;

export interface AuthState {
  isLoggedIn: boolean;
  username: string | null;
}

class AuthStore {
  private state: AuthState = {
    isLoggedIn: false,
    username: null,
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

  setLoggedIn(username: string): void {
    this.state = { isLoggedIn: true, username };
    localStorage.setItem('username', username);
    this.notify();
  }

  setLoggedOut(): void {
    this.state = { isLoggedIn: false, username: null };
    localStorage.removeItem('username');
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
    // まずlocalStorageをチェック
    const cachedUsername = localStorage.getItem('username');
    if (cachedUsername) {
      this.state = { isLoggedIn: true, username: cachedUsername };
      this.notify();
    }

    // サーバーで確認
    const [user, err] = await to(getMe());
    if (err || !user) {
      this.setLoggedOut();
      return false;
    }

    this.setLoggedIn(user.username);
    return true;
  }
}

export const authStore = new AuthStore();
