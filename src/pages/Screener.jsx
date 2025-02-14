import { useState, useEffect } from 'react';
import './Screener.css';

const ITEMS_PER_PAGE = 50;

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

  // Función para parsear una línea de CSV respetando las comillas dobles
  const parseCSVLine = (line) => {
    const result = [];
    let currentValue = '';
    let insideQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      
      if (char === '"') {
        if (insideQuotes && line[i + 1] === '"') {
          currentValue += '"';
          i++;
        } else {
          insideQuotes = !insideQuotes;
        }
      } else if (char === ',' && !insideQuotes) {
        result.push(currentValue.trim());
        currentValue = '';
      } else {
        currentValue += char;
      }
    }
    
    result.push(currentValue.trim());
    return result;
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/empresas.csv');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const text = await response.text();
        
        const lines = text.split('\n').filter(line => line.trim() !== '');
        if (lines.length === 0) {
          throw new Error('CSV está vacío');
        }

        // Procesar encabezados y crear un mapa de índices
        const headerLine = parseCSVLine(lines[0]);
        const headerIndexMap = {};
        headerLine.forEach((header, index) => {
          headerIndexMap[header.trim()] = index;
        });

        // Procesar datos solo para las columnas que queremos mostrar
        const dataRows = lines.slice(1);
        const formattedData = dataRows.map(row => {
          const values = parseCSVLine(row);
          const rowData = {};
          
          DISPLAY_COLUMNS.forEach(({ key }) => {
            const index = headerIndexMap[key];
            if (index !== undefined) {
              const value = values[index] || '';
              // Convertir valores numéricos excepto para campos específicos
              if (!['symbol', 'companyName', 'sector', 'industry', 'reported_currency'].includes(key)) {
                const numValue = value.replace(/[^0-9.-]/g, '');
                rowData[key] = !isNaN(numValue) && numValue !== '' ? parseFloat(numValue) : value;
              } else {
                rowData[key] = value;
              }
            }
          });
          return rowData;
        });
        
        // Ordenar por score_final de mayor a menor
        const sortedData = formattedData.sort((a, b) => b.score_final - a.score_final);
        setData(sortedData);
        setTotalPages(Math.ceil(sortedData.length / ITEMS_PER_PAGE));
      } catch (error) {
        console.error('Error loading data:', error);
        setError(error.message);
      }
    };

    fetchData();
  }, []);

  const getCurrentPageData = () => {
    const start = currentPage * ITEMS_PER_PAGE;
    const end = start + ITEMS_PER_PAGE;
    return data.slice(start, end);
  };

  const goToNextPage = () => {
    if (currentPage < totalPages - 1) {
      setCurrentPage(currentPage + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const goToPreviousPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const formatNumber = (value, key) => {
    if (typeof value !== 'number') return value;
    
    if (key === 'score_final') {
      return value.toFixed(2);
    }
    
    if (['current_price', 'fair_value_min', 'fair_value_max'].includes(key)) {
      return new Intl.NumberFormat('en-US', {
        style: 'decimal',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }).format(value);
    }
    
    return value;
  };

  if (error) {
    return <div className="error-message">Error cargando datos: {error}</div>;
  }

  return (
    <div className="screener-container">
      <h1 className="page-title">Market Screener</h1>
      <div className="table-container">
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
          Anterior
        </button>
        <span className="page-info">
          Página {currentPage + 1} de {totalPages}
        </span>
        <button 
          onClick={goToNextPage} 
          disabled={currentPage === totalPages - 1}
          className="pagination-button"
        >
          Siguiente
        </button>
      </div>
    </div>
  );
};

export default Screener;
