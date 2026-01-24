import { routes } from './routes';
import { Header } from '../components/Header/Header';
import { Component } from 'src/interface/Component';
import { authStore } from '../store/authStore';

const APP_ROOT_ID = 'app-root'; // アプリケーションがマウントされるルート要素を特定

// 認証が必要なパス
const protectedPaths = ['/game/remote', '/dashboard', '/chat'];

export class Router {
  private static instance: Router;
  private appRoot!: HTMLElement;
  private currentPageComponent: Component | null = null;

  constructor() {
    if (Router.instance) return Router.instance;
    const root = document.getElementById(APP_ROOT_ID);
    if (!root)
      throw new Error(`Root element with ID '${APP_ROOT_ID}' not found.`);
    this.appRoot = root;
    this.initListeners();
    this.renderInitialStructure();
    this.renderContent();
    Router.instance = this;
  }

  public static getInstance(): Router {
    if (!Router.instance) Router.instance = new Router();
    return Router.instance;
  }

  public navigateTo(url: string) {
    // const path = new URL(url, window.location.origin).pathname
    // history.pushState(null, '', path)
    const targetUrl = new URL(url, window.location.origin);
    const fullPath = targetUrl.pathname + targetUrl.search;
    history.pushState(null, '', fullPath);
    this.renderContent();
  }

  private renderInitialStructure() {
    if (this.appRoot.querySelector('header')) return;
    const header = new Header().getElement();
    this.appRoot.prepend(header);
  }

  private renderContent() {
    const path = window.location.pathname;
    let normalizedPath = path.replace(/\/+$/, '');
    let PageComponent: Component | undefined;
    if (normalizedPath === '' || normalizedPath === '/') {
      history.replaceState(null, '', '/home');
      normalizedPath = '/home';
    }

    // 認証が必要なパスにアクセスした場合、ログインしていなければリダイレクト
    if (protectedPaths.includes(normalizedPath) && !authStore.isLoggedIn()) {
      history.replaceState(null, '', '/auth?view=login');
      normalizedPath = '/auth';
    }

    PageComponent = routes[normalizedPath]();
    if (PageComponent === undefined) {
      history.replaceState(null, '', '/404');
      PageComponent = routes['/404']();
    }
    if (this.currentPageComponent) this.currentPageComponent.destroy();
    this.currentPageComponent = PageComponent;
    if (PageComponent) {
      const newPageElement: HTMLElement = PageComponent.getElement();
      this.appRoot.appendChild(newPageElement);
    }
  }

  private initListeners() {
    document.body.addEventListener('click', (e) => {
      const target = e.target as HTMLAnchorElement;
      if (target && target.matches('a[href]')) {
        e.preventDefault();
        this.navigateTo(target.href);
      }
    });

    window.addEventListener('popstate', () => this.renderContent());
  }
}

export const router = Router.getInstance();
