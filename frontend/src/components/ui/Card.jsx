import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export const Card = ({ children, className, hover = false, ...props }) => {
  return (
    <div
      className={twMerge(
        clsx(
          'glass-card rounded-xl p-5 relative overflow-hidden transition-all duration-200',
          hover && 'glass-card-hover cursor-pointer',
          className
        )
      )}
      {...props}
    >
      {children}
    </div>
  );
};

export const CardHeader = ({ children, className, title, subtitle, action, ...props }) => {
  return (
    <div className={twMerge('flex items-start justify-between mb-4', className)} {...props}>
      <div>
        {title && <h3 className="text-base font-semibold text-slate-100 tracking-tight">{title}</h3>}
        {subtitle && <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>}
        {children}
      </div>
      {action && <div className="ml-4 flex-shrink-0">{action}</div>}
    </div>
  );
};

export const CardBody = ({ children, className, ...props }) => {
  return (
    <div className={twMerge('relative', className)} {...props}>
      {children}
    </div>
  );
};
