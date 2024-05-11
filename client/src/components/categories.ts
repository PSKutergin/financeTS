import { Category } from "../services/category";
import { CategoryType } from "../types/category.type";

export class Categories {
    public idCategory: string | undefined = undefined;
    public type: string | null = null;
    public titleCategory: HTMLElement | null = null;
    public contentCategories: HTMLElement | null = null;
    public popup: HTMLElement | null = null;
    public createBtn: HTMLElement | null = null;
    public editBtns: NodeListOf<HTMLElement> | null = null;
    public deleteBtns: NodeListOf<HTMLElement> | null = null;

    constructor() {
        this.init();
    }
    private init(): void {
        this.type = window.currentType.getType()
        this.titleCategory = document.querySelector('.content__title');
        this.contentCategories = document.querySelector('.content__categories');
        this.popup = document.querySelector('.content__popup');

        if (this.popup) {
            this.popup.addEventListener('click', (e) => {
                if ((e.target as HTMLElement).closest('.popup__btn-cancel')) (this.popup as HTMLElement).classList.remove('open');

                if ((e.target as HTMLElement).closest('.popup__btn-delete')) {
                    this.deleteCategory();
                    (this.popup as HTMLElement).classList.remove('open');
                }
            })
        }

        this.getCategoriesFromApi();
    }

    private async getCategoriesFromApi(): Promise<void> {
        try {
            if (this.titleCategory && this.contentCategories) {
                await Category.getCategories((this.type as string))
                    .then(res => this.renderCategories(res.data))
                    .catch(error => {
                        console.log(error);
                    })
            }
        } catch (error) {
            console.log(error);
        }
    }

    private renderCategories(categories = []): void {
        if (this.titleCategory && this.contentCategories) {
            this.titleCategory.textContent = this.type === 'income' ? 'Доходы' : this.type === 'expense' ? 'Расходы' : '';
            this.contentCategories.innerHTML = '';

            categories.forEach((item: CategoryType) => {
                (this.contentCategories as HTMLElement).insertAdjacentHTML('beforeend',
                    `
                    <li class="content__categories-item" data-id=${item.id}>
                        <h3 class="content__categories-item-title">${item.title}</h3>
                        <section class="content__categories-item-btn-wrapper">
                            <button class="content__categories-item-btn edit">Редактировать</button>
                            <button class="content__categories-item-btn delete">Удалить</button>
                        </section>
                    </li>
                `
                )
            });

            this.contentCategories.insertAdjacentHTML('beforeend',
                `
                <li class="content__categories-item new-item">
                    <span>+</span>
                </li>
            `
            );

            this.initButtons();
        }
    }

    private initButtons(): void {
        this.createBtn = document.querySelector('.new-item');
        this.editBtns = document.querySelectorAll('.edit');
        this.deleteBtns = document.querySelectorAll('.delete');

        if (this.createBtn && this.editBtns && this.deleteBtns) {
            this.editBtns.forEach((btn: HTMLElement) => {
                btn.addEventListener('click', (e: Event) => {
                    const target = e.target as HTMLElement;
                    const closestItem = target.closest('.content__categories-item') as HTMLElement | null;
                    if (closestItem) {
                        const id: string | undefined = closestItem.dataset.id;
                        if (id) {
                            window.location.hash = `#/edit-categories/${id}`;
                        }
                    }
                })
            })

            this.deleteBtns.forEach((btn: HTMLElement) => {
                btn.addEventListener('click', (e: Event) => {
                    const target = e.target as HTMLElement;
                    const closestItem = target.closest('.content__categories-item');
                    if (closestItem instanceof HTMLElement) {
                        this.idCategory = closestItem.dataset.id;
                        this.popup && this.popup.classList.add('open');
                    }
                })
            })

            this.createBtn.addEventListener('click', (e: Event) => {
                e.preventDefault();
                window.location.hash = '#/new-categories'
            })
        }
    }

    private async deleteCategory(): Promise<void> {
        try {
            if (this.type && this.idCategory) {
                await Category.deleteCategory(this.type, this.idCategory)
                this.getCategoriesFromApi();
            }
        } catch (error) {
            console.log(error);
        }
    }
}