/**
 * Servicios para cálculos de opciones financieras
 */

// Implementación de la distribución normal acumulativa (aproximación)
const normCDF = (x) => {
  // Constantes para la aproximación
  const a1 = 0.254829592;
  const a2 = -0.284496736;
  const a3 = 1.421413741;
  const a4 = -1.453152027;
  const a5 = 1.061405429;
  const p = 0.3275911;

  // Guardar el signo de x
  const sign = x < 0 ? -1 : 1;
  x = Math.abs(x) / Math.sqrt(2.0);

  // Forma de cálculo
  const t = 1.0 / (1.0 + p * x);
  const y = 1.0 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-x * x);

  return 0.5 * (1.0 + sign * y);
};

/**
 * Calcula el precio de una opción de divisas según el modelo Black-Scholes.
 * 
 * @param {number} S - Tipo de cambio spot (doméstica/extranjera)
 * @param {number} K - Precio strike
 * @param {number} T - Tiempo hasta vencimiento en años
 * @param {number} r_d - Tasa de interés doméstica (como decimal)
 * @param {number} r_f - Tasa de interés extranjera (como decimal)
 * @param {number} sigma - Volatilidad del tipo de cambio (como decimal)
 * @param {string} option_type - 'call' o 'put'
 * @returns {number} Precio de la opción en moneda doméstica por unidad de moneda extranjera
 */
export const blackScholesCurrency = (S, K, T, r_d, r_f, sigma, option_type = 'put') => {
  // Verificar entradas válidas
  if (T <= 0 || sigma <= 0) {
    return 0;
  }

  const d1 = (Math.log(S / K) + (r_d - r_f + 0.5 * sigma * sigma) * T) / (sigma * Math.sqrt(T));
  const d2 = d1 - sigma * Math.sqrt(T);

  if (option_type.toLowerCase() === 'put') {
    return K * Math.exp(-r_d * T) * normCDF(-d2) - S * Math.exp(-r_f * T) * normCDF(-d1);
  } else { // call option
    return S * Math.exp(-r_f * T) * normCDF(d1) - K * Math.exp(-r_d * T) * normCDF(d2);
  }
};

/**
 * Calcula el tipo de cambio efectivo si la opción no se ejerce.
 * 
 * @param {number} future_spot - Tipo de cambio spot futuro
 * @param {number} premium_per_unit - Prima de la opción por unidad de moneda extranjera
 * @param {number} amount - Cantidad de moneda extranjera
 * @returns {number} Tipo de cambio efectivo
 */
export const calculateEffectiveExchangeRate = (future_spot, premium_per_unit, amount) => {
  const total_premium_cost = premium_per_unit * amount;
  const received_without_option = future_spot * amount;
  const effective_clp = received_without_option - total_premium_cost;
  return effective_clp / amount;
};

/**
 * Genera escenarios para diferentes tipos de cambio futuros.
 * 
 * @param {number} spot - Tipo de cambio spot actual
 * @param {number} strike - Precio strike
 * @param {number} premium - Prima de la opción
 * @param {number} amount - Cantidad de moneda extranjera
 * @param {string} option_type - 'call' o 'put'
 * @returns {Array} Array de objetos con escenarios
 */
export const generateScenarios = (spot, strike, premium, amount, option_type = 'put') => {
  // Generar escenarios con variaciones de ±10% del spot en 9 pasos
  const futureSpots = Array.from({ length: 9 }, (_, i) => spot * (1 + (i - 4) * 0.025));
  
  return futureSpots.map(futureSpot => {
    const effectiveRate = calculateEffectiveExchangeRate(futureSpot, premium, amount);
    
    // Determinar si se ejercería la opción
    let exercise = "No";
    if (option_type === 'put' && futureSpot < strike) {
      exercise = "Sí";
    } else if (option_type === 'call' && futureSpot > strike) {
      exercise = "Sí";
    }
    
    // Tipo de cambio final (considerando ejercicio de la opción)
    let finalRate;
    if (option_type === 'put') {
      finalRate = Math.max(effectiveRate, strike);
    } else { // call
      finalRate = Math.min(effectiveRate, strike);
    }
    
    return {
      futureSpot,
      effectiveRate,
      exercise,
      finalRate
    };
  });
};

/**
 * Calcula el punto de equilibrio para una opción.
 * 
 * @param {number} strike - Precio strike
 * @param {number} premium - Prima de la opción
 * @param {string} option_type - 'call' o 'put'
 * @returns {number} Punto de equilibrio
 */
export const calculateBreakEven = (strike, premium, option_type = 'put') => {
  if (option_type === 'put') {
    return strike - premium;
  } else { // call
    return strike + premium;
  }
};

/**
 * Obtiene la fecha y hora de la última actualización de datos.
 * 
 * @returns {string} Fecha y hora formateada
 */
export const getDataLastUpdated = () => {
  try {
    // Obtener la fecha y hora actual
    const now = new Date();
    
    // Formatear la fecha y hora (formato chileno: DD-MM-YYYY HH:MM:SS)
    const day = String(now.getDate()).padStart(2, '0');
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const year = now.getFullYear();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    
    return `${day}-${month}-${year} ${hours}:${minutes}:${seconds}`;
  } catch (error) {
    console.error("Error al obtener timestamp:", error);
    // En caso de error, devolver la fecha actual en formato básico
    return "26-02-2025 11:15:00";
  }
};

import { getMarketData } from './marketDataService';

// Valores predeterminados para el tipo de cambio y volatilidad (solo se usan si falla la API)
const FALLBACK_EXCHANGE_RATE = 950.0;
const FALLBACK_VOLATILITY = 0.12; // 12% anual

/**
 * Obtiene datos de mercado (tipo de cambio y volatilidad) desde Yahoo Finance.
 * 
 * @returns {Object} Objeto con tipo de cambio y volatilidad
 */
export const getCurrencyData = async () => {
  console.log("Obteniendo datos de tipo de cambio...");
  
  try {
    // Usar el nuevo servicio de datos de mercado
    const marketData = await getMarketData('USD', 'CLP');
    
    // Obtener la volatilidad correcta del objeto
    const volatility = marketData.volatility?.clpUsd || marketData.volatility?.usdClp || 0.159;
    
    console.log(`Tipo de cambio obtenido: ${marketData.currentRate} (USD/CLP)`);
    console.log(`Volatilidad obtenida: ${volatility * 100}%`);
    
    return {
      currentRate: parseFloat(marketData.currentRate.toFixed(2)),
      volatility: parseFloat(volatility.toFixed(4)),
      lastUpdated: marketData.lastUpdated,
      source: marketData.source
    };
  } catch (error) {
    console.error("Error al obtener datos de tipo de cambio:", error);
    
    // En caso de error, devolver valores predeterminados
    return {
      currentRate: FALLBACK_EXCHANGE_RATE,
      volatility: FALLBACK_VOLATILITY,
      lastUpdated: getDataLastUpdated(),
      source: "Valores predeterminados (error en API)",
      error: true
    };
  }
};

export default {
  blackScholesCurrency,
  calculateEffectiveExchangeRate,
  generateScenarios,
  calculateBreakEven,
  getCurrencyData,
  getDataLastUpdated
};
