import instance from "../api/interceptor";

export class Balance {
    public static async getBalance(): Promise<any> {
        return instance.get(`api/balance`)
    }

    public static async editBalance(newBalance: number): Promise<any> {
        return instance.put(`api/balance`, { newBalance })
    }
}