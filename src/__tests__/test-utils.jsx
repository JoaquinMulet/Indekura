import React from 'react';
import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { vi } from 'vitest';
import userEvent from '@testing-library/user-event';

// Custom render function that includes router
export function renderWithRouter(ui, { route = '/' } = {}) {
  window.history.pushState({}, 'Test page', route);
  
  const user = userEvent.setup();
  
  return {
    user,
    ...render(ui, { wrapper: BrowserRouter }),
  };
}

// Mock for environment variables
export function mockEnvVars() {
  vi.stubGlobal('import.meta', {
    env: {
      VITE_API_KEY: 'test-api-key',
      VITE_APP_PASSWORD: 'test-password',
      VITE_VALUATION_API_URL: 'http://test-api.com/valuation'
    }
  });
}

// Helper to create mock financial data
export function createMockFinancialData() {
  return {
    incomeStatement: [
      { date: '2020-12-31', revenue: 1000, netIncome: 100, weightedAverageShsOutDil: 10 },
      { date: '2021-12-31', revenue: 1200, netIncome: 120, weightedAverageShsOutDil: 10 },
      { date: '2022-12-31', revenue: 1400, netIncome: 140, weightedAverageShsOutDil: 10 }
    ],
    balanceSheet: [
      { date: '2020-12-31', totalAssets: 2000, totalStockholdersEquity: 1000 },
      { date: '2021-12-31', totalAssets: 2200, totalStockholdersEquity: 1100 },
      { date: '2022-12-31', totalAssets: 2400, totalStockholdersEquity: 1200 }
    ],
    cashFlow: [
      { date: '2020-12-31', operatingCashFlow: 150 },
      { date: '2021-12-31', operatingCashFlow: 170 },
      { date: '2022-12-31', operatingCashFlow: 190 }
    ],
    estimates: [
      { date: '2023-12-31', estimatedRevenue: 1600, estimatedEps: 15 },
      { date: '2024-12-31', estimatedRevenue: 1800, estimatedEps: 17 }
    ]
  };
}
