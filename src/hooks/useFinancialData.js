import { useState, useCallback } from 'react';
import { financialService, sortChronologically } from '../services/api';

/**
 * Hook personalizado para manejar la carga y procesamiento de datos financieros
 * @returns {Object} - Estado y funciones para manejar datos financieros
 */
export const useFinancialData = () => {
  const [searchTicker, setSearchTicker] = useState('');
  const [currentTicker, setCurrentTicker] = useState('');
  const [financialData, setFinancialData] = useState(null);
  const [companyProfile, setCompanyProfile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Carga datos financieros para un ticker específico
   * @param {string} ticker - Símbolo de la empresa
   */
  const fetchFinancialData = useCallback(async (ticker) => {
    if (!ticker || ticker.trim() === '') return;
    
    setLoading(true);
    setError(null);
    setFinancialData(null);
    setCompanyProfile(null);

    try {
      const data = await financialService.getFinancialStatements(ticker);
      
      // Ordenar los datos cronológicamente
      const processedData = {
        incomeStatement: sortChronologically(data.incomeStatement),
        balanceSheet: sortChronologically(data.balanceSheet),
        cashFlow: sortChronologically(data.cashFlow),
        estimates: sortChronologically(data.estimates)
      };

      if (data.profile) {
        setCompanyProfile(data.profile);
        setFinancialData(processedData);
        setCurrentTicker(ticker);
      } else {
        setError(`No se encontró información para el ticker ${ticker}`);
      }
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Error al obtener los datos financieros. Por favor, verifica el ticker.');
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    searchTicker,
    setSearchTicker,
    currentTicker,
    financialData,
    companyProfile,
    loading,
    error,
    setError,
    fetchFinancialData
  };
};
