import { Chart, ChartConfiguration, ChartData, registerables } from 'chart.js';

Chart.register(...registerables);

interface Utils {
    CHART_COLORS: {
        red: string;
        orange: string;
        yellow: string;
        green: string;
        blue: string;
        purple: string;
        grey: string;
    };
}

const Utils: Utils = {
    CHART_COLORS: {
        red: 'rgb(255, 99, 132)',
        orange: 'rgb(255, 159, 64)',
        yellow: 'rgb(255, 205, 86)',
        green: 'rgb(75, 192, 192)',
        blue: 'rgb(54, 162, 235)',
        purple: 'rgb(153, 102, 255)',
        grey: 'rgb(201, 203, 207)',
    },
};

const pieChart = (
    element: HTMLCanvasElement | null,
    title: string,
    categories: string[],
    values: number[]
): Chart => {
    const data: ChartData = {
        labels: categories,
        datasets: [
            {
                backgroundColor: Object.values(Utils.CHART_COLORS),
                data: values,
            },
        ],
    };

    interface LegendOptions {
        position: 'top' | 'bottom' | 'left' | 'right' | 'chartArea';
        labels: {
            color: string;
            font: {
                size: number;
                weight: string;
                lineHeight: number;
                family: string;
                style: string;
            };
            boxWidth: number;
            boxHeight: number;
            padding: number;
        };
        paddingBottom: number;
    }

    interface TitleOptions {
        display: boolean;
        text: string;
        position: 'top' | 'bottom' | 'left' | 'right' | 'chartArea';
        align: 'center' | 'start' | 'end';
        color: string;
        paddingBottom: number;
        font: {
            size: number;
            weight: string;
            lineHeight: number;
            family: string;
            style: string;
        };
    }

    const setConfig = (data: ChartData): ChartConfiguration => {
        const legendOptions: LegendOptions = {
            position: 'top',
            labels: {
                color: '#000',
                font: {
                    size: 12,
                    weight: 'bold',
                    lineHeight: 1.2,
                    family: 'Roboto',
                    style: 'normal',
                },
                boxWidth: 35,
                boxHeight: 10,
                padding: 15,
            },
            paddingBottom: 42,
        };

        const titleOptions: TitleOptions = {
            display: true,
            text: title,
            position: 'top',
            align: 'center',
            color: '#290661',
            paddingBottom: 20,
            font: {
                size: 28,
                weight: 'bold',
                lineHeight: 1.2,
                family: 'Roboto',
                style: 'normal',
            },
        };

        const config: ChartConfiguration = {
            type: 'pie',
            data: data,
            options: {
                responsive: true,
                plugins: {
                    legend: legendOptions as any,
                    title: titleOptions as any,
                },
            },
        };
        return config;
    };

    if (!element) {
        throw new Error('Element not found');
    }
    return new Chart(element, setConfig(data));
};

export default pieChart;
