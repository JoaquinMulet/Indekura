import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import IndekuraValuation from '../../components/IndekuraValuation/IndekuraValuation';
import { useValuation } from '../../hooks/useValuation';

// Mock del hook useValuation
vi.mock('../../hooks/useValuation', () => ({
  useValuation: vi.fn()
}));

// Mock de useNavigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate
  };
});

describe('IndekuraValuation Component', () => {
  const mockValuationData = {
    'Last EPS ttm': 5.67,
    'Precio accion (con crecimiento historico minimo - 1er quintil)': 120.45,
    'Precio accion (con crecimiento historico maximo - 2do quintil)': 150.78,
    'Precio accion (con crecimiento medio del modelo': 135.67
  };

  beforeEach(() => {
    // Resetear los mocks antes de cada test
    vi.clearAllMocks();
  });

  it('muestra mensaje de carga cuando está cargando', () => {
    useValuation.mockReturnValue({
      valuationData: null,
      loading: true,
      error: null
    });

    render(<IndekuraValuation ticker="AAPL" />);
    expect(screen.getByText('Cargando valoración...')).toBeInTheDocument();
  });

  it('muestra mensaje de error cuando hay un error', () => {
    const errorMessage = 'Error al cargar datos';
    useValuation.mockReturnValue({
      valuationData: null,
      loading: false,
      error: errorMessage
    });

    render(<IndekuraValuation ticker="AAPL" />);
    expect(screen.getByText(errorMessage)).toBeInTheDocument();
  });

  it('muestra los datos de valoración correctamente', () => {
    useValuation.mockReturnValue({
      valuationData: mockValuationData,
      loading: false,
      error: null
    });

    render(<IndekuraValuation ticker="AAPL" />);
    
    expect(screen.getByText('Valoración Histórica')).toBeInTheDocument();
    expect(screen.getByText('EPS (TTM)')).toBeInTheDocument();
    expect(screen.getByText('$5.67')).toBeInTheDocument();
    expect(screen.getByText('Precio Mínimo Histórico Ajustado al EPS Actual')).toBeInTheDocument();
    expect(screen.getByText('$120.45')).toBeInTheDocument();
    expect(screen.getByText('Precio Conservador')).toBeInTheDocument();
    expect(screen.getByText('$150.78')).toBeInTheDocument();
    expect(screen.getByText('Precio Promedio')).toBeInTheDocument();
    expect(screen.getByText('$135.67')).toBeInTheDocument();
  });

  it('muestra el modal al hacer clic en el botón de método de valoración', async () => {
    useValuation.mockReturnValue({
      valuationData: mockValuationData,
      loading: false,
      error: null
    });

    render(
      <MemoryRouter>
        <IndekuraValuation ticker="AAPL" />
      </MemoryRouter>
    );
    
    const button = screen.getByText('Saber más del método de Valoración');
    await userEvent.click(button);
    
    expect(screen.getByText('Método de Valoración')).toBeInTheDocument();
    expect(screen.getByText(/Este modelo adapta el clásico Modelo de Descuento de Dividendos/)).toBeInTheDocument();
  });

  it('navega a la página de valoración histórica al hacer clic en el botón correspondiente', async () => {
    useValuation.mockReturnValue({
      valuationData: mockValuationData,
      loading: false,
      error: null
    });

    render(
      <MemoryRouter>
        <IndekuraValuation ticker="AAPL" />
      </MemoryRouter>
    );
    
    // Primero abrimos el modal
    const methodButton = screen.getByText('Saber más del método de Valoración');
    await userEvent.click(methodButton);
    
    // Luego hacemos clic en el botón de navegación
    const detailButton = screen.getByText('Ver explicación detallada');
    await userEvent.click(detailButton);
    
    // Verificamos que la navegación se haya realizado correctamente
    expect(mockNavigate).toHaveBeenCalledWith('/historical-valuation');
  });
});
