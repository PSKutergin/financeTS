export const formatDateFromISO = (date: string | null = null): string => {
    let dateObj: Date;

    if (date) dateObj = new Date(date);
    else dateObj = new Date();

    const day: number = dateObj.getDate();
    const month: number = dateObj.getMonth() + 1;
    const year: number = dateObj.getFullYear();
    return `${year}-${month < 10 ? '0' + month : month}-${day < 10 ? '0' + day : day}`;
}

export const formatDate = (date: string): string => {
    const dateObj: Date = new Date(date);
    const day: number = dateObj.getDate();
    const month: number = dateObj.getMonth() + 1;
    const year: number = dateObj.getFullYear();
    return `${day < 10 ? '0' + day : day}.${month < 10 ? '0' + month : month}.${year}`
}