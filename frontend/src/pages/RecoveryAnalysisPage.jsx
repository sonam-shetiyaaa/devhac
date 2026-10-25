import React, { useState, useEffect } from 'react';
import { Sparkles, CheckCircle2, ArrowRight, Clock, DollarSign, Layers, ShieldCheck, AlertCircle, RefreshCw, SlidersHorizontal, Check } from 'lucide-react';
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
        if (onPlanConfirmed) onPlanConfirmed(res.data.itinerary);
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
      <div className="bg-white border border-slate-200 rounded-lg p-8 text-center text-xs">
        <p className="text-slate-600">No active trip found.</p>
        <button
          onClick={() => onNavigate('dashboard')}
          className="mt-3 px-4 py-2 bg-emerald-600 text-white rounded font-medium"
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  const scoredOptions = analysisData?.scoredOptions || [];
  const cascade = analysisData?.cascadeAnalysis;
  const aiExplanation = analysisData?.aiExplanation;
  const selectedOption = scoredOptions.find(o => o.id === selectedOptionId) || scoredOptions[0];

  return (
    <div className="space-y-6">
      {/* Page Title & Status */}
      <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-semibold text-emerald-800 uppercase tracking-wider mb-1">
            <Sparkles className="w-4 h-4 text-emerald-600" />
            <span>Feature 4: Constraint & Disruption Decision Engine</span>
          </div>
          <h1 className="text-xl font-bold text-slate-900">Autonomous Travel Recovery Analysis</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Trip: <strong className="text-slate-800">{activeTrip.title}</strong> • Traveller: <strong className="text-slate-800">{activeTrip.traveller_name}</strong>
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowRelaxPanel(!showRelaxPanel)}
            className="px-3 py-1.5 border border-slate-300 text-xs font-medium rounded text-slate-700 hover:bg-slate-50 inline-flex items-center"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 mr-1.5 text-slate-500" />
            {showRelaxPanel ? 'Hide Constraints Simulator' : 'Simulate Constraint Relaxation'}
          </button>
          <button
            onClick={fetchAnalysis}
            disabled={loading}
            className="px-3 py-1.5 border border-slate-300 text-xs font-medium rounded text-slate-700 hover:bg-slate-50 inline-flex items-center"
          >
            <RefreshCw className={`w-3.5 h-3.5 mr-1.5 text-slate-500 ${loading ? 'animate-spin' : ''}`} />
            Re-evaluate
          </button>
        </div>
      </div>

      {error && (
        <div className="p-3 bg-rose-50 border border-rose-200 rounded text-xs text-rose-800">
          {error}
        </div>
      )}

      {/* Constraint Relaxation Simulator (Collapsible) */}
      {showRelaxPanel && (
        <div className="bg-slate-50 border border-slate-300 rounded-lg p-4 text-xs space-y-3">
          <div className="flex items-center justify-between border-b border-slate-200 pb-2">
            <div className="flex items-center space-x-2">
              <SlidersHorizontal className="w-4 h-4 text-emerald-700" />
              <h3 className="font-bold text-slate-900">Constraint Relaxation & Trade-off Sandbox</h3>
            </div>
            <span className="text-[11px] text-slate-500">
              Test what happens when constraints cannot all be satisfied simultaneously.
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                Max Additional Budget Limit (INR): <span className="text-emerald-700 font-bold">₹{parseInt(relaxedBudget, 10).toLocaleString()}</span>
              </label>
              <input
                type="range"
                min="1000"
                max="10000"
                step="500"
                value={relaxedBudget}
                onChange={e => setRelaxedBudget(e.target.value)}
                className="w-full"
              />
              <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                <span>₹1,000 (Strict Economy)</span>
                <span>₹5,000 (Standard)</span>
                <span>₹10,000 (Maximum Flexibility)</span>
              </div>
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                Target Arrival Deadline:
              </label>
              <select
                value={relaxedDeadline}
                onChange={e => setRelaxedDeadline(e.target.value)}
                className="w-full border border-slate-300 rounded p-1.5 bg-white text-slate-800"
              >
                <option value="2026-11-15T19:00:00">19:00 PM (Strict early arrival - preserve all events)</option>
                <option value="2026-11-15T21:00:00">21:00 PM (Standard evening arrival)</option>
                <option value="2026-11-15T23:30:00">23:30 PM (Late night arrival - relax evening tour)</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              onClick={handleApplyRelaxation}
              disabled={recalculating}
              className="px-4 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded font-medium text-xs flex items-center shadow-xs"
            >
              {recalculating ? 'Re-calculating Scores...' : 'Apply & Re-score Alternatives'}
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

      {/* LLM Agent Reasoning Box */}
      {aiExplanation && (
        <div className="bg-white border-2 border-emerald-500/30 rounded-lg p-5 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-3">
            <div className="flex items-center space-x-2">
              <div className="w-7 h-7 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xs">
                AI
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-sm">
                  Agentic Travel Recovery Justification
                </h3>
                <p className="text-[11px] text-slate-500">
                  Powered by {aiExplanation.source === 'GOOGLE_GEMINI_API' ? 'Google Gemini 1.5 Flash' : 'TripRescue AI Heuristic Reasoning Engine'}
                </p>
              </div>
            </div>
            <span className="text-[11px] font-mono bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded">
              Verified Constraint-Checked
            </span>
          </div>

          <div className="space-y-3 text-xs leading-relaxed text-slate-700">
            <div>
              <strong className="text-slate-900 block mb-0.5">1. Whole-Trip Diagnosis:</strong>
              <p>{aiExplanation.executiveSummary}</p>
            </div>

            <div className="p-3 bg-emerald-50/50 border border-emerald-200 rounded">
              <strong className="text-emerald-950 block mb-0.5">2. Recommended Solution Justification:</strong>
              <p className="text-emerald-900">{aiExplanation.recommendedJustification}</p>
            </div>

            <div>
              <strong className="text-slate-900 block mb-0.5">3. Alternatives & Trade-Offs:</strong>
              <p className="whitespace-pre-line text-slate-600">{aiExplanation.tradeOffsAnalysis}</p>
            </div>

            <div>
              <strong className="text-slate-900 block mb-0.5">4. Constraint Guidance:</strong>
              <p className="text-slate-600">{aiExplanation.constraintGuidance}</p>
            </div>
          </div>
        </div>
      )}

      {/* Evaluated Alternatives Cards */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900">
            Evaluated Recovery Alternatives ({scoredOptions.length})
          </h2>
          <span className="text-xs text-slate-500">
            Click an option card to inspect its full trade-offs and approve recovery
          </span>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {scoredOptions.map(opt => {
            const isSelected = opt.id === selectedOptionId;
            const isRec = opt.is_recommended;

            return (
              <div
                key={opt.id}
                onClick={() => setSelectedOptionId(opt.id)}
                className={`border-2 rounded-lg p-5 transition-all cursor-pointer bg-white ${
                  isSelected
                    ? (isRec ? 'border-emerald-600 ring-2 ring-emerald-100 shadow-md' : 'border-slate-800 shadow-md')
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                {/* Header of option card */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-2">
                  <div className="flex items-center space-x-2">
                    <span className="font-mono font-bold text-xs px-2 py-0.5 rounded bg-slate-100 text-slate-800">
                      {opt.option_code}
                    </span>
                    <h3 className="font-bold text-slate-900 text-sm">{opt.title}</h3>
                    {isRec && (
                      <span className="bg-emerald-600 text-white text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">
                        Top Recommendation
                      </span>
                    )}
                  </div>

                  <div className="flex items-center space-x-3 text-xs">
                    <span className="text-slate-500">
                      Additional Cost: <strong className="text-slate-900 font-semibold">₹{opt.additional_cost.toLocaleString()}</strong>
                    </span>
                    <span className={`font-bold px-2.5 py-1 rounded text-sm ${
                      opt.overall_score >= 80 ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                    }`}>
                      Score: {opt.overall_score}/100
                    </span>
                  </div>
                </div>

                {/* Route & timing highlights */}
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs my-3 bg-slate-50 p-3 rounded">
                  <div>
                    <span className="text-slate-500 block text-[11px]">Provider / Mode</span>
                    <span className="font-semibold text-slate-800">{opt.provider} ({opt.transport_type})</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[11px]">Route</span>
                    <span className="font-semibold text-slate-800">{opt.route_summary}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[11px]">Schedule</span>
                    <span className="font-semibold text-slate-800">
                      {new Date(opt.departure_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} → {new Date(opt.arrival_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[11px]">Availability</span>
                    <span className="font-semibold text-slate-700">{opt.availability_status}</span>
                  </div>
                </div>

                {/* Score breakdown metrics */}
                <ScoreBreakdown
                  factors={opt.score_factors}
                  overallScore={opt.overall_score}
                  isRecommended={isRec}
                />

                {/* Whole-trip connection impact description */}
                <div className="text-xs text-slate-700 mb-3 bg-white p-2.5 rounded border border-slate-200">
                  <strong className="text-slate-900">Whole-Trip Recovery Effect:</strong> {opt.impact_on_connections}
                </div>

                {/* Pros and cons */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs mb-4">
                  <div className="bg-emerald-50/40 p-2.5 rounded border border-emerald-100">
                    <span className="font-bold text-emerald-900 block mb-1">Advantages</span>
                    <ul className="list-disc list-inside space-y-0.5 text-emerald-800 text-[11px]">
                      {opt.advantages?.map((adv, i) => (
                        <li key={i}>{adv}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="bg-rose-50/40 p-2.5 rounded border border-rose-100">
                    <span className="font-bold text-rose-900 block mb-1">Disadvantages / Trade-offs</span>
                    <ul className="list-disc list-inside space-y-0.5 text-rose-800 text-[11px]">
                      {opt.disadvantages?.map((dis, i) => (
                        <li key={i}>{dis}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Selection & Approval Button */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pt-3 border-t border-slate-100 gap-2">
                  <span className="text-[11px] text-slate-400">
                    Data Source: {opt.data_source || 'DEMONSTRATION_DATA (Simulated for Evaluation)'}
                  </span>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleConfirmPlan(opt.id);
                    }}
                    disabled={approving}
                    className={`px-4 py-2 text-xs font-bold rounded shadow-xs flex items-center justify-center transition-colors ${
                      isRec
                        ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                        : 'bg-slate-800 hover:bg-slate-900 text-white'
                    }`}
                  >
                    <Check className="w-3.5 h-3.5 mr-1.5" />
                    {approving && isSelected ? 'Generating Revised Itinerary...' : `Approve & Adopt Option ${opt.option_code}`}
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
