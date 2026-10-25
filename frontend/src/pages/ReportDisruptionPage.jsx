import React, { useState, useEffect } from 'react';
import { AlertTriangle, Clock, ArrowRight, ShieldAlert, CheckCircle, Info } from 'lucide-react';
import { previewDisruptionCascade } from '../services/api';
import CascadeFlow from '../components/CascadeFlow';

export default function ReportDisruptionPage({ activeTrip, onReportDisruption, onNavigate }) {
  const bookings = activeTrip?.bookings || [];

  const [selectedBookingId, setSelectedBookingId] = useState(
    bookings.find(b => b.status === 'DISRUPTED')?.id || bookings[0]?.id || ''
  );
  const [disruptionType, setDisruptionType] = useState('FLIGHT_CANCELLATION');
  const [delayMinutes, setDelayMinutes] = useState(720);
  const [description, setDescription] = useState(
    'Flight cancelled by carrier before departure due to unscheduled technical aircraft maintenance. No immediate automatic rebooking offered.'
  );
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Live cascade preview state
  const [previewCascade, setPreviewCascade] = useState(null);

  const selectedBooking = bookings.find(b => b.id === selectedBookingId);

  // Update cascade preview when booking or delay changes
  useEffect(() => {
    if (!activeTrip || !selectedBookingId) return;

    previewDisruptionCascade({
      trip_id: activeTrip.id,
      booking_id: selectedBookingId,
      disruption_type: disruptionType,
      delay_minutes: delayMinutes,
    })
      .then(res => {
        if (res.success) setPreviewCascade(res.data);
      })
      .catch(() => {
        // Fallback or silence
      });
  }, [activeTrip?.id, selectedBookingId, disruptionType, delayMinutes]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setSubmitting(true);

    try {
      await onReportDisruption({
        trip_id: activeTrip.id,
        booking_id: selectedBookingId,
        disruption_type: disruptionType,
        severity: disruptionType.includes('CANCELLATION') ? 'CRITICAL' : 'MEDIUM',
        planned_time: selectedBooking?.scheduled_departure,
        updated_time: selectedBooking?.scheduled_departure,
        delay_minutes: parseInt(delayMinutes, 10) || 0,
        description,
      });

      setSuccessMsg('Disruption successfully recorded and multi-leg cascade impacts mapped!');
      setTimeout(() => {
        onNavigate('recovery-analysis');
      }, 1200);
    } catch (err) {
      setError(err.message || 'Failed to submit disruption report');
    } finally {
      setSubmitting(false);
    }
  };

  if (!activeTrip) {
    return (
      <div className="bg-white border border-slate-200 rounded-lg p-8 text-center">
        <p className="text-slate-600">Please select or load a trip first.</p>
        <button
          onClick={() => onNavigate('dashboard')}
          className="mt-3 px-4 py-2 bg-emerald-600 text-white rounded text-xs font-semibold"
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-xs">
        <div className="flex items-center space-x-2 text-xs font-semibold text-amber-800 uppercase tracking-wider mb-1">
          <AlertTriangle className="w-4 h-4 text-amber-600" />
          <span>Feature 1: Disruption Intake & Impact Recognition</span>
        </div>
        <h1 className="text-xl font-bold text-slate-900">Report a Travel Disruption</h1>
        <p className="text-xs text-slate-600 mt-1 max-w-2xl">
          Report delays or cancellations for any flight, train, or hotel booking. TripRescue AI immediately analyzes dependencies on connecting trains, hotel check-ins, and planned activities.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Form column (5 cols) */}
        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-lg p-5 shadow-xs">
          <h2 className="text-sm font-bold text-slate-900 mb-3 pb-2 border-b border-slate-200">
            Disruption Reporting Form
          </h2>

          {error && (
            <div className="mb-3 p-3 bg-rose-50 border border-rose-200 rounded text-xs text-rose-800">
              {error}
            </div>
          )}

          {successMsg && (
            <div className="mb-3 p-3 bg-emerald-50 border border-emerald-200 rounded text-xs text-emerald-800 flex items-center">
              <CheckCircle className="w-4 h-4 mr-2 text-emerald-600 shrink-0" />
              <span>{successMsg} Redirecting to Recovery Analysis...</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            {/* 1. Affected Booking */}
            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                Affected Journey Segment <span className="text-rose-600">*</span>
              </label>
              <select
                value={selectedBookingId}
                onChange={e => {
                  setSelectedBookingId(e.target.value);
                  const bk = bookings.find(b => b.id === e.target.value);
                  if (bk?.type === 'TRAIN') setDisruptionType('TRAIN_DELAY');
                  else if (bk?.type === 'HOTEL') setDisruptionType('HOTEL_ISSUE');
                  else setDisruptionType('FLIGHT_CANCELLATION');
                }}
                className="w-full border border-slate-300 rounded p-2 bg-white text-slate-800 font-medium"
                required
              >
                {bookings.map(b => (
                  <option key={b.id} value={b.id}>
                    [{b.type}] {b.title} ({b.reference_code})
                  </option>
                ))}
              </select>
              {selectedBooking && (
                <div className="mt-1.5 text-[11px] text-slate-500 bg-slate-50 p-2 rounded border border-slate-200">
                  Scheduled: {selectedBooking.scheduled_departure ? new Date(selectedBooking.scheduled_departure).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'N/A'} • Carrier: {selectedBooking.provider}
                </div>
              )}
            </div>

            {/* 2. Disruption Type */}
            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                Disruption Category <span className="text-rose-600">*</span>
              </label>
              <select
                value={disruptionType}
                onChange={e => {
                  setDisruptionType(e.target.value);
                  if (e.target.value.includes('CANCELLATION')) {
                    setDelayMinutes(720);
                  }
                }}
                className="w-full border border-slate-300 rounded p-2 bg-white text-slate-800"
                required
              >
                <option value="FLIGHT_CANCELLATION">Flight Cancellation</option>
                <option value="FLIGHT_DELAY">Flight Delay</option>
                <option value="TRAIN_CANCELLATION">Train Cancellation</option>
                <option value="TRAIN_DELAY">Train Delay</option>
                <option value="HOTEL_ISSUE">Hotel Booking Issue / Delay</option>
                <option value="OTHER">Other Transit Issue</option>
              </select>
            </div>

            {/* 3. Delay Minutes */}
            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                Estimated Delay (Minutes)
              </label>
              <input
                type="number"
                min="0"
                step="15"
                value={delayMinutes}
                onChange={e => setDelayMinutes(e.target.value)}
                className="w-full border border-slate-300 rounded p-2 bg-white text-slate-800"
                placeholder="e.g. 120 (or 720 for cancellation)"
              />
              <span className="text-[11px] text-slate-400">
                {disruptionType.includes('CANCELLATION') ? 'Cancellation stops all downstream progress on this leg.' : `Delay of ${Math.round(delayMinutes / 60 * 10) / 10} hours.`}
              </span>
            </div>

            {/* 4. Description */}
            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                Description / Airline Notice <span className="text-rose-600">*</span>
              </label>
              <textarea
                rows={4}
                value={description}
                onChange={e => setDescription(e.target.value)}
                className="w-full border border-slate-300 rounded p-2 bg-white text-slate-800"
                placeholder="Describe what occurred, carrier notice, reason given, or current airport situation..."
                required
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-2.5 px-4 bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded shadow-xs transition-colors text-xs flex items-center justify-center"
            >
              <AlertTriangle className="w-4 h-4 mr-2" />
              {submitting ? 'Submitting & Analyzing...' : 'Submit Disruption & Launch Recovery Agent'}
            </button>
          </form>
        </div>

        {/* Live cascade preview column (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs flex items-start text-slate-600">
            <Info className="w-4 h-4 text-emerald-600 mr-2 shrink-0 mt-0.5" />
            <span>
              <strong>Real-Time Cascade Preview:</strong> As you adjust disruption parameters on the left, TripRescue AI dynamically calculates the impact on connecting trains, hotel check-ins, and scheduled events below.
            </span>
          </div>

          {previewCascade ? (
            <CascadeFlow
              disruptedBooking={selectedBooking}
              impactedBookings={previewCascade.impactedBookings}
              summary={previewCascade.summary}
            />
          ) : (
            <div className="bg-white border border-slate-200 rounded-lg p-8 text-center text-xs text-slate-500">
              Select an affected booking to preview its cascade impacts across your trip.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
