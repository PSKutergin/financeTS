import instance from "../api/interceptor";

export class Category {
    public static async getCategories(type: string): Promise<any> {
        return instance.get(`api/categories/${type}`)
    }

    public static async setCategories(type: string, title: string): Promise<any> {
        return instance.post(`api/categories/${type}`, { title })
    }

    public static async getCategory(type: string, id: string): Promise<any> {
        return instance.get(`api/categories/${type}/${id}`)
    }

    public static async editCategory(type: string, id: string, title: string): Promise<any> {
        return instance.put(`api/categories/${type}/${id}`, { title })
    }

    public static async deleteCategory(type: string, id: string): Promise<any> {
        return instance.delete(`api/categories/${type}/${id}`)
    }
}