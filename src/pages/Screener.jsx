import { useState, useEffect } from 'react';
import './Screener.css';

const ITEMS_PER_PAGE = 50;

const Screener = () => {
  const [data, setData] = useState([]);
  const [headers, setHeaders] = useState([]);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/empresas_filtradas_g_20250203.csv');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const text = await response.text();
        
        const lines = text.split('\n').filter(line => line.trim() !== '');
        if (lines.length === 0) {
          throw new Error('CSV está vacío');
        }

        const headerRow = lines[0];
        const headerColumns = headerRow.split(',').map(header => header.trim());
        setHeaders(headerColumns);

        const dataRows = lines.slice(1);
        const formattedData = dataRows.map(row => {
          const values = row.split(',').map(value => value.trim());
          const rowData = {};
          headerColumns.forEach((header, index) => {
            rowData[header] = values[index] || '';
          });
          return rowData;
        });
        
        setData(formattedData);
        setTotalPages(Math.ceil(formattedData.length / ITEMS_PER_PAGE));
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

  const formatNumber = (value) => {
    if (typeof value === 'number') {
      return new Intl.NumberFormat('en-US', {
        style: 'decimal',
        minimumFractionDigits: 0,
        maximumFractionDigits: 2
      }).format(value);
    }
    return value;
  };

  const renderTableCell = (item, column) => {
    const value = item[column.key];
    return (
      <td key={column.key}>
        {formatNumber(value)}
      </td>
    );
  };

  if (error) {
    return <div className="error-message">Error cargando datos: {error}</div>;
  }

  return (
    <div className="screener-container">
      <h2 className="screener-title">Market Screener</h2>
      <div className="table-container">
        {headers.length > 0 && (
          <>
            <table className="data-table">
              <thead>
                <tr>
                  {headers.map((header, index) => (
                    <th key={index}>{header}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {getCurrentPageData().map((row, rowIndex) => (
                  <tr key={rowIndex}>
                    {headers.map((header, colIndex) => (
                      renderTableCell(row, { key: header })
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="pagination">
              <button 
                className="pagination-button"
                onClick={goToPreviousPage}
                disabled={currentPage === 0}
              >
                ← Anterior
              </button>
              <span className="page-info">
                Página {currentPage + 1} de {totalPages}
              </span>
              <button 
                className="pagination-button"
                onClick={goToNextPage}
                disabled={currentPage === totalPages - 1}
              >
                Siguiente →
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Screener;
