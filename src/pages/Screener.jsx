import { useState, useEffect, useRef } from 'react';
import './Screener.css';
import { processCSV } from '../services/csvService';
import { formatNumber } from '../utils/formatters';

// Definir las columnas que queremos mostrar y su orden
const DISPLAY_COLUMNS = [
  { key: 'score_final', label: 'Score' },
  { key: 'symbol', label: 'Symbol' },
  { key: 'companyName', label: 'Company Name' },
  { key: 'sector', label: 'Sector' },
  { key: 'industry', label: 'Industry' },
  { key: 'current_price', label: 'Current Price' },
  { key: 'fair_value_min', label: 'Min Fair Value' },
  { key: 'fair_value_max', label: 'Max Fair Value' },
  { key: 'reported_currency', label: 'Currency' }
];

const Screener = () => {
  const [data, setData] = useState([]);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredData, setFilteredData] = useState([]);
  const [itemsPerPage, setItemsPerPage] = useState(50);
  const tableContainerRef = useRef(null);

  useEffect(() => {
    document.title = 'Indekura Hedge Fund - Market Screener';
    
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await fetch('/empresas.csv');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const text = await response.text();
        
        // Procesar CSV usando el servicio
        const formattedData = processCSV(text, DISPLAY_COLUMNS);
        
        // Ordenar por score_final de mayor a menor
        const sortedData = formattedData.sort((a, b) => b.score_final - a.score_final);
        setData(sortedData);
        setFilteredData(sortedData);
      } catch (error) {
        console.error('Error loading data:', error);
        setError(`Error cargando datos: ${error.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Ajustar elementos por página según altura disponible
  useEffect(() => {
    const adjustItemsPerPage = () => {
      if (!tableContainerRef.current) return;
      
      // Calculamos el espacio disponible para la tabla
      const windowHeight = window.innerHeight;
      const navbarHeight = 70; // Altura estimada de la barra de navegación
      const headerHeight = document.querySelector('.page-title')?.offsetHeight || 60;
      const searchHeight = document.querySelector('.search-form')?.offsetHeight || 70;
      const tableStatsHeight = document.querySelector('.table-stats')?.offsetHeight || 30;
      const paginationHeight = document.querySelector('.pagination')?.offsetHeight || 50;
      const containerPadding = 40; // 2rem arriba + 2rem abajo
      const bottomMargin = 40; // Margen adicional en la parte inferior
      
      // Espacio disponible para la tabla
      const availableHeight = windowHeight - navbarHeight - headerHeight - searchHeight - tableStatsHeight - paginationHeight - containerPadding - bottomMargin;
      
      // Altura de cada fila (incluyendo bordes y padding)
      const rowHeight = 45;
      // Altura del encabezado de la tabla
      const headerRowHeight = 45;
      
      // Calculamos cuántas filas caben en el espacio disponible
      const visibleRows = Math.floor((availableHeight - headerRowHeight) / rowHeight);
      // Aseguramos un mínimo de filas
      const newItemsPerPage = Math.max(10, visibleRows);
      
      // Actualizamos el número de elementos por página
      setItemsPerPage(newItemsPerPage);
      
      // Actualizamos el total de páginas
      if (filteredData.length > 0) {
        setTotalPages(Math.ceil(filteredData.length / newItemsPerPage));
      }
    };
    
    // Ajustar al cargar y al cambiar el tamaño de la ventana
    adjustItemsPerPage();
    window.addEventListener('resize', adjustItemsPerPage);
    
    return () => {
      window.removeEventListener('resize', adjustItemsPerPage);
    };
  }, [filteredData.length]);

  // Filtrar datos cuando cambia el término de búsqueda
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredData(data);
    } else {
      const term = searchTerm.toLowerCase().trim();
      const filtered = data.filter(item => 
        (item.symbol && item.symbol.toLowerCase().includes(term)) || 
        (item.companyName && item.companyName.toLowerCase().includes(term)) ||
        (item.sector && item.sector.toLowerCase().includes(term)) ||
        (item.industry && item.industry.toLowerCase().includes(term))
      );
      setFilteredData(filtered);
    }
    setCurrentPage(0);
  }, [searchTerm, data]);

  // Actualizar total de páginas cuando cambian los datos filtrados o items por página
  useEffect(() => {
    setTotalPages(Math.ceil(filteredData.length / itemsPerPage));
  }, [filteredData, itemsPerPage]);

  const getCurrentPageData = () => {
    const start = currentPage * itemsPerPage;
    const end = start + itemsPerPage;
    return filteredData.slice(start, end);
  };

  // Función para manejar el cambio de página y asegurar que la vista vuelva al inicio
  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    
    // Asegurarse de que la tabla se desplace al inicio
    if (tableContainerRef.current) {
      tableContainerRef.current.scrollTop = 0;
    }
  };

  const goToNextPage = () => {
    if (currentPage < totalPages - 1) {
      handlePageChange(currentPage + 1);
    }
  };

  const goToPreviousPage = () => {
    if (currentPage > 0) {
      handlePageChange(currentPage - 1);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    // La búsqueda ya se maneja en el useEffect
  };

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  return (
    <div className="screener-container">
      <h1 className="page-title">Market Screener</h1>
      
      <form className="search-form" onSubmit={handleSearch}>
        <input
          type="text"
          placeholder="Buscar por símbolo, nombre, sector o industria..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <button type="submit">
          Buscar
        </button>
      </form>
      
      {loading ? (
        <div className="loading">Cargando datos del mercado...</div>
      ) : filteredData.length === 0 ? (
        <div className="no-results">No se encontraron resultados para tu búsqueda.</div>
      ) : (
        <>
          <div className="table-stats">
            <span>Mostrando {filteredData.length} empresas</span>
          </div>
          
          <div className="table-container" ref={tableContainerRef}>
            <table className="data-table">
              <thead>
                <tr>
                  {DISPLAY_COLUMNS.map(({ key, label }) => (
                    <th key={key}>{label}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {getCurrentPageData().map((item, rowIndex) => (
                  <tr key={rowIndex}>
                    {DISPLAY_COLUMNS.map(({ key }) => (
                      <td key={`${rowIndex}-${key}`} className={key === 'score_final' ? 'score-column' : ''}>
                        {formatNumber(item[key], key)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="pagination">
            <button 
              onClick={goToPreviousPage} 
              disabled={currentPage === 0}
              className="pagination-button"
            >
              ← Anterior
            </button>
            <span className="page-info">
              Página {currentPage + 1} de {totalPages}
            </span>
            <button 
              onClick={goToNextPage} 
              disabled={currentPage === totalPages - 1}
              className="pagination-button"
            >
              Siguiente →
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default Screener;
