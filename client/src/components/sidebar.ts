import User from "../store/user";
import { Balance } from '../services/balance'
import { AxiosResponse } from "axios";

export class Sidebar {
    private page: string = '';
    private layout: HTMLElement | null = null;
    private navList: HTMLElement | null = null;
    private navSubList: HTMLElement | null = null;
    private navItems: NodeListOf<HTMLElement> | null = null;
    private navItemsSub: NodeListOf<HTMLElement> | null = null;
    private categoriesItem: HTMLElement | null = null;
    private balanceElem: HTMLElement | null = null;
    private btnLogOut: HTMLElement | null = null;
    private userName: HTMLElement | null = null;

    constructor(page: string) {
        this.page = page.split('#/')[1];
        this.init();
    }

    private async init(): Promise<void> {
        this.layout = document.querySelector('.layout');
        this.navList = document.querySelector('.sidebar__list');
        this.navSubList = document.querySelector('.sidebar__sublist');
        this.navItems = document.querySelectorAll('.sidebar__item');
        this.navItemsSub = document.querySelectorAll('.sidebar__sublist-item');
        this.categoriesItem = document.querySelector('.sidebar__item--categories');
        this.balanceElem = document.getElementById('balance-value')
        this.btnLogOut = document.querySelector('.sidebar__user-logout');

        this.userName = document.getElementById('userName');
        if (this.userName) this.userName.textContent = User.getFullName();

        const currentType: string | null = window.currentType.getType();

        this.navItemsSub.forEach(item => {
            if (item.dataset.hash === this.page) item.classList.add('active');
            else item.classList.remove('active');

            if (this.categoriesItem) this.categoriesItem.setAttribute('data-hash', `categories-${currentType}`);
        })

        this.navItemsSub.forEach((item: HTMLElement) => {
            if (((item as HTMLElement).dataset.hash as string).split('-')[1] === currentType) item.classList.add('active');
            else item.classList.remove('active');
        })

        this.navItems.forEach(item => {
            if (item.dataset.hash === this.page) item.classList.add('active');
            else item.classList.remove('active');
        });

        if (this.page.includes('categories') || this.page.includes('operation')) {
            if (this.categoriesItem) this.categoriesItem.classList.add('active');
            if (this.navSubList) this.navSubList.classList.add('open');
        } else {
            if (this.navSubList) this.navSubList.classList.remove('open');
        }

        if (this.navList) {
            this.navList.addEventListener('click', (e) => {
                if (e.target instanceof HTMLElement) {
                    if (e.target.closest('.sidebar__item')) {
                        if (e.target.closest('.sidebar__item--categories')) {
                            (e.target.closest('.sidebar__item--categories') as HTMLElement).classList.add('active');
                            if (this.navSubList) this.navSubList.classList.add('open');

                            const link: HTMLElement | null = e.target.closest('.sidebar__item--categories');
                            window.location.hash = `#/${(link as HTMLElement).dataset.hash}`
                        } else {
                            const link: HTMLElement | null = e.target.closest('.sidebar__item');
                            window.location.hash = `#/${(link as HTMLElement).dataset.hash}`
                        }
                    }

                    if (e.target.closest('.sidebar__sublist-item')) {
                        const link: HTMLElement | null = e.target.closest('.sidebar__sublist-item');
                        window.currentType.setType(((link as HTMLElement).dataset.hash as string).split('-')[1]);
                        window.location.hash = `#/${(link as HTMLElement).dataset.hash}`
                    }
                }
            })
        }

        if (this.layout) {
            this.layout.addEventListener('click', (e) => {
                if ((e.target as HTMLElement).closest('.sidebar__user')) {
                    if (this.btnLogOut) this.btnLogOut.classList.toggle('hidden');
                }

                if ((e.target as HTMLElement).closest('.sidebar__user-logout')) {
                    User.logout();
                    window.location.hash = '#/login';
                }
            })
        }

        this.getBalanceFromApi();
    }

    private async getBalanceFromApi(): Promise<void> {
        try {
            const res: AxiosResponse = await Balance.getBalance()

            if (this.balanceElem) this.balanceElem.textContent = `${res.data.balance.toLocaleString()} $`
        } catch (error) {
            console.log(error);
        }
    }
}