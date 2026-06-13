import React from 'react';
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
} from 'chart.js';
import { Radar } from 'react-chartjs-2';

ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend);

interface RadarChartProps {
  labels: string[];
  values: number[];
  title?: string;
  color?: string;
  height?: number;
}

const RadarChart: React.FC<RadarChartProps> = ({
  labels,
  values,
  title,
  color = '#2E7D32',
  height = 300,
}) => {
  const data = {
    labels,
    datasets: [
      {
        label: title || '区位因素',
        data: values,
        backgroundColor: `${color}33`,
        borderColor: color,
        borderWidth: 2,
        pointBackgroundColor: color,
        pointRadius: 4,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      r: {
        beginAtZero: true,
        max: 1,
        ticks: { stepSize: 0.2 },
        pointLabels: { font: { size: 12 } },
      },
    },
    plugins: {
      legend: { display: false },
    },
  };

  return (
    <div style={{ height, width: '100%' }}>
      <Radar data={data} options={options} />
    </div>
  );
};

export default RadarChart;
