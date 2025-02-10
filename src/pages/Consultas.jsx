import { useState, useEffect } from 'react';
import axios from 'axios';
import ExcelJS from 'exceljs';
import './Consultas.css';
import CompanyProfile from '../components/CompanyProfile/CompanyProfile';
import FinancialCharts from '../components/FinancialCharts/FinancialCharts';
import IndekuraValuation from '../components/IndekuraValuation/IndekuraValuation';

const API_KEY = import.meta.env.VITE_API_KEY;
const APP_PASSWORD = import.meta.env.VITE_APP_PASSWORD;

const Consultas = () => {
  useEffect(() => {
    document.title = 'Indekura Hedge Fund - Consulta de Estados Financieros';
  }, []);

  const [searchTicker, setSearchTicker] = useState('');
  const [currentTicker, setCurrentTicker] = useState('');
  const [financialData, setFinancialData] = useState(null);
  const [companyProfile, setCompanyProfile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [password, setPassword] = useState('');
  const [tempTicker, setTempTicker] = useState('');

  const fetchFinancialData = async (ticker) => {
    setLoading(true);
    setError(null);
    setFinancialData(null);
    setCompanyProfile(null);

    try {
      console.log('Fetching data for ticker:', ticker); // Debug log
      const [incomeStatement, balanceSheet, cashFlow, estimates, profile] = await Promise.all([
        axios.get(`https://financialmodelingprep.com/api/v3/income-statement/${ticker}?period=annual&apikey=${API_KEY}`),
        axios.get(`https://financialmodelingprep.com/api/v3/balance-sheet-statement/${ticker}?period=annual&apikey=${API_KEY}`),
        axios.get(`https://financialmodelingprep.com/api/v3/cash-flow-statement/${ticker}?period=annual&apikey=${API_KEY}`),
        axios.get(`https://financialmodelingprep.com/api/v3/analyst-estimates/${ticker}?apikey=${API_KEY}`),
        axios.get(`https://financialmodelingprep.com/api/v3/profile/${ticker}?apikey=${API_KEY}`)
      ]);

      // Ordenar los datos cronológicamente antes de guardarlos
      const sortChronologically = (data) => {
        if (!data || !Array.isArray(data)) return [];
        return [...data].sort((a, b) => new Date(a.date) - new Date(b.date));
      };

      const newFinancialData = {
        incomeStatement: sortChronologically(incomeStatement.data),
        balanceSheet: sortChronologically(balanceSheet.data),
        cashFlow: sortChronologically(cashFlow.data),
        estimates: sortChronologically(estimates.data)
      };

      if (profile.data && Array.isArray(profile.data) && profile.data.length > 0) {
        setCompanyProfile(profile.data[0]);
        setFinancialData(newFinancialData);
        setCurrentTicker(ticker);
      } else {
        setError(`No se encontró información para el ticker ${ticker}`);
      }
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Error al obtener los datos financieros. Por favor, verifica el ticker.');
    }
    setLoading(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmedTicker = searchTicker.trim().toUpperCase();
    if (trimmedTicker) {
      setTempTicker(trimmedTicker);
      setShowPasswordDialog(true);
    }
  };

  const handlePasswordSubmit = (e) => {
    if (e.key === 'Enter' || e.type === 'click') {
      if (password === APP_PASSWORD) {
        setShowPasswordDialog(false);
        setPassword('');
        fetchFinancialData(tempTicker);
      } else {
        setError('Contraseña incorrecta');
        setPassword('');
      }
    }
  };

  const handleExportToExcel = async () => {
    const workbook = new ExcelJS.Workbook();
    
    // Función para transponer datos
    const transposeData = (data) => {
      if (!data || data.length === 0) return [];
      const headers = Object.keys(data[0]).filter(key => key !== 'date');
      const years = data.map(item => item.date);
      
      return headers.map(header => {
        return [header, ...data.map(item => item[header])];
      });
    };

    // Función para crear y formatear una hoja
    const createSheet = (name, data) => {
      const sheet = workbook.addWorksheet(name);
      const transposedData = transposeData(data);
      
      // Agregar años como encabezados
      const years = data.map(item => item.date);
      sheet.getRow(1).values = ['Concepto', ...years];
      
      // Agregar datos
      transposedData.forEach((row, index) => {
        sheet.getRow(index + 2).values = row;
      });
      
      // Formatear encabezados
      const headerRow = sheet.getRow(1);
      headerRow.font = { bold: true };
      headerRow.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFE2E8F0' }
      };
      
      // Ajustar ancho de columnas
      sheet.columns.forEach(column => {
        column.width = 15;
      });
      
      // Agregar bordes a todas las celdas con datos
      const lastRow = sheet.lastRow.number;
      const lastCol = sheet.lastColumn.number;
      for (let row = 1; row <= lastRow; row++) {
        for (let col = 1; col <= lastCol; col++) {
          const cell = sheet.getCell(row, col);
          cell.border = {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' }
          };
        }
      }
    };

    // Crear hojas para cada tipo de estado financiero
    if (financialData.incomeStatement.length > 0) {
      createSheet('Income Statement', financialData.incomeStatement);
    }
    if (financialData.balanceSheet.length > 0) {
      createSheet('Balance Sheet', financialData.balanceSheet);
    }
    if (financialData.cashFlow.length > 0) {
      createSheet('Cash Flow', financialData.cashFlow);
    }
    if (financialData.estimates.length > 0) {
      createSheet('Estimates', financialData.estimates);
    }

    // Generar y descargar el archivo
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${currentTicker}_financial_data.xlsx`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="consultas-container">
      <div className="search-section">
        <form onSubmit={handleSubmit} className="search-form">
          <input
            type="text"
            value={searchTicker}
            onChange={(e) => setSearchTicker(e.target.value)}
            placeholder="Ingrese el ticker (ej: AAPL)"
            className="ticker-input"
          />
          <button type="submit" className="search-button">
            Buscar
          </button>
          {financialData && (
            <button type="button" onClick={handleExportToExcel} className="export-button">
              Descargar Excel
            </button>
          )}
        </form>
      </div>

      {showPasswordDialog && (
        <div className="password-dialog">
          <div className="password-dialog-content">
            <h2>Ingrese la contraseña</h2>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyPress={handlePasswordSubmit}
              placeholder="Ingrese la contraseña"
              className="password-input"
              autoFocus
            />
            <div className="password-dialog-buttons">
              <button onClick={handlePasswordSubmit} className="password-button">
                Confirmar
              </button>
              <button 
                onClick={() => {
                  setShowPasswordDialog(false);
                  setPassword('');
                }} 
                className="password-button cancel"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {error && <div className="error-message">{error}</div>}
      
      {loading ? (
        <div className="loading">Cargando datos...</div>
      ) : (
        <div className="results-container">
          {companyProfile && <CompanyProfile profile={companyProfile} />}
          {financialData && (
            <>
              <IndekuraValuation ticker={currentTicker} />
              <FinancialCharts financialData={financialData} />
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default Consultas;
