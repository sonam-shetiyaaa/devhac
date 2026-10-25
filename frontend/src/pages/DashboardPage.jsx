import React, { useState } from 'react';
import { AlertTriangle, PlusCircle, ArrowRight, ShieldCheck, CheckCircle2, MapPin, Calendar, User, Compass, RefreshCw, Zap, Train, Plane, Clock, Plus, X } from 'lucide-react';
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
      {/* Intro hero banner */}
      <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-xs">
        <div className="max-w-3xl">
          <div className="inline-flex items-center px-2.5 py-1 rounded bg-emerald-50 text-emerald-800 text-xs font-semibold mb-3 border border-emerald-200">
            <Zap className="w-3.5 h-3.5 mr-1.5 text-emerald-600" />
            Autonomous Multimodal Disruption Recovery Platform
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            TripRescue AI — Travel Disruption Recovery
          </h1>
          <p className="mt-2 text-sm text-slate-600 leading-relaxed">
            Existing travel solutions attempt to fix only the single disrupted flight or train without considering the traveller's whole journey.
            TripRescue AI autonomously diagnoses upstream cancellations, evaluates multi-leg cascade impacts on connecting trains, hotels, and activities, and formulates a transparent, constraint-optimized recovery itinerary across any route.
          </p>

          {/* Core action buttons */}
          <div className="mt-5 flex flex-wrap gap-3">
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center px-4 py-2 border border-emerald-600 text-sm font-semibold rounded-md shadow-xs text-white bg-emerald-600 hover:bg-emerald-700 transition-colors"
            >
              <PlusCircle className="w-4 h-4 mr-2" />
              + Create New Trip Route
            </button>
            <button
              onClick={() => onNavigate('report-disruption')}
              className="inline-flex items-center px-4 py-2 border border-amber-600 text-sm font-semibold rounded-md text-amber-900 bg-amber-50 hover:bg-amber-100 transition-colors"
            >
              <AlertTriangle className="w-4 h-4 mr-2 text-amber-700" />
              Report Disruption
            </button>
            <button
              onClick={onLoadDemo}
              className="inline-flex items-center px-4 py-2 border border-slate-300 text-sm font-medium rounded-md text-slate-700 bg-white hover:bg-slate-50 transition-colors"
            >
              <RefreshCw className="w-4 h-4 mr-2 text-slate-500" />
              Reset All Demo Trips
            </button>
          </div>
        </div>
      </div>

      {/* Preset Scenarios Quick-Switcher Strip */}
      <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Pre-Configured Route Scenarios ({trips.length})
            </h3>
            <p className="text-[11px] text-slate-500">
              Click any scenario below to immediately test TripRescue AI on different disruption types and routes:
            </p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="text-xs text-emerald-700 font-semibold hover:text-emerald-800 flex items-center"
          >
            <Plus className="w-3.5 h-3.5 mr-1" />
            Add Custom Route
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {trips.map((t) => {
            const isCurrent = activeTrip?.id === t.id;
            let tag = 'Flagship Demo';
            let issue = 'Flight Cancellation Cascade';
            if (t.id === 'trip-bom-goa-02') {
              tag = 'Scenario 2';
              issue = 'Tejas Train Delay → Sunset Cruise';
            } else if (t.id === 'trip-del-cok-03') {
              tag = 'Scenario 3';
              issue = 'Fog Ground Delay → Alleppey Houseboat';
            } else if (t.id !== 'trip-blr-jai-01') {
              tag = 'Custom Trip';
              issue = 'Custom Itinerary';
            }

            return (
              <div
                key={t.id}
                onClick={() => onQuickSwitchTrip(t.id)}
                className={`p-3 rounded-lg border cursor-pointer transition-all ${
                  isCurrent
                    ? 'border-emerald-600 bg-emerald-50/40 shadow-xs ring-1 ring-emerald-500'
                    : 'border-slate-200 bg-slate-50/50 hover:border-slate-300 hover:bg-white'
                }`}
              >
                <div className="flex items-center justify-between text-[11px] mb-1">
                  <span className={`font-semibold px-1.5 py-0.2 rounded text-[10px] ${
                    isCurrent ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-700'
                  }`}>
                    {tag}
                  </span>
                  <StatusBadge status={t.status} />
                </div>
                <h4 className="text-xs font-bold text-slate-900 leading-tight mt-1 truncate">
                  {t.origin} → {t.destination}
                </h4>
                <div className="text-[11px] text-slate-500 mt-0.5">
                  Traveller: <strong>{t.traveller_name}</strong>
                </div>
                <div className="text-[11px] text-amber-800 font-medium mt-1 truncate">
                  • {issue}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Active Trip Status & Cascade Alert Banner */}
      {activeTrip && (
        <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200 gap-3">
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Active Selected Trip</span>
                <StatusBadge status={activeTrip.status} />
              </div>
              <h2 className="text-lg font-bold text-slate-900 mt-1">{activeTrip.title}</h2>
              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 mt-1">
                <span className="flex items-center">
                  <User className="w-3.5 h-3.5 mr-1 text-slate-400" />
                  {activeTrip.traveller_name}
                </span>
                <span className="flex items-center">
                  <MapPin className="w-3.5 h-3.5 mr-1 text-slate-400" />
                  {activeTrip.origin} → {activeTrip.destination}
                </span>
                <span className="flex items-center">
                  <Calendar className="w-3.5 h-3.5 mr-1 text-slate-400" />
                  {new Date(activeTrip.start_date).toLocaleDateString()}
                </span>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => onNavigate('trip-details')}
                className="px-3 py-1.5 border border-slate-300 text-xs font-medium rounded text-slate-700 hover:bg-slate-50"
              >
                Inspect Segments ({activeTrip.bookings?.length || 0})
              </button>
              {isDisrupted && (
                <button
                  onClick={() => onNavigate('recovery-analysis')}
                  className="px-3.5 py-1.5 bg-emerald-600 text-white text-xs font-semibold rounded shadow-xs hover:bg-emerald-700 inline-flex items-center"
                >
                  Run Recovery Analysis
                  <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                </button>
              )}
              {isRecovered && (
                <button
                  onClick={() => onNavigate('revised-itinerary')}
                  className="px-3.5 py-1.5 bg-emerald-700 text-white text-xs font-semibold rounded shadow-xs hover:bg-emerald-800 inline-flex items-center"
                >
                  View Revised Itinerary
                  <CheckCircle2 className="w-3.5 h-3.5 ml-1.5" />
                </button>
              )}
            </div>
          </div>

          {/* Disruption Alert Box */}
          {isDisrupted && (
            <div className="mt-4 p-4 rounded-md bg-amber-50/70 border border-amber-200">
              <div className="flex items-start">
                <AlertTriangle className="w-5 h-5 text-amber-700 mr-3 mt-0.5 shrink-0" />
                <div className="flex-1">
                  <h3 className="text-sm font-bold text-amber-900">
                    Active Travel Disruption Detected
                  </h3>
                  <p className="text-xs text-amber-800 mt-1">
                    {activeTrip.disruptions?.[0]?.description ||
                      'An upstream schedule disruption threatens downstream connecting transport, hotel check-in, and scheduled activities.'}
                  </p>
                  <div className="mt-3 flex items-center space-x-3">
                    <button
                      onClick={() => onNavigate('recovery-analysis')}
                      className="inline-flex items-center text-xs font-bold text-amber-900 bg-amber-200/80 hover:bg-amber-300 px-3 py-1.5 rounded transition-colors"
                    >
                      Analyze & Solve Whole Trip
                      <ArrowRight className="w-3.5 h-3.5 ml-1" />
                    </button>
                    <span className="text-xs text-amber-700">
                      3 Alternative Recovery Options Ready for Evaluation
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {isRecovered && (
            <div className="mt-4 p-4 rounded-md bg-emerald-50 border border-emerald-200">
              <div className="flex items-start">
                <CheckCircle2 className="w-5 h-5 text-emerald-700 mr-3 mt-0.5 shrink-0" />
                <div>
                  <h3 className="text-sm font-bold text-emerald-900">
                    Trip Successfully Recovered
                  </h3>
                  <p className="text-xs text-emerald-800 mt-1">
                    Your approved recovery plan is active. All connecting dependencies are accounted for, and your required action checklist is ready to execute.
                  </p>
                  <button
                    onClick={() => onNavigate('revised-itinerary')}
                    className="mt-2 inline-flex items-center text-xs font-semibold text-emerald-800 hover:text-emerald-900 underline"
                  >
                    Open Action Checklist & Printable Schedule →
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* CREATE NEW TRIP MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full p-6 text-xs max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-4">
              <div className="flex items-center space-x-2">
                <PlusCircle className="w-5 h-5 text-emerald-600" />
                <h3 className="font-bold text-slate-900 text-sm">Create New Custom Travel Route</h3>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick preset chips */}
            <div className="mb-4 bg-slate-50 p-2.5 rounded border border-slate-200">
              <span className="text-[11px] font-semibold text-slate-600 block mb-1.5">
                Quick Preset Routes (Click to Auto-fill):
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
                    title: 'Hyderabad to Varanasi Spiritual Tour',
                    traveller: 'Karthik Rao',
                    origin: 'Hyderabad (HYD)',
                    destination: 'Varanasi (VNS)',
                    activity: 'Dashashwamedh Ghat Evening Ganga Aarti',
                    type: 'FLIGHT',
                    carrier: 'SpiceJet',
                    code: 'SG-814',
                    cost: '5400'
                  },
                  {
                    title: 'Pune to Ahmedabad Trade Expo',
                    traveller: 'Siddharth Patel',
                    origin: 'Pune (PNQ)',
                    destination: 'Ahmedabad (AMD)',
                    activity: 'Vibrant Gujarat Trade Pavilion',
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
                    className="px-2 py-1 rounded bg-white border border-slate-300 text-[11px] text-slate-700 hover:border-emerald-500 hover:text-emerald-700 transition-colors"
                  >
                    + {preset.origin} → {preset.destination}
                  </button>
                ))}
              </div>
            </div>

            {modalError && (
              <div className="p-2.5 mb-3 bg-rose-50 border border-rose-200 rounded text-rose-800 text-[11px]">
                {modalError}
              </div>
            )}

            <form onSubmit={handleFormSubmit} className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Trip Title <span className="text-rose-600">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Chennai to Kolkata Tech Summit"
                    value={newTripData.title}
                    onChange={e => setNewTripData({ ...newTripData, title: e.target.value })}
                    className="w-full border border-slate-300 rounded p-2 bg-white text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Traveller Full Name <span className="text-rose-600">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Pooja Reddy"
                    value={newTripData.traveller_name}
                    onChange={e => setNewTripData({ ...newTripData, traveller_name: e.target.value })}
                    className="w-full border border-slate-300 rounded p-2 bg-white text-slate-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Starting City / Origin <span className="text-rose-600">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Chennai (MAA)"
                    value={newTripData.origin}
                    onChange={e => setNewTripData({ ...newTripData, origin: e.target.value })}
                    className="w-full border border-slate-300 rounded p-2 bg-white text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Destination City <span className="text-rose-600">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Kolkata (CCU)"
                    value={newTripData.destination}
                    onChange={e => setNewTripData({ ...newTripData, destination: e.target.value })}
                    className="w-full border border-slate-300 rounded p-2 bg-white text-slate-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Max Additional Recovery Budget (INR)
                  </label>
                  <input
                    type="number"
                    value={newTripData.max_additional_budget}
                    onChange={e => setNewTripData({ ...newTripData, max_additional_budget: e.target.value })}
                    className="w-full border border-slate-300 rounded p-2 bg-white text-slate-800"
                    placeholder="e.g. 5000"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Critical Activity / Event
                  </label>
                  <input
                    type="text"
                    value={newTripData.critical_activities}
                    onChange={e => setNewTripData({ ...newTripData, critical_activities: e.target.value })}
                    className="w-full border border-slate-300 rounded p-2 bg-white text-slate-800"
                    placeholder="e.g. Keynote Address or Tour"
                  />
                </div>
              </div>

              <div className="border-t border-slate-200 pt-3">
                <span className="font-semibold text-slate-800 block mb-2">Initial Primary Segment:</span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-slate-600 mb-1">Mode</label>
                    <select
                      value={newTripData.initial_transport_type}
                      onChange={e => setNewTripData({ ...newTripData, initial_transport_type: e.target.value })}
                      className="w-full border border-slate-300 rounded p-1.5 bg-white"
                    >
                      <option value="FLIGHT">Flight</option>
                      <option value="TRAIN">Train</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-600 mb-1">Carrier Name</label>
                    <input
                      type="text"
                      value={newTripData.initial_carrier}
                      onChange={e => setNewTripData({ ...newTripData, initial_carrier: e.target.value })}
                      className="w-full border border-slate-300 rounded p-1.5 bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 mb-1">Booking Ref / Code</label>
                    <input
                      type="text"
                      value={newTripData.initial_code}
                      onChange={e => setNewTripData({ ...newTripData, initial_code: e.target.value })}
                      className="w-full border border-slate-300 rounded p-1.5 bg-white"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-3.5 py-2 border border-slate-300 rounded text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded font-semibold shadow-xs"
                >
                  {submitting ? 'Creating Trip...' : 'Create & Open Trip'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
