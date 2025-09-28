// src/router/router.ts
import { routes } from './routes';

const rootElement = document.getElementById('app') as HTMLElement;

export function navigateTo(url: string) {
  history.pushState(null, '', url);
  renderContent();
}

export function renderContent() {
  const path = window.location.pathname;
  const pageComponent = routes[path] || routes['/'];

  if (rootElement) {
    rootElement.innerHTML = '';
    rootElement.appendChild(pageComponent());
  }
}

  document.addEventListener('DOMContentLoaded', () => {
    document.body.addEventListener('click', e => {
      const target = e.target as HTMLAnchorElement;
      if (target && target.matches('a')) {
        e.preventDefault();
        navigateTo(target.href);
      }
    });
    window.addEventListener('popstate', renderContent);
    renderContent();
});