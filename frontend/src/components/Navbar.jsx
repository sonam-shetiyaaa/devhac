import React, { useState } from 'react';
import { Compass, RefreshCw, Server, Check, X } from 'lucide-react';
import { getCustomApiUrl, setCustomApiUrl, getBackendStatus } from '../services/api';

export default function Navbar({ activePage, setActivePage, activeTripId, onResetDemo, systemStatus }) {
  const [showApiModal, setShowApiModal] = useState(false);
  const [customUrl, setCustomUrl] = useState(getCustomApiUrl());
  const [savedMsg, setSavedMsg] = useState(false);

  const backendInfo = getBackendStatus();
  const isOnline = backendInfo.isOnline;

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

  const navItems = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'trip-details', label: 'Trip Details' },
    { id: 'report-disruption', label: 'Report Disruption' },
    { id: 'recovery-analysis', label: 'Recovery Analysis' },
    { id: 'revised-itinerary', label: 'Revised Itinerary' },
  ];

  return (
    <header className="border-b border-slate-200/80 bg-white/95 backdrop-blur-md sticky top-0 z-30 no-print">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-14">
          {/* Logo & Brand */}
          <div
            className="flex items-center space-x-2.5 cursor-pointer select-none"
            onClick={() => setActivePage('dashboard')}
          >
            <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center font-bold shadow-xs">
              <Compass className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="flex items-center space-x-1.5">
              <span className="text-sm font-semibold tracking-tight text-slate-900">TripRescue</span>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200/60">
                AI
              </span>
            </div>
          </div>

          {/* Desktop Navigation Links - Minimalist pill bar */}
          <nav className="hidden md:flex items-center space-x-1 bg-slate-100/70 p-1 rounded-lg border border-slate-200/50">
            {navItems.map(({ id, label }) => {
              const active = activePage === id;
              return (
                <button
                  key={id}
                  onClick={() => setActivePage(id)}
                  className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${
                    active
                      ? 'bg-white text-slate-900 shadow-xs font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </nav>

          {/* Right actions: clean status pill & reset demo */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowApiModal(true)}
              title="API / Engine Settings"
              className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium text-slate-600 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 border border-slate-200/80 transition-colors"
            >
              <span className={`w-1.5 h-1.5 rounded-full ${isOnline ? 'bg-emerald-500 animate-pulse' : 'bg-emerald-500'}`} />
              <span className="hidden sm:inline">{isOnline ? 'Online' : 'Engine Ready'}</span>
            </button>

            <button
              onClick={onResetDemo}
              title="Reset sample scenario"
              className="inline-flex items-center space-x-1 px-2.5 py-1 text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5 text-slate-400" />
              <span className="hidden sm:inline">Reset</span>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile nav bar */}
      <div className="md:hidden border-t border-slate-200/60 px-3 py-1.5 bg-slate-50/70 flex overflow-x-auto space-x-1 text-xs no-scrollbar">
        {navItems.map(({ id, label }) => (
          <button
            key={id}
            onClick={() => setActivePage(id)}
            className={`px-2.5 py-1 rounded-md whitespace-nowrap text-xs transition-colors ${
              activePage === id
                ? 'bg-slate-900 text-white font-medium'
                : 'text-slate-600 bg-white border border-slate-200/70'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* API Modal */}
      {showApiModal && (
        <div className="fixed inset-0 bg-slate-900/30 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 max-w-md w-full p-6 text-slate-800">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div className="flex items-center space-x-2">
                <Server className="w-4 h-4 text-emerald-600" />
                <h3 className="text-sm font-semibold text-slate-900">Backend API Configuration</h3>
              </div>
              <button
                onClick={() => setShowApiModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-md"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4 text-xs text-slate-600">
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-slate-700">Status</span>
                  <span className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                    {isOnline ? 'Remote API Active' : 'Standalone Engine Active'}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 pt-1 leading-relaxed">
                  {isOnline
                    ? 'Connected to Express backend. Real-time endpoints active.'
                    : 'Running in Standalone mode with in-memory multimodal routing, cascade computation, and scoring.'}
                </p>
              </div>

              <form onSubmit={handleSaveApiUrl} className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Custom Backend Server URL (Optional)
                  </label>
                  <input
                    type="url"
                    value={customUrl}
                    onChange={(e) => setCustomUrl(e.target.value)}
                    placeholder="e.g. https://api.yourdomain.com"
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 outline-none transition-all"
                  />
                  <p className="text-[11px] text-slate-400 mt-1">
                    Leave blank to use default proxy or local standalone engine.
                  </p>
                </div>

                {savedMsg && (
                  <div className="p-2 bg-emerald-50 text-emerald-800 text-xs rounded-lg border border-emerald-200 flex items-center">
                    <Check className="w-3.5 h-3.5 mr-1.5" />
                    Saved! Reloading...
                  </div>
                )}

                <div className="flex items-center justify-end space-x-2 pt-2">
                  {customUrl && (
                    <button
                      type="button"
                      onClick={handleClearApiUrl}
                      className="px-3 py-1.5 border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-lg text-xs font-medium"
                    >
                      Clear
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setShowApiModal(false)}
                    className="px-3 py-1.5 border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-lg text-xs font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-medium rounded-lg text-xs shadow-xs"
                  >
                    Save
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
