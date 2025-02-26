import React, { useState, useEffect, useRef } from 'react';
import { Chart, registerables } from 'chart.js';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import './FinancialOptionsLab.css';
import optionService from '../services/optionService';

// Registrar los componentes necesarios de Chart.js
Chart.register(...registerables);

// Importar servicios
import { getMarketData } from '../services/marketDataService';
import { 
  calculateTimeToMaturity, 
  calculateOptionPrice,
  calculateBreakEven,
  generateScenarios,
  calculateDaysToYears
} from '../services/financialOptionsService';

/**
 * Componente principal de la calculadora de opciones financieras
 * Implementa el modelo Garman-Kohlhagen para la valoración de opciones de divisas
 */
const FinancialOptionsLab = () => {
  // Estado para valores del formulario con valores por defecto
  const [inputs, setInputs] = useState({
    spot: 942.51,
    strike: 942.51,
    days: 33,
    domesticRate: 0.055, // Tasa CLP (5.5%)
    foreignRate: 0.059, // Tasa USD (5.9%)
    volatility: 0.159, // Volatilidad anualizada (15.9%)
    amount: 44000,     // Monto en USD a cubrir
    optionType: 'call'  // Por defecto una opción de compra
  });

  const [expirationDate, setExpirationDate] = useState(new Date(new Date().setDate(new Date().getDate() + 33)));
  const [results, setResults] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Referencia para el gráfico
  const chartRef = useRef(null);
  const chartInstanceRef = useRef(null);

  // Efecto para establecer el título del documento
  useEffect(() => {
    document.title = 'Indekura Hedge Fund - Calculadora de Opciones';
  }, []);

  // Efecto para cargar datos de mercado al iniciar
  useEffect(() => {
    const fetchMarketData = async () => {
      try {
        const data = await getMarketData();
        console.log("Datos de mercado recibidos:", data);
        
        if (data) {
          // Obtener el tipo de cambio CLP/USD
          const spotRate = data.currentRate || 942.51;
          
          // Obtener volatilidad para CLP/USD
          const volatilityValue = data.volatility?.clpUsd || 0.15;
          
          // Obtener tasas de interés
          const domesticRateValue = data.interestRates?.clp || 0.055;
          const foreignRateValue = data.interestRates?.usd || 0.059;
          
          // Actualizar los inputs con los datos obtenidos
          setInputs(prev => ({
            ...prev,
            spot: spotRate,
            strike: spotRate,
            volatility: volatilityValue,
            domesticRate: domesticRateValue,
            foreignRate: foreignRateValue
          }));
          
          console.log("Inputs actualizados con datos de mercado:", {
            spot: spotRate,
            volatility: volatilityValue,
            domesticRate: domesticRateValue,
            foreignRate: foreignRateValue
          });
        }
      } catch (error) {
        console.error("Error al cargar datos de mercado:", error);
      }
    };

    fetchMarketData();
  }, []);

  // Efecto para inicializar y actualizar el gráfico cuando cambian los resultados
  useEffect(() => {
    if (results && chartRef.current) {
      updateChart();
    }
  }, [results]);

  // Manejador para cambios en los inputs
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // Si el valor está vacío, permitir que se muestre vacío
    const newValue = value === '' ? '' : parseFloat(value);
    
    setInputs(prev => ({
      ...prev,
      [name]: newValue
    }));
  };

  // Manejador para cambio de tipo de opción
  const handleOptionTypeChange = (e) => {
    setInputs(prev => ({
      ...prev,
      optionType: e.target.value
    }));
  };

  // Manejador para cambio de fecha de vencimiento
  const handleDateChange = (date) => {
    setExpirationDate(date);
    
    // Calcular días hasta vencimiento
    const today = new Date();
    const diffTime = date.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    setInputs(prev => ({
      ...prev,
      days: diffDays > 0 ? diffDays : 1
    }));
  };

  // Función para calcular la opción
  const handleCalculate = () => {
    setIsLoading(true);
    setError(null);

    try {
      // Calcular tiempo hasta vencimiento en años
      const timeToMaturity = calculateDaysToYears(inputs.days);
      
      // Calcular precio de la opción
      const premium = calculateOptionPrice({
        spot: inputs.spot,
        strike: inputs.strike,
        timeToMaturity,
        domesticRate: inputs.domesticRate,
        foreignRate: inputs.foreignRate,
        volatility: inputs.volatility,
        optionType: inputs.optionType
      });
      
      // Calcular punto de equilibrio
      const breakEven = calculateBreakEven(
        inputs.strike,
        premium,
        inputs.optionType
      );
      
      // Calcular costo total de la cobertura en pesos chilenos (CLP)
      // El premium está en CLP por USD, lo multiplicamos por el monto en USD
      const totalPremium = premium * inputs.amount;
      
      // Generar escenarios para el gráfico
      const scenarios = generateScenarios({
        spot: inputs.spot,
        strike: inputs.strike,
        premium,
        breakEven,
        amount: inputs.amount,
        optionType: inputs.optionType
      });
      
      // Configurar resultados
      const results = {
        premium,
        totalPremium,
        breakEven,
        timeToMaturity,
        scenarios,
        isCall: inputs.optionType === 'call'
      };
      
      setResults(results);
      
    } catch (error) {
      console.error("Error en el cálculo:", error);
      setError(`Error: ${error.message}`);
      setResults(null);
    } finally {
      setIsLoading(false);
    }
  };

  // Función para actualizar el gráfico
  const updateChart = () => {
    const ctx = chartRef.current.getContext('2d');
    
    // Destruir gráfico anterior si existe
    if (chartInstanceRef.current) {
      chartInstanceRef.current.destroy();
    }
    
    const { scenarios, isCall } = results;
    
    // Preparar datos para el gráfico
    const labels = scenarios.map(s => Math.round(s.futureSpot).toString());
    const netResultData = scenarios.map(s => s.result);
    
    // Crear nuevo gráfico
    chartInstanceRef.current = new Chart(ctx, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [
          {
            label: 'Resultado neto (con prima)',
            data: netResultData,
            borderColor: '#0A5C36', // Color institucional Indekura
            backgroundColor: 'rgba(10, 92, 54, 0.2)', // Color institucional con transparencia
            borderWidth: 2,
            tension: 0.1,
            pointRadius: 4, // Añadir puntos visibles
            pointHoverRadius: 6, // Aumentar tamaño al pasar el mouse
            pointBackgroundColor: '#0A5C36', // Color de los puntos
            pointBorderColor: '#fff', // Borde blanco para los puntos
            pointBorderWidth: 1.5 // Grosor del borde de los puntos
          },
          {
            label: 'Punto de equilibrio',
            data: Array(labels.length).fill(0),
            borderColor: 'rgba(0, 0, 0, 0.5)',
            borderWidth: 1,
            borderDash: [5, 5],
            pointRadius: 0
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            title: {
              display: true,
              text: 'Valor (CLP por USD)'
            },
            ticks: {
              callback: function(value) {
                return value.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ".");
              }
            }
          },
          x: {
            title: {
              display: true,
              text: 'Precio Spot (CLP/USD)'
            },
            ticks: {
              callback: function(value, index, values) {
                if (index % 5 === 0) {
                  return labels[index].split('.')[0]; // Eliminar decimales
                }
              }
            }
          }
        },
        plugins: {
          title: {
            display: true,
            text: isCall ? 'Payoff de Opción Call' : 'Payoff de Opción Put',
            font: {
              size: 16
            }
          },
          tooltip: {
            mode: 'index',
            intersect: false,
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            titleFont: {
              size: 14,
              weight: 'bold'
            },
            bodyFont: {
              size: 13
            },
            padding: 10,
            callbacks: {
              title: function(tooltipItems) {
                return `Spot: ${tooltipItems[0].label} CLP/USD`;
              },
              label: function(context) {
                const label = context.dataset.label || '';
                // Solo mostrar el tooltip para el dataset de "Resultado neto"
                if (label === 'Resultado neto (con prima)') {
                  const value = context.parsed.y.toFixed(0);
                  return `${label}: ${value.replace(/\B(?=(\d{3})+(?!\d))/g, ".")} CLP`;
                } else {
                  return null; // No mostrar etiqueta para el punto de equilibrio
                }
              }
            }
          },
          annotation: {
            annotations: {
              spotLine: {
                type: 'line',
                xMin: inputs.spot,
                xMax: inputs.spot,
                borderColor: 'rgba(75, 192, 192, 0.7)',
                borderWidth: 2,
                borderDash: [5, 5],
                label: {
                  display: true,
                  content: `Spot actual: ${inputs.spot.toFixed(2)}`,
                  position: 'start'
                }
              },
              strikeLine: {
                type: 'line',
                xMin: inputs.strike,
                xMax: inputs.strike,
                borderColor: 'rgba(153, 102, 255, 0.7)',
                borderWidth: 2,
                borderDash: [5, 5],
                label: {
                  display: true,
                  content: `Strike: ${inputs.strike.toFixed(2)}`,
                  position: 'start'
                }
              },
              breakEvenLine: {
                type: 'line',
                xMin: results.breakEven,
                xMax: results.breakEven,
                borderColor: 'rgba(255, 159, 64, 0.7)',
                borderWidth: 2,
                borderDash: [5, 5],
                label: {
                  display: true,
                  content: `Break-even: ${results.breakEven.toFixed(2)}`,
                  position: 'start'
                }
              }
            }
          }
        }
      }
    });
  };

  // Formatear números con separador de miles
  const formatNumber = (value, decimals = 2) => {
    return value.toFixed(decimals).replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };

  // Inicializar cálculo al cargar
  useEffect(() => {
    handleCalculate();
  }, []);

  return (
    <div className="option-calculator-container" style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
      <h1 className="page-title">Calculadora de Opciones</h1>
      <p style={{ 
        color: '#666666', 
        marginBottom: '1.5rem', 
        fontSize: '1rem',
        textAlign: 'left'
      }}>Modelo Garman-Kohlhagen para opciones de divisa</p>
      
      <div style={{ 
        display: 'flex', 
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: '20px',
        justifyContent: 'space-between'
      }}>
        {/* Columna izquierda - Formulario */}
        <div style={{ 
          flex: '1',
          minWidth: '300px',
          backgroundColor: '#ffffff', 
          padding: '20px', 
          borderRadius: '4px', 
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
        }}>
          <div style={{ marginBottom: '20px' }}>
            <div className="input-group" style={{ marginBottom: '15px' }}>
              <label htmlFor="spot" style={{ 
                display: 'block', 
                marginBottom: '6px', 
                fontWeight: '500', 
                color: '#333333' 
              }}>Precio Spot (CLP/USD):</label>
              <input 
                type="number" 
                id="spot" 
                name="spot"
                value={inputs.spot === '' ? '' : inputs.spot} 
                onChange={handleInputChange}
                step="0.01"
                style={{ 
                  padding: '8px',
                  border: '1px solid #ccc',
                  borderRadius: '3px',
                  width: '100%',
                  backgroundColor: '#ffffff',
                  color: '#000000'
                }}
              />
            </div>
            
            <div className="input-group" style={{ marginBottom: '15px' }}>
              <label htmlFor="strike" style={{ 
                display: 'block', 
                marginBottom: '6px', 
                fontWeight: '500', 
                color: '#333333' 
              }}>Precio Strike (CLP/USD):</label>
              <input 
                type="number" 
                id="strike" 
                name="strike"
                value={inputs.strike === '' ? '' : inputs.strike} 
                onChange={handleInputChange}
                step="0.01"
                style={{ 
                  padding: '8px',
                  border: '1px solid #ccc',
                  borderRadius: '3px',
                  width: '100%',
                  backgroundColor: '#ffffff',
                  color: '#000000'
                }}
              />
            </div>
            
            <div className="input-group" style={{ marginBottom: '15px' }}>
              <label htmlFor="expirationDate" style={{ 
                display: 'block', 
                marginBottom: '6px', 
                fontWeight: '500', 
                color: '#333333' 
              }}>Fecha de vencimiento:</label>
              <DatePicker
                id="expirationDate"
                selected={expirationDate}
                onChange={handleDateChange}
                minDate={new Date()}
                dateFormat="dd/MM/yyyy"
                showMonthDropdown
                showYearDropdown
                dropdownMode="select"
                className="date-picker-input"
                style={{
                  padding: '8px',
                  border: '1px solid #ccc',
                  borderRadius: '3px',
                  width: '100%',
                  backgroundColor: '#ffffff',
                  color: '#000000'
                }}
              />
              <p style={{ 
                fontSize: '12px', 
                color: '#666666', 
                marginTop: '4px' 
              }}>
                Días hasta vencimiento: {inputs.days}
              </p>
            </div>
          
            <div className="input-group" style={{ marginBottom: '15px' }}>
              <label htmlFor="domesticRate" style={{ 
                display: 'block', 
                marginBottom: '6px', 
                fontWeight: '500', 
                color: '#333333' 
              }}>Tasa CLP (anual):</label>
              <input 
                type="number" 
                id="domesticRate" 
                name="domesticRate"
                value={inputs.domesticRate === '' ? '' : inputs.domesticRate} 
                onChange={handleInputChange}
                step="0.001" 
                min="0"
                style={{ 
                  padding: '8px',
                  border: '1px solid #ccc',
                  borderRadius: '3px',
                  width: '100%',
                  backgroundColor: '#ffffff',
                  color: '#000000'
                }}
              />
            </div>
            
            <div className="input-group" style={{ marginBottom: '15px' }}>
              <label htmlFor="foreignRate" style={{ 
                display: 'block', 
                marginBottom: '6px', 
                fontWeight: '500', 
                color: '#333333' 
              }}>Tasa USD (anual):</label>
              <input 
                type="number" 
                id="foreignRate" 
                name="foreignRate"
                value={inputs.foreignRate === '' ? '' : inputs.foreignRate} 
                onChange={handleInputChange}
                step="0.001" 
                min="0"
                style={{ 
                  padding: '8px',
                  border: '1px solid #ccc',
                  borderRadius: '3px',
                  width: '100%',
                  backgroundColor: '#ffffff',
                  color: '#000000'
                }}
              />
            </div>
            
            <div className="input-group" style={{ marginBottom: '15px' }}>
              <label htmlFor="volatility" style={{ 
                display: 'block', 
                marginBottom: '6px', 
                fontWeight: '500', 
                color: '#333333' 
              }}>Volatilidad (anual):</label>
              <input 
                type="number" 
                id="volatility" 
                name="volatility"
                value={inputs.volatility === '' ? '' : inputs.volatility} 
                onChange={handleInputChange}
                step="0.001" 
                min="0.001"
                style={{ 
                  padding: '8px',
                  border: '1px solid #ccc',
                  borderRadius: '3px',
                  width: '100%',
                  backgroundColor: '#ffffff',
                  color: '#000000'
                }}
              />
            </div>
          
            <div className="input-group" style={{ marginBottom: '15px' }}>
              <label htmlFor="amount" style={{ 
                display: 'block', 
                marginBottom: '6px', 
                fontWeight: '500', 
                color: '#333333' 
              }}>Monto a cubrir (USD):</label>
              <input 
                type="number" 
                id="amount" 
                name="amount"
                value={inputs.amount === '' ? '' : inputs.amount} 
                onChange={handleInputChange}
                step="1000"
                style={{ 
                  padding: '8px',
                  border: '1px solid #ccc',
                  borderRadius: '3px',
                  width: '100%',
                  backgroundColor: '#ffffff',
                  color: '#000000'
                }}
              />
            </div>
            
            <div className="input-group" style={{ marginBottom: '15px' }}>
              <label htmlFor="optionType" style={{ 
                display: 'block', 
                marginBottom: '6px', 
                fontWeight: '500', 
                color: '#333333' 
              }}>Tipo de Opción:</label>
              <select 
                id="optionType" 
                name="optionType"
                value={inputs.optionType} 
                onChange={handleOptionTypeChange}
                style={{ 
                  padding: '8px',
                  border: '1px solid #ccc',
                  borderRadius: '3px',
                  width: '100%',
                  backgroundColor: '#ffffff',
                  color: '#000000'
                }}
              >
                <option value="call">Call - Derecho a comprar USD</option>
                <option value="put">Put - Derecho a vender USD</option>
              </select>
            </div>
            
            <div className="input-group" style={{ marginTop: '20px' }}>
              <button
                id="calculate" 
                onClick={handleCalculate}
                disabled={isLoading}
                style={{
                  backgroundColor: '#0A5C36',
                  color: 'white',
                  padding: '12px 20px',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  width: '100%',
                  marginTop: '10px',
                  fontWeight: '600',
                  fontSize: '16px',
                  transition: 'background-color 0.3s, transform 0.2s',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                }}
                onMouseOver={(e) => !isLoading && (e.currentTarget.style.backgroundColor = '#084a2c')}
                onMouseOut={(e) => !isLoading && (e.currentTarget.style.backgroundColor = '#0A5C36')}
                onMouseDown={(e) => {
                  if (!isLoading) {
                    e.currentTarget.style.transform = 'translateY(2px)';
                    e.currentTarget.style.boxShadow = 'none';
                  }
                }}
                onMouseUp={(e) => {
                  if (!isLoading) {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
                  }
                }}
              >
                {isLoading ? 'Calculando...' : 'Calcular Precio'}
              </button>
            </div>
          </div>
        </div>
        
        {/* Columna derecha - Resultados */}
        <div style={{ 
          flex: '1',
          minWidth: '300px',
          display: 'flex',
          flexDirection: 'column'
        }}>
          {error && (
            <div style={{
              color: '#721c24',
              backgroundColor: '#f8d7da',
              padding: '10px',
              borderRadius: '3px',
              marginBottom: '20px',
              textAlign: 'center'
            }}>
              {error}
            </div>
          )}
          
          {results && (
            <>
              <div style={{ 
                backgroundColor: '#ffffff', 
                padding: '20px',
                borderRadius: '4px',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                marginBottom: '20px'
              }}>
                <p style={{ marginBottom: '10px', fontSize: '14px', lineHeight: '1.5' }}>
                  <strong style={{ fontWeight: '600' }}>Tipo de opción:</strong> {results.isCall ? 'Call (derecho a comprar USD)' : 'Put (derecho a vender USD)'}
                </p>
                <p style={{ marginBottom: '10px', fontSize: '14px', lineHeight: '1.5' }}>
                  <strong style={{ fontWeight: '600' }}>Tiempo hasta vencimiento:</strong> {inputs.days} días ({results.timeToMaturity.toFixed(5)} años)
                </p>
                <p style={{ marginBottom: '10px', fontSize: '14px', lineHeight: '1.5' }}>
                  <strong style={{ fontWeight: '600' }}>Precio de la opción:</strong> {formatNumber(results.premium)} CLP por USD
                </p>
                <p style={{ marginBottom: '10px', fontSize: '14px', lineHeight: '1.5' }}>
                  <strong style={{ fontWeight: '600' }}>Costo total de la cobertura:</strong> {formatNumber(results.totalPremium, 0)} CLP para {inputs.amount.toLocaleString()} USD
                </p>
                <p style={{ marginBottom: '10px', fontSize: '14px', lineHeight: '1.5' }}>
                  <strong style={{ fontWeight: '600' }}>Punto de equilibrio:</strong> {formatNumber(results.breakEven)} CLP/USD
                </p>
                <p style={{ marginBottom: '10px', fontSize: '14px', lineHeight: '1.5' }}>
                  <strong style={{ fontWeight: '600' }}>Interpretación:</strong> {results.isCall ? 
                    `La opción Call protege contra una subida del dólar por encima de ${formatNumber(results.breakEven)} CLP/USD.` : 
                    `La opción Put protege contra una bajada del dólar por debajo de ${formatNumber(results.breakEven)} CLP/USD.`}
                </p>
              </div>
              
              <div style={{ 
                backgroundColor: '#ffffff',
                padding: '20px',
                borderRadius: '4px',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                height: '400px',
                flex: '1'
              }}>
                <canvas id="payoffChart" ref={chartRef}></canvas>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default FinancialOptionsLab;
