import React, { useState, useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';
import './SimpleOptionsCalculator.css';

// Importar servicios necesarios
import { getMarketData } from '../services/marketDataService';

/**
 * Componente de calculadora simple de opciones de divisas
 * Implementa el modelo Garman-Kohlhagen
 */
const SimpleOptionsCalculator = () => {
  // Estado para valores del formulario
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

  // Estado para resultados
  const [results, setResults] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isLoadingMarketData, setIsLoadingMarketData] = useState(false);

  // Referencia para el gráfico
  const chartRef = useRef(null);
  const chartInstanceRef = useRef(null);

  // Efecto para cargar datos de mercado al iniciar
  useEffect(() => {
    const fetchMarketData = async () => {
      setIsLoadingMarketData(true);
      try {
        const data = await getMarketData();
        if (data && data.exchangeRate && data.exchangeRate.clpUsd) {
          setInputs(prev => ({
            ...prev,
            spot: data.exchangeRate.clpUsd,
            strike: data.exchangeRate.clpUsd,
            volatility: data.volatility?.clpUsd || prev.volatility,
            domesticRate: data.interestRates?.clp || prev.domesticRate,
            foreignRate: data.interestRates?.usd || prev.foreignRate
          }));
        }
      } catch (error) {
        console.error("Error al cargar datos de mercado:", error);
      } finally {
        setIsLoadingMarketData(false);
      }
    };

    fetchMarketData();
  }, []);

  // Manejador para cambios en los inputs
  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setInputs(prev => ({
      ...prev,
      [id]: parseFloat(value)
    }));
  };

  // Manejador para cambio de tipo de opción
  const handleOptionTypeChange = (e) => {
    setInputs(prev => ({
      ...prev,
      optionType: e.target.value
    }));
  };

  // Función para calcular la opción
  const handleCalculate = () => {
    setIsLoading(true);
    setError(null);

    try {
      // Calcular tiempo hasta vencimiento en años
      const T = inputs.days / 365;
      
      // Calcular precio de la opción usando Garman-Kohlhagen
      const isCall = inputs.optionType === 'call';
      const premium = calculateOptionPrice(
        inputs.spot, 
        inputs.strike, 
        T, 
        inputs.domesticRate, 
        inputs.foreignRate, 
        inputs.volatility, 
        isCall
      );
      
      // Calcular punto de equilibrio
      const breakEven = isCall 
        ? inputs.strike + premium 
        : inputs.strike - premium;
      
      // Calcular costo total
      const totalCost = premium * inputs.amount;
      
      // Generar escenarios para el gráfico
      const scenarios = generateScenarios(
        inputs.spot,
        inputs.strike,
        premium,
        isCall
      );
      
      // Actualizar resultados
      setResults({
        premium,
        totalCost,
        breakEven,
        T,
        isCall,
        scenarios
      });
      
      // Actualizar gráfico
      updateChart(scenarios, premium, isCall);
      
    } catch (error) {
      console.error("Error en el cálculo:", error);
      setError(`Error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Función para calcular el precio de la opción (Garman-Kohlhagen)
  const calculateOptionPrice = (S, K, T, r_d, r_f, sigma, isCall) => {
    const d1 = (Math.log(S / K) + (r_d - r_f + 0.5 * sigma * sigma) * T) / (sigma * Math.sqrt(T));
    const d2 = d1 - sigma * Math.sqrt(T);
    
    if (isCall) {
      return S * Math.exp(-r_f * T) * normCDF(d1) - K * Math.exp(-r_d * T) * normCDF(d2);
    } else { // Put option
      return K * Math.exp(-r_d * T) * normCDF(-d2) - S * Math.exp(-r_f * T) * normCDF(-d1);
    }
  };

  // Aproximación de la función de distribución normal acumulada
  const normCDF = (x) => {
    const a1 = 0.254829592;
    const a2 = -0.284496736;
    const a3 = 1.421413741;
    const a4 = -1.453152027;
    const a5 = 1.061405429;
    const p = 0.3275911;
    
    const sign = x < 0 ? -1 : 1;
    x = Math.abs(x);
    
    const t = 1.0 / (1.0 + p * x);
    const y = 1.0 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-x * x);
    
    return 0.5 * (1.0 + sign * y);
  };

  // Calcular payoff de la opción al vencimiento
  const calculatePayoff = (spotPrice, strikePrice, isCall) => {
    if (isCall) {
      return Math.max(0, spotPrice - strikePrice);
    } else {
      return Math.max(0, strikePrice - spotPrice);
    }
  };

  // Generar escenarios para el gráfico
  const generateScenarios = (baseSpot, strike, premium, isCall) => {
    const scenarios = [];
    
    // Rango desde -150 a +200 desde el precio spot actual
    const minSpot = baseSpot - 150;
    const maxSpot = baseSpot + 200;
    const step = (maxSpot - minSpot) / 50;
    
    for (let spot = minSpot; spot <= maxSpot; spot += step) {
      const payoff = calculatePayoff(spot, strike, isCall);
      scenarios.push({
        spotPrice: spot,
        payoff: payoff,
        netResult: payoff - premium
      });
    }
    
    return scenarios;
  };

  // Actualizar el gráfico
  const updateChart = (scenarios, premium, isCall) => {
    const ctx = chartRef.current.getContext('2d');
    
    // Destruir gráfico anterior si existe
    if (chartInstanceRef.current) {
      chartInstanceRef.current.destroy();
    }
    
    // Preparar datos para el gráfico
    const labels = scenarios.map(s => s.spotPrice.toFixed(2));
    const payoffData = scenarios.map(s => s.payoff);
    const profitLossData = scenarios.map(s => s.netResult);
    
    // Crear nuevo gráfico
    chartInstanceRef.current = new Chart(ctx, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [
          {
            label: 'Payoff (valor intrínseco)',
            data: payoffData,
            borderColor: 'rgba(54, 162, 235, 1)',
            backgroundColor: 'rgba(54, 162, 235, 0.2)',
            borderWidth: 2,
            tension: 0.1
          },
          {
            label: 'Profit/Loss (considerando prima)',
            data: profitLossData,
            borderColor: 'rgba(255, 99, 132, 1)',
            backgroundColor: 'rgba(255, 99, 132, 0.2)',
            borderWidth: 2,
            tension: 0.1
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
            grid: {
              color: 'rgba(0, 0, 0, 0.05)'
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
                  return labels[index];
                }
              }
            },
            grid: {
              color: 'rgba(0, 0, 0, 0.05)'
            }
          }
        },
        plugins: {
          title: {
            display: true,
            text: isCall ? 'Payoff de Opción Call' : 'Payoff de Opción Put',
            font: {
              size: 16,
              weight: 'bold'
            },
            padding: {
              top: 10,
              bottom: 20
            }
          },
          tooltip: {
            backgroundColor: 'rgba(44, 62, 80, 0.9)',
            titleFont: {
              size: 14
            },
            bodyFont: {
              size: 13
            },
            padding: 12,
            cornerRadius: 8,
            callbacks: {
              label: function(context) {
                const label = context.dataset.label || '';
                const value = context.parsed.y.toFixed(2);
                return `${label}: ${value} CLP`;
              }
            }
          },
          legend: {
            position: 'top',
            labels: {
              padding: 15,
              usePointStyle: true,
              pointStyleWidth: 10
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
    if (!isLoadingMarketData) {
      handleCalculate();
    }
  }, [isLoadingMarketData]);

  // Componente Tooltip para información adicional
  const Tooltip = ({ text }) => (
    <div className="tooltip">
      <span className="tooltip-icon">ⓘ</span>
      <span className="tooltip-text">{text}</span>
    </div>
  );

  return (
    <div className="option-calculator-container">
      <h1>Calculadora de Opciones de Divisa</h1>
      <p className="description">
        Modelo Garman-Kohlhagen para opciones de divisa USD/CLP
        {isLoadingMarketData && (
          <span className="market-data-loading">
            {" · "}
            <span className="spinner"></span>
            Cargando datos de mercado...
          </span>
        )}
      </p>
      
      <div className="calculator-columns">
        <div className="calculator-column">
          <div className="input-group">
            <label htmlFor="spot">
              Precio Spot (CLP/USD)
              <Tooltip text="Precio actual del dólar en pesos chilenos" />
            </label>
            <input 
              type="number" 
              id="spot" 
              value={inputs.spot} 
              onChange={handleInputChange}
              step="0.01"
            />
          </div>
          
          <div className="input-group">
            <label htmlFor="strike">
              Precio Strike (CLP/USD)
              <Tooltip text="Precio pactado para ejercer la opción" />
            </label>
            <input 
              type="number" 
              id="strike" 
              value={inputs.strike} 
              onChange={handleInputChange}
              step="0.01"
            />
          </div>
          
          <div className="input-group">
            <label htmlFor="days">
              Días hasta vencimiento
              <Tooltip text="Número de días hasta que expira la opción" />
            </label>
            <input 
              type="number" 
              id="days" 
              value={inputs.days} 
              onChange={handleInputChange}
              min="1"
            />
          </div>
        </div>
        
        <div className="calculator-column">
          <div className="input-group">
            <label htmlFor="domesticRate">
              Tasa CLP (anual)
              <Tooltip text="Tasa de interés anual en pesos chilenos (formato decimal: 0.055 = 5.5%)" />
            </label>
            <input 
              type="number" 
              id="domesticRate" 
              value={inputs.domesticRate} 
              onChange={handleInputChange}
              step="0.001" 
              min="0"
            />
          </div>
          
          <div className="input-group">
            <label htmlFor="foreignRate">
              Tasa USD (anual)
              <Tooltip text="Tasa de interés anual en dólares (formato decimal: 0.059 = 5.9%)" />
            </label>
            <input 
              type="number" 
              id="foreignRate" 
              value={inputs.foreignRate} 
              onChange={handleInputChange}
              step="0.001" 
              min="0"
            />
          </div>
          
          <div className="input-group">
            <label htmlFor="volatility">
              Volatilidad (anual)
              <Tooltip text="Volatilidad anualizada del tipo de cambio (formato decimal: 0.159 = 15.9%)" />
            </label>
            <input 
              type="number" 
              id="volatility" 
              value={inputs.volatility} 
              onChange={handleInputChange}
              step="0.001" 
              min="0.001"
            />
          </div>
        </div>
        
        <div className="calculator-column">
          <div className="input-group">
            <label htmlFor="amount">
              Monto a cubrir (USD)
              <Tooltip text="Cantidad de dólares que se desea cubrir con la opción" />
            </label>
            <input 
              type="number" 
              id="amount" 
              value={inputs.amount} 
              onChange={handleInputChange}
              step="1000"
            />
          </div>
          
          <div className="input-group">
            <label htmlFor="optionType">
              Tipo de Opción
              <Tooltip text="Call: derecho a comprar USD a precio fijo. Put: derecho a vender USD a precio fijo." />
            </label>
            <select 
              id="optionType" 
              value={inputs.optionType} 
              onChange={handleOptionTypeChange}
            >
              <option value="call">Call - Derecho a comprar USD</option>
              <option value="put">Put - Derecho a vender USD</option>
            </select>
          </div>
          
          <div className="input-group" style={{ marginTop: '33px' }}>
            <button 
              id="calculate" 
              onClick={handleCalculate}
              disabled={isLoading}
            >
              {isLoading ? <><span className="spinner"></span>Calculando...</> : 'Calcular Precio'}
            </button>
          </div>
        </div>
      </div>
      
      {error && (
        <div className="error-message">
          {error}
        </div>
      )}
      
      {results && (
        <div className="result-container">
          <div className="result">
            <p>
              <strong>Tipo de opción:</strong>
              <span className={results.isCall ? 'call-value' : 'put-value'}>
                {results.isCall ? 'Call (derecho a comprar USD)' : 'Put (derecho a vender USD)'}
              </span>
            </p>
            <p>
              <strong>Tiempo hasta vencimiento:</strong>
              <span>{inputs.days} días ({results.T.toFixed(5)} años)</span>
            </p>
            <p>
              <strong>Precio de la opción:</strong>
              <span>{formatNumber(results.premium)} CLP por USD</span>
            </p>
            <p>
              <strong>Costo total de la cobertura:</strong>
              <span>{formatNumber(results.totalCost, 0)} CLP para {inputs.amount.toLocaleString()} USD</span>
            </p>
            <p>
              <strong>Punto de equilibrio:</strong>
              <span>{formatNumber(results.breakEven)} CLP/USD</span>
            </p>
            <p>
              <strong>Interpretación:</strong>
              {results.isCall ? 
                `La opción Call protege contra una subida del dólar por encima de ${formatNumber(results.breakEven)} CLP/USD.` : 
                `La opción Put protege contra una bajada del dólar por debajo de ${formatNumber(results.breakEven)} CLP/USD.`}
            </p>
          </div>
          
          <div className="chart-container">
            <canvas id="payoffChart" ref={chartRef}></canvas>
          </div>
          
          <div className="calculator-footer">
            <p>
              Esta calculadora utiliza el modelo Garman-Kohlhagen para opciones de divisas. 
              Los resultados son aproximados y no constituyen asesoría financiera.
            </p>
            <p>
              <strong>Última actualización de datos:</strong> {new Date().toLocaleString()}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default SimpleOptionsCalculator;
