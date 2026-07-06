'use client';

import React, { useEffect } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('LeadHunter AI Error boundary caught:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-[#090D16] text-white flex flex-col items-center justify-center p-6 text-center">
      <div className="glass-panel rounded-2xl p-8 max-w-md w-full border border-white/10 shadow-2xl">
        <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center mx-auto mb-4">
          <AlertTriangle className="w-6 h-6" />
        </div>
        <h2 className="text-lg font-bold mb-2">Application Notice</h2>
        <p className="text-xs text-gray-400 mb-6 leading-relaxed">
          {error?.message || 'An unexpected issue occurred while loading lead intelligence data.'}
        </p>
        <button
          onClick={() => reset()}
          className="w-full py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-cyan-500 text-white text-xs font-semibold shadow-lg hover:brightness-110 transition-all flex items-center justify-center gap-2"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Reload Pipeline Dashboard</span>
        </button>
      </div>
    </div>
  );
}
