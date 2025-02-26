/**
 * Servicios para formateo de valores numéricos con formato profesional
 */

/**
 * Formatea un número con separadores de miles y decimales personalizados
 * 
 * @param {number} value - Valor a formatear
 * @param {number} decimals - Número de decimales a mostrar
 * @param {boolean} showPositiveSign - Si se debe mostrar el signo positivo
 * @returns {string} - Número formateado
 */
export const formatNumber = (value, decimals = 2, showPositiveSign = false) => {
  if (value === null || value === undefined) return '-';
  
  const options = {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
    signDisplay: showPositiveSign ? 'exceptZero' : 'auto'
  };
  
  return new Intl.NumberFormat('es-CL', options).format(value);
};

/**
 * Formatea un valor como moneda
 * 
 * @param {number} value - Valor a formatear
 * @param {string} currency - Código de moneda ('CLP' o 'USD')
 * @param {number} decimals - Número de decimales a mostrar
 * @param {boolean} showPositiveSign - Si se debe mostrar el signo positivo
 * @returns {string} - Valor formateado como moneda
 */
export const formatCurrency = (value, currency = 'CLP', decimals = 0, showPositiveSign = false) => {
  if (value === null || value === undefined) return '-';
  
  const options = {
    style: 'currency',
    currency: currency === 'CLP' ? 'CLP' : 'USD',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
    signDisplay: showPositiveSign ? 'exceptZero' : 'auto'
  };
  
  return new Intl.NumberFormat('es-CL', options).format(value);
};

/**
 * Formatea un valor como porcentaje
 * 
 * @param {number} value - Valor decimal a formatear (ej: 0.25 para 25%)
 * @param {number} decimals - Número de decimales a mostrar
 * @param {boolean} showPositiveSign - Si se debe mostrar el signo positivo
 * @returns {string} - Porcentaje formateado
 */
export const formatPercent = (value, decimals = 2, showPositiveSign = true) => {
  if (value === null || value === undefined) return '-';
  
  const options = {
    style: 'percent',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
    signDisplay: showPositiveSign ? 'exceptZero' : 'auto'
  };
  
  return new Intl.NumberFormat('es-CL', options).format(value);
};

/**
 * Formatea una fecha
 * 
 * @param {Date|string} date - Fecha a formatear
 * @param {string} format - Formato de fecha ('short', 'medium', 'long', 'full')
 * @returns {string} - Fecha formateada
 */
export const formatDate = (date, format = 'medium') => {
  if (!date) return '-';
  
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  if (isNaN(dateObj.getTime())) return '-';
  
  const options = { 
    dateStyle: format 
  };
  
  return new Intl.DateTimeFormat('es-CL', options).format(dateObj);
};

export default {
  formatNumber,
  formatCurrency,
  formatPercent,
  formatDate
};
