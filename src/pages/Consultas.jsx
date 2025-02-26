import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import './Consultas.css';
import CompanyProfile from '../components/CompanyProfile/CompanyProfile';
import FinancialCharts from '../components/FinancialCharts/FinancialCharts';
import IndekuraValuation from '../components/IndekuraValuation/IndekuraValuation';
import { useFinancialData } from '../hooks/useFinancialData';
import { exportFinancialDataToExcel } from '../services/excelService';

const APP_PASSWORD = import.meta.env.VITE_APP_PASSWORD;

const Consultas = () => {
  useEffect(() => {
    document.title = 'Indekura Hedge Fund - Consulta de Estados Financieros';
  }, []);

  const {
    searchTicker,
    setSearchTicker,
    currentTicker,
    financialData,
    companyProfile,
    loading,
    error,
    setError,
    fetchFinancialData
  } = useFinancialData();

  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [password, setPassword] = useState('');
  const [tempTicker, setTempTicker] = useState('');

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
    if (!financialData || !currentTicker) return;
    
    try {
      const blob = await exportFinancialDataToExcel(financialData, currentTicker);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${currentTicker}_financial_data.xlsx`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error exporting to Excel:', err);
      setError('Error al exportar a Excel. Por favor, inténtelo de nuevo.');
    }
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
