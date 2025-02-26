/**
 * Servicio para obtener datos de mercado
 * 
 * Este servicio se conecta a nuestra API proxy en Railway para obtener
 * datos financieros de Yahoo Finance sin problemas de CORS.
 */
import axios from 'axios';

// URL base de la API (URL proporcionada por Railway)
const API_BASE_URL = import.meta.env.VITE_FINANCE_API_URL || 'https://abundant-enthusiasm-production.up.railway.app';

// Crear instancia de axios con configuración base
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

/**
 * Obtiene el tipo de cambio actual para un par de divisas
 * 
 * @param {string} symbol - Par de divisas en formato Yahoo Finance (ej: 'CLPUSD=X')
 * @returns {Promise<Object>} Objeto con el tipo de cambio y metadatos
 */
export const getExchangeRate = async (symbol = 'CLPUSD=X') => {
  console.log(`Obteniendo tipo de cambio para ${symbol}...`);
  
  try {
    const response = await apiClient.get(`/api/currency/${symbol}`);
    return response.data;
  } catch (error) {
    console.error(`Error al obtener tipo de cambio para ${symbol}:`, error);
    
    // En caso de error, intentar obtener los datos de fallback de la respuesta
    if (error.response && error.response.data && error.response.data.fallback) {
      return error.response.data.fallback;
    }
    
    // Si no hay fallback, usar valores predeterminados
    return {
      symbol,
      currentRate: symbol === 'CLPUSD=X' ? 0.00105 : 950.0, // ~950 CLP por USD
      volatility: 0.12,
      lastUpdated: new Date().toLocaleString(),
      source: 'Valores predeterminados (error en API)',
      error: true
    };
  }
};

/**
 * Obtiene cotización para un símbolo
 * 
 * @param {string} symbol - Símbolo (ej: 'AAPL')
 * @returns {Promise<Object>} Datos de cotización
 */
export const getQuote = async (symbol) => {
  try {
    const response = await apiClient.get(`/api/quote/${symbol}`);
    return response.data;
  } catch (error) {
    console.error(`Error al obtener cotización para ${symbol}:`, error);
    throw error;
  }
};

/**
 * Obtiene datos históricos para un símbolo
 * 
 * @param {string} symbol - Símbolo (ej: 'AAPL')
 * @param {string} period1 - Fecha de inicio (YYYY-MM-DD)
 * @param {string} period2 - Fecha de fin (YYYY-MM-DD)
 * @param {string} interval - Intervalo ('1d', '1wk', '1mo')
 * @returns {Promise<Object>} Datos históricos
 */
export const getHistoricalData = async (symbol, period1, period2, interval = '1d') => {
  try {
    const response = await apiClient.get(`/api/historical/${symbol}`, {
      params: { period1, period2, interval }
    });
    return response.data;
  } catch (error) {
    console.error(`Error al obtener datos históricos para ${symbol}:`, error);
    throw error;
  }
};

/**
 * Obtiene datos completos de mercado para un par de divisas
 * 
 * @param {string} baseCurrency - Moneda base (ej: 'USD')
 * @param {string} quoteCurrency - Moneda cotizada (ej: 'CLP')
 * @returns {Promise<Object>} Objeto con tipo de cambio, volatilidad, tasas de interés y metadatos
 */
export const getMarketData = async (baseCurrency = 'USD', quoteCurrency = 'CLP') => {
  try {
    // Para tipos de cambio, usamos el formato de símbolo de Yahoo Finance
    const symbol = quoteCurrency + baseCurrency + '=X'; // Ej: CLPUSD=X
    
    const data = await getExchangeRate(symbol);
    console.log("Datos recibidos de la API:", data);
    
    // Valores de tasas de interés y volatilidad
    // En una aplicación real, estos datos vendrían de una API de datos financieros
    const interestRates = {
      usd: 0.059, // Tasa de interés USD (5.9%)
      clp: 0.055, // Tasa de interés CLP (5.5%)
      eur: 0.035, // Tasa de interés EUR (3.5%)
      gbp: 0.042, // Tasa de interés GBP (4.2%)
    };
    
    // Volatilidades anualizadas por par de divisas
    const volatilities = {
      clpUsd: data.volatility || 0.159, // Volatilidad anualizada CLP/USD (15.9%)
      usdClp: data.volatility || 0.159, // Volatilidad anualizada USD/CLP (15.9%)
      eurUsd: 0.085, // Volatilidad anualizada EUR/USD (8.5%)
      gbpUsd: 0.092, // Volatilidad anualizada GBP/USD (9.2%)
    };
    
    // Convertir el tipo de cambio al formato adecuado
    const exchangeRate = {};
    
    // La API ya devuelve el valor correcto de CLP/USD, lo usamos directamente
    if (symbol === 'CLPUSD=X') {
      exchangeRate.clpUsd = data.currentRate;
      exchangeRate.usdClp = 1 / data.currentRate;
    } else if (symbol === 'USDCLP=X') {
      exchangeRate.usdClp = data.currentRate;
      exchangeRate.clpUsd = 1 / data.currentRate;
    } else {
      exchangeRate[`${quoteCurrency.toLowerCase()}${baseCurrency.toLowerCase()}`] = data.currentRate;
    }
    
    return {
      currentRate: data.currentRate, // Usamos directamente el currentRate de la API
      exchangeRate,
      volatility: volatilities,
      interestRates,
      lastUpdated: data.lastUpdated,
      source: data.source
    };
  } catch (error) {
    console.error(`Error al obtener datos de mercado para ${baseCurrency}/${quoteCurrency}:`, error);
    
    // En caso de error, devolver valores predeterminados
    return {
      currentRate: 942.51, // Valor predeterminado CLP/USD
      exchangeRate: {
        clpUsd: 942.51, // Valor predeterminado CLP/USD
        usdClp: 0.00106  // Valor predeterminado USD/CLP
      },
      volatility: {
        clpUsd: 0.159,
        usdClp: 0.159
      },
      interestRates: {
        usd: 0.059,
        clp: 0.055
      },
      lastUpdated: new Date().toLocaleString(),
      source: 'Valores predeterminados (error en API)',
      error: true
    };
  }
};

export default {
  getExchangeRate,
  getQuote,
  getHistoricalData,
  getMarketData
};
