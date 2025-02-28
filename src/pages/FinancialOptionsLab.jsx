import React, { useState, useEffect, useRef } from 'react';
import { Chart, registerables } from 'chart.js';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import './FinancialOptionsLab.css';
import optionService from '../services/optionService';

// Importar componentes
import OptionForm from '../components/options/OptionForm';
import OptionResults from '../components/options/OptionResults';
import OptionChart from '../components/options/OptionChart';

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

  // Manejar cambios en los inputs del formulario
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setInputs(prev => ({
      ...prev,
      [name]: value === '' ? '' : parseFloat(value)
    }));
  };

  // Manejar cambios en la fecha de vencimiento
  const handleDateChange = (date) => {
    setExpirationDate(date);
    
    // Calcular días hasta vencimiento
    const today = new Date();
    const diffTime = Math.abs(date - today);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    setInputs(prev => ({
      ...prev,
      days: diffDays
    }));
  };

  // Función para calcular el precio de la opción
  const handleCalculate = async () => {
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
        volatility: inputs.volatility,
        domesticRate: inputs.domesticRate,
        foreignRate: inputs.foreignRate,
        optionType: inputs.optionType
      });
      
      // Calcular prima total
      const totalPremium = premium * inputs.amount;
      
      // Calcular punto de equilibrio
      const breakEven = calculateBreakEven(
        inputs.strike,
        premium,
        inputs.optionType
      );
      
      // Generar escenarios para el gráfico
      const scenarios = generateScenarios({
        spot: inputs.spot,
        strike: inputs.strike,
        premium,
        breakEven,
        amount: inputs.amount,
        optionType: inputs.optionType
      });
      
      // Establecer resultados
      setResults({
        premium,
        totalPremium,
        breakEven,
        scenarios,
        isCall: inputs.optionType === 'call'
      });
      
    } catch (error) {
      console.error("Error en el cálculo:", error);
      setError(`Error: ${error.message}`);
      setResults(null);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="financial-options-lab">
      <h1 className="page-title">Calculadora de Opciones</h1>
      
      <div className="option-calculator-container">
        <p style={{ 
          color: '#666666', 
          marginBottom: '1.5rem', 
          fontSize: '1rem',
          textAlign: 'left'
        }}>Modelo Garman-Kohlhagen para opciones de divisa</p>
        
        {error && (
          <div style={{ 
            backgroundColor: '#fff2f0', 
            border: '1px solid #ffccc7', 
            padding: '10px 15px', 
            borderRadius: '4px', 
            marginBottom: '20px',
            color: '#ff4d4f'
          }}>
            {error}
          </div>
        )}
        
        <div style={{ 
          display: 'flex', 
          flexDirection: 'row',
          flexWrap: 'wrap',
          gap: '20px',
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
            <OptionForm 
              inputs={inputs}
              expirationDate={expirationDate}
              handleInputChange={handleInputChange}
              handleDateChange={handleDateChange}
              handleCalculate={handleCalculate}
              isLoading={isLoading}
            />
          </div>
          
          {/* Columna derecha - Resultados */}
          <div style={{ 
            flex: '1',
            minWidth: '300px',
            display: 'flex',
            flexDirection: 'column',
            gap: '20px'
          }}>
            {results && (
              <>
                <div style={{ 
                  backgroundColor: '#ffffff', 
                  padding: '20px',
                  borderRadius: '4px',
                  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
                }}>
                  <OptionResults results={results} />
                </div>
                
                <OptionChart 
                  results={results} 
                  inputs={inputs} 
                  chartRef={chartRef} 
                  chartInstanceRef={chartInstanceRef} 
                />
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FinancialOptionsLab;
