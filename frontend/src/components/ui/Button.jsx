import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

const variants = {
  primary: 'bg-brand-500 hover:bg-brand-600 text-white shadow-lg shadow-brand-500/20 border border-brand-400/30',
  secondary: 'bg-surface-50 hover:bg-surface-100 text-slate-200 border border-border-default hover:border-slate-600',
  outline: 'bg-transparent hover:bg-surface-50 text-slate-300 border border-border-subtle hover:border-slate-600',
  ghost: 'bg-transparent hover:bg-surface-50 text-slate-300 hover:text-white',
  danger: 'bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30',
};

const sizes = {
  sm: 'px-2.5 py-1.5 text-xs',
  md: 'px-3.5 py-2 text-sm',
  lg: 'px-5 py-2.5 text-base',
  icon: 'p-2'
};

export const Button = ({
  children,
  variant = 'secondary',
  size = 'md',
  disabled = false,
  className,
  icon: Icon,
  ...props
}) => {
  return (
    <button
      disabled={disabled}
      className={twMerge(
        clsx(
          'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-brand-500/40 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-opacity-100',
          variants[variant],
          sizes[size],
          className
        )
      )}
      {...props}
    >
      {Icon && <Icon className={clsx('w-4 h-4', children && 'mr-2')} />}
      {children}
    </button>
  );
};
