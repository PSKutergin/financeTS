import './assets/scss/index.scss';
import { Router } from "./router";
import CurrentType from './store/currentType';
// import Categories from './store/categories';

declare global {
    interface Window {
        currentType: CurrentType;
        // categories: Categories;
    }
}

class App {
    private router: Router;
    constructor() {
        this.router = new Router();
        this.init();
    }

    private init(): void {
        window.addEventListener('DOMContentLoaded', this.handleRouteChanging.bind(this));
        window.addEventListener('popstate', this.handleRouteChanging.bind(this))

        window.currentType = new CurrentType();
        // window.categories = new Categories();
    }

    handleRouteChanging(): void {
        this.router.openRoute();
    }
};

(new App());