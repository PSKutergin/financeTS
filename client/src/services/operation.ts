import { AxiosError, AxiosResponse } from "axios";
import instance from "../api/interceptor";
import { formatDateFromISO } from '../helpers/helpers';
import { OperationType } from "../types/operation.type";

export class Operation {
    public static async getOperations(interval: string = 'interval', dateFrom: string | null = null, dateTo: string | null = null): Promise<AxiosResponse | AxiosError> {
        let url = `api/operations`;

        switch (interval) {
            case 'week':
                url += '?period=week';
                break;
            case 'month':
                url += '?period=month';
                break;
            case 'year':
                url += '?period=year';
                break;
            case 'all':
                url += '?period=all';
                break;
            case 'interval':
                if (dateFrom && dateTo) {
                    url += `?period=interval&dateFrom=${formatDateFromISO(dateFrom)}&dateTo=${formatDateFromISO(dateTo)}`
                } else {
                    url += `?period=interval&dateFrom=${formatDateFromISO()}&dateTo=${formatDateFromISO()}`
                }
                break;
        }
        return instance.get(url)
    }

    public static async setOperations({ type, amount, date, comment, category_id }: OperationType): Promise<AxiosResponse | AxiosError> {
        return instance.post(`api/operations`, { type, amount, date, comment, category_id })
    }

    public static async getOperation(id: string): Promise<AxiosResponse | AxiosError> {
        return instance.get(`api/operations/${id}`)
    }

    public static async editOperation(id: string, { type, amount, date, comment, category_id }: OperationType): Promise<AxiosResponse | AxiosError> {
        return instance.put(`api/operations/${id}`, { type, amount, date, comment, category_id })
    }

    public static async deleteOperation(id: string): Promise<AxiosResponse | AxiosError> {
        return instance.delete(`api/operations/${id}`)
    }
}