import { useState, useEffect } from 'react';
import axios from 'axios';
import ExcelJS from 'exceljs';
import './Consultas.css';
import CompanyProfile from '../components/CompanyProfile/CompanyProfile';
import FinancialCharts from '../components/FinancialCharts/FinancialCharts';

const API_KEY = import.meta.env.VITE_API_KEY;
const APP_PASSWORD = import.meta.env.VITE_APP_PASSWORD;

const Consultas = () => {
  useEffect(() => {
    document.title = 'Indekura Hedge Fund - Consulta de Estados Financieros';
  }, []);

  const [ticker, setTicker] = useState('');
  const [financialData, setFinancialData] = useState(null);
  const [companyProfile, setCompanyProfile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [password, setPassword] = useState('');
  const [tempTicker, setTempTicker] = useState('');

  const fetchFinancialData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [incomeStatement, balanceSheet, cashFlow, estimates, profile] = await Promise.all([
        axios.get(`https://financialmodelingprep.com/api/v3/income-statement/${ticker}?period=annual&apikey=${API_KEY}`),
        axios.get(`https://financialmodelingprep.com/api/v3/balance-sheet-statement/${ticker}?period=annual&apikey=${API_KEY}`),
        axios.get(`https://financialmodelingprep.com/api/v3/cash-flow-statement/${ticker}?period=annual&apikey=${API_KEY}`),
        axios.get(`https://financialmodelingprep.com/api/v3/analyst-estimates/${ticker}?apikey=${API_KEY}`),
        axios.get(`https://financialmodelingprep.com/api/v3/profile/${ticker}?apikey=${API_KEY}`)
      ]);

      // Imprimir columnas de cada tabla
      if (incomeStatement.data && incomeStatement.data.length > 0) {
        console.log('Income Statement Columns:', Object.keys(incomeStatement.data[0]));
      }
      
      if (balanceSheet.data && balanceSheet.data.length > 0) {
        console.log('Balance Sheet Columns:', Object.keys(balanceSheet.data[0]));
      }
      
      if (cashFlow.data && cashFlow.data.length > 0) {
        console.log('Cash Flow Columns:', Object.keys(cashFlow.data[0]));
      }
      
      if (estimates.data && estimates.data.length > 0) {
        console.log('Estimates Columns:', Object.keys(estimates.data[0]));
      }
      
      if (profile.data && profile.data.length > 0) {
        console.log('Company Profile Columns:', Object.keys(profile.data[0]));
      }

      // Ordenar los datos cronológicamente antes de guardarlos
      const sortChronologically = (data) => {
        if (!data || !Array.isArray(data)) return [];
        return [...data].sort((a, b) => new Date(a.date) - new Date(b.date));
      };

      setFinancialData({
        incomeStatement: sortChronologically(incomeStatement.data),
        balanceSheet: sortChronologically(balanceSheet.data),
        cashFlow: sortChronologically(cashFlow.data),
        estimates: sortChronologically(estimates.data)
      });
      
      if (profile.data && profile.data.length > 0) {
        setCompanyProfile(profile.data[0]);
      }
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
    if (e.key === 'Enter' || e.type === 'click') {
      if (password === APP_PASSWORD) {
        setShowPasswordDialog(false);
        setPassword('');
        setTicker(tempTicker);
        fetchFinancialData();
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
    a.download = `${ticker}_financial_data.xlsx`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="consultas-container">
      <div className="consultas-content">
        <h1 className="page-title">Consultas</h1>
        <form className="search-form" onSubmit={handleSubmit}>
          <input
            type="text"
            value={ticker}
            onChange={(e) => setTicker(e.target.value.toUpperCase())}
            placeholder="Ingrese el símbolo (ej: AAPL)"
          />
          <button type="submit">Buscar</button>
          {financialData && (
            <button type="button" onClick={handleExportToExcel}>
              Descargar Excel
            </button>
          )}
        </form>

        {loading && <div className="loading">Cargando...</div>}
        {error && <div className="error">{error}</div>}
        
        {companyProfile && <CompanyProfile profile={companyProfile} />}

        {financialData && (
          <div className="results-container">
            <FinancialCharts financialData={financialData} />
          </div>
        )}

        {showPasswordDialog && (
          <div className="password-dialog">
            <div className="password-dialog-content">
              <h2>Ingrese la contraseña</h2>
              <form>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Contraseña"
                  autoComplete="current-password"
                  name="password"
                  autoFocus
                  onKeyDown={handlePasswordSubmit}
                />
                <div className="password-dialog-buttons">
                  <button type="button" onClick={handlePasswordSubmit}>Confirmar</button>
                  <button type="button" onClick={() => {
                    setShowPasswordDialog(false);
                    setPassword('');
                  }}>
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Consultas;
