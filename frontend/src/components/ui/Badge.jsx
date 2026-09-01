import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

const variants = {
  default: 'bg-surface-50 text-slate-300 border-border-default',
  brand: 'bg-brand-500/10 text-brand-400 border-brand-500/30',
  emerald: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
  amber: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
  orange: 'bg-orange-500/10 text-orange-400 border-orange-500/30',
  rose: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
  outline: 'bg-transparent text-slate-400 border-border-subtle'
};

const sizes = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-2.5 py-1 text-xs',
  lg: 'px-3 py-1.5 text-sm'
};

export const Badge = ({
  children,
  variant = 'default',
  size = 'md',
  dot = false,
  className,
  ...props
}) => {
  return (
    <span
      className={twMerge(
        clsx(
          'inline-flex items-center font-medium rounded-full border tracking-wide uppercase font-mono',
          variants[variant] || variants.default,
          sizes[size] || sizes.md,
          className
        )
      )}
      {...props}
    >
      {dot && (
        <span
          className={clsx(
            'w-1.5 h-1.5 rounded-full mr-1.5 animate-pulse',
            variant === 'rose' && 'bg-rose-400',
            variant === 'orange' && 'bg-orange-400',
            variant === 'amber' && 'bg-amber-400',
            variant === 'emerald' && 'bg-emerald-400',
            variant === 'brand' && 'bg-brand-400',
            variant === 'default' && 'bg-slate-400'
          )}
        />
      )}
      {children}
    </span>
  );
};
