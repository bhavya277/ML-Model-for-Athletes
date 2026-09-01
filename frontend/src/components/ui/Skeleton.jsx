import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export const Skeleton = ({ className, ...props }) => {
  return (
    <div
      className={twMerge(
        clsx(
          'animate-pulse bg-surface-50/60 rounded-md border border-border-subtle/30',
          className
        )
      )}
      {...props}
    />
  );
};
