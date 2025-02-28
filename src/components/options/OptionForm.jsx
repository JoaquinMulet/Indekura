import React from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

/**
 * Componente de formulario para la calculadora de opciones
 */
const OptionForm = ({ 
  inputs, 
  expirationDate, 
  handleInputChange, 
  handleDateChange, 
  handleCalculate, 
  isLoading 
}) => {
  return (
    <div className="option-form">
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
          disabled={true} 
          style={{ 
            padding: '8px',
            border: '1px solid #ccc',
            borderRadius: '3px',
            width: '100%',
            backgroundColor: '#f5f5f5', 
            color: '#000000'
          }}
        />
        <small style={{ 
          display: 'block', 
          marginTop: '4px', 
          color: '#666666',
          fontSize: '0.8rem'
        }}>El precio strike es igual al precio spot para ATM (At-The-Money)</small>
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
          dateFormat="dd/MM/yyyy"
          minDate={new Date()}
          className="datepicker-input"
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
        <label htmlFor="volatility" style={{ 
          display: 'block', 
          marginBottom: '6px', 
          fontWeight: '500', 
          color: '#333333' 
        }}>Volatilidad anualizada:</label>
        <input 
          type="number" 
          id="volatility" 
          name="volatility"
          value={inputs.volatility === '' ? '' : inputs.volatility} 
          onChange={handleInputChange}
          step="0.001"
          min="0.001"
          max="1"
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
        <label htmlFor="domesticRate" style={{ 
          display: 'block', 
          marginBottom: '6px', 
          fontWeight: '500', 
          color: '#333333' 
        }}>Tasa CLP (%):</label>
        <input 
          type="number" 
          id="domesticRate" 
          name="domesticRate"
          value={inputs.domesticRate === '' ? '' : inputs.domesticRate} 
          onChange={handleInputChange}
          step="0.001"
          min="0"
          max="1"
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
        }}>Tasa USD (%):</label>
        <input 
          type="number" 
          id="foreignRate" 
          name="foreignRate"
          value={inputs.foreignRate === '' ? '' : inputs.foreignRate} 
          onChange={handleInputChange}
          step="0.001"
          min="0"
          max="1"
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
        }}>Tipo de opción:</label>
        <select 
          id="optionType" 
          name="optionType"
          value={inputs.optionType} 
          onChange={handleInputChange}
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
  );
};

export default OptionForm;
