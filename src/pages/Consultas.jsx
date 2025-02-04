import { useState, useEffect } from 'react';
import axios from 'axios';
import * as XLSX from 'xlsx';
import './Consultas.css';

const API_KEY = import.meta.env.VITE_API_KEY;
const APP_PASSWORD = import.meta.env.VITE_APP_PASSWORD;

const Consultas = () => {
  useEffect(() => {
    document.title = 'Indekura Hedge Fund - Consulta de Estados Financieros';
  }, []);

  const [ticker, setTicker] = useState('');
  const [financialData, setFinancialData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [password, setPassword] = useState('');
  const [tempTicker, setTempTicker] = useState('');

  const fetchFinancialData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [incomeStatement, balanceSheet, cashFlow, estimates] = await Promise.all([
        axios.get(`https://financialmodelingprep.com/api/v3/income-statement/${ticker}?period=annual&apikey=${API_KEY}`),
        axios.get(`https://financialmodelingprep.com/api/v3/balance-sheet-statement/${ticker}?period=annual&apikey=${API_KEY}`),
        axios.get(`https://financialmodelingprep.com/api/v3/cash-flow-statement/${ticker}?period=annual&apikey=${API_KEY}`),
        axios.get(`https://financialmodelingprep.com/api/v3/analyst-estimates/${ticker}?apikey=${API_KEY}`)
      ]);

      setFinancialData({
        incomeStatement: incomeStatement.data,
        balanceSheet: balanceSheet.data,
        cashFlow: cashFlow.data,
        estimates: estimates.data
      });
    } catch (err) {
      setError('Error al obtener los datos financieros. Por favor, verifica el ticker.');
    }
    setLoading(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (ticker.trim()) {
      setTempTicker(ticker);
      setShowPasswordDialog(true);
    }
  };

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    if (password === APP_PASSWORD) {
      setShowPasswordDialog(false);
      setPassword('');
      setTicker(tempTicker);
      fetchFinancialData();
    } else {
      setError('Contraseña incorrecta');
      setPassword('');
    }
  };

  const downloadExcel = () => {
    if (!financialData) return;

    try {
      const wb = XLSX.utils.book_new();

      const processSheet = (data, sheetName) => {
        if (!data || data.length === 0) return;
        
        // Ordenar los datos por fecha de más antiguo a más reciente
        const sortedData = [...data].sort((a, b) => new Date(a.date) - new Date(b.date));
        const years = sortedData.map(item => new Date(item.date).getFullYear());
        const excludeColumns = ['symbol', 'reportedCurrency', 'cik', 'fillingDate', 'acceptedDate', 'calendarYear', 'period', 'link', 'finalLink', 'date'];
        
        const concepts = Object.keys(sortedData[0]).filter(key => !excludeColumns.includes(key));
        
        const sheetData = [
          ['Concepto', ...years]
        ];
        
        concepts.forEach(concept => {
          const row = [
            concept.replace(/([A-Z])/g, ' $1').trim(),
            ...sortedData.map(item => item[concept])
          ];
          sheetData.push(row);
        });

        const ws = XLSX.utils.aoa_to_sheet(sheetData);
        
        const colWidths = [
          { wch: 40 },
          ...years.map(() => ({ wch: 15 }))
        ];
        ws['!cols'] = colWidths;

        XLSX.utils.book_append_sheet(wb, ws, sheetName);
      };

      // Procesar estados financieros
      processSheet(financialData.incomeStatement, 'Estado de Resultados');
      processSheet(financialData.balanceSheet, 'Balance General');
      processSheet(financialData.cashFlow, 'Flujo de Efectivo');

      // Procesar estimates
      if (financialData.estimates && financialData.estimates.length > 0) {
        const estimatesData = financialData.estimates;
        const sortedEstimates = [...estimatesData].sort((a, b) => new Date(a.date) - new Date(b.date));
        const years = sortedEstimates.map(item => new Date(item.date).getFullYear());
        
        const estimatesSheet = [
          ['Concepto', ...years]
        ];

        const metrics = [
          { key: 'estimatedRevenueAvg', label: 'Ingresos Estimados Promedio' },
          { key: 'estimatedRevenueHigh', label: 'Ingresos Estimados Alto' },
          { key: 'estimatedRevenueLow', label: 'Ingresos Estimados Bajo' },
          { key: 'estimatedEbitdaAvg', label: 'EBITDA Estimado Promedio' },
          { key: 'estimatedEbitdaHigh', label: 'EBITDA Estimado Alto' },
          { key: 'estimatedEbitdaLow', label: 'EBITDA Estimado Bajo' },
          { key: 'estimatedEbitAvg', label: 'EBIT Estimado Promedio' },
          { key: 'estimatedEbitHigh', label: 'EBIT Estimado Alto' },
          { key: 'estimatedEbitLow', label: 'EBIT Estimado Bajo' },
          { key: 'estimatedNetIncomeAvg', label: 'Utilidad Neta Estimada Promedio' },
          { key: 'estimatedNetIncomeHigh', label: 'Utilidad Neta Estimada Alta' },
          { key: 'estimatedNetIncomeLow', label: 'Utilidad Neta Estimada Baja' },
          { key: 'estimatedEpsAvg', label: 'EPS Estimado Promedio' },
          { key: 'estimatedEpsHigh', label: 'EPS Estimado Alto' },
          { key: 'estimatedEpsLow', label: 'EPS Estimado Bajo' },
          { key: 'numberAnalystEstimatedRevenue', label: 'Número de Analistas (Ingresos)' },
          { key: 'numberAnalystsEstimatedEps', label: 'Número de Analistas (EPS)' }
        ];

        metrics.forEach(({ key, label }) => {
          const row = [
            label,
            ...sortedEstimates.map(item => item[key])
          ];
          estimatesSheet.push(row);
        });

        const ws = XLSX.utils.aoa_to_sheet(estimatesSheet);
        const colWidths = [
          { wch: 40 },
          ...years.map(() => ({ wch: 15 }))
        ];
        ws['!cols'] = colWidths;

        XLSX.utils.book_append_sheet(wb, ws, 'Estimaciones');
      }

      XLSX.writeFile(wb, `${ticker}_estados_financieros.xlsx`);
    } catch (err) {
      setError('Error al generar el archivo Excel');
    }
  };

  const renderFinancialTable = (data, title) => {
    if (!data || data.length === 0) return null;
    
    // Ordenar los datos por fecha de más antiguo a más reciente
    const sortedData = [...data].sort((a, b) => new Date(a.date) - new Date(b.date));
    const years = sortedData.map(item => new Date(item.date).getFullYear());
    
    const keys = Object.keys(sortedData[0]).filter(key => 
      key !== 'date' && 
      key !== 'symbol' && 
      key !== 'reportedCurrency' &&
      key !== 'cik' &&
      key !== 'fillingDate' &&
      key !== 'acceptedDate' &&
      key !== 'calendarYear' &&
      key !== 'period' &&
      key !== 'link' &&
      key !== 'finalLink'
    );

    return (
      <div className="financial-table-container">
        <h3>{title}</h3>
        <div className="table-wrapper">
          <table className="financial-table">
            <thead>
              <tr>
                <th>Concepto</th>
                {years.map(year => (
                  <th key={year}>{year}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {keys.map(key => (
                <tr key={key}>
                  <td>{key.replace(/([A-Z])/g, ' $1').trim()}</td>
                  {sortedData.map((item, index) => (
                    <td key={index}>
                      {typeof item[key] === 'number' 
                        ? new Intl.NumberFormat('en-US', {
                            style: 'decimal',
                            maximumFractionDigits: 0
                          }).format(item[key])
                        : item[key]}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const renderEstimatesTable = () => {
    if (!financialData || !financialData.estimates) return null;

    const estimatesData = financialData.estimates;
    const sortedEstimates = [...estimatesData].sort((a, b) => new Date(a.date) - new Date(b.date));
    const years = sortedEstimates.map(item => new Date(item.date).getFullYear());

    const metrics = [
      { key: 'estimatedRevenueAvg', label: 'Ingresos Estimados Promedio' },
      { key: 'estimatedRevenueHigh', label: 'Ingresos Estimados Alto' },
      { key: 'estimatedRevenueLow', label: 'Ingresos Estimados Bajo' },
      { key: 'estimatedEbitdaAvg', label: 'EBITDA Estimado Promedio' },
      { key: 'estimatedEbitdaHigh', label: 'EBITDA Estimado Alto' },
      { key: 'estimatedEbitdaLow', label: 'EBITDA Estimado Bajo' },
      { key: 'estimatedEbitAvg', label: 'EBIT Estimado Promedio' },
      { key: 'estimatedEbitHigh', label: 'EBIT Estimado Alto' },
      { key: 'estimatedEbitLow', label: 'EBIT Estimado Bajo' },
      { key: 'estimatedNetIncomeAvg', label: 'Utilidad Neta Estimada Promedio' },
      { key: 'estimatedNetIncomeHigh', label: 'Utilidad Neta Estimada Alta' },
      { key: 'estimatedNetIncomeLow', label: 'Utilidad Neta Estimada Baja' },
      { key: 'estimatedEpsAvg', label: 'EPS Estimado Promedio' },
      { key: 'estimatedEpsHigh', label: 'EPS Estimado Alto' },
      { key: 'estimatedEpsLow', label: 'EPS Estimado Bajo' },
      { key: 'numberAnalystEstimatedRevenue', label: 'Número de Analistas (Ingresos)' },
      { key: 'numberAnalystsEstimatedEps', label: 'Número de Analistas (EPS)' }
    ];

    return (
      <div className="financial-table-container">
        <h3>Estimaciones</h3>
        <div className="table-wrapper">
          <table className="financial-table">
            <thead>
              <tr>
                <th>Concepto</th>
                {years.map(year => (
                  <th key={year}>{year}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {metrics.map(({ key, label }) => (
                <tr key={key}>
                  <td>{label}</td>
                  {sortedEstimates.map((item, index) => (
                    <td key={index}>
                      {typeof item[key] === 'number' 
                        ? new Intl.NumberFormat('en-US', {
                            style: 'decimal',
                            maximumFractionDigits: 0
                          }).format(item[key])
                        : item[key]}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  return (
    <main className="consultas-container">
      <header>
        <h1 className="consultas-title">Consulta de Estados Financieros</h1>
      </header>
      
      <section className="search-section" aria-label="Búsqueda de empresa">
        <form onSubmit={handleSubmit} className="search-form" role="search">
          <label htmlFor="ticker-input" className="visually-hidden">
            Símbolo de la empresa
          </label>
          <input
            id="ticker-input"
            type="text"
            value={ticker}
            onChange={(e) => setTicker(e.target.value.toUpperCase())}
            placeholder="Ej: AAPL"
            className="ticker-input"
            aria-label="Ingrese el símbolo de la empresa"
          />
          <button type="submit" className="search-button" disabled={loading}>
            {loading ? 'Cargando...' : 'Buscar'}
          </button>
        </form>
      </section>

      {error && (
        <div className="error-message" role="alert" aria-live="polite">
          {error}
        </div>
      )}

      {showPasswordDialog && (
        <div className="password-dialog-overlay" role="dialog" aria-modal="true" aria-labelledby="password-dialog-title">
          <div className="password-dialog">
            <h2 id="password-dialog-title">Ingrese la contraseña</h2>
            <form onSubmit={handlePasswordSubmit}>
              <label htmlFor="password-input" className="visually-hidden">
                Contraseña
              </label>
              <input
                id="password-input"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="password-input"
                autoFocus
                aria-label="Ingrese la contraseña"
              />
              <div className="password-dialog-buttons">
                <button type="submit" className="confirm-button">
                  Confirmar
                </button>
                <button
                  type="button"
                  className="cancel-button"
                  onClick={() => {
                    setShowPasswordDialog(false);
                    setPassword('');
                    setError(null);
                  }}
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {financialData && (
        <section className="financial-data-container" aria-label="Resultados financieros">
          <div className="download-section">
            <button 
              onClick={downloadExcel} 
              className="download-button"
              aria-label="Descargar datos en Excel"
            >
              Descargar Excel
            </button>
          </div>

          {renderFinancialTable(financialData.incomeStatement, 'Estado de Resultados')}
          {renderFinancialTable(financialData.balanceSheet, 'Balance General')}
          {renderFinancialTable(financialData.cashFlow, 'Flujo de Efectivo')}
          {renderEstimatesTable()}
        </section>
      )}
    </main>
  );
};

export default Consultas;
