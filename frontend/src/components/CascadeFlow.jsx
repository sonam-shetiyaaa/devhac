import React from 'react';
import { AlertCircle, ArrowDown, AlertTriangle, ShieldAlert } from 'lucide-react';

export default function CascadeFlow({ disruptedBooking, impactedBookings = [], summary }) {
  if (!disruptedBooking) return null;

  return (
    <div className="bg-white border border-slate-200/80 rounded-xl p-5 shadow-xs">
      {/* Header */}
      <div className="pb-3 mb-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <div className="flex items-center space-x-2">
            <ShieldAlert className="w-4 h-4 text-slate-700" />
            <h3 className="font-semibold text-slate-900 text-sm">Cascade Impact Analysis</h3>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            {summary || 'Upstream failure impact mapping across connecting transport, lodging, and activities.'}
          </p>
        </div>
        <span className="self-start sm:self-auto text-[11px] bg-amber-50 text-amber-700 border border-amber-200/70 px-2 py-0.5 rounded-full font-medium">
          {impactedBookings.length} Downstream Conflict{impactedBookings.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Chain flow */}
      <div className="space-y-3">
        {/* Step 1: Root disruption */}
        <div className="border border-rose-200/80 bg-rose-50/40 rounded-xl p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="flex items-center space-x-2">
                <span className="bg-rose-600 text-white text-[10px] font-semibold px-1.5 py-0.5 rounded">
                  Root Cause
                </span>
                <span className="text-xs font-semibold text-rose-900 uppercase tracking-wide">
                  {disruptedBooking.type || 'FLIGHT'} Disruption
                </span>
              </div>
              <h4 className="text-sm font-semibold text-slate-900 mt-1.5">
                {disruptedBooking.title || disruptedBooking.bookingTitle || 'Primary Disrupted Leg'}
              </h4>
              <p className="text-xs text-rose-800 mt-0.5">
                {disruptedBooking.notes || disruptedBooking.description || 'Cancelled by operator before scheduled departure.'}
              </p>
            </div>
            <span className="text-[11px] font-medium text-rose-700 bg-white/80 border border-rose-200 px-2 py-0.5 rounded-full shrink-0">
              Cancelled
            </span>
          </div>
        </div>

        {/* Minimal connecting divider */}
        {impactedBookings.length > 0 && (
          <div className="flex items-center justify-center py-0.5">
            <div className="flex items-center space-x-1 text-[11px] text-slate-400 bg-slate-50 px-2.5 py-0.5 rounded-full border border-slate-100">
              <ArrowDown className="w-3 h-3 text-slate-400" />
              <span>Downstream Cascades</span>
            </div>
          </div>
        )}

        {/* Downstream conflicts */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {impactedBookings.map((conflict, idx) => (
            <div
              key={conflict.bookingId || idx}
              className="border border-slate-200/80 bg-slate-50/50 rounded-xl p-3.5 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="font-medium text-slate-600 bg-white border border-slate-200/70 px-1.5 py-0.5 rounded text-[10px]">
                    Step {conflict.cascadeLevel || idx + 1}
                  </span>
                  <span className="text-[11px] font-medium text-slate-400 uppercase">
                    {conflict.type}
                  </span>
                </div>
                <h5 className="text-xs font-semibold text-slate-900 leading-snug">
                  {conflict.bookingTitle}
                </h5>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  {conflict.description}
                </p>
              </div>

              <div className="mt-3 pt-2.5 border-t border-slate-100">
                <div className="flex items-start space-x-1.5 text-[11px] text-amber-800">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                  <span className="font-medium">{conflict.requiredAction}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
