import React from 'react';
import DatePicker from 'react-datepicker';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCalculator,
  faQuestionCircle,
  faChartLine,
  faExchangeAlt,
  faCalendarAlt,
  faPercentage,
  faDollarSign
} from '@fortawesome/free-solid-svg-icons';
import 'react-datepicker/dist/react-datepicker.css';
import './OptionsForm.css';

/**
 * Componente de formulario para el cálculo de opciones financieras
 * 
 * @param {Object} props - Propiedades del componente
 * @param {Object} props.inputs - Valores de entrada del formulario
 * @param {Function} props.handleInputChange - Manejador de cambios en inputs numéricos
 * @param {Function} props.handleDateChange - Manejador de cambios en la fecha
 * @param {Function} props.handleOptionTypeChange - Manejador de cambios en el tipo de opción
 * @param {Function} props.handleCalculate - Función para calcular resultados
 * @param {boolean} props.isLoading - Indicador de carga
 */
const OptionsForm = ({
  inputs,
  handleInputChange,
  handleDateChange,
  handleOptionTypeChange,
  handleCalculate,
  isLoading
}) => {
  // Función para renderizar un tooltip
  const renderTooltip = (text) => (
    <FontAwesomeIcon 
      icon={faQuestionCircle} 
      className="ms-1 tooltip-icon" 
      data-bs-toggle="tooltip" 
      data-bs-placement="top" 
      title={text} 
    />
  );

  return (
    <div className="card mb-4 options-form-card">
      <div className="card-header d-flex align-items-center options-form-header">
        <FontAwesomeIcon icon={faCalculator} className="me-2 text-primary" />
        <h5 className="mb-0">Calculadora de Opciones de Divisas</h5>
      </div>
      
      <div className="card-body">
        <div className="alert info-alert mb-3" role="alert">
          <small>
            <strong>Modelo Garman-Kohlhagen:</strong> Esta calculadora utiliza el modelo Garman-Kohlhagen para valorar opciones europeas sobre divisas, 
            extendiendo el modelo Black-Scholes para incluir tasas de interés doméstica (CLP) y extranjera (USD).
          </small>
        </div>
        
        <form>
          {/* Sección: Tipo de Opción */}
          <div className="mb-4">
            <h6 className="section-title">
              <FontAwesomeIcon icon={faExchangeAlt} className="me-2 text-secondary" />
              Tipo de Opción
            </h6>
            
            <div className="d-flex gap-4 mb-3">
              <div className="form-check">
                <input
                  className="form-check-input"
                  type="radio"
                  name="optionType"
                  id="callOption"
                  value="call"
                  checked={inputs.optionType === 'call'}
                  onChange={handleOptionTypeChange}
                />
                <label className="form-check-label" htmlFor="callOption">
                  <strong>Call (Compra)</strong>
                  <div className="text-muted small">
                    Derecho a comprar divisas al precio strike
                  </div>
                </label>
              </div>
              
              <div className="form-check">
                <input
                  className="form-check-input"
                  type="radio"
                  name="optionType"
                  id="putOption"
                  value="put"
                  checked={inputs.optionType === 'put'}
                  onChange={handleOptionTypeChange}
                />
                <label className="form-check-label" htmlFor="putOption">
                  <strong>Put (Venta)</strong>
                  <div className="text-muted small">
                    Derecho a vender divisas al precio strike
                  </div>
                </label>
              </div>
            </div>
          </div>
          
          {/* Sección: Precios y Fechas */}
          <div className="mb-4">
            <h6 className="section-title">
              <FontAwesomeIcon icon={faChartLine} className="me-2 text-secondary" />
              Precios y Fechas
            </h6>
            
            <div className="row g-3">
              <div className="col-md-6">
                <label htmlFor="spot" className="form-label">
                  Precio Spot (CLP/USD) 
                  {renderTooltip("Precio actual del tipo de cambio CLP/USD en el mercado.")}
                </label>
                <div className="input-group">
                  <span className="input-group-text">$</span>
                  <input
                    type="number"
                    className="form-control"
                    id="spot"
                    value={inputs.spot || ''}
                    onChange={handleInputChange}
                    name="spot"
                    min="0"
                    step="0.01"
                    required
                  />
                  <span className="input-group-text">CLP/USD</span>
                </div>
              </div>
              
              <div className="col-md-6">
                <label htmlFor="strike" className="form-label">
                  Precio Strike (CLP/USD) 
                  {renderTooltip("Precio al que se puede ejercer la opción en la fecha de vencimiento.")}
                </label>
                <div className="input-group">
                  <span className="input-group-text">$</span>
                  <input
                    type="number"
                    className="form-control"
                    id="strike"
                    value={inputs.strike || ''}
                    onChange={handleInputChange}
                    name="strike"
                    min="0"
                    step="0.01"
                    required
                  />
                  <span className="input-group-text">CLP/USD</span>
                </div>
              </div>
              
              <div className="col-md-6">
                <label htmlFor="maturityDate" className="form-label">
                  Fecha de Vencimiento 
                  {renderTooltip("Fecha en la que expira la opción y puede ser ejercida (para opciones europeas).")}
                </label>
                <div className="input-group">
                  <span className="input-group-text">
                    <FontAwesomeIcon icon={faCalendarAlt} />
                  </span>
                  <DatePicker
                    selected={inputs.maturityDate}
                    onChange={handleDateChange}
                    className="form-control"
                    dateFormat="dd/MM/yyyy"
                    minDate={new Date()}
                    id="maturityDate"
                    name="maturityDate"
                    required
                  />
                </div>
              </div>
              
              <div className="col-md-6">
                <label htmlFor="amount" className="form-label">
                  Monto Nominal (USD) 
                  {renderTooltip("Monto nominal de la operación en dólares estadounidenses.")}
                </label>
                <div className="input-group">
                  <span className="input-group-text">
                    <FontAwesomeIcon icon={faDollarSign} />
                  </span>
                  <input
                    type="number"
                    className="form-control"
                    id="amount"
                    value={inputs.amount || ''}
                    onChange={handleInputChange}
                    name="amount"
                    min="0"
                    step="1000"
                    required
                  />
                  <span className="input-group-text">USD</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Sección: Tasas y Volatilidad */}
          <div className="mb-4">
            <h6 className="section-title">
              <FontAwesomeIcon icon={faPercentage} className="me-2 text-secondary" />
              Tasas y Volatilidad
            </h6>
            
            <div className="row g-3">
              <div className="col-md-4">
                <label htmlFor="domesticRate" className="form-label">
                  Tasa CLP 
                  {renderTooltip("Tasa de interés doméstica (Chile) anualizada.")}
                </label>
                <div className="input-group">
                  <input
                    type="number"
                    className="form-control"
                    id="domesticRate"
                    value={inputs.domesticRate || ''}
                    onChange={handleInputChange}
                    name="domesticRate"
                    min="0"
                    max="1"
                    step="0.001"
                    required
                  />
                  <span className="input-group-text">%</span>
                </div>
                <div className="form-text">Ejemplo: 0.055 para 5.5%</div>
              </div>
              
              <div className="col-md-4">
                <label htmlFor="foreignRate" className="form-label">
                  Tasa USD 
                  {renderTooltip("Tasa de interés extranjera (EE.UU.) anualizada.")}
                </label>
                <div className="input-group">
                  <input
                    type="number"
                    className="form-control"
                    id="foreignRate"
                    value={inputs.foreignRate || ''}
                    onChange={handleInputChange}
                    name="foreignRate"
                    min="0"
                    max="1"
                    step="0.001"
                    required
                  />
                  <span className="input-group-text">%</span>
                </div>
                <div className="form-text">Ejemplo: 0.059 para 5.9%</div>
              </div>
              
              <div className="col-md-4">
                <label htmlFor="volatility" className="form-label">
                  Volatilidad 
                  {renderTooltip("Volatilidad anualizada del tipo de cambio CLP/USD.")}
                </label>
                <div className="input-group">
                  <input
                    type="number"
                    className="form-control"
                    id="volatility"
                    value={inputs.volatility || ''}
                    onChange={handleInputChange}
                    name="volatility"
                    min="0"
                    max="1"
                    step="0.001"
                    required
                  />
                  <span className="input-group-text">%</span>
                </div>
                <div className="form-text">Ejemplo: 0.159 para 15.9%</div>
              </div>
            </div>
          </div>
          
          {/* Botón de cálculo */}
          <div className="d-grid gap-2 mt-4">
            <button
              type="button"
              className="btn btn-primary btn-calculate"
              onClick={handleCalculate}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  Calculando...
                </>
              ) : (
                <>
                  <FontAwesomeIcon icon={faCalculator} className="me-2" />
                  Calcular Opción
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default OptionsForm;
