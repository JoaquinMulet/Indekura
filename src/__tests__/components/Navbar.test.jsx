import React from 'react';
import { screen } from '@testing-library/react';
import { renderWithRouter } from '../test-utils';
import Navbar from '../../components/Navbar';

describe('Navbar', () => {
  test('renders all navigation links', () => {
    renderWithRouter(<Navbar />);
    
    // Check if all links are rendered
    expect(screen.getByText(/Home/i)).toBeInTheDocument();
    expect(screen.getByText(/Screener/i)).toBeInTheDocument();
    expect(screen.getByText(/Opciones/i)).toBeInTheDocument();
    expect(screen.getByText(/Consultas/i)).toBeInTheDocument();
    expect(screen.getByText(/Legal/i)).toBeInTheDocument();
  });
  
  test('links have correct href attributes', () => {
    renderWithRouter(<Navbar />);
    
    // Check if links have correct href attributes
    expect(screen.getByText(/Home/i).closest('a')).toHaveAttribute('href', '/');
    expect(screen.getByText(/Screener/i).closest('a')).toHaveAttribute('href', '/screener');
    expect(screen.getByText(/Opciones/i).closest('a')).toHaveAttribute('href', '/financial-options-lab');
    expect(screen.getByText(/Consultas/i).closest('a')).toHaveAttribute('href', '/consultas');
    expect(screen.getByText(/Legal/i).closest('a')).toHaveAttribute('href', '/nosotros');
  });
  
  test('navigation works when links are clicked', async () => {
    const { user } = renderWithRouter(<Navbar />);
    
    // Click on the Opciones link
    await user.click(screen.getByText(/Opciones/i));
    
    // Check if the URL has changed
    expect(window.location.pathname).toBe('/financial-options-lab');
  });
});
