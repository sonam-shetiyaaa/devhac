import React from 'react';
import { Compass } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-white border-t border-slate-200 mt-12 py-6 text-xs text-slate-600 no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div className="flex items-center space-x-2 text-slate-900 font-bold">
            <Compass className="w-5 h-5 text-emerald-700" />
            <span>TripRescue AI</span>
            <span className="text-slate-400 font-normal">|</span>
            <span className="text-slate-500 font-normal text-xs">Autonomous Whole-Trip Travel Recovery Platform</span>
          </div>

          <div className="text-slate-500 text-xs text-center sm:text-right">
            Autonomous multi-leg disruption diagnosis and constraint-optimized itinerary recovery.
          </div>
        </div>

        <div className="pt-3 flex flex-col sm:flex-row items-center justify-between text-slate-400 text-[11px]">
          <div>TripRescue AI • Whole-Trip Travel Recovery Platform</div>
          <div className="mt-1 sm:mt-0">© 2026 TripRescue AI • All travel data marked as demonstration dataset.</div>
        </div>
      </div>
    </footer>
  );
}
