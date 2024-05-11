import { AxiosResponse } from 'axios';
import pieChart from '../modules/charts';
import { Operation } from "../services/operation";
import Calendar from "./calendar";
import { OperationsResponseType } from '../types/response.type';

export class Main {
    public query: string | null = null;
    public popup: HTMLElement | null = null
    private filterBtns: NodeListOf<HTMLElement> | null = null
    private dateIntervalContainer: HTMLElement | null = null
    private chartIncome: HTMLElement | null = null
    private chartExpense: HTMLElement | null = null
    private noIncome: HTMLElement | null = null
    private noExpense: HTMLElement | null = null
    private incomeChartElement: HTMLCanvasElement | null = null
    private expenseChartElement: HTMLCanvasElement | null = null
    private errorMessage: HTMLElement | null = null
    private inputDateFrom: HTMLInputElement | null = null
    private inputDateTo: HTMLInputElement | null = null
    private calendarBoxFrom: HTMLElement | null = null
    private calendarBoxTo: HTMLElement | null = null
    private currentCalendarFrom: Calendar | null = null
    private currentCalendarTo: Calendar | null = null
    private dateFrom: string | null = null
    private dateTo: string | null = null
    private incomeChart: any = null
    private expenseChart: any = null

    constructor() {
        this.init();
    }
    private init(): void {
        this.popup = document.querySelector('.content__popup');
        this.filterBtns = document.querySelectorAll('.content__nav-item');
        this.dateIntervalContainer = document.getElementById('dateInterval');
        this.chartIncome = document.getElementById('chart-income');
        this.chartExpense = document.getElementById('chart-expense');
        this.noIncome = document.getElementById('no-income');
        this.noExpense = document.getElementById('no-expense');
        this.incomeChartElement = document.getElementById('pie-chart-income') as HTMLCanvasElement;
        this.expenseChartElement = document.getElementById('pie-chart-expense') as HTMLCanvasElement;
        this.errorMessage = document.querySelector('.date-error');
        this.inputDateFrom = document.getElementById('dateFrom') as HTMLInputElement;
        this.inputDateTo = document.getElementById('dateTo') as HTMLInputElement;
        this.calendarBoxFrom = document.getElementById('calendarFrom');
        this.calendarBoxTo = document.getElementById('calendarTo');

        if (this.filterBtns) {
            this.filterBtns.forEach(btn => {
                btn.addEventListener('click', (e: Event) => {
                    (e.target as HTMLElement).classList.add('active');

                    this.query = (e.target as HTMLElement).id;
                    if (this.query === 'interval') {
                        this.isOpenDateIntervalContainer()
                        if (this.chartIncome && this.chartExpense && this.noIncome && this.noExpense) {
                            this.chartExpense.classList.add('hide');
                            this.noExpense.classList.remove('hide');
                            this.chartIncome.classList.add('hide');
                            this.noIncome.classList.remove('hide');
                        }
                    } else {
                        this.isCloseDateIntervalContainer();
                        this.getOperations(this.query)
                    }

                    if (this.filterBtns) this.filterBtns.forEach((item: HTMLElement) => {
                        if (item !== e.target) {
                            item.classList.remove('active');
                        }
                    })
                })
            })
        }

        if (this.incomeChartElement && this.expenseChartElement) {
            this.incomeChart = pieChart(this.incomeChartElement, 'Доходы', [], []);
            this.expenseChart = pieChart(this.expenseChartElement, 'Расходы', [], []);
        }

        if (this.inputDateFrom && this.inputDateTo && this.calendarBoxFrom && this.calendarBoxTo) {
            if (this.currentCalendarFrom && this.currentCalendarTo) {
                this.currentCalendarFrom = new Calendar(this.calendarBoxFrom, this.inputDateFrom);
                this.currentCalendarTo = new Calendar(this.calendarBoxTo, this.inputDateTo);
                this.initInputs();
            }
        }

        this.getOperations(this.query)
    }

    private isOpenDateIntervalContainer(): void {
        if (this.dateIntervalContainer) this.dateIntervalContainer.classList.add('open');
    }

    private isCloseDateIntervalContainer(): void {
        if (this.dateIntervalContainer) this.dateIntervalContainer.classList.remove('open');
        if (this.inputDateFrom) this.inputDateFrom.value = '';
        if (this.inputDateTo) this.inputDateTo.value = '';
    }

    private initInputs(): void {
        const handleInput: EventListener = (e: Event): void => {
            if (this.inputDateFrom && this.inputDateTo) {
                this.inputDateFrom.removeEventListener('change', handleInput)
                this.inputDateTo.removeEventListener('change', handleInput)

                const target = e.target as HTMLInputElement

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
        }

        if (this.inputDateFrom && this.inputDateTo) {
            this.inputDateFrom.addEventListener('click', () => {
                this.hideErrorDate();
                if (this.inputDateFrom) this.inputDateFrom.removeEventListener('change', handleInput)
                if (this.inputDateFrom) this.inputDateFrom.addEventListener('change', handleInput)
                if (this.currentCalendarFrom) this.currentCalendarFrom.showCalendar();
            })
            this.inputDateTo.addEventListener('click', () => {
                this.hideErrorDate();
                if (this.inputDateTo) this.inputDateTo.removeEventListener('change', handleInput)
                if (this.inputDateTo) this.inputDateTo.addEventListener('change', handleInput)
                if (this.currentCalendarTo) this.currentCalendarTo.showCalendar();
            })
        }

        document.addEventListener('click', (e: Event): void => {
            const target = e.target as HTMLElement;

            if (target !== this.inputDateFrom && !target.closest('#prevMonth') && !target.closest('#nextMonth')) {
                if (this.calendarBoxFrom) this.calendarBoxFrom.classList.remove('open');
            }
            if (target !== this.inputDateTo && !target.closest('#prevMonth') && !target.closest('#nextMonth')) {
                if (this.calendarBoxTo) this.calendarBoxTo.classList.remove('open');
            }
        });
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
            this.renderCharts(respons.data);
        } catch (error) {
            console.log(error);
        }
    }

    private renderCharts(data: OperationsResponseType[]): void {
        const { incomeValues, expenseValues } = data.reduce((acc, curr) => {
            const { type, category, amount } = curr;
            if (type === 'income') {
                acc.incomeValues.set(category, (acc.incomeValues.get(category) || 0) + amount);
            } else if (type === 'expense') {
                acc.expenseValues.set(category, (acc.expenseValues.get(category) || 0) + amount);
            }
            return acc;
        }, {
            incomeValues: new Map(),
            expenseValues: new Map(),
        });

        if (this.noIncome && this.incomeChart && this.chartIncome) {
            if ([...incomeValues.keys()].length) {
                this.chartIncome.classList.remove('hide');
                this.noIncome.classList.add('hide');
                this.incomeChart.data.labels = [...incomeValues.keys()];
                this.incomeChart.data.datasets[0].data = [...incomeValues.values()];
                this.incomeChart.update();
            } else {
                this.chartIncome.classList.add('hide');
                this.noIncome.classList.remove('hide');
            }
        }

        if (this.noExpense && this.expenseChart && this.chartExpense) {
            if ([...expenseValues.keys()].length) {
                this.chartExpense.classList.remove('hide');
                this.noExpense.classList.add('hide');
                this.expenseChart.data.labels = [...expenseValues.keys()];
                this.expenseChart.data.datasets[0].data = [...expenseValues.values()];
                this.expenseChart.update();
            } else {
                this.chartExpense.classList.add('hide');
                this.noExpense.classList.remove('hide');
            }
        }
    }

    private showErrorDate(): void {
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