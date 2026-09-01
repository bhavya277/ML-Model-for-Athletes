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
    <div className={clsx('p-6 max-w-7xl mx-auto space-y-6 animate-fadeIn', className)}>
      {(title || subtitle || action) && (
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-border-subtle/50">
          <div>
            <div className="flex items-center space-x-3">
              {title && <h1 className="text-2xl font-bold text-slate-100 tracking-tight">{title}</h1>}
              {meta}
            </div>
            {subtitle && <p className="text-sm text-slate-400 mt-1 max-w-3xl leading-relaxed">{subtitle}</p>}
          </div>
          {action && <div className="flex items-center space-x-3 flex-shrink-0">{action}</div>}
        </div>
      )}
      {children}
    </div>
  );
};
