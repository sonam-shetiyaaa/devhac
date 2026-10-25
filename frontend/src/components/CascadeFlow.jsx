import React from 'react';
import { AlertCircle, ArrowRight, Clock, ShieldAlert, AlertTriangle, ArrowDown } from 'lucide-react';

export default function CascadeFlow({ disruptedBooking, impactedBookings = [], summary }) {
  if (!disruptedBooking) return null;

  return (
    <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-xs">
      {/* Header with key problem reminder */}
      <div className="border-b border-slate-200 pb-3 mb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <ShieldAlert className="w-5 h-5 text-amber-600" />
            <h3 className="font-semibold text-slate-900 text-base">Whole-Trip Cascade Impact Analysis</h3>
          </div>
          <span className="text-xs bg-amber-50 text-amber-800 border border-amber-200 px-2 py-0.5 rounded font-medium">
            {impactedBookings.length} Downstream Conflict{impactedBookings.length !== 1 ? 's' : ''} Identified
          </span>
        </div>
        <p className="text-xs text-slate-500 mt-1">
          {summary || 'Analyzing how the primary booking failure cascades through connecting transport, hotel check-in, and scheduled activities.'}
        </p>
      </div>

      {/* Visual domino chain */}
      <div className="space-y-3">
        {/* Step 1: Root disruption */}
        <div className="border-2 border-rose-300 bg-rose-50/50 rounded-lg p-3.5 relative">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center space-x-2">
                <span className="bg-rose-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded uppercase">
                  Root Cause
                </span>
                <span className="text-xs font-semibold text-rose-900 uppercase tracking-wide">
                  {disruptedBooking.type || 'FLIGHT'} DISRUPTION
                </span>
              </div>
              <h4 className="text-sm font-bold text-slate-900 mt-1">
                {disruptedBooking.title || disruptedBooking.bookingTitle || 'Primary Disrupted Segment'}
              </h4>
              <p className="text-xs text-rose-800 mt-0.5">
                {disruptedBooking.notes || disruptedBooking.description || 'Cancelled by operator before scheduled departure.'}
              </p>
            </div>
            <span className="text-xs font-medium text-rose-700 bg-rose-100 px-2 py-1 rounded">
              Status: Cancelled / Broken
            </span>
          </div>
        </div>

        {/* Downward connecting indicator */}
        {impactedBookings.length > 0 && (
          <div className="flex items-center justify-center my-1">
            <div className="flex items-center text-xs text-amber-600 font-medium bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
              <ArrowDown className="w-3.5 h-3.5 mr-1" />
              Cascading Domino Effects on Remaining Trip
            </div>
          </div>
        )}

        {/* Subsequent cascaded conflicts */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {impactedBookings.map((conflict, idx) => (
            <div
              key={conflict.bookingId || idx}
              className="border border-amber-200 bg-amber-50/30 rounded-lg p-3 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-semibold text-amber-800 bg-amber-100 px-1.5 py-0.5 rounded text-[10px]">
                    Cascade Step {conflict.cascadeLevel || idx + 1}
                  </span>
                  <span className="text-[11px] font-medium text-slate-500 uppercase">
                    {conflict.type}
                  </span>
                </div>
                <h5 className="text-xs font-bold text-slate-900 leading-snug">
                  {conflict.bookingTitle}
                </h5>
                <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                  {conflict.description}
                </p>
              </div>

              <div className="mt-3 pt-2 border-t border-amber-100">
                <div className="flex items-start text-[11px] text-amber-900 font-medium">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-600 mr-1.5 shrink-0 mt-0.5" />
                  <span>{conflict.requiredAction}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
