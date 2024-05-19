import { AxiosResponse } from 'axios';
import { Operation } from '../services/operation';
import { CategoryType } from '../types/category.type';
import Calendar from './calendar';
import { OperationsResponseType } from '../types/response.type';
import { OperationType } from '../types/operation.type';
import { Category } from '../services/category';

export class AddEditOperations {
    private idOperation: string | null = null
    private currentType: string | null = null
    private contentTitle: HTMLElement | null = null
    private contentBtn: HTMLElement | null = null
    private contentBtnCnl: HTMLElement | null = null
    private contentForm: HTMLFormElement | null = null
    private typeSelect: HTMLSelectElement | null = null
    private categorySelect: HTMLSelectElement | null = null
    private inputAmount: HTMLInputElement | null = null
    private inputDate: HTMLInputElement | null = null
    private calendar: HTMLElement | null = null
    private currentCalendar: Calendar | null = null
    private categoriesList: CategoryType[] = []
    private categoriesIncome: CategoryType[] = []
    private categoriesExpense: CategoryType[] = []
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
        this.contentBtn = document.querySelector('.content__button');
        this.contentBtnCnl = document.querySelector('.content__button-cancel');
        this.contentForm = document.querySelector('.content__form');
        this.typeSelect = document.getElementById('type') as HTMLSelectElement;
        this.categorySelect = document.getElementById('category_id') as HTMLSelectElement;
        this.inputAmount = document.getElementById('amount') as HTMLInputElement;
        this.inputDate = document.getElementById('date') as HTMLInputElement;
        this.calendar = document.getElementById('calendar');

        this.getCategories().then(() => {
            this.renderCategoriesSelect(this.currentType as 'income' | 'expense');
        })

        if (this.contentTitle && this.contentBtn) {
            if (this.mode === 'edit') {
                this.idOperation = window.location.hash.split('/')[2];
                this.title = 'Редактирование дохода/расхода';
                this.textBtn = 'Сохранить';

                try {
                    this.getOperationFromApi();
                } catch (error) {
                    console.log(error);
                }
            } else if (this.mode === 'new') {
                this.title = 'Создание дохода/расхода';
                this.textBtn = 'Создать';
                this.typeSelect.value = (this.currentType as string);
                this.renderCategoriesSelect(this.typeSelect.value as 'income' | 'expense');
            }

            this.contentTitle.textContent = this.title;
            this.contentBtn.textContent = this.textBtn;
        }

        if (this.contentBtnCnl && this.contentBtn) {
            this.initButtons();
        }

        if (this.inputDate && this.calendar && this.inputAmount) {
            this.currentCalendar = new Calendar(this.calendar, this.inputDate);
            this.initInputs();
        }

        if (this.typeSelect) {
            this.typeSelect.addEventListener('change', (e: Event) => {
                const target: HTMLSelectElement = e.target as HTMLSelectElement;
                this.renderCategoriesSelect(target.value as 'income' | 'expense');
            })
        }
    }

    private initButtons(): void {
        if (this.contentBtn && this.contentBtnCnl) {
            this.contentBtn.addEventListener('click', () => {
                if (this.mode === 'edit') {
                    this.editOperation();
                } else if (this.mode === 'new') {
                    this.addOperation();
                }
            })

            this.contentBtnCnl.addEventListener('click', () => {
                window.location.hash = `#/balance`;
            })
        }
    }

    private initInputs(): void {
        if (this.inputDate && this.inputAmount) {
            this.inputDate.addEventListener('click', () => {
                (this.currentCalendar as Calendar).showCalendar();
            })

            document.addEventListener('click', (e: Event) => {
                const target: HTMLInputElement = e.target as HTMLInputElement
                if (target !== this.inputDate && !target.closest('#prevMonth') && !target.closest('#nextMonth')) {
                    (this.calendar as HTMLElement).classList.remove('open');
                }
            });

            this.inputAmount.addEventListener('input', (e: Event) => {
                const target: HTMLInputElement = e.target as HTMLInputElement
                let value: string = target.value;
                value = value.replace(/[^\d.]/g, '');
                if (!/^\d*\.?\d*$/.test(value)) {
                    value = value.slice(0, -1);
                }
                target.value = value;
            });
        }
    }

    private async getCategories(): Promise<void> {
        try {
            const [incomeRes, expenseRes]: [AxiosResponse, AxiosResponse] = await Promise.all([
                Category.getCategories("income") as Promise<AxiosResponse>,
                Category.getCategories("expense") as Promise<AxiosResponse>
            ]);
            this.categoriesIncome = incomeRes.data;
            this.categoriesExpense = expenseRes.data;
        } catch (error) {
            console.error("Ошибка при загрузке категорий:", error);
            return
        }
    }

    private renderCategoriesSelect(type: 'income' | 'expense'): void {
        (this.categorySelect as HTMLSelectElement).innerHTML = '';
        if (type === 'income') {
            this.categoriesList = this.categoriesIncome;
        } else if (type === 'expense') {
            this.categoriesList = this.categoriesExpense;
        }

        const option: HTMLOptionElement = document.createElement('option');
        option.value = '';
        option.textContent = 'Категория...';
        option.disabled = true;
        option.selected = true;
        (this.categorySelect as HTMLSelectElement).appendChild(option);

        if (this.categorySelect) {
            this.categoriesList.forEach((category: CategoryType) => {
                const option: HTMLOptionElement = document.createElement('option');
                option.value = category.id as unknown as string;
                option.textContent = category.title;
                (this.categorySelect as HTMLSelectElement).appendChild(option);
            })
        }
    }

    private async getOperationFromApi(): Promise<void> {
        const res: AxiosResponse = await Operation.getOperation(this.idOperation as string) as AxiosResponse;
        const operationData: OperationsResponseType = res.data;
        this.currentType = operationData.type;

        this.renderCategoriesSelect(this.currentType as 'income' | 'expense');

        if (this.contentForm) {
            Array.from(this.contentForm.elements).forEach((elem): void => {
                if (elem instanceof HTMLInputElement || elem instanceof HTMLSelectElement) {
                    Object.keys(operationData as OperationsResponseType)
                        .forEach((item: string): void => {
                            if (elem.name === 'category_id' && operationData.category) {
                                const categoryId: number | undefined = this.categoriesList.find((el: CategoryType) => el.title === operationData.category)?.id;
                                if (categoryId !== undefined) {
                                    (elem as HTMLSelectElement).value = categoryId.toString();
                                }
                            } else if (elem.name === item) {
                                elem.value = operationData[item as keyof OperationsResponseType].toString();
                            }
                        });
                }
            });
        }
    }

    private async editOperation(): Promise<void> {
        const formData: FormData = new FormData(this.contentForm as HTMLFormElement);
        const amount: string | null = (formData as any).get('amount');
        const category_id: string | null = (formData as any).get('category_id');
        const parsedAmount: number = amount ? parseFloat(amount) : 0;
        const parsedCategoryId: number = category_id ? parseInt(category_id) : 0;
        const operationData: OperationType = {
            type: formData.get('type') as string,
            date: formData.get('date') as string,
            comment: formData.get('comment') as string,
            amount: parsedAmount,
            category_id: parsedCategoryId
        }
        try {
            await Operation.editOperation(this.idOperation as string, operationData as OperationType);
            window.location.hash = `#/balance`;
        } catch (error) {
            console.log(error);
        }
    }

    private async addOperation(): Promise<void> {
        const formData: FormData = new FormData(this.contentForm as HTMLFormElement);
        const amount: string | null = (formData as any).get('amount');
        const category_id: string | null = (formData as any).get('category_id');
        const parsedAmount: number = amount ? parseFloat(amount) : 0;
        const parsedCategoryId: number = category_id ? parseInt(category_id) : 0;
        const operationData: OperationType = {
            type: formData.get('type') as string,
            date: formData.get('date') as string,
            comment: formData.get('comment') as string,
            amount: parsedAmount,
            category_id: parsedCategoryId
        }

        try {
            await Operation.setOperations(operationData as OperationType);
            window.location.hash = `#/balance`;
        } catch (error) {
            console.log(error);
        }
    }
}