import React, { useState, useEffect } from 'react';
import { PageContainer } from '../components/layout/PageContainer';
import { PlayerTable } from '../components/players/PlayerTable';
import { PlayerFilters } from '../components/players/PlayerFilters';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { useAthletes } from '../hooks/useAthletes';
import { athleteApi } from '../api/athleteApi';
import { Users, ChevronLeft, ChevronRight, Download, SlidersHorizontal } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';

export const Players = () => {
  const [searchParams] = useSearchParams();
  const initialRiskTier = searchParams.get('riskTier') || 'All';
  const initialSport = searchParams.get('sport') || 'All';

  const {
    athletes,
    meta,
    filters,
    loading,
    updateFilter,
    resetFilters
  } = useAthletes({
    riskTier: initialRiskTier,
    sport: initialSport,
    limit: 25
  });

  const [positions, setPositions] = useState([]);

  useEffect(() => {
    athleteApi.getModelMetrics().then(res => {
      if (res.metadata?.positions) {
        setPositions(res.metadata.positions);
      }
    });
  }, []);

  return (
    <PageContainer
      title="Athlete Intelligence Directory"
      subtitle="Search and filter all 1,100 athletes across sports, positions, and validated risk signals."
      meta={
        <Badge variant="brand" size="sm">
          {meta.total} Athletes Filtered
        </Badge>
      }
    >
      {/* Filter Toolbar */}
      <PlayerFilters
        filters={filters}
        updateFilter={updateFilter}
        resetFilters={resetFilters}
        positions={positions}
      />

      {/* Athlete Table */}
      <PlayerTable athletes={athletes} loading={loading} />

      {/* Pagination Controls */}
      {meta.totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 text-xs text-slate-400">
          <div>
            Showing <strong className="text-slate-200">{((meta.page - 1) * meta.limit) + 1}</strong> to{' '}
            <strong className="text-slate-200">{Math.min(meta.page * meta.limit, meta.total)}</strong> of{' '}
            <strong className="text-slate-200">{meta.total}</strong> athletes
          </div>

          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              disabled={meta.page <= 1}
              onClick={() => updateFilter('page', meta.page - 1)}
            >
              <ChevronLeft className="w-4 h-4 mr-1" /> Previous
            </Button>

            <span className="font-mono text-slate-300 px-2">
              Page {meta.page} of {meta.totalPages}
            </span>

            <Button
              variant="outline"
              size="sm"
              disabled={meta.page >= meta.totalPages}
              onClick={() => updateFilter('page', meta.page + 1)}
            >
              Next <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </div>
      )}
    </PageContainer>
  );
};
