import { Header } from './components/organisms/header';

document.addEventListener('DOMContentLoaded', () => {
    const headerComponent = new Header();
    document.body.prepend(headerComponent.getElement());
});
