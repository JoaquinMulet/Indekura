import React, { useState, useRef } from 'react';
import { processFinancialData, getUniqueYears } from './utils/chartUtils';
import SharesEPSChart from './charts/SharesEPSChart';
import DupontChart from './charts/DupontChart';
import LeverageChart from './charts/LeverageChart';
import './FinancialCharts.css';

const FinancialCharts = ({ financialData }) => {
  const [maximizedChart, setMaximizedChart] = useState(null);
  const chartRefs = {
    shares: useRef(null),
    dupont: useRef(null),
    leverage: useRef(null)
  };

  if (!financialData || !financialData.incomeStatement || !financialData.balanceSheet) {
    return null;
  }

  const { incomeStatement, balanceSheet } = financialData;
  const years = getUniqueYears(incomeStatement, balanceSheet);

  // Procesar datos para cada gráfico
  const sharesData = {
    years,
    dilutedShares: processFinancialData(incomeStatement, 'weightedAverageShsOutDil'),
    eps: incomeStatement.map(item => 
      item.weightedAverageShsOutDil ? item.netIncome / item.weightedAverageShsOutDil : null
    )
  };

  const dupontData = {
    years,
    roe: incomeStatement.map((item, i) => {
      const bs = balanceSheet[i];
      return bs && bs.totalStockholdersEquity
        ? item.netIncome / bs.totalStockholdersEquity
        : null;
    }),
    profitMargin: incomeStatement.map(item =>
      item.revenue ? item.netIncome / item.revenue : null
    )
  };

  const leverageData = {
    years,
    assetTurnover: incomeStatement.map((item, i) => {
      const bs = balanceSheet[i];
      return bs && bs.totalAssets ? item.revenue / bs.totalAssets : null;
    }),
    equityMultiplier: balanceSheet.map(item =>
      item.totalStockholdersEquity ? item.totalAssets / item.totalStockholdersEquity : null
    )
  };

  const handleResetZoom = (chartId) => {
    const chartRef = chartRefs[chartId];
    if (chartRef && chartRef.current) {
      chartRef.current.resetZoom();
    }
  };

  return (
    <div className="charts-container">
      <div className={`chart-section ${maximizedChart === 'shares' ? 'maximized' : ''}`}>
        <div className="chart-header">
          <h3>Shares & EPS Analysis</h3>
          <div className="chart-controls">
            <button onClick={() => handleResetZoom('shares')} className="reset-zoom-btn">
              Reset Zoom
            </button>
            <button
              onClick={() => setMaximizedChart(maximizedChart === 'shares' ? null : 'shares')}
              className="maximize-btn"
            >
              {maximizedChart === 'shares' ? 'Minimize' : 'Maximize'}
            </button>
          </div>
        </div>
        <div className="chart-wrapper">
          <SharesEPSChart data={sharesData} chartRef={chartRefs.shares} />
        </div>
      </div>

      <div className={`chart-section ${maximizedChart === 'dupont' ? 'maximized' : ''}`}>
        <div className="chart-header">
          <h3>DuPont Analysis</h3>
          <div className="chart-controls">
            <button onClick={() => handleResetZoom('dupont')} className="reset-zoom-btn">
              Reset Zoom
            </button>
            <button
              onClick={() => setMaximizedChart(maximizedChart === 'dupont' ? null : 'dupont')}
              className="maximize-btn"
            >
              {maximizedChart === 'dupont' ? 'Minimize' : 'Maximize'}
            </button>
          </div>
        </div>
        <div className="chart-wrapper">
          <DupontChart data={dupontData} chartRef={chartRefs.dupont} />
        </div>
      </div>

      <div className={`chart-section ${maximizedChart === 'leverage' ? 'maximized' : ''}`}>
        <div className="chart-header">
          <h3>Financial Leverage</h3>
          <div className="chart-controls">
            <button onClick={() => handleResetZoom('leverage')} className="reset-zoom-btn">
              Reset Zoom
            </button>
            <button
              onClick={() => setMaximizedChart(maximizedChart === 'leverage' ? null : 'leverage')}
              className="maximize-btn"
            >
              {maximizedChart === 'leverage' ? 'Minimize' : 'Maximize'}
            </button>
          </div>
        </div>
        <div className="chart-wrapper">
          <LeverageChart data={leverageData} chartRef={chartRefs.leverage} />
        </div>
      </div>
    </div>
  );
};

export default FinancialCharts;
