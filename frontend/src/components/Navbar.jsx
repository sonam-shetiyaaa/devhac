import React, { useState } from 'react';
import { Compass, RefreshCw, Globe, Server, Check, X } from 'lucide-react';
import { getCustomApiUrl, setCustomApiUrl, getBackendStatus } from '../services/api';

export default function Navbar({ activePage, setActivePage, activeTripId, onResetDemo, systemStatus }) {
  const [showApiModal, setShowApiModal] = useState(false);
  const [customUrl, setCustomUrl] = useState(getCustomApiUrl());
  const [savedMsg, setSavedMsg] = useState(false);

  const backendInfo = getBackendStatus();
  const isOnline = backendInfo.isOnline;
  const isStandalone = !isOnline;

  const handleSaveApiUrl = (e) => {
    e.preventDefault();
    setCustomApiUrl(customUrl);
    setSavedMsg(true);
    setTimeout(() => {
      setSavedMsg(false);
      setShowApiModal(false);
      window.location.reload();
    }, 800);
  };

  const handleClearApiUrl = () => {
    setCustomUrl('');
    setCustomApiUrl('');
    setSavedMsg(true);
    setTimeout(() => {
      setSavedMsg(false);
      setShowApiModal(false);
      window.location.reload();
    }, 800);
  };

  return (
    <header className="border-b border-slate-200 bg-white sticky top-0 z-30 shadow-sm no-print">
      {/* Top micro-bar with system status */}
      <div className="bg-slate-100 border-b border-slate-200 px-4 py-1 text-xs text-slate-600 flex flex-wrap items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className="font-medium text-slate-700">Autonomous Whole-Trip Travel Recovery Platform</span>
        </div>
        <div className="flex items-center space-x-2 mt-1 sm:mt-0">
          <button
            onClick={() => setShowApiModal(true)}
            title="Configure Backend API endpoint"
            className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-emerald-100 text-emerald-800 hover:bg-emerald-200 transition-colors"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 mr-1.5 animate-pulse"></span>
            {isOnline ? 'Backend Connected' : 'Vercel Standalone Engine'}
          </button>
          <span className="text-slate-400">|</span>
          <span className="text-[11px] text-slate-500 font-mono">
            {systemStatus?.db?.connected ? 'MySQL Connected' : 'Resilient Storage'}
          </span>
          <span className="text-slate-400">|</span>
          <button
            onClick={() => setShowApiModal(true)}
            className="text-[11px] text-emerald-700 font-semibold hover:underline cursor-pointer"
          >
            API Settings
          </button>
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

      {/* API Backend Configuration Modal */}
      {showApiModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl border border-slate-200 max-w-md w-full p-6 text-slate-800">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-4">
              <div className="flex items-center space-x-2">
                <Server className="w-5 h-5 text-emerald-700" />
                <h3 className="text-base font-bold text-slate-900">Backend API Configuration</h3>
              </div>
              <button
                onClick={() => setShowApiModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-600">
              <div className="p-3 bg-slate-50 rounded-md border border-slate-200 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-700">Current Mode:</span>
                  <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                    isOnline ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                  }`}>
                    {isOnline ? 'Remote Backend Connected' : 'Vercel Standalone Engine Active'}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 pt-1">
                  {isOnline
                    ? 'Connected to live Express API. Real-time MySQL/Node endpoints are responding.'
                    : 'Running in zero-config Vercel Standalone mode. All 3 multi-modal scenarios, cascade calculations, 100-pt scoring formulas, and itinerary actions run locally.'}
                </p>
              </div>

              <form onSubmit={handleSaveApiUrl} className="space-y-3 pt-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Custom Backend Server URL (Optional):
                  </label>
                  <input
                    type="url"
                    value={customUrl}
                    onChange={(e) => setCustomUrl(e.target.value)}
                    placeholder="e.g. https://your-backend.onrender.com"
                    className="w-full px-3 py-2 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-emerald-600 focus:border-emerald-600 outline-none"
                  />
                  <p className="text-[11px] text-slate-400 mt-1">
                    If you deploy the Node.js backend to Render, Railway, or Fly.io, paste its base URL here. Leave empty to use local Vite proxy or standalone mode.
                  </p>
                </div>

                {savedMsg && (
                  <div className="p-2 bg-emerald-50 text-emerald-800 text-xs rounded border border-emerald-200 flex items-center">
                    <Check className="w-4 h-4 mr-1.5" />
                    Settings saved! Reloading application...
                  </div>
                )}

                <div className="flex items-center justify-end space-x-2 pt-2">
                  {customUrl && (
                    <button
                      type="button"
                      onClick={handleClearApiUrl}
                      className="px-3 py-1.5 border border-slate-300 text-slate-600 hover:bg-slate-50 rounded text-xs"
                    >
                      Reset to Default
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setShowApiModal(false)}
                    className="px-3 py-1.5 border border-slate-300 text-slate-700 hover:bg-slate-50 rounded text-xs"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 bg-emerald-700 text-white font-semibold rounded text-xs hover:bg-emerald-800 shadow-xs"
                  >
                    Save & Connect
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
