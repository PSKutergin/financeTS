export default class CurrentType {
    public type: string | null = null;

    constructor() {
        this.init();
    }

    private init(): void {
        const link: string = window.location.hash.split('?')[0];

        if (link.includes('expense')) {
            this.type = 'expense';
        } else {
            this.type = 'income';
        }
    }

    public setType(type: string): void {
        this.type = type;
    }

    public getType(): string | null {
        return this.type
    }
}