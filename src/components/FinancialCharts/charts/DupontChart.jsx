import React from 'react';
import { Line } from 'react-chartjs-2';
import { baseChartOptions, chartColors, createYAxisOptions } from '../utils/chartUtils';

const DupontChart = ({ data, chartRef }) => {
  const { years, roe, profitMargin } = data;

  const chartOptions = {
    ...baseChartOptions,
    scales: {
      ...baseChartOptions.scales,
      y1: createYAxisOptions('ROE', 'left', true),
      y2: createYAxisOptions('Profit Margin', 'right', false)
    }
  };

  const chartData = {
    labels: years,
    datasets: [
      {
        label: 'Return on Equity (ROE)',
        data: roe,
        borderColor: chartColors.blue.border,
        backgroundColor: chartColors.blue.background,
        borderWidth: 2,
        pointRadius: 0,
        tension: 0.4,
        yAxisID: 'y1'
      },
      {
        label: 'Profit Margin',
        data: profitMargin,
        borderColor: chartColors.green.border,
        backgroundColor: chartColors.green.background,
        borderWidth: 2,
        pointRadius: 0,
        tension: 0.4,
        yAxisID: 'y2'
      }
    ]
  };

  return <Line ref={chartRef} data={chartData} options={chartOptions} />;
};

export default DupontChart;
