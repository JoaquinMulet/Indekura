import { useState, useEffect } from 'react';
// PropTypes no se está usando en este componente directamente, puedes quitarlo si no lo necesitas aquí.
// import PropTypes from 'prop-types';
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
      // Limpiar error anterior al iniciar nueva búsqueda
      setError(null);
    }
  };

  const handlePasswordSubmit = (e) => {
    // Permitir submit con Enter o click
    if (e.key === 'Enter' || e.type === 'click') {
       // Prevenir doble submit si se presiona Enter en el botón
       e.preventDefault();
      if (password === APP_PASSWORD) {
        setShowPasswordDialog(false);
        setPassword('');
        fetchFinancialData(tempTicker);
      } else {
        setError('Contraseña incorrecta');
        setPassword('');
        // Opcional: mantener el diálogo abierto o cerrarlo
        // setShowPasswordDialog(false);
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
      document.body.appendChild(a); // Requerido en algunos navegadores
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a); // Limpiar
    } catch (err) {
      console.error('Error exporting to Excel:', err);
      setError('Error al exportar a Excel. Por favor, inténtelo de nuevo.');
    }
  };

  return (
    // Contenedor principal de la página de Consultas
    <div className="consultas-container">

      {/* --- Sección de Búsqueda (Siempre Visible) --- */}
      <div className="search-section">
        <form onSubmit={handleSubmit} className="search-form">
          <input
            type="text"
            value={searchTicker}
            onChange={(e) => setSearchTicker(e.target.value)}
            placeholder="Ingrese el ticker (ej: AAPL)"
            className="ticker-input" // Asegúrate que esta clase exista en tu CSS si la necesitas
          />
          <button type="submit" className="search-button">
            Buscar
          </button>
          {/* Botón Exportar movido al área de resultados */}
        </form>
      </div>
      {/* --- Fin Sección de Búsqueda --- */}


      {/* --- Mensaje de Error (si existe) --- */}
      {/* Asegúrate que la clase CSS coincida, usabas 'error' en CSS y 'error-message' aquí */}
      {error && <div className="error">{error}</div>}


      {/* --- Contenido Principal: Loading o Resultados --- */}
      {loading ? (
        <div className="loading">Cargando datos...</div>
      ) : (
        // Renderizar results-container SOLO si hay datos financieros
        financialData && !error && (
          <div className="results-container">
            {/* --- NUEVO: Encabezado de Resultados --- */}
            <div className="results-header">
              {/* Formulario de Búsqueda (Movido Aquí) */}
              <form onSubmit={handleSubmit} className="search-form search-form-in-results"> {/* Clase adicional opcional */}
                <input
                  type="text"
                  value={searchTicker}
                  onChange={(e) => setSearchTicker(e.target.value)}
                  placeholder="Buscar otro ticker..." // Placeholder actualizado
                  className="ticker-input"
                />
                <button type="submit" className="search-button">
                  Buscar
                </button>
              </form>

              {/* Botón Exportar (Movido Aquí) */}
              <button
                type="button"
                onClick={handleExportToExcel}
                className="export-button" // Ya no necesita estilos de pos. absoluta
              >
                Descargar Excel
              </button>
            </div>
            {/* --- FIN Encabezado de Resultados --- */}


            {/* Contenedor para el resto de los resultados (para aplicar padding/margen si es necesario) */}
            <div className="results-actual-content">
              {companyProfile && <CompanyProfile profile={companyProfile} />}
              <IndekuraValuation ticker={currentTicker} />
              <FinancialCharts financialData={financialData} />
            </div>

          </div> // Cierre de results-container
        )
      )}
      {/* --- Fin Contenido Principal --- */}


      {/* --- Diálogo de Contraseña (Renderizado condicionalmente sobre todo) --- */}
      {showPasswordDialog && (
        <div className="password-dialog">
          <div className="password-dialog-content">
            <h2>Ingrese la contraseña</h2>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyPress={handlePasswordSubmit} // Detecta Enter en input
              placeholder="Ingrese la contraseña"
              className="password-input" // Asegúrate que esta clase exista
              autoFocus // Pone el foco aquí al aparecer
            />
            <div className="password-dialog-buttons">
              {/* Usar onClick para ambos botones */}
              <button onClick={handlePasswordSubmit} className="password-button confirm">
                Confirmar
              </button>
              <button
                onClick={() => {
                  setShowPasswordDialog(false);
                  setPassword('');
                  setError(null); // Limpiar error al cancelar
                }}
                className="password-button cancel"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div> // Cierre de consultas-container
  );
};

// PropTypes no está siendo usado, puedes remover la importación si no defines propTypes aquí
// Consultas.propTypes = {
//  // Define tus propTypes si este componente recibiera props
// };

export default Consultas;