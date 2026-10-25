import React from 'react';
import { Compass } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="mt-16 py-8 border-t border-slate-200/60 text-xs text-slate-400 no-print">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center space-x-2 text-slate-600">
          <Compass className="w-3.5 h-3.5 text-slate-400" />
          <span className="font-medium text-slate-700">TripRescue AI</span>
          <span className="text-slate-300">•</span>
          <span className="text-slate-400 text-[11px]">Autonomous whole-trip travel recovery</span>
        </div>

        <div className="text-[11px] text-slate-400">
          © 2026 TripRescue AI • Demonstration dataset
        </div>
      </div>
    </footer>
  );
}
