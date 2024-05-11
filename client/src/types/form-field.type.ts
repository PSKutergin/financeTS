export type FormFieldType = {
    id: string,
    name: string,
    element: HTMLInputElement | null,
    regex: RegExp,
    valid: boolean
}