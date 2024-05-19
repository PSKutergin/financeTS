import { AxiosError, AxiosResponse } from "axios";
import instance from "../api/interceptor";
import { LoginResponseType, SignupResponseType } from "../types/response.type";

export class Auth {
    public static accessTokenKey: string = 'accessToken';
    public static refreshTokenKey: string = 'refreshToken';

    public static async login(data: LoginResponseType): Promise<AxiosResponse | AxiosError> {
        return instance.post('api/login', data)
    }

    public static async signup(data: SignupResponseType): Promise<AxiosResponse | AxiosError> {
        return instance.post('api/signup', data)
    }

    public static async refresh(refreshToken: string): Promise<AxiosResponse | AxiosError> {
        return instance.post('api/refresh', { refreshToken })
    }

    public static async logout(refreshToken: string): Promise<AxiosResponse | AxiosError> {
        return instance.post('api/logout', { refreshToken })
    }

    public static getToken = (nameToken: string): string | null => {
        return localStorage.getItem(nameToken) ? localStorage.getItem(nameToken) : null
    }

    public static setTokens = (accessToken: string, refreshToken: string): void => {
        localStorage.setItem(this.accessTokenKey, accessToken);
        localStorage.setItem(this.refreshTokenKey, refreshToken);
    }

    public static removeTokens = (): void => {
        localStorage.removeItem(this.accessTokenKey);
        localStorage.removeItem(this.refreshTokenKey);
    }
}