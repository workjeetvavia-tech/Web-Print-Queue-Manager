import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Plus, Play, Trash2, Printer, AlertTriangle } from 'lucide-react';
import { PrintJob, ProcessingStats } from './types';
import { Button } from './components/Button';
import { JobItem } from './components/JobItem';
import { ProgressBar } from './components/ProgressBar';

const App: React.FC = () => {
  const [jobs, setJobs] = useState<PrintJob[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentJobId, setCurrentJobId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Stats calculation
  const stats: ProcessingStats = {
    total: jobs.length,
    completed: jobs.filter(j => j.status === 'completed').length,
    pending: jobs.filter(j => j.status === 'pending').length,
    failed: jobs.filter(j => j.status === 'failed').length,
  };

  const overallProgress = stats.total === 0 ? 0 : (stats.completed / stats.total) * 100;

  const handleAddFiles = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      const newJobs: PrintJob[] = Array.from(event.target.files).map((file: File) => ({
        id: Math.random().toString(36).substring(7),
        file,
        name: file.name,
        size: file.size,
        status: 'pending',
        progress: 0,
        timestamp: Date.now(),
      }));
      setJobs(prev => [...prev, ...newJobs]);
    }
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemoveJob = (id: string) => {
    setJobs(prev => prev.filter(job => job.id !== id));
  };

  const handleClearAll = () => {
    if (confirm('Are you sure you want to clear the entire queue?')) {
      setJobs([]);
    }
  };

  // The main printing logic loop
  const startPrinting = useCallback(async () => {
    if (isProcessing || jobs.length === 0) return;

    setIsProcessing(true);

    const pendingJobs = jobs.filter(job => job.status === 'pending');
    
    // Simulate finding jobs to print
    for (let i = 0; i < pendingJobs.length; i++) {
      const job = pendingJobs[i];
      
      // 1. Mark as processing
      setCurrentJobId(job.id);
      setJobs(prev => prev.map(j => j.id === job.id ? { ...j, status: 'processing' } : j));

      // 2. Simulate "win32api.ShellExecute" delay and work
      // In a real desktop app, this would be the print command.
      // We are waiting 2 seconds as requested for stability.
      try {
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // 3. Mark as completed
        setJobs(prev => prev.map(j => j.id === job.id ? { ...j, status: 'completed', progress: 100 } : j));
      } catch (error) {
        setJobs(prev => prev.map(j => j.id === job.id ? { ...j, status: 'failed' } : j));
      }
      
      setCurrentJobId(null);
    }

    setIsProcessing(false);
  }, [jobs, isProcessing]);

  // Determine current status message
  const getStatusMessage = () => {
    if (isProcessing && currentJobId) {
      const currentJob = jobs.find(j => j.id === currentJobId);
      return `Printing: ${currentJob?.name || 'Unknown file'}...`;
    }
    if (stats.completed === stats.total && stats.total > 0) {
      return 'All jobs completed successfully.';
    }
    if (stats.total === 0) {
      return 'Queue is empty. Add files to begin.';
    }
    return `${stats.pending} files waiting in queue.`;
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 p-6 md:p-12">
      <div className="max-w-4xl mx-auto">
        
        {/* Header */}
        <div className="flex items-center space-x-4 mb-8">
          <div className="p-3 bg-blue-600 rounded-xl shadow-lg shadow-blue-200">
            <Printer className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">WebPrint Queue Manager</h1>
            <p className="text-slate-500">Bulk printing utility prototype</p>
          </div>
        </div>

        {/* Main Control Panel */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end">
            
            {/* Stats & Progress */}
            <div>
               <ProgressBar 
                progress={overallProgress} 
                label="Queue Progress" 
                subLabel={`${stats.completed}/${stats.total} Files`} 
              />
              <div className="mt-4 flex gap-4 text-sm text-slate-600">
                 <div className="flex items-center">
                    <div className="w-2 h-2 rounded-full bg-slate-300 mr-2"></div>
                    Pending: {stats.pending}
                 </div>
                 <div className="flex items-center">
                    <div className="w-2 h-2 rounded-full bg-blue-500 mr-2"></div>
                    Processing: {isProcessing ? 1 : 0}
                 </div>
                 <div className="flex items-center">
                    <div className="w-2 h-2 rounded-full bg-green-500 mr-2"></div>
                    Completed: {stats.completed}
                 </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col md:flex-row gap-3 md:justify-end">
              <input
                type="file"
                multiple
                className="hidden"
                ref={fileInputRef}
                onChange={handleAddFiles}
                disabled={isProcessing}
              />
              
              <Button 
                variant="secondary" 
                onClick={() => fileInputRef.current?.click()}
                disabled={isProcessing}
                icon={<Plus className="w-4 h-4" />}
              >
                Add Files
              </Button>
              
              <Button 
                variant="primary" 
                onClick={startPrinting}
                disabled={isProcessing || stats.pending === 0}
                isLoading={isProcessing}
                icon={<Play className="w-4 h-4" />}
              >
                {isProcessing ? 'Printing...' : 'Start Printing'}
              </Button>

              {jobs.length > 0 && !isProcessing && (
                <Button 
                  variant="ghost" 
                  onClick={handleClearAll}
                  className="text-red-500 hover:text-red-600 hover:bg-red-50"
                  icon={<Trash2 className="w-4 h-4" />}
                >
                  Clear
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Status Bar */}
        <div className={`mb-6 p-4 rounded-lg border flex items-center ${isProcessing ? 'bg-blue-50 border-blue-200 text-blue-800' : 'bg-slate-100 border-slate-200 text-slate-700'}`}>
           <div className={`mr-3 ${isProcessing ? 'animate-spin' : ''}`}>
              {isProcessing ? <Printer className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5 text-slate-400" />}
           </div>
           <span className="font-medium">{getStatusMessage()}</span>
        </div>

        {/* File List */}
        <div className="space-y-3">
          {jobs.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-xl border border-dashed border-slate-300">
              <Printer className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-900">Queue is empty</h3>
              <p className="text-slate-500 max-w-sm mx-auto mt-1">
                Click "Add Files" to select documents for bulk printing. The system will process them sequentially with a safe delay.
              </p>
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="mt-6 text-blue-600 font-medium hover:text-blue-700"
              >
                Browse files on your computer
              </button>
            </div>
          ) : (
            jobs.map(job => (
              <JobItem 
                key={job.id} 
                job={job} 
                onRemove={handleRemoveJob}
                isLocked={isProcessing}
              />
            ))
          )}
        </div>

      </div>
    </div>
  );
};

export default App;