import { useState, useEffect, useCallback } from 'react';
import { athleteApi } from '../api/athleteApi';

export const useAthletes = (initialFilters = {}) => {
  const [athletes, setAthletes] = useState([]);
  const [meta, setMeta] = useState({ total: 0, page: 1, limit: 25, totalPages: 1 });
  const [filters, setFilters] = useState({
    sport: 'All',
    position: 'All',
    riskTier: 'All',
    search: '',
    sortBy: 'risk_desc',
    page: 1,
    limit: 25,
    ...initialFilters
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAthletes = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await athleteApi.getAthletes(filters);
      setAthletes(res.data);
      setMeta(res.meta);
    } catch (err) {
      setError(err.message || 'Failed to fetch athletes');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchAthletes();
  }, [fetchAthletes]);

  const updateFilter = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: key === 'page' ? value : 1 // Reset to page 1 on filter changes
    }));
  };

  const resetFilters = () => {
    setFilters({
      sport: 'All',
      position: 'All',
      riskTier: 'All',
      search: '',
      sortBy: 'risk_desc',
      page: 1,
      limit: 25
    });
  };

  return {
    athletes,
    meta,
    filters,
    loading,
    error,
    updateFilter,
    resetFilters,
    refetch: fetchAthletes
  };
};
