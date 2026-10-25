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
        // Fallback check if activeTrip has revisedItinerary attached
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
    content += `TripRescue AI does not execute real bank transactions or airline booking purchases.\n`;
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
      <div className="bg-white border border-slate-200 rounded-lg p-8 text-center text-xs">
        <p className="text-slate-600">No active trip selected.</p>
        <button
          onClick={() => onNavigate('dashboard')}
          className="mt-3 px-4 py-2 bg-emerald-600 text-white rounded font-medium"
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
      <div className="bg-white border border-slate-200 rounded-lg p-12 text-center text-xs space-y-2">
        <div className="w-6 h-6 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="text-slate-600 font-medium">Loading approved recovery itinerary...</p>
      </div>
    );
  }

  if (error || !itin) {
    return (
      <div className="bg-white border border-slate-200 rounded-lg p-8 text-center text-xs space-y-3">
        <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center mx-auto">
          <FileText className="w-6 h-6" />
        </div>
        <h2 className="text-base font-bold text-slate-800">No Approved Recovery Plan Found</h2>
        <p className="text-slate-500 max-w-md mx-auto">
          Please review the disruption and approve a recovery alternative in the Recovery Analysis page first.
        </p>
        <button
          onClick={() => onNavigate('recovery-analysis')}
          className="px-4 py-2 bg-emerald-600 text-white font-semibold rounded shadow-xs hover:bg-emerald-700"
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
      <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-semibold text-emerald-800 uppercase tracking-wider mb-1">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Revised Travel Itinerary & Action Execution</span>
          </div>
          <h1 className="text-xl font-bold text-slate-900">Approved Recovery Itinerary</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Trip: <strong className="text-slate-800">{trip?.title || activeTrip?.title}</strong> • Traveller: <strong className="text-slate-800">{trip?.traveller_name || activeTrip?.traveller_name}</strong>
          </p>
        </div>

        <div className="flex items-center space-x-2 no-print">
          <button
            onClick={handlePrint}
            className="px-3 py-1.5 border border-slate-300 text-xs font-semibold rounded text-slate-700 bg-white hover:bg-slate-50 flex items-center shadow-xs cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5 mr-1.5 text-slate-500" />
            Print Itinerary
          </button>
          <button
            onClick={handleDownload}
            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded flex items-center shadow-xs cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 mr-1.5" />
            Download Summary
          </button>
        </div>
      </div>

      {/* Plan summary badge */}
      <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 text-xs">
        <div className="flex items-start">
          <CheckCircle2 className="w-5 h-5 text-emerald-700 mr-2.5 mt-0.5 shrink-0" />
          <div>
            <h3 className="font-bold text-emerald-950 text-sm">
              Whole-Trip Recovery Applied: {selectedOption ? selectedOption.title : 'Direct Re-route'}
            </h3>
            <p className="text-emerald-900 mt-1 leading-relaxed">{itin.summary}</p>
          </div>
        </div>
      </div>

      {/* Revised Schedule Timeline */}
      <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-xs">
        <h2 className="text-sm font-bold text-slate-900 border-b border-slate-200 pb-2 mb-4">
          Revised Whole-Trip Timeline & Bookings
        </h2>

        <div className="space-y-3">
          {(itin.revised_schedule || []).map((seg, idx) => (
            <div
              key={seg.segmentId || idx}
              className="border border-slate-200 rounded-lg p-3.5 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-3"
            >
              <div className="flex items-start space-x-3">
                <div className="w-7 h-7 rounded bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                  {idx + 1}
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-[11px] font-bold uppercase text-slate-600">{seg.type}</span>
                    <span className="font-mono text-[11px] text-slate-500">• {seg.referenceCode}</span>
                    <StatusBadge status={seg.status} />
                  </div>
                  <h4 className="font-bold text-slate-900 text-sm mt-0.5">{seg.title}</h4>
                  <p className="text-xs text-slate-600 mt-0.5">{seg.notes}</p>
                </div>
              </div>

              <div className="sm:text-right shrink-0 text-xs">
                <div className="font-semibold text-slate-800">
                  {formatTimeSafe(seg.departureTime)} → {formatTimeSafe(seg.arrivalTime)}
                </div>
                <div className="text-[11px] text-slate-500">
                  Fare: ₹{parseFloat(seg.cost || 0).toLocaleString()}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Required Actions Checklist */}
      <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-xs">
        <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-4">
          <div>
            <h2 className="text-sm font-bold text-slate-900">Required Traveller Next Actions</h2>
            <p className="text-xs text-slate-500">
              Check off each action as you contact airlines, hotels, or venues.
            </p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded bg-slate-100 text-slate-800 border border-slate-200">
            Progress: {completedCount} of {checklist.length} Completed
          </span>
        </div>

        <div className="space-y-2.5">
          {checklist.map((act) => (
            <div
              key={act.id}
              onClick={() => handleToggleChecklist(act.id, act.completed)}
              className={`p-3 rounded-lg border transition-colors cursor-pointer flex items-start space-x-3 ${
                act.completed ? 'bg-slate-50 border-slate-200 opacity-60' : 'bg-white border-slate-300 hover:border-slate-400'
              }`}
            >
              <div className="mt-0.5 shrink-0 text-emerald-600">
                {act.completed ? (
                  <CheckSquare className="w-5 h-5 text-emerald-600" />
                ) : (
                  <Square className="w-5 h-5 text-slate-400" />
                )}
              </div>
              <div className="flex-1 text-xs">
                <div className="flex items-center space-x-2">
                  <span className={`font-bold ${act.completed ? 'line-through text-slate-500' : 'text-slate-900'}`}>
                    {act.title}
                  </span>
                  <span className="text-[10px] font-mono uppercase px-1.5 py-0.2 bg-slate-100 rounded text-slate-600">
                    {act.category?.replace('_', ' ')}
                  </span>
                  <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                    act.priority === 'HIGH' ? 'bg-rose-100 text-rose-800' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {act.priority}
                  </span>
                </div>
                <p className={`mt-1 ${act.completed ? 'line-through text-slate-400' : 'text-slate-600'}`}>
                  {act.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Official Transaction Disclaimer */}
      <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 text-xs text-slate-600">
        <div className="flex items-start">
          <ShieldAlert className="w-4 h-4 text-amber-600 mr-2 mt-0.5 shrink-0" />
          <div className="space-y-1">
            <strong className="text-slate-800">Operational Disclaimer & Safety Policy:</strong>
            <p>
              In accordance with project presentation guidelines, TripRescue AI provides automated constraint evaluation and decision justification.
              Real travel bookings, financial credit-card debits, and airline ticket cancellations must be performed directly by the traveller through authorized provider channels. Real booking transactions are not simulated or fabricated.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
