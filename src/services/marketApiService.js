/**
 * Servicio para obtener datos de mercado desde una API externa
 */
import axios from 'axios';

// Configuración de la API
const API_KEY = import.meta.env.VITE_MARKET_API_KEY || ''; // Asegúrate de configurar esta variable en .env
const API_HOST = import.meta.env.VITE_MARKET_API_HOST || ''; // Asegúrate de configurar esta variable en .env

// Crear instancia de axios con configuración base
const marketApi = axios.create({
  baseURL: API_HOST,
  headers: {
    'X-RapidAPI-Key': API_KEY,
    'X-RapidAPI-Host': API_HOST
  }
});

/**
 * Obtiene cotizaciones en tiempo real para los símbolos especificados
 * 
 * @param {string|Array} symbols - Símbolo o array de símbolos (ej: 'AAPL' o ['AAPL', 'MSFT'])
 * @param {string} region - Región (ej: 'US', 'CL')
 * @returns {Promise<Object>} - Datos de cotización
 */
export const getQuotes = async (symbols, region = 'US') => {
  try {
    // Convertir array de símbolos a string separado por comas si es necesario
    const symbolsParam = Array.isArray(symbols) ? symbols.join(',') : symbols;
    
    const response = await marketApi.get('/market/v2/get-quotes', {
      params: {
        symbols: symbolsParam,
        region: region
      }
    });
    
    return response.data;
  } catch (error) {
    console.error('Error al obtener cotizaciones:', error);
    throw error;
  }
};

/**
 * Obtiene el tipo de cambio para un par de divisas
 * 
 * @param {string} baseCurrency - Moneda base (ej: 'USD')
 * @param {string} quoteCurrency - Moneda cotizada (ej: 'CLP')
 * @returns {Promise<Object>} - Datos del tipo de cambio
 */
export const getExchangeRate = async (baseCurrency = 'USD', quoteCurrency = 'CLP') => {
  try {
    // Para tipos de cambio, usamos el formato de símbolo de Yahoo Finance
    const symbol = `${baseCurrency}${quoteCurrency}=X`;
    
    const data = await getQuotes(symbol, 'US');
    
    // Extraer el precio del tipo de cambio de la respuesta
    if (data && data.quoteResponse && data.quoteResponse.result && data.quoteResponse.result.length > 0) {
      const quoteData = data.quoteResponse.result[0];
      
      return {
        symbol: symbol,
        currentRate: quoteData.regularMarketPrice || quoteData.ask || quoteData.bid || 950.0,
        bid: quoteData.bid,
        ask: quoteData.ask,
        dayHigh: quoteData.regularMarketDayHigh,
        dayLow: quoteData.regularMarketDayLow,
        lastUpdated: new Date().toLocaleString(),
        source: 'Market API'
      };
    }
    
    throw new Error('No se encontraron datos para el tipo de cambio solicitado');
  } catch (error) {
    console.error(`Error al obtener tipo de cambio ${baseCurrency}/${quoteCurrency}:`, error);
    
    // En caso de error, devolver valores predeterminados
    return {
      symbol: `${baseCurrency}${quoteCurrency}=X`,
      currentRate: baseCurrency === 'USD' && quoteCurrency === 'CLP' ? 950.0 : 1.0,
      volatility: 0.12,
      lastUpdated: new Date().toLocaleString(),
      source: 'Valores predeterminados (error en API)',
      error: true
    };
  }
};

/**
 * Obtiene datos completos de mercado para un par de divisas
 * 
 * @param {string} baseCurrency - Moneda base (ej: 'USD')
 * @param {string} quoteCurrency - Moneda cotizada (ej: 'CLP')
 * @returns {Promise<Object>} - Datos completos de mercado
 */
export const getMarketData = async (baseCurrency = 'USD', quoteCurrency = 'CLP') => {
  try {
    const exchangeRateData = await getExchangeRate(baseCurrency, quoteCurrency);
    
    // Por ahora, usamos un valor fijo para la volatilidad
    // En una implementación real, se calcularía a partir de datos históricos
    const volatility = 0.12;
    
    return {
      symbol: `${baseCurrency}/${quoteCurrency}`,
      currentRate: exchangeRateData.currentRate,
      volatility: volatility,
      lastUpdated: exchangeRateData.lastUpdated,
      source: exchangeRateData.source,
      additionalData: {
        bid: exchangeRateData.bid,
        ask: exchangeRateData.ask,
        dayHigh: exchangeRateData.dayHigh,
        dayLow: exchangeRateData.dayLow
      }
    };
  } catch (error) {
    console.error('Error al obtener datos de mercado:', error);
    
    // En caso de error, devolver valores predeterminados
    return {
      symbol: `${baseCurrency}/${quoteCurrency}`,
      currentRate: baseCurrency === 'USD' && quoteCurrency === 'CLP' ? 950.0 : 1.0,
      volatility: 0.12,
      lastUpdated: new Date().toLocaleString(),
      source: 'Valores predeterminados (error en API)',
      error: true
    };
  }
};

export default {
  getQuotes,
  getExchangeRate,
  getMarketData
};
