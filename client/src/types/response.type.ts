export type LoginResponseType = {
    email: string;
    password: string;
    rememberMe: boolean
}

export type SignupResponseType = {
    name: string,
    lastName: string,
    email: string,
    password: string,
    passwordRepeat: string
}

export type OperationsResponseType = {
    id: number,
    category: string,
    type: string,
    amount: number,
    date: string,
    comment: string
}

export type ErrorResponseType = {
    error: boolean,
    message: string
}