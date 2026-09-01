import React from 'react';
import { Search, Filter, RotateCcw } from 'lucide-react';
import { Button } from '../ui/Button';
import { SPORTS_LIST } from '../../utils/constants';

const RISK_OPTIONS = ['All', 'Low', 'Moderate', 'High', 'Very High'];
const SORT_OPTIONS = [
  { value: 'risk_desc', label: 'Highest Risk First' },
  { value: 'risk_asc', label: 'Lowest Risk First' },
  { value: 'id_asc', label: 'Athlete ID (Asc)' },
  { value: 'onset_asc', label: 'Imminent Onset' },
  { value: 'recovery_desc', label: 'Longest Recovery' }
];

export const PlayerFilters = ({
  filters,
  updateFilter,
  resetFilters,
  positions = []
}) => {
  return (
    <div className="p-4 rounded-xl bg-surface-200 border border-border-subtle space-y-3">
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
        {/* Search input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by Athlete ID, sport, position, team (e.g. 3009, Guard, BAS-1)..."
            value={filters.search}
            onChange={(e) => updateFilter('search', e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs bg-surface-100 border border-border-default rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
          />
        </div>

        {/* Filters Group */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Sport Filter */}
          <select
            value={filters.sport}
            onChange={(e) => updateFilter('sport', e.target.value)}
            className="px-3 py-2 text-xs bg-surface-100 border border-border-default rounded-lg text-slate-200 focus:outline-none focus:border-brand-500"
          >
            <option value="All">All Sports</option>
            {SPORTS_LIST.map((sport) => (
              <option key={sport} value={sport}>{sport}</option>
            ))}
          </select>

          {/* Position Filter */}
          {positions.length > 0 && (
            <select
              value={filters.position}
              onChange={(e) => updateFilter('position', e.target.value)}
              className="px-3 py-2 text-xs bg-surface-100 border border-border-default rounded-lg text-slate-200 focus:outline-none focus:border-brand-500"
            >
              <option value="All">All Positions</option>
              {positions.map((pos) => (
                <option key={pos} value={pos}>{pos}</option>
              ))}
            </select>
          )}

          {/* Risk Tier Filter */}
          <select
            value={filters.riskTier}
            onChange={(e) => updateFilter('riskTier', e.target.value)}
            className="px-3 py-2 text-xs bg-surface-100 border border-border-default rounded-lg text-slate-200 focus:outline-none focus:border-brand-500"
          >
            {RISK_OPTIONS.map((tier) => (
              <option key={tier} value={tier}>{tier === 'All' ? 'All Risk Tiers' : `${tier} Risk`}</option>
            ))}
          </select>

          {/* Sort By */}
          <select
            value={filters.sortBy}
            onChange={(e) => updateFilter('sortBy', e.target.value)}
            className="px-3 py-2 text-xs bg-surface-100 border border-border-default rounded-lg text-slate-200 focus:outline-none focus:border-brand-500 font-mono"
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>

          {/* Reset button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={resetFilters}
            className="text-xs text-slate-400 hover:text-slate-200"
            title="Reset Filters"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>
    </div>
  );
};
