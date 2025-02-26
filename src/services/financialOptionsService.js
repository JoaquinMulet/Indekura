/**
 * Servicios para cálculos de opciones financieras
 * Implementación del modelo Garman-Kohlhagen para opciones de divisas
 */

// Función para calcular la distribución normal acumulada con mayor precisión
const cumulativeStandardNormal = (x) => {
  // Implementación de la función de distribución normal acumulada
  if (x < -10) return 0;
  if (x > 10) return 1;
  
  // Aproximación polinómica basada en Abramowitz y Stegun
  const b1 = 0.319381530;
  const b2 = -0.356563782;
  const b3 = 1.781477937;
  const b4 = -1.821255978;
  const b5 = 1.330274429;
  const p = 0.2316419;
  const c = 0.39894228;
  
  if (x >= 0) {
    const t = 1.0 / (1.0 + p * x);
    return 1.0 - c * Math.exp(-x * x / 2) * t * (t * (t * (t * (t * b5 + b4) + b3) + b2) + b1);
  } else {
    const t = 1.0 / (1.0 - p * x);
    return c * Math.exp(-x * x / 2) * t * (t * (t * (t * (t * b5 + b4) + b3) + b2) + b1);
  }
};

// Función para calcular la densidad de probabilidad normal
const standardNormalPDF = (x) => {
  return (1 / Math.sqrt(2 * Math.PI)) * Math.exp(-0.5 * x * x);
};

/**
 * Implementación del modelo Garman-Kohlhagen para opciones de divisas
 * 
 * @param {number} spot - Precio spot actual (CLP/USD)
 * @param {number} strike - Precio strike (CLP/USD)
 * @param {number} timeToMaturity - Tiempo hasta vencimiento (en años)
 * @param {number} domesticRate - Tasa de interés doméstica (CLP) (decimal anual)
 * @param {number} foreignRate - Tasa de interés extranjera (USD) (decimal anual)
 * @param {number} volatility - Volatilidad anualizada (decimal)
 * @param {string|boolean} optionType - Tipo de opción ('call', 'put', true para call, false para put)
 * @returns {number} - Precio de la opción (CLP/USD)
 */
export const garmanKohlhagen = (spot, strike, timeToMaturity, domesticRate, foreignRate, volatility, optionType) => {
  // Validar parámetros
  if (!spot || !strike || timeToMaturity <= 0 || volatility <= 0) {
    console.warn("Parámetros inválidos en garmanKohlhagen:", { spot, strike, timeToMaturity, volatility });
    return 0;
  }
  
  // Calcular d1 y d2 según el modelo Garman-Kohlhagen
  const d1 = (Math.log(spot / strike) + (domesticRate - foreignRate + 0.5 * volatility * volatility) * timeToMaturity) / 
             (volatility * Math.sqrt(timeToMaturity));
  
  const d2 = d1 - volatility * Math.sqrt(timeToMaturity);
  
  // Verificar si optionType es un booleano o una cadena
  const isCall = typeof optionType === 'boolean' 
    ? optionType 
    : (typeof optionType === 'string' && optionType.toLowerCase() === 'call');
  
  // Calcular precio de la opción según tipo
  let price = 0;
  
  if (isCall) {
    // Precio de una opción CALL: S * e^(-r_f * T) * N(d1) - K * e^(-r_d * T) * N(d2)
    price = spot * Math.exp(-foreignRate * timeToMaturity) * cumulativeStandardNormal(d1) - 
            strike * Math.exp(-domesticRate * timeToMaturity) * cumulativeStandardNormal(d2);
  } else {
    // Precio de una opción PUT: K * e^(-r_d * T) * N(-d2) - S * e^(-r_f * T) * N(-d1)
    price = strike * Math.exp(-domesticRate * timeToMaturity) * cumulativeStandardNormal(-d2) - 
            spot * Math.exp(-foreignRate * timeToMaturity) * cumulativeStandardNormal(-d1);
  }
  
  return price;
};

/**
 * Cálculo analítico de griegos para el modelo Garman-Kohlhagen
 * 
 * @param {Object} params - Parámetros para el cálculo
 * @param {number} params.spot - Precio spot actual
 * @param {number} params.strike - Precio strike
 * @param {number} params.timeToMaturity - Tiempo hasta el vencimiento (en años)
 * @param {number} params.volatility - Volatilidad anualizada
 * @param {number} params.domesticRate - Tasa de interés doméstica (CLP)
 * @param {number} params.foreignRate - Tasa de interés extranjera (USD)
 * @param {string} params.optionType - Tipo de opción ('call' o 'put')
 * @returns {Object} - Objeto con los griegos (delta, gamma, theta, vega, rho)
 */
export const calculateGreeks = ({ spot, strike, timeToMaturity, volatility, domesticRate, foreignRate, optionType }) => {
  // Calcular d1 y d2 (utilizados en todos los griegos)
  const d1 = (Math.log(spot / strike) + (domesticRate - foreignRate + 0.5 * volatility * volatility) * timeToMaturity) / 
            (volatility * Math.sqrt(timeToMaturity));
  const d2 = d1 - volatility * Math.sqrt(timeToMaturity);
  
  // Cálculo de Delta (analítico)
  let delta;
  if (optionType.toLowerCase() === 'call') {
    delta = Math.exp(-foreignRate * timeToMaturity) * cumulativeStandardNormal(d1);
  } else {
    delta = Math.exp(-foreignRate * timeToMaturity) * (cumulativeStandardNormal(d1) - 1);
  }
  
  // Cálculo de Gamma (analítico) - igual para call y put
  const gamma = Math.exp(-foreignRate * timeToMaturity) * standardNormalPDF(d1) / 
               (spot * volatility * Math.sqrt(timeToMaturity));
  
  // Cálculo de Theta (analítico)
  let theta;
  const term1 = -spot * Math.exp(-foreignRate * timeToMaturity) * standardNormalPDF(d1) * volatility / 
                (2 * Math.sqrt(timeToMaturity));
  if (optionType.toLowerCase() === 'call') {
    theta = term1 - domesticRate * strike * Math.exp(-domesticRate * timeToMaturity) * cumulativeStandardNormal(d2) +
            foreignRate * spot * Math.exp(-foreignRate * timeToMaturity) * cumulativeStandardNormal(d1);
  } else {
    theta = term1 + domesticRate * strike * Math.exp(-domesticRate * timeToMaturity) * cumulativeStandardNormal(-d2) -
            foreignRate * spot * Math.exp(-foreignRate * timeToMaturity) * cumulativeStandardNormal(-d1);
  }
  // Convertir theta a días (theta diario)
  theta = theta / 365;
  
  // Cálculo de Vega (analítico) - igual para call y put
  const vega = spot * Math.exp(-foreignRate * timeToMaturity) * standardNormalPDF(d1) * Math.sqrt(timeToMaturity);
  
  // Cálculo de Rho (analítico) - sensibilidad a la tasa doméstica
  let rho;
  if (optionType.toLowerCase() === 'call') {
    rho = strike * timeToMaturity * Math.exp(-domesticRate * timeToMaturity) * cumulativeStandardNormal(d2);
  } else {
    rho = -strike * timeToMaturity * Math.exp(-domesticRate * timeToMaturity) * cumulativeStandardNormal(-d2);
  }
  
  return {
    delta: parseFloat(delta.toFixed(4)),
    gamma: parseFloat(gamma.toFixed(4)),
    theta: parseFloat(theta.toFixed(4)),
    vega: parseFloat(vega.toFixed(4)),
    rho: parseFloat(rho.toFixed(4))
  };
};

/**
 * Genera escenarios para el análisis de resultados de la opción
 * @param {Object} params Parámetros para generar escenarios
 * @param {number} params.spot Precio spot actual
 * @param {number} params.strike Precio de ejercicio
 * @param {number} params.premium Prima de la opción
 * @param {number} params.breakEven Punto de equilibrio
 * @param {number} params.amount Monto nominal
 * @param {string|boolean} params.optionType Tipo de opción ('call', 'put', true para call, false para put)
 * @returns {Array} Array de objetos con escenarios generados
 */
export const generateScenarios = ({
  spot,
  strike,
  premium,
  breakEven,
  amount,
  optionType
}) => {
  // Validar parámetros
  if (!spot || !strike || !premium || !amount) {
    throw new Error('Parámetros incompletos para generar escenarios');
  }

  // Verificar si optionType es un booleano o una cadena
  const isCall = typeof optionType === 'boolean' 
    ? optionType 
    : (typeof optionType === 'string' && optionType.toLowerCase() === 'call');

  // Determinar el rango de variación para los escenarios
  const minVariation = -0.25; // -25%
  const maxVariation = 0.25;  // +25%
  const steps = 20;           // Número de puntos a calcular
  const stepSize = (maxVariation - minVariation) / (steps - 1);
  
  // Calcular la cantidad de moneda extranjera (USD) que se está cubriendo
  const currencyAmount = amount;
  
  // Generar escenarios
  const scenarios = [];
  for (let i = 0; i < steps; i++) {
    const variation = minVariation + (stepSize * i);
    const futureSpot = spot * (1 + variation);
    
    // Calcular el payoff
    let payoff = 0;
    if (isCall) {
      // Para un Call, el payoff es máx(0, Spot - Strike)
      payoff = Math.max(0, futureSpot - strike) * currencyAmount;
    } else {
      // Para un Put, el payoff es máx(0, Strike - Spot)
      payoff = Math.max(0, strike - futureSpot) * currencyAmount;
    }
    
    // Calcular el resultado neto considerando la prima pagada
    const result = payoff - (premium * currencyAmount);
    
    // Calcular el resultado como porcentaje de la prima
    const resultPercent = premium !== 0 ? (result / (premium * currencyAmount)) * 100 : 0;
    
    // Agregar el escenario
    scenarios.push({
      variation,
      futureSpot,
      finalRate: futureSpot,
      breakEven,
      payoff,
      result,
      resultPercent
    });
  }
  
  return scenarios;
};

/**
 * Calcula el punto de equilibrio para una opción
 * 
 * @param {number} strike - Precio strike de la opción
 * @param {number} premium - Prima de la opción
 * @param {string|boolean} optionType - Tipo de opción ('call', 'put', true para call, false para put)
 * @returns {number} - Punto de equilibrio
 */
export const calculateBreakEven = (strike, premium, optionType) => {
  // Verificar si optionType es un booleano o una cadena
  const isCall = typeof optionType === 'boolean' 
    ? optionType 
    : (typeof optionType === 'string' && optionType.toLowerCase() === 'call');
  
  if (isCall) {
    // Para una call, el punto de equilibrio es strike + prima
    return strike + premium;
  } else {
    // Para una put, el punto de equilibrio es strike - prima
    return strike - premium;
  }
};

/**
 * Calcula el tiempo exacto hasta el vencimiento en años
 * Considera años bisiestos y el número exacto de días
 * 
 * @param {Date} maturityDate - Fecha de vencimiento
 * @returns {number} - Tiempo hasta el vencimiento en años
 */
export const calculateTimeToMaturity = (maturityDate) => {
  const now = new Date();
  const timeDiff = maturityDate.getTime() - now.getTime();
  const daysDiff = timeDiff / (1000 * 3600 * 24);
  
  // Considerar años bisiestos al calcular fracción de año
  const isLeapYear = (year) => {
    return ((year % 4 === 0) && (year % 100 !== 0)) || (year % 400 === 0);
  };
  
  const currentYear = now.getFullYear();
  const daysInYear = isLeapYear(currentYear) ? 366 : 365;
  
  return parseFloat((daysDiff / daysInYear).toFixed(6));
};

/**
 * Calcula el número exacto de días hasta el vencimiento
 * 
 * @param {Date} maturityDate - Fecha de vencimiento
 * @returns {number} - Días hasta el vencimiento
 */
export const calculateDaysToMaturity = (maturityDate) => {
  const now = new Date();
  const timeDiff = maturityDate.getTime() - now.getTime();
  return Math.max(0, Math.floor(timeDiff / (1000 * 3600 * 24)));
};

/**
 * Calcula el tiempo en años a partir de días
 * 
 * @param {number} days - Número de días
 * @returns {number} - Tiempo en años
 */
export const calculateDaysToYears = (days) => {
  // Consideramos un año estándar de 365 días
  return parseFloat((days / 365).toFixed(6));
};

/**
 * Calcula el precio de una opción financiera
 * 
 * @param {Object} params - Parámetros para el cálculo
 * @param {number} params.spot - Precio spot actual
 * @param {number} params.strike - Precio strike
 * @param {number} params.timeToMaturity - Tiempo hasta el vencimiento (años)
 * @param {number} params.volatility - Volatilidad anualizada
 * @param {number} params.domesticRate - Tasa de interés doméstica (CLP)
 * @param {number} params.foreignRate - Tasa de interés extranjera (USD)
 * @param {string|boolean} params.optionType - Tipo de opción ('call', 'put', true para call, false para put)
 * @returns {number} - Precio de la opción
 */
export const calculateOptionPrice = ({ spot, strike, timeToMaturity, volatility, domesticRate, foreignRate, optionType }) => {
  try {
    // Validar que todos los parámetros necesarios estén presentes
    if (!spot || !strike || !timeToMaturity || !volatility) {
      throw new Error('Faltan parámetros requeridos para el cálculo');
    }
    
    const premium = garmanKohlhagen(
      spot, 
      strike, 
      timeToMaturity, 
      domesticRate, 
      foreignRate, 
      volatility, 
      optionType
    );
    
    return premium;
  } catch (error) {
    console.error("Error al calcular el precio de la opción:", error);
    throw new Error(`Error en el cálculo: ${error.message}`);
  }
};

export default {
  garmanKohlhagen,
  calculateGreeks,
  calculateBreakEven,
  generateScenarios,
  calculateTimeToMaturity,
  calculateDaysToMaturity,
  calculateDaysToYears,
  calculateOptionPrice
};
