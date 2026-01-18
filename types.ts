export type PrintStatus = 'pending' | 'processing' | 'completed' | 'failed';

export interface PrintJob {
  id: string;
  file: File;
  name: string;
  size: number;
  status: PrintStatus;
  progress: number; // 0 to 100
  timestamp: number;
}

export interface ProcessingStats {
  total: number;
  completed: number;
  pending: number;
  failed: number;
}