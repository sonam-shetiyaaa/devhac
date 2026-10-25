import React, { useState, useEffect } from 'react';
import { Sparkles, CheckCircle2, ArrowRight, ArrowLeft, Clock, DollarSign, Layers, ShieldCheck, AlertCircle, RefreshCw, SlidersHorizontal, Check } from 'lucide-react';
import CascadeFlow from '../components/CascadeFlow';
import ScoreBreakdown from '../components/ScoreBreakdown';
import StatusBadge from '../components/StatusBadge';
import { analyzeTripRecovery, compareRelaxedConstraints, confirmTripRecovery } from '../services/api';

export default function RecoveryAnalysisPage({ activeTrip, onNavigate, onPlanConfirmed }) {
  const [analysisData, setAnalysisData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedOptionId, setSelectedOptionId] = useState(null);
  const [approving, setApproving] = useState(false);

  // Constraint relaxation simulation state
  const [showRelaxPanel, setShowRelaxPanel] = useState(false);
  const [relaxedBudget, setRelaxedBudget] = useState(4500);
  const [relaxedDeadline, setRelaxedDeadline] = useState('2026-11-15T21:00:00');
  const [recalculating, setRecalculating] = useState(false);

  const fetchAnalysis = async () => {
    if (!activeTrip) return;
    setLoading(true);
    setError('');
    try {
      const res = await analyzeTripRecovery(activeTrip.id);
      if (res.success) {
        setAnalysisData(res.data);
        const topOpt = res.data.scoredOptions.find(o => o.is_recommended) || res.data.scoredOptions[0];
        if (topOpt) setSelectedOptionId(topOpt.id);
        if (res.data.activeConstraints?.max_additional_budget) {
          setRelaxedBudget(res.data.activeConstraints.max_additional_budget);
        }
      }
    } catch (err) {
      setError(err.message || 'Failed to analyze recovery');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalysis();
  }, [activeTrip?.id]);

  const handleApplyRelaxation = async () => {
    setRecalculating(true);
    try {
      const res = await compareRelaxedConstraints(activeTrip.id, {
        max_additional_budget: parseFloat(relaxedBudget),
        preferred_arrival_deadline: relaxedDeadline,
      });
      if (res.success && analysisData) {
        setAnalysisData({
          ...analysisData,
          scoredOptions: res.data.reScoredOptions,
        });
      }
    } catch (err) {
      setError(err.message || 'Failed to re-calculate scores');
    } finally {
      setRecalculating(false);
    }
  };

  const handleConfirmPlan = async (optionId) => {
    setApproving(true);
    try {
      const res = await confirmTripRecovery(activeTrip.id, optionId);
      if (res.success) {
        if (onPlanConfirmed) {
          await onPlanConfirmed(res.data?.itinerary || res.data);
        }
        onNavigate('revised-itinerary');
      }
    } catch (err) {
      setError(err.message || 'Failed to confirm plan');
    } finally {
      setApproving(false);
    }
  };

  if (!activeTrip) {
    return (
      <div className="bg-white border border-slate-200/80 rounded-xl p-8 text-center text-xs">
        <p className="text-slate-600 text-sm">No active trip found.</p>
        <button
          onClick={() => onNavigate('dashboard')}
          className="mt-3 px-3.5 py-1.5 bg-slate-900 text-white rounded-lg text-xs font-medium"
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  const scoredOptions = analysisData?.scoredOptions || [];
  const cascade = analysisData?.cascadeAnalysis;
  const aiExplanation = analysisData?.aiExplanation;

  return (
    <div className="space-y-6">
      {/* Page Title & Status */}
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
            <h1 className="text-xl font-bold tracking-tight text-slate-900">Recovery Analysis</h1>
            <StatusBadge status={activeTrip.status} />
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Trip: <span className="font-medium text-slate-700">{activeTrip.title}</span> • Traveller: <span className="font-medium text-slate-700">{activeTrip.traveller_name}</span>
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowRelaxPanel(!showRelaxPanel)}
            className="px-3 py-1.5 border border-slate-200 text-xs font-medium rounded-lg text-slate-700 hover:bg-slate-50 inline-flex items-center space-x-1.5 transition-colors"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400" />
            <span>{showRelaxPanel ? 'Hide Constraints' : 'Simulate Constraints'}</span>
          </button>
          <button
            onClick={fetchAnalysis}
            disabled={loading}
            className="px-3 py-1.5 border border-slate-200 text-xs font-medium rounded-lg text-slate-700 hover:bg-slate-50 inline-flex items-center space-x-1.5 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-slate-400 ${loading ? 'animate-spin' : ''}`} />
            <span>Re-evaluate</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-800">
          {error}
        </div>
      )}

      {/* Constraint Relaxation Simulator (Collapsible) */}
      {showRelaxPanel && (
        <div className="bg-white border border-slate-200/80 rounded-xl p-5 text-xs space-y-3.5 shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
            <div className="flex items-center space-x-2">
              <SlidersHorizontal className="w-4 h-4 text-slate-700" />
              <h3 className="font-semibold text-slate-900">Constraint Simulation</h3>
            </div>
            <span className="text-[11px] text-slate-400">
              Adjust budget and deadline parameters to re-score options.
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-600 font-medium mb-1">
                Max Added Budget: <span className="text-slate-900 font-bold">₹{parseInt(relaxedBudget, 10).toLocaleString()}</span>
              </label>
              <input
                type="range"
                min="1000"
                max="10000"
                step="500"
                value={relaxedBudget}
                onChange={e => setRelaxedBudget(e.target.value)}
                className="w-full accent-slate-900"
              />
              <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                <span>₹1,000 (Strict)</span>
                <span>₹5,000</span>
                <span>₹10,000 (Flexible)</span>
              </div>
            </div>

            <div>
              <label className="block text-slate-600 font-medium mb-1">
                Arrival Target Deadline
              </label>
              <select
                value={relaxedDeadline}
                onChange={e => setRelaxedDeadline(e.target.value)}
                className="w-full border border-slate-200 rounded-lg p-2 bg-white text-slate-800 focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 outline-none"
              >
                <option value="2026-11-15T19:00:00">19:00 (Preserve all evening activities)</option>
                <option value="2026-11-15T21:00:00">21:00 (Standard evening arrival)</option>
                <option value="2026-11-15T23:30:00">23:30 (Late arrival - relax evening tour)</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end pt-1">
            <button
              onClick={handleApplyRelaxation}
              disabled={recalculating}
              className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-medium text-xs shadow-xs transition-colors"
            >
              {recalculating ? 'Calculating...' : 'Apply & Re-score'}
            </button>
          </div>
        </div>
      )}

      {/* Whole-Trip Cascade Domino Flow */}
      {cascade && (
        <CascadeFlow
          disruptedBooking={cascade.disruptedBooking}
          impactedBookings={cascade.impactedBookings}
          summary={cascade.summary}
        />
      )}

      {/* AI Agent Reasoning Box */}
      {aiExplanation && (
        <div className="bg-white border border-slate-200/80 rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3.5">
            <div className="flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              <h3 className="font-semibold text-slate-900 text-sm">
                AI Recovery Rationale
              </h3>
            </div>
            <span className="text-[11px] text-slate-400">
              {aiExplanation.source === 'GOOGLE_GEMINI_API' ? 'Gemini 1.5 Flash' : 'Recovery Engine'}
            </span>
          </div>

          <div className="space-y-3 text-xs leading-relaxed text-slate-600">
            <div>
              <span className="font-medium text-slate-900 block mb-0.5">Whole-Trip Diagnosis</span>
              <p>{aiExplanation.executiveSummary}</p>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
              <span className="font-medium text-slate-900 block mb-0.5">Recommended Plan Justification</span>
              <p className="text-slate-700">{aiExplanation.recommendedJustification}</p>
            </div>

            <div>
              <span className="font-medium text-slate-900 block mb-0.5">Trade-offs Analysis</span>
              <p className="whitespace-pre-line text-slate-500">{aiExplanation.tradeOffsAnalysis}</p>
            </div>
          </div>
        </div>
      )}

      {/* Evaluated Alternatives Cards */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Recovery Options ({scoredOptions.length})
          </h2>
          <span className="text-[11px] text-slate-400">
            Select an option to approve
          </span>
        </div>

        <div className="grid grid-cols-1 gap-3.5">
          {scoredOptions.map(opt => {
            const isSelected = opt.id === selectedOptionId;
            const isRec = opt.is_recommended;

            return (
              <div
                key={opt.id}
                onClick={() => setSelectedOptionId(opt.id)}
                className={`border rounded-xl p-5 transition-all cursor-pointer bg-white ${
                  isSelected
                    ? 'border-slate-900 ring-1 ring-slate-900 shadow-xs'
                    : 'border-slate-200/80 hover:border-slate-300'
                }`}
              >
                {/* Header of option card */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-2">
                  <div className="flex items-center space-x-2">
                    <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                      {opt.option_code}
                    </span>
                    <h3 className="font-semibold text-slate-900 text-sm">{opt.title}</h3>
                    {isRec && (
                      <span className="bg-emerald-50 text-emerald-700 border border-emerald-200/80 text-[10px] font-semibold px-2 py-0.5 rounded-full">
                        Recommended
                      </span>
                    )}
                  </div>

                  <div className="flex items-center space-x-3 text-xs">
                    <span className="text-slate-500">
                      Cost: <span className="text-slate-900 font-semibold">₹{opt.additional_cost.toLocaleString()}</span>
                    </span>
                    <span className={`font-bold px-2 py-0.5 rounded-full text-xs border ${
                      opt.overall_score >= 80
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200/80'
                        : 'bg-amber-50 text-amber-700 border-amber-200/80'
                    }`}>
                      {opt.overall_score}/100
                    </span>
                  </div>
                </div>

                {/* Route & timing highlights */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs my-3 bg-slate-50/70 p-3 rounded-lg border border-slate-100">
                  <div>
                    <span className="text-slate-400 block text-[10px]">Carrier / Mode</span>
                    <span className="font-medium text-slate-800">{opt.provider} ({opt.transport_type})</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Route</span>
                    <span className="font-medium text-slate-800">{opt.route_summary}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Timing</span>
                    <span className="font-medium text-slate-800">
                      {new Date(opt.departure_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} → {new Date(opt.arrival_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Status</span>
                    <span className="font-medium text-slate-700">{opt.availability_status}</span>
                  </div>
                </div>

                {/* Score breakdown metrics */}
                <ScoreBreakdown
                  factors={opt.score_factors}
                  overallScore={opt.overall_score}
                  isRecommended={isRec}
                />

                {/* Connection impact */}
                <div className="text-xs text-slate-600 mb-3 bg-white p-2.5 rounded-lg border border-slate-100">
                  <span className="font-medium text-slate-900">Recovery Impact: </span>
                  {opt.impact_on_connections}
                </div>

                {/* Pros and cons */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs mb-3.5">
                  <div className="p-2.5 rounded-lg bg-slate-50/80 border border-slate-100">
                    <span className="font-medium text-slate-800 block mb-1">Advantages</span>
                    <ul className="list-disc list-inside space-y-0.5 text-slate-600 text-[11px]">
                      {opt.advantages?.map((adv, i) => (
                        <li key={i}>{adv}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="p-2.5 rounded-lg bg-slate-50/80 border border-slate-100">
                    <span className="font-medium text-slate-800 block mb-1">Trade-offs</span>
                    <ul className="list-disc list-inside space-y-0.5 text-slate-600 text-[11px]">
                      {opt.disadvantages?.map((dis, i) => (
                        <li key={i}>{dis}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Approval Button */}
                <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                  <span className="text-[11px] text-slate-400">
                    Simulated option dataset
                  </span>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleConfirmPlan(opt.id);
                    }}
                    disabled={approving}
                    className={`px-3.5 py-1.5 text-xs font-medium rounded-lg shadow-xs flex items-center space-x-1.5 transition-colors ${
                      isRec
                        ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                        : 'bg-slate-900 hover:bg-slate-800 text-white'
                    }`}
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>{approving && isSelected ? 'Applying...' : `Approve Option ${opt.option_code}`}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
