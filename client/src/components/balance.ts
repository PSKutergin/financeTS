import { Operation } from "../services/operation";
import { formatDate } from "../helpers/helpers";
import Calendar from "./calendar";
import { OperationsResponseType } from "../types/response.type";
import { AxiosResponse } from "axios";
import { CategoryType } from "../types/category.type";
import { Category } from "../services/category";

export class Balance {
    public idCategory: string | undefined = undefined;
    private query: string | null = null;
    private dateFrom: string | null = null;
    private dateTo: string | null = null;
    private filterBtns: NodeListOf<HTMLElement> | null = null;
    private dateIntervalContainer: HTMLElement | null = null;
    private contentTable: HTMLElement | null = null;
    private contentTableBody: HTMLElement | null = null;
    private contentNoOperations: HTMLElement | null = null;
    private popup: HTMLElement | null = null;
    private createIncomeBtn: HTMLElement | null = null;
    private createExpenseBtn: HTMLElement | null = null;
    private errorMessage: HTMLElement | null = null;
    private inputDateFrom: HTMLInputElement | null = null;
    private inputDateTo: HTMLInputElement | null = null;
    private calendarBoxFrom: HTMLElement | null = null;
    private calendarBoxTo: HTMLElement | null = null;
    private currentCalendarFrom: Calendar | null = null;
    private currentCalendarTo: Calendar | null = null;
    private deleteCategoriesBtns: NodeListOf<HTMLElement> | null = null;
    private editCategoriesBtns: NodeListOf<HTMLElement> | null = null;
    private handleInput: (e: Event) => void = (e: Event) => { e.preventDefault() };
    private categoriesIncome: CategoryType[] = [];
    private categoriesExpense: CategoryType[] = [];

    constructor() {
        this.init();
    }

    private init(): void {
        this.getCategories();

        this.filterBtns = document.querySelectorAll('.content__nav-item');
        this.dateIntervalContainer = document.getElementById('dateInterval');
        this.contentTable = document.querySelector('.content__table');
        this.contentTableBody = document.querySelector('.content__table-body');
        this.contentNoOperations = document.querySelector('.content__no-operations');
        this.popup = document.querySelector('.content__popup');
        this.errorMessage = document.querySelector('.date-error');
        this.inputDateFrom = document.getElementById('dateFrom') as HTMLInputElement;
        this.inputDateTo = document.getElementById('dateTo') as HTMLInputElement;
        this.calendarBoxFrom = document.getElementById('calendarFrom');
        this.calendarBoxTo = document.getElementById('calendarTo');

        if (this.filterBtns) {
            this.filterBtns.forEach((btn: HTMLElement) => {
                btn.addEventListener('click', (e: Event) => {
                    const target: HTMLElement = e.target as HTMLElement;
                    target.classList.add('active');

                    this.query = target.id;
                    if (this.query === 'interval') {
                        this.isOpenDateIntervalContainer();
                        if (this.contentTableBody) this.contentTableBody.innerHTML = '';
                        this.contentNoOperations && this.contentNoOperations.classList.remove('hide');
                        this.contentTable && this.contentTable.classList.add('hide');
                    } else {
                        this.isCloseDateIntervalContainer();
                        this.getOperations(this.query)
                    }

                    this.filterBtns && this.filterBtns.forEach((item: HTMLElement) => {
                        if (item !== e.target) {
                            item.classList.remove('active');
                        }
                    })
                })
            })
        }



        if (this.popup) {
            this.popup.addEventListener('click', (e: Event) => {
                const target: HTMLElement = e.target as HTMLElement;
                if (target.closest('.popup__btn-cancel')) {
                    (this.popup as HTMLElement).classList.remove('open');
                }

                if (target.closest('.popup__btn-delete')) {
                    this.deleteOperation();
                    (this.popup as HTMLElement).classList.remove('open');
                }
            })
        }

        if (this.inputDateFrom && this.inputDateTo && this.calendarBoxFrom && this.calendarBoxTo && this.errorMessage) {
            this.currentCalendarFrom = new Calendar(this.calendarBoxFrom, this.inputDateFrom);
            this.currentCalendarTo = new Calendar(this.calendarBoxTo, this.inputDateTo);
            this.initInputs();
        }

        this.getOperations();
    }

    private initInputs(): void {
        this.handleInput = (e: Event) => {
            const target: HTMLInputElement = e.target as HTMLInputElement
            this.inputDateFrom && this.inputDateFrom.removeEventListener('change', this.handleInput)
            this.inputDateTo && this.inputDateTo.removeEventListener('change', this.handleInput)

            if (target.id === 'dateFrom') this.dateFrom = target.value;
            if (target.id === 'dateTo') this.dateTo = target.value;

            if (this.dateFrom && this.dateTo) {
                if (this.dateFrom <= this.dateTo) {
                    this.getOperations(this.query, this.dateFrom, this.dateTo);
                } else {
                    this.showErrorDate()
                }
            }
        }

        if (this.inputDateFrom && this.inputDateTo) {
            this.inputDateFrom.addEventListener('click', () => {
                this.hideErrorDate();
                (this.inputDateFrom as HTMLInputElement).removeEventListener('change', this.handleInput);
                (this.inputDateFrom as HTMLInputElement).addEventListener('change', this.handleInput);
                (this.currentCalendarFrom as Calendar).showCalendar();
            })
            this.inputDateTo.addEventListener('click', () => {
                this.hideErrorDate();
                (this.inputDateTo as HTMLInputElement).removeEventListener('change', this.handleInput);
                (this.inputDateTo as HTMLInputElement).addEventListener('change', this.handleInput);
                (this.currentCalendarTo as Calendar).showCalendar();
            })
        }

        document.addEventListener('click', (e: Event) => {
            const target: HTMLElement = e.target as HTMLElement
            if (target !== this.inputDateFrom && !target.closest('#prevMonth') && !target.closest('#nextMonth')) {
                (this.calendarBoxFrom as HTMLElement).classList.remove('open');
            }
            if (target !== this.inputDateTo && !target.closest('#prevMonth') && !target.closest('#nextMonth')) {
                (this.calendarBoxTo as HTMLElement).classList.remove('open');
            }
        });
    }

    private renderTable(data: OperationsResponseType[]): void {
        if (this.contentTable && this.contentNoOperations && this.contentTableBody) {
            if (data.length) {
                this.contentNoOperations.classList.add('hide');
                this.contentTable.classList.remove('hide');
                this.contentTableBody.innerHTML = '';

                data.sort((a: OperationsResponseType, b: OperationsResponseType) => new Date(a.date).getTime() - new Date(b.date).getTime())
                    .forEach((item: OperationsResponseType, index: number) => {
                        (this.contentTableBody as HTMLElement).insertAdjacentHTML('beforeend', `
                            <tr data-id="${item.id}">
                                <td class="content__table-body-item">${index + 1}</td>
                                <td class="content__table-body-item" style="color: ${item.type === 'income' ? '#198754' : '#dc3545'};">${item.type === 'income' ? 'доход' : 'расход'}</td>
                                <td class="content__table-body-item">${item.category}</td>
                                <td class="content__table-body-item">${item.amount.toLocaleString()}&nbsp;$</td>
                                <td class="content__table-body-item">${formatDate(item.date)}</td>
                                <td class="content__table-body-item">${item.comment}</td>
                                <td class="content__table-body-item">
                                    <button class="btn-delete"><img src="/images/delete.svg" alt="delete"></button>
                                    <button class="btn-edit"><img src="/images/edit.svg" alt="edit"></button>
                                </td>
                            </tr>
                        `)
                    })

                this.initBtns();
            } else {
                this.contentNoOperations.classList.remove('hide');
                this.contentTable.classList.add('hide');
            }
        }
    }

    private initMainBtns(): void {
        this.createIncomeBtn = document.querySelector('.content__button-income');
        this.createExpenseBtn = document.querySelector('.content__button-expense');

        if (this.createIncomeBtn && this.createExpenseBtn) {
            if (this.categoriesIncome.length === 0) {
                this.createIncomeBtn.setAttribute('disabled', 'disabled');
            } else {
                this.createIncomeBtn.removeAttribute('disabled');
            }

            if (this.categoriesExpense.length === 0) {
                this.createExpenseBtn.setAttribute('disabled', 'disabled');
            } else {
                this.createExpenseBtn.removeAttribute('disabled');
            }

            this.createIncomeBtn.addEventListener('click', () => {
                window.currentType.setType('income');
                window.location.hash = `#/new-operation`
            })

            this.createExpenseBtn.addEventListener('click', () => {
                window.currentType.setType('expense');
                window.location.hash = `#/new-operation`
            })
        }
    }

    private initBtns(): void {
        this.deleteCategoriesBtns = document.querySelectorAll('.btn-delete');
        this.editCategoriesBtns = document.querySelectorAll('.btn-edit');

        this.deleteCategoriesBtns.forEach((btn: HTMLElement) => {
            btn.addEventListener('click', (e: Event) => {
                const target: HTMLElement = e.target as HTMLElement;
                const closestItem = target.closest('tr');
                if (closestItem instanceof HTMLElement) {
                    this.idCategory = closestItem.dataset.id;
                    (this.popup as HTMLElement).classList.add('open');
                }
            })
        })

        this.editCategoriesBtns.forEach((btn: HTMLElement) => {
            btn.addEventListener('click', async (e: Event) => {
                const target: HTMLElement = e.target as HTMLElement;
                const closestItem = target.closest('tr');
                if (closestItem instanceof HTMLElement) {
                    try {
                        const id: string | undefined = closestItem.dataset.id
                        await Operation.getOperation(id as string).then(respons => {
                            window.currentType.setType(respons.data.type);
                            window.location.hash = `#/edit-operation/${id}`
                        })
                    } catch (error) {
                        console.log(error);
                    }
                }
            })
        })
    }

    private async getCategories(): Promise<void> {
        try {
            const [incomeRes, expenseRes]: [AxiosResponse, AxiosResponse] = await Promise.all([
                Category.getCategories("income"),
                Category.getCategories("expense")
            ]);
            this.categoriesIncome = incomeRes.data;
            this.categoriesExpense = expenseRes.data;
            this.initMainBtns();
        } catch (error) {
            console.error("Ошибка при загрузке категорий:", error);
            return
        }
    }

    private async getOperations(interval: string | null = null, dateFrom: string | null = null, dateTo: string | null = null): Promise<any> {
        try {
            let respons: AxiosResponse;
            if (interval && dateFrom && dateTo) {
                respons = await Operation.getOperations(interval, dateFrom, dateTo);
            } else if (interval && !dateFrom && !dateTo) {
                respons = await Operation.getOperations(interval);
            } else {
                respons = await Operation.getOperations();
            }
            this.renderTable(respons.data as OperationsResponseType[]);
        } catch (error) {
            console.log("Ошибка при получении операций:", error);
            return
        }

    }

    private async deleteOperation(): Promise<void> {
        try {
            const respons = await Operation.deleteOperation(this.idCategory as string);
            if (respons.status === 200) {
                this.getOperations(this.query);
            }
        } catch (error) {
            console.log(error);
        }
    }

    isOpenDateIntervalContainer() {
        if (this.dateIntervalContainer) this.dateIntervalContainer.classList.add('open');
    }

    isCloseDateIntervalContainer() {
        if (this.dateIntervalContainer && this.inputDateFrom && this.inputDateTo) {
            this.dateIntervalContainer.classList.remove('open');
            this.inputDateFrom.value = '';
            this.inputDateTo.value = '';
        }
    }

    showErrorDate() {
        if (this.errorMessage && this.inputDateFrom && this.inputDateTo) {
            this.errorMessage.classList.remove('hide');
            this.inputDateFrom.classList.add('error');
            this.inputDateTo.classList.add('error');
        }
    }

    private hideErrorDate(): void {
        if (this.errorMessage && this.inputDateFrom && this.inputDateTo) {
            this.errorMessage.classList.add('hide');
            this.inputDateFrom.classList.remove('error');
            this.inputDateTo.classList.remove('error');
        }
    }
}