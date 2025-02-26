import { useState, useEffect, useCallback } from 'react';
import { financialService } from '../services/api';

/**
 * Hook personalizado para manejar la carga de datos de valoración
 * @param {string} ticker - Símbolo de la empresa
 * @returns {Object} - Estado y funciones para manejar datos de valoración
 */
export const useValuation = (ticker) => {
  const [valuationData, setValuationData] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastFetchedTicker, setLastFetchedTicker] = useState('');

  /**
   * Carga datos de valoración para un ticker específico
   */
  const fetchValuationData = useCallback(async () => {
    if (!ticker || ticker.trim() === '' || ticker === lastFetchedTicker) return;
    
    setLoading(true);
    setError(null);
    try {
      const data = await financialService.getValuation(ticker);
      setValuationData(data);
      setLastFetchedTicker(ticker);
    } catch (err) {
      console.error('Error detallado:', err);
      setError(err.message || 'Error al obtener los datos de valoración');
    } finally {
      setLoading(false);
    }
  }, [ticker, lastFetchedTicker]);

  // Cargar datos cuando cambia el ticker
  useEffect(() => {
    if (ticker && ticker.trim() !== '' && ticker !== lastFetchedTicker) {
      fetchValuationData();
    }
  }, [ticker, lastFetchedTicker, fetchValuationData]);

  return {
    valuationData,
    loading,
    error,
    fetchValuationData
  };
};
