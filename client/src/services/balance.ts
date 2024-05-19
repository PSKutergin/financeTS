import { AxiosError, AxiosResponse } from "axios";
import instance from "../api/interceptor";

export class Balance {
    public static async getBalance(): Promise<AxiosResponse | AxiosError> {
        return instance.get(`api/balance`)
    }

    public static async editBalance(newBalance: number): Promise<AxiosResponse | AxiosError> {
        return instance.put(`api/balance`, { newBalance })
    }
}