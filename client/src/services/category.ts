import { AxiosError, AxiosResponse } from "axios";
import instance from "../api/interceptor";

export class Category {
    public static async getCategories(type: string): Promise<AxiosResponse | AxiosError> {
        return instance.get(`api/categories/${type}`)
    }

    public static async setCategories(type: string, title: string): Promise<AxiosResponse | AxiosError> {
        return instance.post(`api/categories/${type}`, { title })
    }

    public static async getCategory(type: string, id: string): Promise<AxiosResponse | AxiosError> {
        return instance.get(`api/categories/${type}/${id}`)
    }

    public static async editCategory(type: string, id: string, title: string): Promise<AxiosResponse | AxiosError> {
        return instance.put(`api/categories/${type}/${id}`, { title })
    }

    public static async deleteCategory(type: string, id: string): Promise<AxiosResponse | AxiosError> {
        return instance.delete(`api/categories/${type}/${id}`)
    }
}