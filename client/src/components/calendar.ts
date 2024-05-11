export default class Calendar {
    private currentYear: number = new Date().getFullYear();
    private currentMonth: number = new Date().getMonth() + 1;
    public currentDay: number = new Date().getDate();
    private calendar: HTMLElement | null = null;
    private inputDate: HTMLInputElement | null = null;

    constructor(calendar: HTMLElement, inputDate: HTMLInputElement) {
        this.calendar = calendar;
        this.inputDate = inputDate;
    }

    public showCalendar(): void {
        let calendarHTML: string = '<div class="calendar-header">';
        calendarHTML += '<button id="prevMonth">&#60;</button>';
        calendarHTML += '<span>' + this.currentYear + ' - ' + this.currentMonth + '</span>';
        calendarHTML += '<button id="nextMonth">&#62;</button>';
        calendarHTML += '</div>';
        calendarHTML += '<table>';
        calendarHTML += '<thead><tr><th>Пн</th><th>Вт</th><th>Ср</th><th>Чт</th><th>Пт</th><th>Сб</th><th>Вс</th></tr></thead>';
        calendarHTML += '<tbody>';

        // Определяем первый день месяца
        const firstDayOfMonth: number = new Date(this.currentYear, this.currentMonth - 1, 1).getDay();
        // Определяем день недели, с которого начинается календарь (0 - Воскресенье, 1 - Понедельник, ..., 6 - Суббота)
        const startingDayOfWeek: number = 1; // Начало недели с Понедельника (1)
        let offset: number = firstDayOfMonth - startingDayOfWeek;
        if (offset < 0) {
            offset += 7;
        }

        // Добавляем пустые ячейки перед первым днем месяца
        calendarHTML += '<tr>';
        for (let i: number = 0; i < offset; i++) {
            calendarHTML += '<td></td>';
        }

        // Добавляем дни месяца
        const daysInMonth: number = new Date(this.currentYear, this.currentMonth, 0).getDate();
        for (let day: number = 1; day <= daysInMonth; day++) {
            if (offset % 7 === 0) {
                calendarHTML += '</tr><tr>'; // Начинаем новую строку для следующей недели
            }
            calendarHTML += '<td>' + day + '</td>';
            offset++;
        }

        calendarHTML += '</tr></tbody></table>';

        // Отображаем календарь
        if (this.calendar) {
            this.calendar.innerHTML = calendarHTML;
            this.calendar.classList.add('open');

            this.calendar.addEventListener('click', (e: Event) => {
                e.preventDefault();
                const target: HTMLElement = e.target as HTMLElement;
                if (target && target.tagName === 'TD' && target.innerHTML !== '') {
                    const selectedDate = this.currentYear + '-' + this.currentMonth.toString().padStart(2, '0') + '-' + target.innerHTML.padStart(2, '0');
                    if (this.inputDate) {
                        this.inputDate.value = selectedDate;
                        this.inputDate.dispatchEvent(new Event('change'));
                    }
                    (this.calendar as HTMLElement).classList.remove('open');
                }
            });

            this.initMonthSwitching();
        }
    }

    private initMonthSwitching(): void {
        const prevMonthButton: HTMLElement = document.getElementById('prevMonth') as HTMLElement;
        const nextMonthButton: HTMLElement = document.getElementById('nextMonth') as HTMLElement;
        prevMonthButton.addEventListener('click', (e) => {
            e.preventDefault();
            this.currentMonth--;
            if (this.currentMonth < 1) {
                this.currentMonth = 12;
                this.currentYear--;
            }
            this.showCalendar();
        });
        nextMonthButton.addEventListener('click', (e) => {
            e.preventDefault();
            this.currentMonth++;
            if (this.currentMonth > 12) {
                this.currentMonth = 1;
                this.currentYear++;
            }
            this.showCalendar();
        });
    }
}