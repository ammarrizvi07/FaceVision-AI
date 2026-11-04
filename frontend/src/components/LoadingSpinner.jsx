import React from 'react';
import { Loader2 } from 'lucide-react';

export default function LoadingSpinner({ text = 'Loading...' }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 space-y-3">
      <Loader2 className="w-8 h-8 text-accent-blue animate-spin" />
      <p className="text-sm font-medium text-slate-500">{text}</p>
    </div>
  );
}
