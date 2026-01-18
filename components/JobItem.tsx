import React from 'react';
import { FileText, X, Printer } from 'lucide-react';
import { PrintJob } from '../types';
import { StatusBadge } from './StatusBadge';

interface JobItemProps {
  job: PrintJob;
  onRemove: (id: string) => void;
  isLocked: boolean;
}

export const JobItem: React.FC<JobItemProps> = ({ job, onRemove, isLocked }) => {
  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className={`group flex items-center p-4 bg-white border border-slate-200 rounded-lg hover:shadow-sm transition-all duration-200 ${job.status === 'processing' ? 'ring-2 ring-blue-500 ring-opacity-50 border-blue-200' : ''}`}>
      <div className={`flex-shrink-0 p-2 rounded-lg ${job.status === 'processing' ? 'bg-blue-50 text-blue-600' : 'bg-slate-100 text-slate-500'}`}>
        {job.status === 'processing' ? <Printer className="w-6 h-6 animate-pulse" /> : <FileText className="w-6 h-6" />}
      </div>
      
      <div className="ml-4 flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <p className="text-sm font-semibold text-slate-900 truncate pr-4" title={job.name}>
            {job.name}
          </p>
          <StatusBadge status={job.status} />
        </div>
        <p className="text-xs text-slate-500">
          {formatSize(job.size)} • Added {new Date(job.timestamp).toLocaleTimeString()}
        </p>
      </div>

      {!isLocked && (
        <button
          onClick={() => onRemove(job.id)}
          className="ml-4 p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 opacity-0 group-hover:opacity-100"
          title="Remove file"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};