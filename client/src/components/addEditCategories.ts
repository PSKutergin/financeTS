import { AxiosResponse } from 'axios';
import { Category } from '../services/category';

export class AddEditCategories {
    private idCategory: string | undefined = undefined
    private currentType: string | null = null
    private contentTitle: HTMLElement | null = null
    private valueInput: HTMLInputElement | null = null
    private contentBtn: HTMLElement | null = null
    private contentBtnCnl: HTMLElement | null = null
    private title: string = ''
    private textBtn: string = ''
    private mode: string = ''

    constructor(mode: string) {
        this.mode = mode;
        this.init();
    }

    private init(): void {
        this.currentType = window.currentType.getType();
        this.contentTitle = document.querySelector('.content__title');
        this.valueInput = document.querySelector('.content__input');
        this.contentBtn = document.querySelector('.content__button');
        this.contentBtnCnl = document.querySelector('.content__button-cancel');

        if (this.contentTitle && this.contentBtn) {
            if (this.mode === 'edit') {
                this.idCategory = window.location.hash.split('/')[2];
                if (this.currentType === 'income') {
                    this.title = 'Редактирование категории доходов';
                } else if (this.currentType === 'expense') {
                    this.title = 'Редактирование категории расходов';
                }
                this.textBtn = 'Сохранить';
                try {
                    this.getCategoryFromApi();
                } catch (error) {
                    console.log(error);
                }
            } else if (this.mode === 'new') {
                if (this.currentType === 'income') {
                    this.title = 'Создание категории доходов';
                } else if (this.currentType === 'expense') {
                    this.title = 'Создание категории расходов';
                }
                this.textBtn = 'Создать';
            }

            this.contentTitle.textContent = this.title;
            this.contentBtn.textContent = this.textBtn;
        }

        if (this.contentBtnCnl && this.contentBtn) {
            this.initButtons();
        }
    }

    private initButtons(): void {
        if (this.contentBtn && this.contentBtnCnl) {
            this.contentBtn.addEventListener('click', () => {
                if (this.mode === 'edit') {
                    this.editCategory();
                } else if (this.mode === 'new') {
                    this.addCategory();
                }
            })

            this.contentBtnCnl.addEventListener('click', () => {
                window.location.hash = `#/categories-${this.currentType}`;
            })
        }
    }

    private async getCategoryFromApi(): Promise<void> {
        const res: AxiosResponse = await Category.getCategory((this.currentType as string), (this.idCategory as string)) as AxiosResponse;
        (this.valueInput as HTMLInputElement).value = res.data.title;
    }

    private async editCategory(): Promise<void> {
        const title: string = (this.valueInput as HTMLInputElement).value;
        try {
            await Category.editCategory((this.currentType as string), (this.idCategory as string), title);
            window.location.hash = `#/categories-${this.currentType}`;
        } catch (error) {
            console.log(error);
        }
    }

    private async addCategory(): Promise<void> {
        const title: string = (this.valueInput as HTMLInputElement).value;
        try {
            await Category.setCategories((this.currentType as string), title);
            window.location.hash = `#/categories-${this.currentType}`;
        } catch (error) {
            console.log(error);
        }
    }
}