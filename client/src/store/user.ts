import axios, { AxiosResponse } from "axios";
import { Auth } from "../services/auth";
import { TokensType } from "../types/tokens.type";
import { UserType } from "../types/user.type";
import { ErrorResponseType, LoginResponseType, SignupResponseType } from "../types/response.type";

export default class User {
    private static userKey: 'user';
    private static isRefreshing: boolean = false;
    public static errorElement: HTMLElement | null = null;

    public static setUser(user: UserType): void {
        localStorage.setItem(this.userKey, JSON.stringify(user));
    }

    public static getUser(): UserType | null {
        const user: string | null = localStorage.getItem(this.userKey);
        if (!user) {
            return null;
        }
        return JSON.parse(user)
    }

    public static removeUser(): void {
        localStorage.removeItem(this.userKey);
    }

    public static getFullName() {
        const user: UserType | null = this.getUser();
        if (!user) {
            Auth.removeTokens();
            window.location.hash = '#/login';
        }
        return `${(user as UserType).name} ${(user as UserType).lastName}`
    }

    public static showError(text: string): void {
        this.errorElement = document.getElementById('error');
        if (this.errorElement) {
            this.errorElement.innerText = text;
            this.errorElement.classList.add('active');

            setTimeout(() => (this.errorElement as HTMLElement).classList.remove('active'), 3000);
        }
    }

    public static async login(data: LoginResponseType): Promise<void> {
        try {
            const response: AxiosResponse = await Auth.login(data);
            const user: UserType = response.data.user;
            const tokens: TokensType = response.data.tokens;

            Auth.setTokens(tokens.accessToken, tokens.refreshToken);
            this.setUser(user);
            window.location.hash = '#/main';
        } catch (error) {
            if (axios.isAxiosError(error)) {
                const errorResponse: ErrorResponseType = error.response?.data;
                this.showError(errorResponse.message);
            }
        }
    }

    public static async registration(data: SignupResponseType): Promise<void> {
        try {
            await Auth.signup(data);
            window.location.hash = '#/login';
        } catch (error) {
            if (axios.isAxiosError(error)) {
                const errorResponse: ErrorResponseType = error.response?.data;
                this.showError(errorResponse.message);
            }
        }
    }

    public static async logout(): Promise<void> {
        const refreshToken: string | null = Auth.getToken(Auth.refreshTokenKey);

        if (refreshToken) {
            try {
                await Auth.logout(refreshToken);
                this.removeUser();
                Auth.removeTokens();
            } catch (error) {
                if (axios.isAxiosError(error)) {
                    const errorResponse: ErrorResponseType = error.response?.data;
                    this.showError(errorResponse.message);
                }
            }
        }
    }

    public static async checkAuth(): Promise<void> {
        try {
            const refreshToken: string | null = Auth.getToken(Auth.refreshTokenKey);

            if (!this.isRefreshing) { // проверяем, не происходит ли уже обновление
                this.isRefreshing = true; // устанавливаем флаг обновления

                if (refreshToken) {
                    const response: AxiosResponse = await Auth.refresh(refreshToken);
                    const tokens: TokensType = response.data.tokens;
                    Auth.setTokens(tokens.accessToken, tokens.refreshToken);
                } else {
                    Auth.removeTokens();
                    this.removeUser();
                    window.location.hash = '#/login';
                }

                this.isRefreshing = false; // сбрасываем флаг обновления после успешного обновления
            }
        } catch (error) {
            if (axios.isAxiosError(error)) {
                this.removeUser();
                Auth.removeTokens();
            }
        }
    }
}