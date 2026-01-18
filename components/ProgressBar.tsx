import React from 'react';

interface ProgressBarProps {
  progress: number;
  label?: string;
  subLabel?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ progress, label, subLabel }) => {
  return (
    <div className="w-full">
      <div className="flex justify-between mb-1">
        {label && <span className="text-sm font-medium text-slate-700">{label}</span>}
        {subLabel && <span className="text-sm font-medium text-slate-500">{subLabel}</span>}
      </div>
      <div className="w-full bg-slate-200 rounded-full h-2.5 overflow-hidden">
        <div 
          className="bg-blue-600 h-2.5 rounded-full transition-all duration-500 ease-out" 
          style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
        ></div>
      </div>
    </div>
  );
};