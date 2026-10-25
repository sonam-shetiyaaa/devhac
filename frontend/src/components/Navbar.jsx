import React from 'react';
import { Compass, AlertTriangle, RefreshCw, CheckCircle, FileText, MapPin, Sparkles } from 'lucide-react';

export default function Navbar({ activePage, setActivePage, activeTripId, onResetDemo, systemStatus }) {
  return (
    <header className="border-b border-slate-200 bg-white sticky top-0 z-30 shadow-sm no-print">
      {/* Top micro-bar with system status */}
      <div className="bg-slate-100 border-b border-slate-200 px-4 py-1 text-xs text-slate-600 flex flex-wrap items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className="font-medium text-slate-700">Autonomous Whole-Trip Travel Recovery Platform</span>
        </div>
        <div className="flex items-center space-x-2 mt-1 sm:mt-0">
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-emerald-100 text-emerald-800">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 mr-1.5"></span>
            {systemStatus?.ai?.mode === 'LIVE_GEMINI_AI' ? 'Gemini AI Live' : 'AI Reasoning Core Active'}
          </span>
          <span className="text-slate-400">|</span>
          <span className="text-[11px] text-slate-500 font-mono">
            {systemStatus?.db?.connected ? 'MySQL Connected' : 'Resilient DB'}
          </span>
        </div>
      </div>

      {/* Main navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & title */}
          <div className="flex items-center cursor-pointer" onClick={() => setActivePage('dashboard')}>
            <div className="w-10 h-10 rounded bg-emerald-700 flex items-center justify-center text-white font-bold mr-3 shadow-sm">
              <Compass className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xl font-bold tracking-tight text-slate-900">TripRescue AI</span>
              </div>
              <p className="text-xs text-slate-500">Autonomous Whole-Trip Disruption Recovery Agent</p>
            </div>
          </div>

          {/* Navigation links */}
          <nav className="hidden md:flex space-x-1">
            <button
              onClick={() => setActivePage('dashboard')}
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                activePage === 'dashboard'
                  ? 'bg-slate-100 text-slate-900 border-b-2 border-emerald-600 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              Dashboard
            </button>
            <button
              onClick={() => setActivePage('trip-details')}
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                activePage === 'trip-details'
                  ? 'bg-slate-100 text-slate-900 border-b-2 border-emerald-600 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              Trip Details
            </button>
            <button
              onClick={() => setActivePage('report-disruption')}
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                activePage === 'report-disruption'
                  ? 'bg-slate-100 text-slate-900 border-b-2 border-amber-600 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              Report Disruption
            </button>
            <button
              onClick={() => setActivePage('recovery-analysis')}
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                activePage === 'recovery-analysis'
                  ? 'bg-slate-100 text-slate-900 border-b-2 border-emerald-600 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              Recovery Analysis
            </button>
            <button
              onClick={() => setActivePage('revised-itinerary')}
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                activePage === 'revised-itinerary'
                  ? 'bg-slate-100 text-slate-900 border-b-2 border-emerald-600 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              Revised Itinerary
            </button>
          </nav>

          {/* Quick Demo Reset */}
          <div className="flex items-center space-x-2">
            <button
              onClick={onResetDemo}
              title="Reset sample scenario (Bengaluru to Jaipur via Delhi flight cancellation)"
              className="inline-flex items-center px-3 py-1.5 border border-slate-300 text-xs font-medium rounded text-slate-700 bg-white hover:bg-slate-50 hover:border-slate-400 transition-colors shadow-xs"
            >
              <RefreshCw className="w-3.5 h-3.5 mr-1.5 text-slate-500" />
              Reset Demo Scenario
            </button>
          </div>
        </div>
      </div>

      {/* Mobile navigation tab strip */}
      <div className="md:hidden border-t border-slate-200 px-2 py-1.5 bg-slate-50 flex overflow-x-auto space-x-1 text-xs">
        {['dashboard', 'trip-details', 'report-disruption', 'recovery-analysis', 'revised-itinerary'].map(page => (
          <button
            key={page}
            onClick={() => setActivePage(page)}
            className={`px-2.5 py-1.5 rounded whitespace-nowrap capitalize ${
              activePage === page ? 'bg-emerald-700 text-white font-medium' : 'text-slate-600 bg-white border border-slate-200'
            }`}
          >
            {page.replace('-', ' ')}
          </button>
        ))}
      </div>
    </header>
  );
}
