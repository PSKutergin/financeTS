import User from './store/user';
import { Auth } from './services/auth';
import { Form } from './components/form';
import { Sidebar } from './components/sidebar';
import { Main } from './components/main';
import { Balance } from './components/balance';
import { Categories } from './components/categories';
import { AddEditCategories } from './components/addEditCategories';
import { AddEditOperations } from './components/addEditOperations';
import { RouterType } from './types/router.type';

export class Router {
    private appElement: HTMLElement | null = null;
    private contentElement: HTMLElement | null = null;
    public titleElement: HTMLElement | null = null;
    private routes: RouterType[] = [];

    constructor() {
        this.appElement = document.getElementById('app');
        this.titleElement = document.getElementById('page-title');

        this.routes = [
            {
                route: '#/',
                template: 'pages/layout.html',
                load: () => {
                    new Sidebar(window.location.hash);
                }
            },
            {
                route: '#/signup',
                template: 'pages/signup.html',
                load: () => {
                    new Form('signup');
                }
            },
            {
                route: '#/login',
                template: 'pages/login.html',
                load: () => {
                    new Form('login');
                }
            },
            {
                route: '#/main',
                template: 'pages/main.html',
                load: () => {
                    new Main();
                }
            },
            {
                route: '#/categories-income',
                template: 'pages/categories.html',
                load: () => {
                    new Categories();
                }
            },
            {
                route: '#/categories-expense',
                template: 'pages/categories.html',
                load: () => {
                    new Categories();
                }
            },
            {
                route: '#/new-categories',
                template: 'pages/addEditCategories.html',
                load: () => {
                    new AddEditCategories('new');
                }
            },
            {
                route: '#/edit-categories/:id',
                template: 'pages/addEditCategories.html',
                load: () => {
                    new AddEditCategories('edit');
                }
            },
            {
                route: '#/new-operation',
                template: 'pages/addEditOperations.html',
                load: () => {
                    new AddEditOperations('new');
                }
            },
            {
                route: `#/edit-operation/:id`,
                template: 'pages/addEditOperations.html',
                load: () => {
                    new AddEditOperations('edit');
                }
            },
            {
                route: '#/balance',
                template: 'pages/balance.html',
                load: () => {
                    new Balance();
                }
            },
        ]
    }

    public async openRoute(): Promise<void> {
        const urlRoute: string = window.location.hash.split('?')[0];
        const newRoute: RouterType | undefined = this.routes.find(item => {
            const routePattern = item.route.replace(/:[^\s/]+/g, '[^\\s/]+');
            return new RegExp(`^${routePattern}$`).test(urlRoute);
        });
        const token: string | null = Auth.getToken(Auth.accessTokenKey);

        if (!newRoute || urlRoute === '#/') {
            window.location.hash = '#/login';
            return;
        };

        if (token && urlRoute === '#/signup') {
            window.location.hash = '#/main';
            return;
        }

        if (urlRoute === '#/signup' || urlRoute === '#/login') {
            this.fetchApp(newRoute)
            return;
        }

        if (token) {
            this.fetchApp(this.routes.find(item => item.route === '#/'), newRoute);
            this.fetchPages(newRoute);
            return;
        } else {
            User.removeUser();
            Auth.removeTokens();
            window.location.hash = '#/login';
            return;
        }
    }

    private async fetchApp(route: RouterType | undefined, internalRoute: RouterType | null = null): Promise<void> {
        const res: Response = await fetch((route as RouterType).template);

        if (this.appElement) {
            this.appElement.innerHTML = await res.text()
            await (route as RouterType).load();
            if (internalRoute) {
                this.fetchPages(internalRoute);
            }
        }
    }

    private async fetchPages(route: RouterType): Promise<void> {
        this.contentElement = document.getElementById('content');
        if (!this.contentElement) {
            return;
        }
        const res: Response = await fetch(route.template);
        this.contentElement.innerHTML = await res.text()
        await route.load();
    }
}