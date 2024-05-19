import { AxiosResponse } from "axios";
import { Category } from "../services/category";
import { CategoryType } from "../types/category.type";

export default class Categories {
    private categoriesIncome: CategoryType[] = [];
    private categoriesExpense: CategoryType[] = [];

    constructor() {
        this.init();
    }

    private async init(): Promise<void> {
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

    public getCategories(type: 'income' | 'expense'): CategoryType[] {
        this.init();
        if (type === "income") {
            return this.categoriesIncome
        } else {
            return this.categoriesExpense
        }
    }
}