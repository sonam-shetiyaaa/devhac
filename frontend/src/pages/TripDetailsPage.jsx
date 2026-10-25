import React, { useState } from 'react';
import { Plane, Train, Building2, CalendarCheck, Plus, ArrowRight, ArrowLeft, AlertTriangle, Shield, Clock } from 'lucide-react';
import StatusBadge from '../components/StatusBadge';

export default function TripDetailsPage({ activeTrip, onAddBooking, onNavigate, loading }) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newBooking, setNewBooking] = useState({
    type: 'FLIGHT',
    provider: '',
    reference_code: '',
    title: '',
    origin_station: '',
    destination_station: '',
    scheduled_departure: '',
    scheduled_arrival: '',
    cost: '',
    notes: '',
  });
  const [formError, setFormError] = useState('');

  if (!activeTrip) {
    return (
      <div className="bg-white border border-slate-200/80 rounded-xl p-8 text-center">
        <p className="text-slate-600 text-sm">No active trip selected.</p>
        <button
          onClick={() => onNavigate('dashboard')}
          className="mt-3 px-3.5 py-1.5 bg-slate-900 text-white rounded-lg text-xs font-medium"
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  const handleCreateBooking = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!newBooking.title || !newBooking.provider || !newBooking.reference_code) {
      setFormError('Title, provider, and reference code are required.');
      return;
    }

    try {
      await onAddBooking(activeTrip.id, newBooking);
      setShowAddForm(false);
      setNewBooking({
        type: 'FLIGHT',
        provider: '',
        reference_code: '',
        title: '',
        origin_station: '',
        destination_station: '',
        scheduled_departure: '',
        scheduled_arrival: '',
        cost: '',
        notes: '',
      });
    } catch (err) {
      setFormError(err.message || 'Failed to add booking');
    }
  };

  const constraints = activeTrip.constraints || {};
  const bookings = activeTrip.bookings || [];

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-1">
        <div>
          <button
            onClick={() => onNavigate('dashboard')}
            className="inline-flex items-center space-x-1 text-xs text-slate-500 hover:text-slate-800 mb-1 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Dashboard</span>
          </button>
          <div className="flex items-center space-x-2.5">
            <h1 className="text-xl font-bold tracking-tight text-slate-900">{activeTrip.title}</h1>
            <StatusBadge status={activeTrip.status} />
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Traveller: <span className="font-medium text-slate-700">{activeTrip.traveller_name}</span> • Route: <span className="font-medium text-slate-700">{activeTrip.origin} → {activeTrip.destination}</span>
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => onNavigate('report-disruption')}
            className="px-3 py-1.5 border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-lg text-xs font-medium flex items-center space-x-1.5 transition-colors"
          >
            <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
            <span>Report Disruption</span>
          </button>
          <button
            onClick={() => onNavigate('recovery-analysis')}
            className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-medium flex items-center space-x-1.5 shadow-xs transition-colors"
          >
            <span>Recovery Analysis</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Constraints & Preferences Panel */}
      <div className="bg-white border border-slate-200/80 rounded-xl p-5 shadow-xs">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-3 flex items-center space-x-1.5">
          <Shield className="w-3.5 h-3.5 text-slate-400" />
          <span>Trip Constraints & Objectives</span>
        </h2>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
          <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
            <span className="text-[11px] text-slate-400 block">Max Added Budget</span>
            <span className="text-base font-semibold text-slate-900 mt-0.5 block">
              ₹{(constraints.max_additional_budget || 4500).toLocaleString()}
            </span>
            <span className="text-[10px] text-slate-400">Ceiling for recovery fare</span>
          </div>

          <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
            <span className="text-[11px] text-slate-400 block">Arrival Target</span>
            <span className="text-base font-semibold text-slate-900 mt-0.5 block">
              {constraints.preferred_arrival_deadline ? new Date(constraints.preferred_arrival_deadline).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '21:00'}
            </span>
            <span className="text-[10px] text-slate-400">Preferred arrival deadline</span>
          </div>

          <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
            <span className="text-[11px] text-slate-400 block">Transfer Buffer</span>
            <span className="text-base font-semibold text-slate-900 mt-0.5 block">
              {constraints.min_connection_buffer_mins || 90} mins
            </span>
            <span className="text-[10px] text-slate-400">Inter-terminal safety</span>
          </div>

          <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
            <span className="text-[11px] text-slate-400 block">Critical Activity</span>
            <span className="text-sm font-semibold text-slate-900 mt-0.5 block truncate" title={constraints.critical_activities}>
              {constraints.critical_activities || 'Keynote / Event'}
            </span>
            <span className="text-[10px] text-emerald-600 font-medium">Must be preserved</span>
          </div>
        </div>

        {constraints.notes && (
          <p className="mt-3 text-xs text-slate-500 bg-slate-50/60 p-2.5 rounded-lg border border-slate-100">
            Note: {constraints.notes}
          </p>
        )}
      </div>

      {/* Booked Journey Segments */}
      <div className="bg-white border border-slate-200/80 rounded-xl p-5 shadow-xs">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
          <div>
            <h2 className="text-sm font-semibold text-slate-900">Journey Segments ({bookings.length})</h2>
            <p className="text-xs text-slate-400 mt-0.5">Chronological travel legs, lodging, and activities</p>
          </div>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="inline-flex items-center space-x-1 px-3 py-1.5 border border-slate-200 text-xs font-medium rounded-lg text-slate-700 hover:bg-slate-50 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{showAddForm ? 'Cancel' : 'Add Leg'}</span>
          </button>
        </div>

        {/* Add booking form drawer */}
        {showAddForm && (
          <form onSubmit={handleCreateBooking} className="bg-slate-50/80 border border-slate-200 rounded-xl p-4 mb-4 text-xs">
            <h3 className="font-semibold text-slate-800 text-xs mb-3">Add Travel Leg</h3>
            {formError && (
              <div className="p-2 bg-rose-50 text-rose-800 border border-rose-200 rounded-lg mb-3">
                {formError}
              </div>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
              <div>
                <label className="block text-slate-600 font-medium mb-1">Type</label>
                <select
                  value={newBooking.type}
                  onChange={e => setNewBooking({ ...newBooking, type: e.target.value })}
                  className="w-full border border-slate-200 rounded-lg p-2 bg-white text-slate-800 focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 outline-none"
                >
                  <option value="FLIGHT">Flight</option>
                  <option value="TRAIN">Train</option>
                  <option value="HOTEL">Hotel</option>
                  <option value="ACTIVITY">Activity / Tour</option>
                  <option value="TRANSFER">Transfer</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-600 font-medium mb-1">Provider</label>
                <input
                  type="text"
                  placeholder="e.g. IndiGo, ITC Hotel"
                  value={newBooking.provider}
                  onChange={e => setNewBooking({ ...newBooking, provider: e.target.value })}
                  className="w-full border border-slate-200 rounded-lg p-2 bg-white text-slate-800 focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-600 font-medium mb-1">Code / PNR</label>
                <input
                  type="text"
                  placeholder="e.g. 6E-204"
                  value={newBooking.reference_code}
                  onChange={e => setNewBooking({ ...newBooking, reference_code: e.target.value })}
                  className="w-full border border-slate-200 rounded-lg p-2 bg-white text-slate-800 focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 outline-none"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
              <div>
                <label className="block text-slate-600 font-medium mb-1">Title</label>
                <input
                  type="text"
                  placeholder="e.g. Flight 6E-204: BLR to DEL"
                  value={newBooking.title}
                  onChange={e => setNewBooking({ ...newBooking, title: e.target.value })}
                  className="w-full border border-slate-200 rounded-lg p-2 bg-white text-slate-800 focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-600 font-medium mb-1">Cost (INR)</label>
                <input
                  type="number"
                  placeholder="5800"
                  value={newBooking.cost}
                  onChange={e => setNewBooking({ ...newBooking, cost: e.target.value })}
                  className="w-full border border-slate-200 rounded-lg p-2 bg-white text-slate-800 focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 outline-none"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-2 mt-3">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-3 py-1.5 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-100 font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 bg-slate-900 text-white rounded-lg font-medium hover:bg-slate-800 transition-colors"
              >
                Save Leg
              </button>
            </div>
          </form>
        )}

        {/* Clean Segments Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-100 text-xs">
            <thead className="text-slate-400 font-medium text-left">
              <tr>
                <th className="py-2.5 px-3 w-8">#</th>
                <th className="py-2.5 px-3">Type</th>
                <th className="py-2.5 px-3">Segment</th>
                <th className="py-2.5 px-3">Timing</th>
                <th className="py-2.5 px-3">Fare</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {bookings.map((b, idx) => (
                <tr
                  key={b.id}
                  className={`transition-colors ${
                    b.status === 'DISRUPTED'
                      ? 'bg-rose-50/30'
                      : b.status === 'IMPACTED'
                      ? 'bg-amber-50/30'
                      : 'hover:bg-slate-50/60'
                  }`}
                >
                  <td className="py-3 px-3 font-mono text-slate-400">{idx + 1}</td>
                  <td className="py-3 px-3">
                    <span className="inline-flex items-center space-x-1.5 px-2 py-0.5 rounded-md text-[11px] font-medium bg-slate-50 text-slate-700 border border-slate-200/60">
                      {b.type === 'FLIGHT' && <Plane className="w-3 h-3 text-slate-500" />}
                      {b.type === 'TRAIN' && <Train className="w-3 h-3 text-slate-500" />}
                      {b.type === 'HOTEL' && <Building2 className="w-3 h-3 text-slate-500" />}
                      {b.type === 'ACTIVITY' && <CalendarCheck className="w-3 h-3 text-slate-500" />}
                      <span>{b.type}</span>
                    </span>
                  </td>
                  <td className="py-3 px-3">
                    <div className="font-semibold text-slate-900">{b.title}</div>
                    <div className="text-slate-400 text-[11px] font-mono">{b.provider} • {b.reference_code}</div>
                  </td>
                  <td className="py-3 px-3">
                    <div className="text-slate-700">
                      {b.scheduled_departure ? new Date(b.scheduled_departure).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'}
                      {' → '}
                      {b.scheduled_arrival ? new Date(b.scheduled_arrival).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'}
                    </div>
                  </td>
                  <td className="py-3 px-3 font-medium text-slate-700">
                    ₹{parseFloat(b.cost).toLocaleString()}
                  </td>
                  <td className="py-3 px-3">
                    <StatusBadge status={b.status} />
                  </td>
                  <td className="py-3 px-3 text-slate-400 text-[11px] max-w-xs truncate">
                    {b.notes || '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
