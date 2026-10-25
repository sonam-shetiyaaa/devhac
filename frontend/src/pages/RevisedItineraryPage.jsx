import React, { useState, useEffect } from 'react';
import { CheckCircle2, Printer, Download, Clock, MapPin, AlertCircle, ShieldAlert, CheckSquare, Square, FileText, ArrowLeft } from 'lucide-react';
import { fetchRevisedItinerary, toggleActionChecklistItem } from '../services/api';
import StatusBadge from '../components/StatusBadge';

function formatTimeSafe(dateStr) {
  if (!dateStr) return 'TBD';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export default function RevisedItineraryPage({ activeTrip, onNavigate }) {
  const [itineraryData, setItineraryData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const loadItinerary = async () => {
    if (!activeTrip) return;
    setLoading(true);
    setError('');
    try {
      const res = await fetchRevisedItinerary(activeTrip.id);
      if (res.success && res.data) {
        setItineraryData(res.data);
      } else {
        if (activeTrip.revisedItinerary) {
          setItineraryData({
            trip: activeTrip,
            itinerary: activeTrip.revisedItinerary,
            selectedOption: (activeTrip.recoveryOptions || [])[0] || null,
          });
        } else {
          setError(res.error || 'No revised itinerary available yet');
        }
      }
    } catch (err) {
      if (activeTrip.revisedItinerary) {
        setItineraryData({
          trip: activeTrip,
          itinerary: activeTrip.revisedItinerary,
          selectedOption: (activeTrip.recoveryOptions || [])[0] || null,
        });
      } else {
        setError(err.message || 'No revised itinerary available yet');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadItinerary();
  }, [activeTrip?.id]);

  const handleToggleChecklist = async (actionId, currentVal) => {
    try {
      const res = await toggleActionChecklistItem(activeTrip.id, actionId, !currentVal);
      if (res.success && itineraryData) {
        const currentChecklist = itin?.actions_checklist || [];
        const updatedList = Array.isArray(res.data)
          ? res.data
          : currentChecklist.map(a => a.id === actionId ? { ...a, completed: !currentVal } : a);

        if (itineraryData.itinerary) {
          setItineraryData({
            ...itineraryData,
            itinerary: {
              ...itineraryData.itinerary,
              actions_checklist: updatedList,
            }
          });
        } else {
          setItineraryData({
            ...itineraryData,
            actions_checklist: updatedList,
          });
        }
      }
    } catch (e) {
      console.error('Failed to toggle checklist item:', e);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    if (!itineraryData) return;
    const itinObj = itineraryData?.itinerary || (itineraryData?.revised_schedule ? itineraryData : {});
    const tripObj = itineraryData?.trip || activeTrip || {};

    let content = `=====================================================\n`;
    content += ` TRIPRESCUE AI - REVISED TRAVEL RECOVERY ITINERARY\n`;
    content += `=====================================================\n\n`;
    content += `Trip: ${tripObj.title || 'Recovered Journey'}\n`;
    content += `Traveller: ${tripObj.traveller_name || 'Traveller'}\n`;
    content += `Route: ${tripObj.origin || ''} -> ${tripObj.destination || ''}\n`;
    content += `Generated At: ${new Date().toLocaleString()}\n`;
    content += `Status: RECOVERED\n\n`;

    content += `RECOVERY SOLUTION SUMMARY:\n`;
    content += `${itinObj.summary || ''}\n\n`;

    content += `REVISED SEGMENT TIMELINE:\n`;
    (itinObj.revised_schedule || []).forEach((seg, i) => {
      content += `${i + 1}. [${seg.type}] ${seg.title} (${seg.referenceCode})\n`;
      content += `   Departure: ${formatTimeSafe(seg.departureTime)} | Arrival: ${formatTimeSafe(seg.arrivalTime)}\n`;
      content += `   Status: ${seg.status} | Notes: ${seg.notes}\n\n`;
    });

    content += `REQUIRED NEXT ACTIONS CHECKLIST:\n`;
    (itinObj.actions_checklist || []).forEach((act, i) => {
      content += `[${act.completed ? 'X' : ' '}] ${i + 1}. ${act.title}\n`;
      content += `    Category: ${act.category} | Priority: ${act.priority}\n`;
      content += `    Action: ${act.description}\n\n`;
    });

    content += `DISCLAIMER:\n`;
    content += `All reservations must be completed by the traveller on official carrier portals.\n`;

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `TripRescue_Revised_Itinerary_${tripObj.id || 'plan'}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  if (!activeTrip) {
    return (
      <div className="bg-white border border-slate-200/80 rounded-xl p-8 text-center text-xs">
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

  const itin = itineraryData?.itinerary || (itineraryData?.revised_schedule ? itineraryData : null);
  const trip = itineraryData?.trip || activeTrip || {};
  const selectedOption = itineraryData?.selectedOption || (activeTrip.recoveryOptions || [])[0] || null;

  if (loading) {
    return (
      <div className="bg-white border border-slate-200/80 rounded-xl p-12 text-center text-xs space-y-2">
        <div className="w-5 h-5 border-2 border-slate-900 border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="text-slate-500 font-medium">Loading itinerary...</p>
      </div>
    );
  }

  if (error || !itin) {
    return (
      <div className="bg-white border border-slate-200/80 rounded-xl p-8 text-center text-xs space-y-3">
        <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center mx-auto">
          <FileText className="w-5 h-5" />
        </div>
        <h2 className="text-sm font-semibold text-slate-900">No Approved Recovery Plan</h2>
        <p className="text-slate-500 max-w-sm mx-auto">
          Approve an alternative option on the Recovery Analysis page first to generate this itinerary.
        </p>
        <button
          onClick={() => onNavigate('recovery-analysis')}
          className="px-3.5 py-1.5 bg-slate-900 text-white font-medium rounded-lg text-xs shadow-xs hover:bg-slate-800 transition-colors"
        >
          Go to Recovery Analysis →
        </button>
      </div>
    );
  }

  const checklist = itin?.actions_checklist || [];
  const completedCount = checklist.filter(a => a.completed).length;

  return (
    <div className="space-y-6 print-area">
      {/* Title & Action controls */}
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
            <h1 className="text-xl font-bold tracking-tight text-slate-900">Revised Itinerary</h1>
            <StatusBadge status="RECOVERED" />
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Trip: <span className="font-medium text-slate-700">{trip?.title || activeTrip?.title}</span> • Traveller: <span className="font-medium text-slate-700">{trip?.traveller_name || activeTrip?.traveller_name}</span>
          </p>
        </div>

        <div className="flex items-center space-x-2 no-print">
          <button
            onClick={handlePrint}
            className="px-3 py-1.5 border border-slate-200 text-xs font-medium rounded-lg text-slate-700 bg-white hover:bg-slate-50 flex items-center space-x-1.5 transition-colors"
          >
            <Printer className="w-3.5 h-3.5 text-slate-400" />
            <span>Print</span>
          </button>
          <button
            onClick={handleDownload}
            className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium rounded-lg flex items-center space-x-1.5 shadow-xs transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download</span>
          </button>
        </div>
      </div>

      {/* Plan summary badge */}
      <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-xl p-4 text-xs">
        <div className="flex items-start space-x-2.5">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-emerald-950 text-xs">
              Recovery Applied: {selectedOption ? selectedOption.title : 'Direct Re-route'}
            </h3>
            <p className="text-emerald-900 mt-0.5 leading-relaxed text-xs">{itin.summary}</p>
          </div>
        </div>
      </div>

      {/* Revised Schedule Timeline */}
      <div className="bg-white border border-slate-200/80 rounded-xl p-5 shadow-xs">
        <div className="pb-3 border-b border-slate-100 mb-4">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Revised Journey Timeline
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">Sequential schedule with updated arrival and departure times</p>
        </div>

        <div className="space-y-2.5">
          {(itin.revised_schedule || []).map((seg, idx) => (
            <div
              key={seg.segmentId || idx}
              className="border border-slate-100 rounded-lg p-3 bg-white hover:bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors"
            >
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 rounded bg-slate-100 text-slate-600 flex items-center justify-center font-semibold text-xs shrink-0 mt-0.5">
                  {idx + 1}
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">{seg.type}</span>
                    <span className="font-mono text-[11px] text-slate-400">• {seg.referenceCode}</span>
                    <StatusBadge status={seg.status} />
                  </div>
                  <h4 className="font-semibold text-slate-900 text-xs mt-0.5">{seg.title}</h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">{seg.notes}</p>
                </div>
              </div>

              <div className="sm:text-right shrink-0 text-xs">
                <div className="font-medium text-slate-800">
                  {formatTimeSafe(seg.departureTime)} → {formatTimeSafe(seg.arrivalTime)}
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5">
                  ₹{parseFloat(seg.cost || 0).toLocaleString()}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Required Actions Checklist */}
      <div className="bg-white border border-slate-200/80 rounded-xl p-5 shadow-xs">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
          <div>
            <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-500">Action Checklist</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Check off tasks as you contact carriers or confirm bookings
            </p>
          </div>
          <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-slate-50 text-slate-600 border border-slate-200/70">
            {completedCount} / {checklist.length} done
          </span>
        </div>

        <div className="space-y-2">
          {checklist.map((act) => (
            <div
              key={act.id}
              onClick={() => handleToggleChecklist(act.id, act.completed)}
              className={`p-3 rounded-lg border transition-all cursor-pointer flex items-start space-x-3 ${
                act.completed ? 'bg-slate-50/50 border-slate-100 opacity-60' : 'bg-white border-slate-200/80 hover:border-slate-300'
              }`}
            >
              <div className="mt-0.5 shrink-0 text-slate-900">
                {act.completed ? (
                  <CheckSquare className="w-4 h-4 text-emerald-600" />
                ) : (
                  <Square className="w-4 h-4 text-slate-300" />
                )}
              </div>
              <div className="flex-1 text-xs">
                <div className="flex items-center space-x-2">
                  <span className={`font-semibold ${act.completed ? 'line-through text-slate-400' : 'text-slate-900'}`}>
                    {act.title}
                  </span>
                  <span className="text-[10px] font-mono uppercase px-1.5 py-0.2 bg-slate-100 rounded text-slate-500">
                    {act.category?.replace('_', ' ')}
                  </span>
                  <span className={`text-[10px] font-medium px-1.5 py-0.2 rounded ${
                    act.priority === 'HIGH' ? 'bg-rose-50 text-rose-700' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {act.priority}
                  </span>
                </div>
                <p className={`mt-0.5 text-xs ${act.completed ? 'line-through text-slate-400' : 'text-slate-500'}`}>
                  {act.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Minimal Policy Note */}
      <div className="p-3 text-[11px] text-slate-400 flex items-start space-x-2">
        <ShieldAlert className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
        <p>
          TripRescue AI evaluates constraints and optimizes itineraries. Bookings and ticket modifications must be completed directly via official provider portals.
        </p>
      </div>
    </div>
  );
}
