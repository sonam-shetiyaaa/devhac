import React, { useState } from 'react';
import { Plane, Train, Building2, CalendarCheck, Plus, ArrowRight, Check, AlertTriangle, Shield, Clock, DollarSign } from 'lucide-react';
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
      <div className="bg-white border border-slate-200 rounded-lg p-8 text-center">
        <p className="text-slate-600">No active trip selected.</p>
        <button
          onClick={() => onNavigate('dashboard')}
          className="mt-3 px-4 py-2 bg-emerald-600 text-white rounded text-sm font-medium"
        >
          Go to Dashboard
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
      {/* Header bar */}
      <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Trip Details</span>
            <StatusBadge status={activeTrip.status} />
          </div>
          <h1 className="text-xl font-bold text-slate-900 mt-1">{activeTrip.title}</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Traveller: <strong className="text-slate-700">{activeTrip.traveller_name}</strong> • Origin: <strong className="text-slate-700">{activeTrip.origin}</strong> • Destination: <strong className="text-slate-700">{activeTrip.destination}</strong>
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => onNavigate('report-disruption')}
            className="px-3.5 py-2 border border-amber-600 text-amber-800 bg-amber-50 hover:bg-amber-100 rounded text-xs font-semibold flex items-center shadow-xs"
          >
            <AlertTriangle className="w-3.5 h-3.5 mr-1.5 text-amber-600" />
            Report Disruption on this Trip
          </button>
          <button
            onClick={() => onNavigate('recovery-analysis')}
            className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs font-semibold flex items-center shadow-xs"
          >
            Open Recovery Analysis
            <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
          </button>
        </div>
      </div>

      {/* Constraints & Preferences Panel */}
      <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-xs">
        <h2 className="text-sm font-bold text-slate-900 border-b border-slate-200 pb-2 mb-4 flex items-center">
          <Shield className="w-4 h-4 text-emerald-700 mr-2" />
          Traveller Constraints & Decision Rules
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
          <div className="bg-slate-50 p-3 rounded border border-slate-200">
            <span className="text-slate-500 block">Max Additional Budget</span>
            <span className="text-base font-bold text-slate-900 mt-1 block">
              ₹{(constraints.max_additional_budget || 4500).toLocaleString()}
            </span>
            <span className="text-[11px] text-slate-500">Ceiling for recovery fare differentials</span>
          </div>

          <div className="bg-slate-50 p-3 rounded border border-slate-200">
            <span className="text-slate-500 block">Arrival Deadline</span>
            <span className="text-base font-bold text-slate-900 mt-1 block">
              {constraints.preferred_arrival_deadline ? new Date(constraints.preferred_arrival_deadline).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '21:00 PM'}
            </span>
            <span className="text-[11px] text-slate-500">Destination arrival target time</span>
          </div>

          <div className="bg-slate-50 p-3 rounded border border-slate-200">
            <span className="text-slate-500 block">Min Connection Buffer</span>
            <span className="text-base font-bold text-slate-900 mt-1 block">
              {constraints.min_connection_buffer_mins || 90} Minutes
            </span>
            <span className="text-[11px] text-slate-500">Inter-terminal or rail transfer safety</span>
          </div>

          <div className="bg-slate-50 p-3 rounded border border-slate-200">
            <span className="text-slate-500 block">Critical Activity</span>
            <span className="text-sm font-bold text-slate-900 mt-1 block truncate" title={constraints.critical_activities}>
              {constraints.critical_activities || 'Amber Fort Evening Tour'}
            </span>
            <span className="text-[11px] text-amber-700 font-medium">Must be preserved or rescheduled</span>
          </div>
        </div>

        {constraints.notes && (
          <p className="mt-3 text-xs text-slate-600 bg-slate-50 p-2.5 rounded border border-slate-200 italic">
            Constraint Notes: {constraints.notes}
          </p>
        )}
      </div>

      {/* Booked Journey Segments */}
      <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-xs">
        <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-4">
          <div>
            <h2 className="text-sm font-bold text-slate-900">Itinerary Segments & Bookings ({bookings.length})</h2>
            <p className="text-xs text-slate-500">Multi-leg transport, accommodation, and activities in sequence order</p>
          </div>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="inline-flex items-center px-3 py-1.5 border border-slate-300 text-xs font-medium rounded text-slate-700 hover:bg-slate-50"
          >
            <Plus className="w-3.5 h-3.5 mr-1" />
            {showAddForm ? 'Cancel Form' : 'Add Segment'}
          </button>
        </div>

        {/* Add booking form modal/drawer */}
        {showAddForm && (
          <form onSubmit={handleCreateBooking} className="bg-slate-50 border border-slate-300 rounded-lg p-4 mb-4 text-xs">
            <h3 className="font-bold text-slate-800 text-sm mb-3">Add Travel Segment to Trip</h3>
            {formError && (
              <div className="p-2 bg-rose-50 text-rose-800 border border-rose-200 rounded mb-3">
                {formError}
              </div>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
              <div>
                <label className="block text-slate-700 font-medium mb-1">Segment Type</label>
                <select
                  value={newBooking.type}
                  onChange={e => setNewBooking({ ...newBooking, type: e.target.value })}
                  className="w-full border border-slate-300 rounded p-1.5 bg-white"
                >
                  <option value="FLIGHT">Flight</option>
                  <option value="TRAIN">Train</option>
                  <option value="HOTEL">Hotel</option>
                  <option value="ACTIVITY">Activity / Tour</option>
                  <option value="TRANSFER">Transfer</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">Provider / Carrier</label>
                <input
                  type="text"
                  placeholder="e.g. IndiGo, Indian Railways, ITC"
                  value={newBooking.provider}
                  onChange={e => setNewBooking({ ...newBooking, provider: e.target.value })}
                  className="w-full border border-slate-300 rounded p-1.5 bg-white"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">Reference Code / PNR</label>
                <input
                  type="text"
                  placeholder="e.g. 6E-204, VB-20978"
                  value={newBooking.reference_code}
                  onChange={e => setNewBooking({ ...newBooking, reference_code: e.target.value })}
                  className="w-full border border-slate-300 rounded p-1.5 bg-white"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
              <div>
                <label className="block text-slate-700 font-medium mb-1">Segment Title</label>
                <input
                  type="text"
                  placeholder="e.g. Flight 6E-204: BLR to DEL"
                  value={newBooking.title}
                  onChange={e => setNewBooking({ ...newBooking, title: e.target.value })}
                  className="w-full border border-slate-300 rounded p-1.5 bg-white"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">Cost (INR)</label>
                <input
                  type="number"
                  placeholder="e.g. 5800"
                  value={newBooking.cost}
                  onChange={e => setNewBooking({ ...newBooking, cost: e.target.value })}
                  className="w-full border border-slate-300 rounded p-1.5 bg-white"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-2 mt-3">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-3 py-1.5 border border-slate-300 rounded text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 bg-emerald-600 text-white rounded font-medium hover:bg-emerald-700"
              >
                Save Segment
              </button>
            </div>
          </form>
        )}

        {/* Segments Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-xs">
            <thead className="bg-slate-50 text-slate-600 font-semibold text-left">
              <tr>
                <th className="py-2.5 px-3">#</th>
                <th className="py-2.5 px-3">Type</th>
                <th className="py-2.5 px-3">Booking Title & Code</th>
                <th className="py-2.5 px-3">Scheduled Timing</th>
                <th className="py-2.5 px-3">Fare (INR)</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3">Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {bookings.map((b, idx) => (
                <tr
                  key={b.id}
                  className={b.status === 'DISRUPTED' ? 'bg-rose-50/40' : (b.status === 'IMPACTED' ? 'bg-amber-50/40' : 'hover:bg-slate-50/50')}
                >
                  <td className="py-3 px-3 font-mono font-semibold text-slate-400">{idx + 1}</td>
                  <td className="py-3 px-3">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-800 border border-slate-200">
                      {b.type === 'FLIGHT' && <Plane className="w-3 h-3 mr-1 text-slate-600" />}
                      {b.type === 'TRAIN' && <Train className="w-3 h-3 mr-1 text-slate-600" />}
                      {b.type === 'HOTEL' && <Building2 className="w-3 h-3 mr-1 text-slate-600" />}
                      {b.type === 'ACTIVITY' && <CalendarCheck className="w-3 h-3 mr-1 text-slate-600" />}
                      {b.type}
                    </span>
                  </td>
                  <td className="py-3 px-3">
                    <div className="font-bold text-slate-900">{b.title}</div>
                    <div className="text-slate-500 text-[11px] font-mono">{b.provider} • {b.reference_code}</div>
                  </td>
                  <td className="py-3 px-3">
                    <div>Dep: {b.scheduled_departure ? new Date(b.scheduled_departure).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'N/A'}</div>
                    <div className="text-slate-500 text-[11px]">Arr: {b.scheduled_arrival ? new Date(b.scheduled_arrival).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'N/A'}</div>
                  </td>
                  <td className="py-3 px-3 font-semibold text-slate-800">
                    ₹{parseFloat(b.cost).toLocaleString()}
                  </td>
                  <td className="py-3 px-3">
                    <StatusBadge status={b.status} />
                  </td>
                  <td className="py-3 px-3 text-slate-500 max-w-xs text-[11px]">
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
