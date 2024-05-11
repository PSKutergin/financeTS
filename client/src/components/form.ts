import User from "../store/user";
import { FormFieldType } from "../types/form-field.type";

export class Form {
    private page: 'login' | 'signup' = 'login';
    private fields: FormFieldType[] = [];
    private processElement: HTMLElement | null = null;

    constructor(page: 'login' | 'signup') {
        this.page = page;

        this.fields = [
            {
                name: 'email',
                id: 'email',
                element: null,
                regex: /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
                valid: false,
            },
            {
                name: 'password',
                id: 'password',
                element: null,
                regex: /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])[0-9a-zA-Z]{8,}$/,
                valid: false,
            },
        ];

        if (this.page === 'signup') {
            this.fields.unshift(
                {
                    name: 'user',
                    id: 'user',
                    element: null,
                    regex: /^[А-ЯЁ][а-яё]*([-][А-ЯЁ][а-яё]*)?\s[А-ЯЁ][а-яё]*\s[А-ЯЁ][а-яё]*$/,
                    valid: false,
                }
            );
            this.fields.push(
                {
                    name: 'password-repeat',
                    id: 'password-repeat',
                    element: null,
                    regex: /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])[0-9a-zA-Z]{8,}$/,
                    valid: false,
                }
            );
        }

        const that: Form = this;

        this.fields.forEach((item: FormFieldType) => {
            item.element = document.getElementById(item.id) as HTMLInputElement;
            item.element.addEventListener('input', () => {
                that.isEmptyField();
                that.inputSuccess(((item.element as HTMLInputElement).parentNode) as HTMLElement);
            })
        });

        this.processElement = document.getElementById('process');
        if (this.processElement) this.processElement.addEventListener('click', (e) => {
            e.preventDefault()
            that.processForm()
        })
    }

    private validateFields(): void {
        this.fields.forEach((field: FormFieldType) => {
            if (!(field.element as HTMLInputElement).value || !(field.element as HTMLInputElement).value.match(field.regex)) {
                this.inputError(((field.element as HTMLInputElement).parentNode) as HTMLElement);
                field.valid = false;
            } else {
                this.inputSuccess(((field.element as HTMLInputElement).parentNode) as HTMLElement);
                field.valid = true;
            }
            if (this.page === 'signup') this.validatePasswords();
        })
    }

    private validatePasswords(): void {
        const password: FormFieldType | undefined = this.fields.find((item: FormFieldType) => item.name === 'password');
        const passwordRepeat: FormFieldType | undefined = this.fields.find((item: FormFieldType) => item.name === 'password-repeat');

        if (password && passwordRepeat) {
            if (!(password.element as HTMLInputElement).value || !(passwordRepeat.element as HTMLInputElement).value) return
            if ((password.element as HTMLInputElement).value !== (passwordRepeat.element as HTMLInputElement).value) {
                this.inputError(((password.element as HTMLInputElement).parentNode) as HTMLElement);
                password.valid = false;
                this.inputError(((passwordRepeat.element as HTMLInputElement).parentNode) as HTMLElement);
                passwordRepeat.valid = false;
            }
        }
    }

    private isEmptyField(): void {
        const isEmpty: boolean = this.fields.every((item: FormFieldType) => !!(item.element as HTMLInputElement).value);

        if (this.processElement) {
            if (isEmpty) {
                this.processElement.removeAttribute('disabled')
            } else {
                this.processElement.setAttribute('disabled', 'disabled')
            }
        }
    }

    private validateForm(): boolean {
        this.validateFields();
        const isValid: boolean = this.fields.every((item: FormFieldType) => item.valid);

        return isValid
    }

    private async processForm(): Promise<void> {
        if (this.validateForm() && this.fields.length) {
            const email: string = ((this.fields.find((item: FormFieldType) => item.name === 'email') as FormFieldType).element as HTMLInputElement).value;
            const password: string = ((this.fields.find((item: FormFieldType) => item.name === 'password') as FormFieldType).element as HTMLInputElement).value;

            if (this.page === 'signup') {
                const fullName: string = ((this.fields.find((item: FormFieldType) => item.name === 'user') as FormFieldType).element as HTMLInputElement).value;
                const lastName: string = fullName.split(' ')[0];
                const name: string = fullName.split(' ')[1];
                const passwordRepeat: string = ((this.fields.find((item: FormFieldType) => item.name === 'password-repeat') as FormFieldType).element as HTMLInputElement).value;

                User.registration({ name, lastName, email, password, passwordRepeat });
            } else {
                const rememberMeElem: HTMLInputElement = document.getElementById('remember') as HTMLInputElement;
                const rememberMe: boolean = (rememberMeElem as HTMLInputElement).checked;

                User.login({ email, password, rememberMe });
            }

        }
    }

    private inputError(element: HTMLElement): void {
        element.classList.add('error');
    }

    private inputSuccess(element: HTMLElement): void {
        element.classList.remove('error');
    }
}