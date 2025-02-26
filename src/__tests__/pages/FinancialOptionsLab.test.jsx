import React from 'react';
import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import App from '../../App';

// Mock the FinancialOptionsLab component
vi.mock('../../pages/FinancialOptionsLab', () => ({
  default: () => <div data-testid="financial-options-lab">Calculadora de Opciones Mock</div>
}));

// Mock other pages to simplify testing
vi.mock('../../pages/Home', () => ({
  default: () => <div data-testid="home-page">Home Mock</div>
}));

vi.mock('../../pages/Screener', () => ({
  default: () => <div data-testid="screener-page">Screener Mock</div>
}));

vi.mock('../../pages/Consultas', () => ({
  default: () => <div data-testid="consultas-page">Consultas Mock</div>
}));

vi.mock('../../pages/Nosotros', () => ({
  default: () => <div data-testid="nosotros-page">Nosotros Mock</div>
}));

// Mock the Navbar component
vi.mock('../../components/Navbar', () => ({
  default: () => <div data-testid="navbar">Navbar Mock</div>
}));

// Mock the BrowserRouter in App.jsx
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    BrowserRouter: ({ children }) => <>{children}</>
  };
});

describe('Calculadora de Opciones Routing', () => {
  test('renders Calculadora de Opciones page when navigating to /financial-options-lab', () => {
    render(
      <MemoryRouter initialEntries={['/financial-options-lab']}>
        <App />
      </MemoryRouter>
    );
    
    // Verify that the FinancialOptionsLab component is rendered
    expect(screen.getByTestId('financial-options-lab')).toBeInTheDocument();
  });
});
