import { routes } from './routes'
import { Header } from '../components/organisms/Header'

const APP_ROOT_ID = 'app-root' // アプリケーションがマウントされるルート要素を特定

export class Router {
    private static instance: Router;
    private appRoot!: HTMLElement;

    constructor() {
        if (Router.instance) return Router.instance
        const root = document.getElementById(APP_ROOT_ID)
        if (!root)
            throw new Error(`Root element with ID '${APP_ROOT_ID}' not found.`)
        this.appRoot = root
        this.initListeners()
        this.renderInitialStructure()
        this.renderContent()
        Router.instance = this
    }

    public static getInstance(): Router {
        if (!Router.instance) Router.instance = new Router()
        return Router.instance
    }

    public navigateTo(url: string) {
        const path = new URL(url, window.location.origin).pathname
        history.pushState(null, '', path)
        this.renderContent()
    }

    private renderContent() {
        const path = window.location.pathname;
        const PageComponent = routes[path] || routes['/'];
        let mainElement = this.appRoot.querySelector('main');
        if (!mainElement) {
            mainElement = document.createElement('main');
            this.appRoot.appendChild(mainElement);
        }
        mainElement.innerHTML = '';
        const pageInstance = PageComponent()
        mainElement.appendChild(pageInstance.getElement())
    }

    private renderInitialStructure() {
        if (this.appRoot.querySelector('header')) return
        const header = new Header().getElement()
        this.appRoot.prepend(header)
    }

    private initListeners() {
        document.body.addEventListener('click', e => {
            const target = e.target as HTMLAnchorElement
            if (target && target.matches('a[href]')) {
                e.preventDefault()
                this.navigateTo(target.href)
            }
        });

        window.addEventListener('popstate', () => this.renderContent())
    }
}

export const router = Router.getInstance()

