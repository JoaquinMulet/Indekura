import React from 'react';
import { Line } from 'react-chartjs-2';
import { baseChartOptions, chartColors, createYAxisOptions } from '../utils/chartUtils';

const SharesEPSChart = ({ data, chartRef }) => {
  const { years, dilutedShares, eps } = data;

  const chartOptions = {
    ...baseChartOptions,
    scales: {
      ...baseChartOptions.scales,
      y1: createYAxisOptions('Shares Outstanding', 'left', true),
      y2: createYAxisOptions('EPS', 'right', false)
    }
  };

  const chartData = {
    labels: years,
    datasets: [
      {
        label: 'Diluted Shares Outstanding',
        data: dilutedShares,
        borderColor: chartColors.blue.border,
        backgroundColor: chartColors.blue.background,
        borderWidth: 2,
        pointRadius: 0,
        tension: 0.4,
        yAxisID: 'y1'
      },
      {
        label: 'Earnings Per Share',
        data: eps,
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

export default SharesEPSChart;
