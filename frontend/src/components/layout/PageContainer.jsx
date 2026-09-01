import React from 'react';
import { clsx } from 'clsx';

export const PageContainer = ({ 
  children, 
  title, 
  subtitle, 
  action, 
  className,
  meta
}) => {
  return (
    <div className={clsx('p-3 sm:p-5 md:p-6 max-w-7xl mx-auto space-y-4 sm:space-y-6 animate-fadeIn w-full', className)}>
      {(title || subtitle || action) && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-border-subtle/50">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              {title && <h1 className="text-xl sm:text-2xl font-bold text-slate-100 tracking-tight truncate">{title}</h1>}
              {meta}
            </div>
            {subtitle && <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-3xl leading-relaxed">{subtitle}</p>}
          </div>
          {action && <div className="flex items-center space-x-2 sm:space-x-3 flex-shrink-0 self-start sm:self-auto">{action}</div>}
        </div>
      )}
      {children}
    </div>
  );
};
