import axios from 'axios';

// Constantes
const API_KEY = import.meta.env.VITE_API_KEY;
const VALUATION_API_URL = import.meta.env.VITE_VALUATION_API_URL;

// Crear instancia de axios con configuración base
const financialApi = axios.create({
  baseURL: 'https://financialmodelingprep.com/api/v3',
  params: {
    apikey: API_KEY
  }
});

// Crear instancia para la API de valoración
const valuationApi = axios.create({
  baseURL: VALUATION_API_URL ? VALUATION_API_URL.replace(/\/$/, '') : ''
});

// Funciones para obtener datos financieros
export const financialService = {
  // Obtener estados financieros anuales
  getFinancialStatements: async (ticker) => {
    try {
      const [incomeStatement, balanceSheet, cashFlow, estimates, profile] = await Promise.all([
        financialApi.get(`/income-statement/${ticker}?period=annual`),
        financialApi.get(`/balance-sheet-statement/${ticker}?period=annual`),
        financialApi.get(`/cash-flow-statement/${ticker}?period=annual`),
        financialApi.get(`/analyst-estimates/${ticker}`),
        financialApi.get(`/profile/${ticker}`)
      ]);

      return {
        incomeStatement: incomeStatement.data,
        balanceSheet: balanceSheet.data,
        cashFlow: cashFlow.data,
        estimates: estimates.data,
        profile: profile.data && profile.data.length > 0 ? profile.data[0] : null
      };
    } catch (error) {
      console.error('Error fetching financial data:', error);
      throw new Error(error.response?.data?.error || error.message || 'Error al obtener los datos financieros');
    }
  },

  // Obtener valoración
  getValuation: async (ticker) => {
    try {
      const response = await valuationApi.get(`?ticker=${ticker}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching valuation data:', error);
      throw new Error(error.response?.data?.error || error.message || 'Error al obtener los datos de valoración');
    }
  }
};

// Función para ordenar datos cronológicamente
export const sortChronologically = (data) => {
  if (!data || !Array.isArray(data)) return [];
  return [...data].sort((a, b) => new Date(a.date) - new Date(b.date));
};
