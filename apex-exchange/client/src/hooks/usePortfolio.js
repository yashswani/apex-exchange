import { useState, useEffect, useCallback } from 'react';
import api from '../lib/api';

export function usePortfolio() {
  const [portfolio, setPortfolio] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchPortfolio = useCallback(async () => {
    try {
      setError(null);
      const res = await api.get('/api/trade/portfolio');
      setPortfolio(res.data);
    } catch (err) {
      console.error('Fetch portfolio error:', err);
      setError(err.response?.data?.error || 'Failed to load portfolio');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPortfolio();
  }, [fetchPortfolio]);

  return { portfolio, loading, error, refetch: fetchPortfolio };
}
