import React from 'react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { clsx } from 'clsx';

export const StatCard = ({
  title,
  value,
  subtitle,
  icon: Icon,
  badge,
  badgeVariant = 'default',
  trend,
  trendPositive = true,
  glowColor,
  onClick
}) => {
  return (
    <Card 
      onClick={onClick}
      className={clsx(
        'group relative flex flex-col justify-between overflow-hidden',
        onClick && 'cursor-pointer hover:border-slate-500/50'
      )}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <span className="text-xs font-medium text-slate-400 uppercase tracking-wider block">
            {title}
          </span>
          <div className="text-2xl font-bold font-mono text-slate-100 tracking-tight">
            {value}
          </div>
        </div>
        {Icon && (
          <div className={clsx(
            'p-2.5 rounded-xl bg-surface-50 border border-border-subtle text-slate-300 group-hover:text-brand-400 group-hover:border-brand-500/30 transition-colors',
            glowColor === 'rose' && 'text-rose-400 bg-rose-500/10 border-rose-500/20',
            glowColor === 'emerald' && 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
            glowColor === 'brand' && 'text-brand-400 bg-brand-500/10 border-brand-500/20'
          )}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>

      <div className="mt-4 pt-3 border-t border-border-subtle/40 flex items-center justify-between text-xs">
        {subtitle && (
          <span className="text-slate-400 truncate max-w-[200px]">
            {subtitle}
          </span>
        )}
        {badge && (
          <Badge variant={badgeVariant} size="sm">
            {badge}
          </Badge>
        )}
      </div>
    </Card>
  );
};
