import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Chart } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale, LinearScale, BarElement, PointElement,
  LineElement, Title, Tooltip, Legend, Filler
);

interface ClimateChartProps {
  monthlyTemps: number[];
  monthlyPrecips: number[];
  height?: number;
}

const months = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'];

const ClimateChart: React.FC<ClimateChartProps> = ({ monthlyTemps, monthlyPrecips, height = 300 }) => {
  const data = {
    labels: months,
    datasets: [
      {
        type: 'bar' as const,
        label: '降水量 (mm)',
        data: monthlyPrecips,
        backgroundColor: 'rgba(21, 101, 192, 0.5)',
        borderColor: '#1565C0',
        borderWidth: 1,
        yAxisID: 'y1',
        order: 2,
      },
      {
        type: 'line' as const,
        label: '气温 (°C)',
        data: monthlyTemps,
        borderColor: '#F57C00',
        backgroundColor: 'rgba(245, 124, 0, 0.1)',
        borderWidth: 2,
        pointBackgroundColor: '#F57C00',
        pointRadius: 4,
        fill: true,
        yAxisID: 'y',
        order: 1,
        tension: 0.3,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: 'index' as const, intersect: false },
    plugins: {
      legend: { position: 'top' as const },
      title: { display: false },
    },
    scales: {
      y: {
        type: 'linear' as const,
        display: true,
        position: 'left' as const,
        title: { display: true, text: '气温 (°C)' },
        grid: { drawOnChartArea: false },
      },
      y1: {
        type: 'linear' as const,
        display: true,
        position: 'right' as const,
        title: { display: true, text: '降水量 (mm)' },
        grid: { drawOnChartArea: true },
      },
    },
  };

  return (
    <div style={{ height, width: '100%' }}>
      <Chart type="bar" data={data} options={options} />
    </div>
  );
};

export default ClimateChart;
