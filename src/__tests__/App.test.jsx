import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { vi } from 'vitest';
import App from '../App';

// Mock all page components to simplify testing
vi.mock('../pages/Home', () => ({
  default: () => <div data-testid="home-page">Home Page</div>
}));

vi.mock('../pages/Screener', () => ({
  default: () => <div data-testid="screener-page">Screener Page</div>
}));

vi.mock('../pages/Consultas', () => ({
  default: () => <div data-testid="consultas-page">Consultas Page</div>
}));

vi.mock('../pages/Nosotros', () => ({
  default: () => <div data-testid="nosotros-page">Nosotros Page</div>
}));

vi.mock('../pages/FinancialOptionsLab', () => ({
  default: () => <div data-testid="financial-options-lab-page">Financial Options Lab Page</div>
}));

// Mock Navbar to avoid navigation issues in tests
vi.mock('../components/Navbar', () => ({
  default: () => <nav data-testid="navbar">Navbar</nav>
}));

// Mock the Router component in App.jsx
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    BrowserRouter: ({ children }) => <>{children}</>
  };
});

describe('App Routing', () => {
  test('renders Home page on default route', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <App />
      </MemoryRouter>
    );
    
    expect(screen.getByTestId('home-page')).toBeInTheDocument();
  });
  
  test('renders Screener page on /screener route', () => {
    render(
      <MemoryRouter initialEntries={['/screener']}>
        <App />
      </MemoryRouter>
    );
    
    expect(screen.getByTestId('screener-page')).toBeInTheDocument();
  });
  
  test('renders Consultas page on /consultas route', () => {
    render(
      <MemoryRouter initialEntries={['/consultas']}>
        <App />
      </MemoryRouter>
    );
    
    expect(screen.getByTestId('consultas-page')).toBeInTheDocument();
  });
  
  test('renders Nosotros page on /nosotros route', () => {
    render(
      <MemoryRouter initialEntries={['/nosotros']}>
        <App />
      </MemoryRouter>
    );
    
    expect(screen.getByTestId('nosotros-page')).toBeInTheDocument();
  });
  
  test('renders FinancialOptionsLab page on /financial-options-lab route', () => {
    render(
      <MemoryRouter initialEntries={['/financial-options-lab']}>
        <App />
      </MemoryRouter>
    );
    
    expect(screen.getByTestId('financial-options-lab-page')).toBeInTheDocument();
  });
});
