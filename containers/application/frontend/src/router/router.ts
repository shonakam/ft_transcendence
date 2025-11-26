import { routes } from './routes';
import { Header } from '../components/organisms/Header';

// アプリケーションがマウントされるルート要素を特定
const APP_ROOT_ID = 'app-root';

export class Router {
    private appRoot: HTMLElement;

    constructor() {
        const root = document.getElementById(APP_ROOT_ID);
        if (!root)
            throw new Error(`Root element with ID '${APP_ROOT_ID}' not found.`);
        this.appRoot = root;
        this.initListeners();
        this.renderInitialStructure();
        this.renderContent();
    }

    public navigateTo(url: string) {
        history.pushState(null, '', url);
        this.renderContent();
    }

    private renderContent() {
        const path = window.location.pathname;
        const PageComponent = routes[path] || routes['/'];
        const oldContent = this.appRoot.querySelector('main');
        if (oldContent) {
            this.appRoot.removeChild(oldContent);
        }
        const newPageElement = PageComponent().getElement();
        this.appRoot.appendChild(newPageElement);
    }

    private renderInitialStructure() {
        const header = new Header().getElement();
        this.appRoot.prepend(header);
    }

    private initListeners() {
        document.body.addEventListener('click', e => {
            const target = e.target as HTMLAnchorElement;
            if (target && target.matches('a[href]')) {
                e.preventDefault();
                this.navigateTo(target.href);
            }
        });

        window.addEventListener('popstate', () => this.renderContent());
    }
}
