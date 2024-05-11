import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError } from "axios";
import { BASE_URL } from "../config/config";
import { Auth } from "../services/auth";
import User from "../store/user";

// Определяем тип для заголовков
interface Headers {
    [key: string]: string;
}

// Функция для получения заголовков
const getContentType = (): Headers => ({
    'Content-Type': 'application/json',
    'Accept': 'application/json'
});

// Создаем экземпляр Axios
const instance: AxiosInstance = axios.create({
    baseURL: BASE_URL,
    headers: getContentType()
});

// Перехватываем запросы для добавления токена аутентификации
instance.interceptors.request.use(
    async (config: AxiosRequestConfig): Promise<any> => {
        const token: string | null = Auth.getToken(Auth.accessTokenKey);

        if (config.headers && token) {
            // Явно указываем тип для headers
            config.headers = {
                ...config.headers,
                'x-auth-token': token
            };
        } else if (token) {
            // Явно указываем тип для headers
            config.headers = { 'x-auth-token': token };
        }
        return config;
    },
    (error: AxiosError): Promise<AxiosError> => {
        return Promise.reject(error);
    }
);

// Перехватываем ответы для обработки ошибки 401 и попытки обновления токена
instance.interceptors.response.use(
    (response: AxiosResponse) => response,
    async (error: AxiosError) => {
        const originalRequest: AxiosRequestConfig | undefined = error.config;

        // Проверяем, определена ли originalRequest
        if (originalRequest) {
            // Проверка на ошибку 401 (Unauthorized)
            if (error.response?.status === 401 && !('retry' in originalRequest)) {
                // Добавляем свойство _retry к originalRequest
                (originalRequest as { _retry?: boolean })._retry = true;

                try {
                    // Попытка обновления токенов
                    await User.checkAuth();
                    // Повторный запрос с обновленными токенами
                    const token: string | null = Auth.getToken(Auth.accessTokenKey);
                    if (token) {
                        // Проверяем, существует ли свойство headers и является ли объектом
                        if (originalRequest.headers && typeof originalRequest.headers === 'object') {
                            originalRequest.headers['x-auth-token'] = token;
                        } else {
                            // Если headers не существует или не является объектом, создаем новый объект headers
                            originalRequest.headers = { 'x-auth-token': token };
                        }
                    }
                } catch (refreshError) {
                    // Обработка ошибки обновления токенов
                    console.error('Ошибка обновления токенов:', refreshError);
                    User.removeUser();
                    Auth.removeTokens();
                }
            }
            // Если не удалось обновить токены или другая ошибка, возвращаем ошибку
            return Promise.reject(error);
        }
    }
);

export default instance;
