import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './IndekuraValuation.css';
import Modal from '../Modal/Modal';
import { useNavigate } from 'react-router-dom';

const IndekuraValuation = ({ ticker }) => {
  const [valuationData, setValuationData] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showMethodModal, setShowMethodModal] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const [lastFetchedTicker, setLastFetchedTicker] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (ticker && ticker.trim() !== '' && ticker !== lastFetchedTicker) {
      fetchValuationData();
    }
  }, [ticker, lastFetchedTicker]);

  const fetchValuationData = async () => {
    if (!ticker || ticker.trim() === '' || ticker === lastFetchedTicker) return;
    
    setLoading(true);
    setError(null);
    try {
      const baseUrl = import.meta.env.VITE_VALUATION_API_URL.replace(/\/$/, '');
      const response = await axios.get(`${baseUrl}?ticker=${ticker}`);
      setValuationData(response.data);
      setLastFetchedTicker(ticker);
    } catch (err) {
      console.error('Error detallado:', err);
      setError(err.response?.data?.error || err.message || 'Error al obtener los datos de valoración');
    } finally {
      setLoading(false);
    }
  };

  const handleLearnMoreClick = () => {
    navigate('/historical-valuation');
  };

  const formatNumber = (value) => {
    if (value === undefined || value === null) return 'N/A';
    return typeof value === 'number' ? value.toFixed(2) : value;
  };

  if (loading) return <div className="valuation-loading">Cargando valoración...</div>;
  if (error) return <div className="valuation-error">{error}</div>;
  if (!valuationData) return null;

  return (
    <div className="indekura-valuation">
      <div className="valuation-header">
        <h2>Valoración Histórica</h2>
        <div 
          className="info-icon-container"
          onMouseEnter={() => setShowTooltip(true)}
          onMouseLeave={() => setShowTooltip(false)}
        >
          <div className="info-icon">
            <span>?</span>
          </div>
          {showTooltip && (
            <div className="custom-tooltip">
              <p>Este modelo no es adecuado para empresas con EPS negativos o aquellas con alta volatilidad en sus resultados, como las compañías productoras de commodities.</p>
              <p>Para saber más del método de valoración hacer click en el botón Saber más del método de Valoración</p>
            </div>
          )}
        </div>
      </div>
      <div className="valuation-grid">
        <div className="valuation-item">
          <div className="item-content">
            <h3>EPS (TTM)</h3>
            <p>${formatNumber(valuationData['Last EPS ttm'])}</p>
          </div>
        </div>
        <div className="valuation-item">
          <div className="item-content">
            <h3>Precio Mínimo Histórico Ajustado al EPS Actual</h3>
            <p>${formatNumber(valuationData['Precio accion (con crecimiento historico minimo - 1er quintil)'])}</p>
          </div>
        </div>
        <div className="valuation-item">
          <div className="item-content">
            <h3>Precio Conservador</h3>
            <p>${formatNumber(valuationData['Precio accion (con crecimiento historico maximo - 2do quintil)'])}</p>
          </div>
        </div>
        <div className="valuation-item">
          <div className="item-content">
            <h3>Precio Promedio</h3>
            <p>${formatNumber(valuationData['Precio accion (con crecimiento medio del modelo'])}</p>
          </div>
        </div>
      </div>
      
      <div className="valuation-actions">
        <button onClick={() => setShowMethodModal(true)} className="learn-more-button">
          Saber más del método de Valoración
        </button>
      </div>

      <Modal
        isOpen={showMethodModal}
        onClose={() => setShowMethodModal(false)}
        title="Método de Valoración"
      >
        <div className="method-content">
          <p>Este modelo adapta el clásico Modelo de Descuento de Dividendos (DDM), sustituyendo los dividendos por el beneficio por acción (EPS). Se fundamenta en la idea de que los EPS reflejan la capacidad de la empresa para generar valor en el largo plazo, ya que pueden ser reinvertidos eficientemente para impulsar el crecimiento.</p>
          
          <h4>La fórmula fundamental es:</h4>
          <p className="formula">P = EPS / (r - g)</p>

          <p>Donde:</p>
          <ul>
            <li><strong>P</strong>: Precio de la acción.</li>
            <li><strong>EPS</strong>: Beneficio por acción.</li>
            <li><strong>r</strong>: Tasa de descuento o costo de capital.</li>
            <li><strong>g</strong>: Tasa de crecimiento de los EPS.</li>
          </ul>

          <p>Despejando <strong>g</strong> de la fórmula:</p>
          <p className="formula">g = r - EPS/P</p>

          <p>El cociente <strong>EPS/P</strong> es el <em>earnings yield</em>, inverso del múltiplo P/E. Un earnings yield alto indica que la empresa genera buenos beneficios en relación con su precio, asociado a expectativas de crecimiento moderado. Un earnings yield bajo sugiere que el precio es alto respecto a los EPS, implicando mayores expectativas de crecimiento.</p>

          <button onClick={handleLearnMoreClick} className="learn-more-button">
            Ver explicación detallada
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default IndekuraValuation;
