import React, { useState } from 'react';
import { clsx } from 'clsx';

export const Tooltip = ({ content, children, position = 'top', className }) => {
  const [visible, setVisible] = useState(false);

  return (
    <div 
      className="relative inline-block"
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
    >
      {children}
      {visible && (
        <div
          className={clsx(
            'absolute z-50 px-2.5 py-1.5 text-xs font-normal text-slate-200 bg-surface-100 border border-border-default rounded-md shadow-xl whitespace-nowrap pointer-events-none transition-opacity duration-150',
            position === 'top' && 'bottom-full left-1/2 -translate-x-1/2 mb-2',
            position === 'bottom' && 'top-full left-1/2 -translate-x-1/2 mt-2',
            position === 'left' && 'right-full top-1/2 -translate-y-1/2 mr-2',
            position === 'right' && 'left-full top-1/2 -translate-y-1/2 ml-2',
            className
          )}
        >
          {content}
          <div
            className={clsx(
              'absolute w-2 h-2 bg-surface-100 border-border-default transform rotate-45',
              position === 'top' && 'top-full left-1/2 -translate-x-1/2 -translate-y-1/2 border-r border-b',
              position === 'bottom' && 'bottom-full left-1/2 -translate-x-1/2 translate-y-1/2 border-l border-t',
              position === 'left' && 'left-full top-1/2 -translate-y-1/2 -translate-x-1/2 border-r border-t',
              position === 'right' && 'right-full top-1/2 -translate-y-1/2 translate-x-1/2 border-l border-b'
            )}
          />
        </div>
      )}
    </div>
  );
};
