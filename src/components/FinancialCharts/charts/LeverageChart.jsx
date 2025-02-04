import React from 'react';
import { Line } from 'react-chartjs-2';
import { baseChartOptions, chartColors, createYAxisOptions } from '../utils/chartUtils';

const LeverageChart = ({ data, chartRef }) => {
  const { years, assetTurnover, equityMultiplier } = data;

  const chartOptions = {
    ...baseChartOptions,
    scales: {
      ...baseChartOptions.scales,
      y1: createYAxisOptions('Asset Turnover', 'left', true),
      y2: createYAxisOptions('Equity Multiplier', 'right', false)
    }
  };

  const chartData = {
    labels: years,
    datasets: [
      {
        label: 'Asset Turnover',
        data: assetTurnover,
        borderColor: chartColors.blue.border,
        backgroundColor: chartColors.blue.background,
        borderWidth: 2,
        pointRadius: 0,
        tension: 0.4,
        yAxisID: 'y1'
      },
      {
        label: 'Equity Multiplier',
        data: equityMultiplier,
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

export default LeverageChart;
