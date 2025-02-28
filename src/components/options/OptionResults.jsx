import React from 'react';

/**
 * Componente para mostrar los resultados del cálculo de opciones
 */
const OptionResults = ({ results }) => {
  if (!results) return null;
  
  const { premium, totalPremium, breakEven, isCall } = results;
  
  // Formatear números para mostrar con separadores de miles
  const formatNumber = (num) => {
    return num.toLocaleString('es-CL', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };
  
  return (
    <div className="option-results">
      <h3 style={{ 
        fontSize: '1.2rem', 
        fontWeight: '600', 
        marginBottom: '15px',
        color: '#333333'
      }}>Resultados del cálculo</h3>
      
      <div style={{ 
        backgroundColor: '#f8f9fa', 
        padding: '15px', 
        borderRadius: '6px',
        marginBottom: '20px'
      }}>
        <div style={{ marginBottom: '10px' }}>
          <span style={{ fontWeight: '500' }}>Prima por USD:</span> 
          <span style={{ float: 'right', fontWeight: '600' }}>
            CLP {formatNumber(premium)}
          </span>
        </div>
        
        <div style={{ marginBottom: '10px' }}>
          <span style={{ fontWeight: '500' }}>Prima total:</span> 
          <span style={{ float: 'right', fontWeight: '600' }}>
            CLP {formatNumber(totalPremium)}
          </span>
        </div>
        
        <div>
          <span style={{ fontWeight: '500' }}>Punto de equilibrio:</span> 
          <span style={{ float: 'right', fontWeight: '600' }}>
            CLP {formatNumber(breakEven)}
          </span>
        </div>
      </div>
      
      <div style={{ 
        backgroundColor: isCall ? '#e6f7ff' : '#fff1f0', 
        padding: '15px', 
        borderRadius: '6px',
        border: `1px solid ${isCall ? '#91d5ff' : '#ffa39e'}`
      }}>
        <p style={{ 
          margin: '0', 
          fontWeight: '500',
          color: isCall ? '#0050b3' : '#cf1322'
        }}>
          {isCall 
            ? 'Esta opción Call le da el derecho a comprar USD al precio strike, protegiéndole contra alzas del tipo de cambio.'
            : 'Esta opción Put le da el derecho a vender USD al precio strike, protegiéndole contra bajas del tipo de cambio.'
          }
        </p>
      </div>
    </div>
  );
};

export default OptionResults;
