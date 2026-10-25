import React, { useState, useEffect } from 'react';
import { AlertTriangle, ArrowLeft, CheckCircle, Info } from 'lucide-react';
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

      setSuccessMsg('Disruption recorded! Multi-leg cascade impacts mapped.');
      setTimeout(() => {
        onNavigate('recovery-analysis');
      }, 1000);
    } catch (err) {
      setError(err.message || 'Failed to submit disruption report');
    } finally {
      setSubmitting(false);
    }
  };

  if (!activeTrip) {
    return (
      <div className="bg-white border border-slate-200/80 rounded-xl p-8 text-center text-xs">
        <p className="text-slate-600 text-sm">Please select or load a trip first.</p>
        <button
          onClick={() => onNavigate('dashboard')}
          className="mt-3 px-3.5 py-1.5 bg-slate-900 text-white rounded-lg text-xs font-medium"
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="pb-1">
        <button
          onClick={() => onNavigate('dashboard')}
          className="inline-flex items-center space-x-1 text-xs text-slate-500 hover:text-slate-800 mb-1 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Dashboard</span>
        </button>
        <h1 className="text-xl font-bold tracking-tight text-slate-900">Report Travel Disruption</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Record delays or cancellations for any leg. Downstream hotel, train, and activity impacts are computed automatically.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Form column (5 cols) */}
        <div className="lg:col-span-5 bg-white border border-slate-200/80 rounded-xl p-5 shadow-xs">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-3 pb-2 border-b border-slate-100">
            Disruption Details
          </h2>

          {error && (
            <div className="mb-3 p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-800">
              {error}
            </div>
          )}

          {successMsg && (
            <div className="mb-3 p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-800 flex items-center space-x-2">
              <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
            {/* 1. Affected Booking */}
            <div>
              <label className="block text-slate-600 font-medium mb-1">
                Affected Segment
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
                className="w-full border border-slate-200 rounded-lg p-2 bg-white text-slate-800 focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 outline-none"
                required
              >
                {bookings.map(b => (
                  <option key={b.id} value={b.id}>
                    [{b.type}] {b.title} ({b.reference_code})
                  </option>
                ))}
              </select>
              {selectedBooking && (
                <div className="mt-1.5 text-[11px] text-slate-400">
                  Scheduled:{' '}
                  {selectedBooking.scheduled_departure
                    ? new Date(selectedBooking.scheduled_departure).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                    : '—'}
                  {' • '}Carrier: {selectedBooking.provider}
                </div>
              )}
            </div>

            {/* 2. Disruption Type */}
            <div>
              <label className="block text-slate-600 font-medium mb-1">
                Category
              </label>
              <select
                value={disruptionType}
                onChange={e => {
                  setDisruptionType(e.target.value);
                  if (e.target.value.includes('CANCELLATION')) {
                    setDelayMinutes(720);
                  }
                }}
                className="w-full border border-slate-200 rounded-lg p-2 bg-white text-slate-800 focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 outline-none"
                required
              >
                <option value="FLIGHT_CANCELLATION">Flight Cancellation</option>
                <option value="FLIGHT_DELAY">Flight Delay</option>
                <option value="TRAIN_CANCELLATION">Train Cancellation</option>
                <option value="TRAIN_DELAY">Train Delay</option>
                <option value="HOTEL_ISSUE">Hotel Issue / Delay</option>
                <option value="OTHER">Other Transit Issue</option>
              </select>
            </div>

            {/* 3. Delay Minutes */}
            <div>
              <label className="block text-slate-600 font-medium mb-1">
                Estimated Delay (Minutes)
              </label>
              <input
                type="number"
                min="0"
                step="15"
                value={delayMinutes}
                onChange={e => setDelayMinutes(e.target.value)}
                className="w-full border border-slate-200 rounded-lg p-2 bg-white text-slate-800 focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 outline-none"
                placeholder="120"
              />
              <span className="text-[11px] text-slate-400 mt-1 block">
                {disruptionType.includes('CANCELLATION') ? 'Stops all scheduled progress on this leg.' : `Delay of ${Math.round(delayMinutes / 60 * 10) / 10} hours.`}
              </span>
            </div>

            {/* 4. Description */}
            <div>
              <label className="block text-slate-600 font-medium mb-1">
                Description / Notice
              </label>
              <textarea
                rows={3}
                value={description}
                onChange={e => setDescription(e.target.value)}
                className="w-full border border-slate-200 rounded-lg p-2 bg-white text-slate-800 focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 outline-none"
                placeholder="Details of the disruption..."
                required
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-2 px-4 bg-slate-900 hover:bg-slate-800 text-white font-medium rounded-lg shadow-xs transition-colors text-xs flex items-center justify-center space-x-1.5"
            >
              <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
              <span>{submitting ? 'Analyzing Cascades...' : 'Submit & Analyze Recovery'}</span>
            </button>
          </form>
        </div>

        {/* Live cascade preview column (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          {previewCascade ? (
            <CascadeFlow
              disruptedBooking={selectedBooking}
              impactedBookings={previewCascade.impactedBookings}
              summary={previewCascade.summary}
            />
          ) : (
            <div className="bg-white border border-slate-200/80 rounded-xl p-8 text-center text-xs text-slate-400">
              Select an affected booking to preview its cascade impacts across your trip.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
