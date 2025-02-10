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
          <p>La valoración se basa en una adaptación del clásico Modelo de Descuento de Dividendos, pero en lugar de utilizar los dividendos, se usa el beneficio por acción (EPS). La idea principal es que, a lo largo del tiempo, los EPS reflejan los flujos de caja futuros de la empresa, ya que los beneficios se reinvierten de forma eficiente para generar crecimiento.</p>
          
          <h4>La fórmula fundamental es:</h4>
          <p className="formula">P = EPS / (r - g)</p>
          
          <p>Donde:</p>
          <ul>
            <li>P: Precio de la acción.</li>
            <li>EPS: Beneficio por acción.</li>
            <li>r: Tasa de descuento o costo de capital (que incorpora el riesgo).</li>
            <li>g: Tasa de crecimiento constante de los EPS a futuro.</li>
          </ul>

          <p>Si despejamos g de la fórmula, obtenemos:</p>
          <p className="formula">g = r - EPS/P</p>

          <p>Aquí, el cociente EPS/P se conoce como earnings yield (rendimiento de las ganancias) y es el inverso del múltiplo precio-beneficio (P/E). Un earnings yield alto indica que, en relación al precio, la empresa genera buenos beneficios, lo que suele asociarse a expectativas de crecimiento moderado; mientras que un earnings yield bajo sugiere que el precio está alto en relación a los EPS, implicando que se esperan mayores tasas de crecimiento.</p>

          <button onClick={handleLearnMoreClick} className="learn-more-button">
            Ver explicación detallada
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default IndekuraValuation;
