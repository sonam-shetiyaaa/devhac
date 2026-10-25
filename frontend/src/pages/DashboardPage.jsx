import React, { useState } from 'react';
import { AlertTriangle, PlusCircle, ArrowRight, CheckCircle2, MapPin, Calendar, User, Clock, Plus, X } from 'lucide-react';
import StatusBadge from '../components/StatusBadge';

export default function DashboardPage({
  trips = [],
  activeTrip,
  onSelectTrip,
  onQuickSwitchTrip,
  onCreateTrip,
  onNavigate,
  onLoadDemo,
  loading,
}) {
  const isDisrupted = activeTrip?.status === 'DISRUPTED';
  const isRecovered = activeTrip?.status === 'RECOVERED';

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTripData, setNewTripData] = useState({
    title: '',
    traveller_name: '',
    origin: '',
    destination: '',
    start_date: '2026-11-28T07:00:00',
    end_date: '2026-12-01T20:00:00',
    max_additional_budget: '5000',
    preferred_arrival_deadline: '2026-11-28T19:00:00',
    critical_activities: 'Important Client Conference & Keynote',
    initial_transport_type: 'FLIGHT',
    initial_carrier: 'National Air Carrier',
    initial_code: 'NC-402',
    initial_cost: '6500',
  });
  const [submitting, setSubmitting] = useState(false);
  const [modalError, setModalError] = useState('');

  const handleApplyPreset = (preset) => {
    setNewTripData({
      ...newTripData,
      title: preset.title,
      traveller_name: preset.traveller,
      origin: preset.origin,
      destination: preset.destination,
      critical_activities: preset.activity,
      initial_transport_type: preset.type,
      initial_carrier: preset.carrier,
      initial_code: preset.code,
      initial_cost: preset.cost,
    });
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setModalError('');
    if (!newTripData.title || !newTripData.traveller_name || !newTripData.origin || !newTripData.destination) {
      setModalError('Title, traveller name, origin, and destination are required.');
      return;
    }

    setSubmitting(true);
    try {
      await onCreateTrip({
        title: newTripData.title,
        traveller_name: newTripData.traveller_name,
        origin: newTripData.origin,
        destination: newTripData.destination,
        start_date: newTripData.start_date,
        end_date: newTripData.end_date,
        constraints: {
          max_additional_budget: parseFloat(newTripData.max_additional_budget) || 5000,
          preferred_arrival_deadline: newTripData.preferred_arrival_deadline,
          min_connection_buffer_mins: 90,
          prefer_direct_transport: true,
          critical_activities: newTripData.critical_activities,
        },
        bookings: [
          {
            type: newTripData.initial_transport_type,
            provider: newTripData.initial_carrier,
            reference_code: newTripData.initial_code,
            title: `${newTripData.initial_transport_type} ${newTripData.initial_code}: ${newTripData.origin} to ${newTripData.destination}`,
            origin_station: newTripData.origin,
            destination_station: newTripData.destination,
            scheduled_departure: newTripData.start_date,
            scheduled_arrival: newTripData.preferred_arrival_deadline,
            cost: parseFloat(newTripData.initial_cost) || 5000,
            status: 'CONFIRMED',
          }
        ]
      });
      setShowCreateModal(false);
    } catch (err) {
      setModalError(err.message || 'Failed to create trip');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header Area */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            Trip Recovery Dashboard
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Diagnoses upstream disruptions and resolves downstream hotel and transit cascades.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigate('report-disruption')}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-medium rounded-lg transition-colors"
          >
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
            <span>Report Disruption</span>
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium rounded-lg shadow-xs transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Trip</span>
          </button>
        </div>
      </div>

      {/* Active Trip Primary Focus Card */}
      {activeTrip && (
        <div className="bg-white border border-slate-200/90 rounded-xl p-5 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 pb-4 border-b border-slate-100">
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-medium text-slate-400">Active Journey</span>
                <StatusBadge status={activeTrip.status} />
              </div>
              <h2 className="text-lg font-bold text-slate-900 mt-1">
                {activeTrip.origin} → {activeTrip.destination}
              </h2>
              <div className="text-xs text-slate-500 mt-0.5 font-medium">
                {activeTrip.title}
              </div>

              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 mt-2.5">
                <span className="flex items-center space-x-1">
                  <User className="w-3.5 h-3.5 text-slate-400" />
                  <span>{activeTrip.traveller_name}</span>
                </span>
                <span className="flex items-center space-x-1">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <span>{new Date(activeTrip.start_date).toLocaleDateString()}</span>
                </span>
                <span className="flex items-center space-x-1">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <span>{activeTrip.bookings?.length || 0} segments</span>
                </span>
              </div>
            </div>

            <div className="flex items-center space-x-2 pt-1 sm:pt-0">
              <button
                onClick={() => onNavigate('trip-details')}
                className="px-3 py-1.5 border border-slate-200 text-xs font-medium rounded-lg text-slate-600 hover:bg-slate-50 transition-colors"
              >
                View Segments
              </button>

              {isDisrupted && (
                <button
                  onClick={() => onNavigate('recovery-analysis')}
                  className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium rounded-lg shadow-xs inline-flex items-center space-x-1.5 transition-colors"
                >
                  <span>Analyze Recovery</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}

              {isRecovered && (
                <button
                  onClick={() => onNavigate('revised-itinerary')}
                  className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium rounded-lg shadow-xs inline-flex items-center space-x-1.5 transition-colors"
                >
                  <span>Revised Itinerary</span>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                </button>
              )}
            </div>
          </div>

          {/* Clean Disruption Context Row */}
          {isDisrupted && (
            <div className="mt-4 p-3.5 rounded-lg bg-amber-50/70 border border-amber-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-start space-x-2.5">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-amber-900 block">Disruption in Progress</span>
                  <p className="text-amber-800 text-xs mt-0.5">
                    {activeTrip.disruptions?.[0]?.description ||
                      'Upstream transit cancellation threatens downstream connecting transport, hotel check-in, and activities.'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => onNavigate('recovery-analysis')}
                className="shrink-0 px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-medium rounded-md text-xs transition-colors self-start sm:self-center"
              >
                Review Recovery Options →
              </button>
            </div>
          )}

          {isRecovered && (
            <div className="mt-4 p-3.5 rounded-lg bg-emerald-50/70 border border-emerald-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-start space-x-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-emerald-900 block">Journey Recovered</span>
                  <p className="text-emerald-800 text-xs mt-0.5">
                    Recovery plan applied. Downstream connections rescheduled and action checklist ready.
                  </p>
                </div>
              </div>
              <button
                onClick={() => onNavigate('revised-itinerary')}
                className="shrink-0 px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white font-medium rounded-md text-xs transition-colors self-start sm:self-center"
              >
                Open Itinerary & Checklist →
              </button>
            </div>
          )}
        </div>
      )}

      {/* Selectable Trips & Scenarios Grid */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Available Journeys ({trips.length})
          </h3>
          <span className="text-[11px] text-slate-400">Click to switch active trip</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {trips.map((t) => {
            const isCurrent = activeTrip?.id === t.id;
            let tag = 'Scenario 1';
            let issue = 'Flight Cancellation';
            if (t.id === 'trip-bom-goa-02') {
              tag = 'Scenario 2';
              issue = 'Train Delay → Sunset Cruise';
            } else if (t.id === 'trip-del-cok-03') {
              tag = 'Scenario 3';
              issue = 'Fog Ground Delay → Houseboat';
            } else if (t.id !== 'trip-blr-jai-01') {
              tag = 'Custom';
              issue = 'Custom Itinerary';
            }

            return (
              <div
                key={t.id}
                onClick={() => onQuickSwitchTrip(t.id)}
                className={`p-4 rounded-xl border cursor-pointer transition-all ${
                  isCurrent
                    ? 'border-slate-900 bg-white shadow-xs ring-1 ring-slate-900'
                    : 'border-slate-200/80 bg-white hover:border-slate-300 hover:bg-slate-50/50'
                }`}
              >
                <div className="flex items-center justify-between text-xs mb-2">
                  <span className="text-[11px] font-medium text-slate-500">
                    {tag}
                  </span>
                  <StatusBadge status={t.status} />
                </div>

                <h4 className="text-sm font-semibold text-slate-900 truncate">
                  {t.origin} → {t.destination}
                </h4>

                <div className="text-xs text-slate-500 mt-1 truncate">
                  {t.traveller_name}
                </div>

                <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                  <span className="text-slate-500 truncate">{issue}</span>
                  {isCurrent && (
                    <span className="text-slate-900 font-medium">Selected</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* CREATE NEW TRIP MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-xl w-full p-6 text-xs max-h-[90vh] overflow-y-auto border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div className="flex items-center space-x-2">
                <PlusCircle className="w-4 h-4 text-slate-900" />
                <h3 className="font-semibold text-slate-900 text-sm">Create New Trip</h3>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-md"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Quick preset chips */}
            <div className="mb-4 bg-slate-50 p-3 rounded-lg border border-slate-100">
              <span className="text-[11px] font-medium text-slate-500 block mb-1.5">
                Quick Presets:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {[
                  {
                    title: 'Chennai to Kolkata Tech Summit',
                    traveller: 'Pooja Reddy',
                    origin: 'Chennai (MAA)',
                    destination: 'Kolkata (CCU)',
                    activity: 'Inaugural Keynote at Biswa Bangla',
                    type: 'FLIGHT',
                    carrier: 'IndiGo Airlines',
                    code: '6E-551',
                    cost: '6200'
                  },
                  {
                    title: 'Hyderabad to Varanasi Tour',
                    traveller: 'Karthik Rao',
                    origin: 'Hyderabad (HYD)',
                    destination: 'Varanasi (VNS)',
                    activity: 'Evening Ganga Aarti',
                    type: 'FLIGHT',
                    carrier: 'SpiceJet',
                    code: 'SG-814',
                    cost: '5400'
                  },
                  {
                    title: 'Pune to Ahmedabad Expo',
                    traveller: 'Siddharth Patel',
                    origin: 'Pune (PNQ)',
                    destination: 'Ahmedabad (AMD)',
                    activity: 'Trade Pavilion Meeting',
                    type: 'TRAIN',
                    carrier: 'Vande Bharat Express',
                    code: 'VB-22926',
                    cost: '1850'
                  }
                ].map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleApplyPreset(preset)}
                    className="px-2.5 py-1 rounded-md bg-white border border-slate-200 text-[11px] text-slate-700 hover:border-slate-300 transition-colors"
                  >
                    {preset.origin} → {preset.destination}
                  </button>
                ))}
              </div>
            </div>

            {modalError && (
              <div className="p-2.5 mb-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-800 text-[11px]">
                {modalError}
              </div>
            )}

            <form onSubmit={handleFormSubmit} className="space-y-3.5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 font-medium mb-1">
                    Trip Title
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Chennai to Kolkata Tech Summit"
                    value={newTripData.title}
                    onChange={e => setNewTripData({ ...newTripData, title: e.target.value })}
                    className="w-full border border-slate-200 rounded-lg p-2 bg-white text-slate-800 focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 font-medium mb-1">
                    Traveller Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Pooja Reddy"
                    value={newTripData.traveller_name}
                    onChange={e => setNewTripData({ ...newTripData, traveller_name: e.target.value })}
                    className="w-full border border-slate-200 rounded-lg p-2 bg-white text-slate-800 focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 font-medium mb-1">
                    Origin City
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Chennai (MAA)"
                    value={newTripData.origin}
                    onChange={e => setNewTripData({ ...newTripData, origin: e.target.value })}
                    className="w-full border border-slate-200 rounded-lg p-2 bg-white text-slate-800 focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 font-medium mb-1">
                    Destination City
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Kolkata (CCU)"
                    value={newTripData.destination}
                    onChange={e => setNewTripData({ ...newTripData, destination: e.target.value })}
                    className="w-full border border-slate-200 rounded-lg p-2 bg-white text-slate-800 focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 font-medium mb-1">
                    Max Additional Budget (INR)
                  </label>
                  <input
                    type="number"
                    value={newTripData.max_additional_budget}
                    onChange={e => setNewTripData({ ...newTripData, max_additional_budget: e.target.value })}
                    className="w-full border border-slate-200 rounded-lg p-2 bg-white text-slate-800 focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 outline-none"
                    placeholder="5000"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 font-medium mb-1">
                    Critical Activity / Event
                  </label>
                  <input
                    type="text"
                    value={newTripData.critical_activities}
                    onChange={e => setNewTripData({ ...newTripData, critical_activities: e.target.value })}
                    className="w-full border border-slate-200 rounded-lg p-2 bg-white text-slate-800 focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 outline-none"
                    placeholder="e.g. Client Keynote"
                  />
                </div>
              </div>

              <div className="border-t border-slate-100 pt-3">
                <span className="font-medium text-slate-700 block mb-2">Initial Primary Segment</span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <div>
                    <label className="block text-slate-500 mb-1">Mode</label>
                    <select
                      value={newTripData.initial_transport_type}
                      onChange={e => setNewTripData({ ...newTripData, initial_transport_type: e.target.value })}
                      className="w-full border border-slate-200 rounded-lg p-2 bg-white text-slate-800 focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 outline-none"
                    >
                      <option value="FLIGHT">Flight</option>
                      <option value="TRAIN">Train</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-500 mb-1">Carrier</label>
                    <input
                      type="text"
                      value={newTripData.initial_carrier}
                      onChange={e => setNewTripData({ ...newTripData, initial_carrier: e.target.value })}
                      className="w-full border border-slate-200 rounded-lg p-2 bg-white text-slate-800 focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-500 mb-1">Code / Ref</label>
                    <input
                      type="text"
                      value={newTripData.initial_code}
                      onChange={e => setNewTripData({ ...newTripData, initial_code: e.target.value })}
                      className="w-full border border-slate-200 rounded-lg p-2 bg-white text-slate-800 focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-3.5 py-1.5 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-medium shadow-xs transition-colors"
                >
                  {submitting ? 'Creating...' : 'Create Trip'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
