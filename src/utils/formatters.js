/**
 * Formatea un número con precisión específica
 * @param {number|string} value - Valor a formatear
 * @param {string} key - Clave para determinar el formato
 * @returns {string} - Valor formateado
 */
export const formatNumber = (value, key) => {
  if (value === undefined || value === null) return 'N/A';
  
  if (typeof value !== 'number') {
    // Intentar convertir a número si es posible
    const numValue = parseFloat(value);
    if (isNaN(numValue)) return value;
    value = numValue;
  }
  
  if (key === 'score_final') {
    return value.toFixed(2);
  }
  
  if (['current_price', 'fair_value_min', 'fair_value_max'].includes(key)) {
    return new Intl.NumberFormat('en-US', {
      style: 'decimal',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  }
  
  return value.toString();
};

/**
 * Formatea un valor de valoración
 * @param {number|string} value - Valor a formatear
 * @returns {string} - Valor formateado
 */
export const formatValuationValue = (value) => {
  if (value === undefined || value === null) return 'N/A';
  return typeof value === 'number' ? value.toFixed(2) : value;
};
