import React from 'react';
import { X } from 'lucide-react';
import { Card } from './Card';

export const Modal = ({ isOpen, onClose, title, children, maxWidth = 'max-w-lg' }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-fadeIn">
      <div className={`w-full ${maxWidth} relative`}>
        <Card className="border border-border-default bg-surface-200 shadow-2xl p-6">
          <div className="flex items-center justify-between pb-3 border-b border-border-subtle mb-4">
            <h3 className="text-base font-bold text-slate-100">{title}</h3>
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-surface-100"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          {children}
        </Card>
      </div>
    </div>
  );
};
