import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faInfoCircle,
  faExclamationTriangle,
  faQuestionCircle,
  faTable,
  faCalculator
} from '@fortawesome/free-solid-svg-icons';
import { formatNumber, formatCurrency, formatPercent } from '../../services/formatService';

/**
 * Componente para mostrar los resultados del cálculo de opciones financieras
 * 
 * @param {Object} props - Propiedades del componente
 * @param {boolean} props.isLoading - Indica si está cargando los resultados
 * @param {string} props.error - Mensaje de error, si existe
 * @param {Object} props.results - Resultados del cálculo de la opción
 * @param {Array} props.scenarios - Escenarios generados para el gráfico
 * @param {React.RefObject} props.chartRef - Referencia al elemento canvas para el gráfico
 */
const ResultsPanel = ({ isLoading, error, results, scenarios, chartRef }) => {
  if (isLoading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Cargando...</span>
        </div>
        <p className="mt-3">Calculando resultados...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-danger" role="alert" style={{ margin: '20px 0' }}>
        <FontAwesomeIcon icon={faExclamationTriangle} className="me-2" />
        {error}
      </div>
    );
  }

  if (!results || !results.premium) {
    return (
      <div className="text-center py-5">
        <FontAwesomeIcon icon={faInfoCircle} className="me-2" />
        <p>No hay resultados disponibles. Por favor, calcula una opción.</p>
      </div>
    );
  }

  return (
    <>
      <div className="card mb-4" style={{ border: '1px solid #eaeaea', boxShadow: '0 2px 4px rgba(0,0,0,0.03)' }}>
        <div className="card-header" style={{ backgroundColor: '#ffffff', borderBottom: '1px solid #eaeaea' }}>
          <FontAwesomeIcon icon={faInfoCircle} className="me-2" />
          Resultados del Análisis
        </div>
        <div className="card-body">
          <h5 className="mb-3">Resumen de la Opción</h5>
          
          {/* Tabla de resumen de resultados */}
          <div className="table-responsive mb-4">
            <table className="table table-sm table-bordered">
              <thead className="table-light">
                <tr>
                  <th colSpan="4" className="text-center">Parámetros y Resultados Principales</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={{ width: '25%' }} className="table-light">
                    <strong>Prima (CLP/USD)</strong>
                    <FontAwesomeIcon 
                      icon={faQuestionCircle} 
                      className="ms-1" 
                      style={{ fontSize: '0.8rem', color: '#6c757d' }}
                      data-bs-toggle="tooltip" 
                      data-bs-placement="top" 
                      title="Precio de la opción por unidad de divisa según modelo Garman-Kohlhagen" 
                    />
                  </td>
                  <td className="text-end">{formatCurrency(results.premium, 'CLP', 2)}</td>
                  <td style={{ width: '25%' }} className="table-light">
                    <strong>Prima Total (CLP)</strong>
                    <FontAwesomeIcon 
                      icon={faQuestionCircle} 
                      className="ms-1" 
                      style={{ fontSize: '0.8rem', color: '#6c757d' }}
                      data-bs-toggle="tooltip" 
                      data-bs-placement="top" 
                      title="Costo total de la opción para el monto nominal especificado" 
                    />
                  </td>
                  <td className="text-end">{formatCurrency(results.totalPremium, 'CLP', 2)}</td>
                </tr>
                <tr>
                  <td className="table-light">
                    <strong>Punto de Equilibrio</strong>
                    <FontAwesomeIcon 
                      icon={faQuestionCircle} 
                      className="ms-1" 
                      style={{ fontSize: '0.8rem', color: '#6c757d' }}
                      data-bs-toggle="tooltip" 
                      data-bs-placement="top" 
                      title="Tipo de cambio donde el resultado neto de la opción es cero (prima = payoff)" 
                    />
                  </td>
                  <td className="text-end">{formatNumber(results.breakEven, 2)} CLP/USD</td>
                  <td className="table-light">
                    <strong>Días al Vencimiento</strong>
                    <FontAwesomeIcon 
                      icon={faQuestionCircle} 
                      className="ms-1" 
                      style={{ fontSize: '0.8rem', color: '#6c757d' }}
                      data-bs-toggle="tooltip" 
                      data-bs-placement="top" 
                      title="Número de días hasta la fecha de vencimiento de la opción" 
                    />
                  </td>
                  <td className="text-end">{results.daysToMaturity} días</td>
                </tr>
                <tr>
                  <td className="table-light">
                    <strong>Valor Intrínseco</strong>
                    <FontAwesomeIcon 
                      icon={faQuestionCircle} 
                      className="ms-1" 
                      style={{ fontSize: '0.8rem', color: '#6c757d' }}
                      data-bs-toggle="tooltip" 
                      data-bs-placement="top" 
                      title="Valor que tendría la opción si se ejerciera inmediatamente" 
                    />
                  </td>
                  <td className="text-end">{formatCurrency(results.intrinsicValue, 'CLP', 2)}</td>
                  <td className="table-light">
                    <strong>Valor Temporal</strong>
                    <FontAwesomeIcon 
                      icon={faQuestionCircle} 
                      className="ms-1" 
                      style={{ fontSize: '0.8rem', color: '#6c757d' }}
                      data-bs-toggle="tooltip" 
                      data-bs-placement="top" 
                      title="Valor adicional de la opción debido al tiempo restante hasta el vencimiento" 
                    />
                  </td>
                  <td className="text-end">{formatCurrency(results.timeValue, 'CLP', 2)}</td>
                </tr>
                <tr>
                  <td className="table-light">
                    <strong>Divisas Cubiertas</strong>
                    <FontAwesomeIcon 
                      icon={faQuestionCircle} 
                      className="ms-1" 
                      style={{ fontSize: '0.8rem', color: '#6c757d' }}
                      data-bs-toggle="tooltip" 
                      data-bs-placement="top" 
                      title="Cantidad de divisas que se pueden comprar/vender con el monto nominal" 
                    />
                  </td>
                  <td className="text-end">{formatNumber(results.currencyAmount, 2)} USD</td>
                  <td className="table-light">
                    <strong>Tiempo (T)</strong>
                    <FontAwesomeIcon 
                      icon={faQuestionCircle} 
                      className="ms-1" 
                      style={{ fontSize: '0.8rem', color: '#6c757d' }}
                      data-bs-toggle="tooltip" 
                      data-bs-placement="top" 
                      title="Tiempo hasta el vencimiento en años, parámetro T del modelo Garman-Kohlhagen" 
                    />
                  </td>
                  <td className="text-end">{formatNumber(results.timeToMaturity, 6)} años</td>
                </tr>
              </tbody>
            </table>
          </div>
          
          {/* Tabla de parámetros griegos */}
          <h5 className="mb-3">Parámetros de Sensibilidad (Griegos)</h5>
          <div className="table-responsive mb-4">
            <table className="table table-sm table-bordered">
              <thead className="table-light">
                <tr>
                  <th style={{ width: '20%' }}>Griego</th>
                  <th style={{ width: '15%' }}>Valor</th>
                  <th>Interpretación</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="table-light">
                    <strong>Delta (Δ)</strong>
                  </td>
                  <td className="text-end">{formatNumber(results.delta, 4)}</td>
                  <td>
                    <small>Sensibilidad del precio de la opción ante cambios en el precio del activo subyacente.</small>
                  </td>
                </tr>
                <tr>
                  <td className="table-light">
                    <strong>Gamma (Γ)</strong>
                  </td>
                  <td className="text-end">{formatNumber(results.gamma, 4)}</td>
                  <td>
                    <small>Tasa de cambio de delta con respecto al precio del subyacente.</small>
                  </td>
                </tr>
                <tr>
                  <td className="table-light">
                    <strong>Theta (Θ)</strong>
                  </td>
                  <td className="text-end">{formatNumber(results.theta, 4)}</td>
                  <td>
                    <small>Sensibilidad del precio de la opción al paso del tiempo (por día).</small>
                  </td>
                </tr>
                <tr>
                  <td className="table-light">
                    <strong>Vega (ν)</strong>
                  </td>
                  <td className="text-end">{formatNumber(results.vega, 4)}</td>
                  <td>
                    <small>Sensibilidad del precio de la opción a cambios en la volatilidad.</small>
                  </td>
                </tr>
                <tr>
                  <td className="table-light">
                    <strong>Rho (ρ)</strong>
                  </td>
                  <td className="text-end">{formatNumber(results.rho, 4)}</td>
                  <td>
                    <small>Sensibilidad del precio de la opción a cambios en la tasa de interés.</small>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          
          {/* Gráfico de escenarios */}
          <h5 className="mb-3">Gráfico de Escenarios al Vencimiento</h5>
          <div style={{ height: '400px', position: 'relative' }}>
            <canvas ref={chartRef}></canvas>
          </div>
          
          {/* Nota informativa */}
          <div className="alert alert-info mt-4" role="alert">
            <h6 className="alert-heading">
              <FontAwesomeIcon icon={faInfoCircle} className="me-2" />
              Nota sobre el Modelo
            </h6>
            <p className="mb-0">
              El modelo Garman-Kohlhagen es el estándar para valorar opciones europeas sobre divisas. 
              Extiende el modelo Black-Scholes para incluir las tasas de interés doméstica (CLP) y extranjera (USD).
              Los escenarios mostrados representan el resultado al vencimiento para diferentes valores del tipo de cambio.
            </p>
          </div>
        </div>
      </div>
      
      {/* Tabla de escenarios detallados */}
      <div className="card mb-4" style={{ border: '1px solid #eaeaea', boxShadow: '0 2px 4px rgba(0,0,0,0.03)' }}>
        <div className="card-header" style={{ backgroundColor: '#ffffff', borderBottom: '1px solid #eaeaea' }}>
          <FontAwesomeIcon icon={faTable} className="me-2" />
          Escenarios Detallados
        </div>
        <div className="card-body">
          <div className="table-responsive">
            <table className="table table-sm table-striped">
              <thead className="table-light">
                <tr>
                  <th>Precio Spot (CLP/USD)</th>
                  <th>Payoff (CLP)</th>
                  <th>Resultado Neto (CLP)</th>
                  <th>Rentabilidad (%)</th>
                </tr>
              </thead>
              <tbody>
                {scenarios && scenarios.map((scenario, index) => (
                  <tr key={index}>
                    <td>{formatNumber(scenario.futureSpot, 2)}</td>
                    <td>{formatCurrency(scenario.payoff, 'CLP', 2)}</td>
                    <td className={scenario.result >= 0 ? 'text-success' : 'text-danger'}>
                      {formatCurrency(scenario.result, 'CLP', 2)}
                    </td>
                    <td className={scenario.resultPercent >= 0 ? 'text-success' : 'text-danger'}>
                      {formatPercent(scenario.resultPercent / 100, 2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-3">
            <small className="text-muted">
              * Los escenarios muestran el resultado al vencimiento para diferentes valores del tipo de cambio.
              El resultado neto considera la prima pagada por la opción.
            </small>
          </div>
        </div>
      </div>
    </>
  );
};

export default ResultsPanel;
