import React from 'react';
import { Clock, DollarSign, Layers, Heart } from 'lucide-react';

export default function ScoreBreakdown({ factors, overallScore, isRecommended }) {
  if (!factors) return null;

  const items = [
    {
      key: 'time',
      label: 'Timing & Arrival',
      icon: Clock,
      factor: factors.time,
      defaultMax: 35,
    },
    {
      key: 'budget',
      label: 'Budget Feasibility',
      icon: DollarSign,
      factor: factors.budget,
      defaultMax: 25,
    },
    {
      key: 'cascade',
      label: 'Cascade Healed',
      icon: Layers,
      factor: factors.cascade,
      defaultMax: 25,
    },
    {
      key: 'comfort',
      label: 'Transit Comfort',
      icon: Heart,
      factor: factors.comfort,
      defaultMax: 15,
    },
  ];

  return (
    <div className="bg-slate-50/70 border border-slate-200/70 rounded-xl p-4 my-3">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
          Optimization Score Breakdown
        </span>
        <div className="flex items-center space-x-1.5">
          <span className="text-xs text-slate-400">Score:</span>
          <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${
            overallScore >= 80
              ? 'bg-emerald-50 text-emerald-700 border-emerald-200/80'
              : overallScore >= 60
              ? 'bg-amber-50 text-amber-700 border-amber-200/80'
              : 'bg-slate-100 text-slate-700 border-slate-200'
          }`}>
            {overallScore}/100
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
        {items.map(({ key, label, icon: Icon, factor, defaultMax }) => {
          const score = factor?.score || 0;
          const max = factor?.max || defaultMax;
          const pct = Math.min(100, Math.max(0, Math.round((score / max) * 100)));

          return (
            <div key={key} className="bg-white p-2.5 rounded-lg border border-slate-100">
              <div className="flex items-center justify-between mb-1.5">
                <span className="flex items-center space-x-1.5 text-slate-700 font-medium text-xs">
                  <Icon className="w-3.5 h-3.5 text-slate-400" />
                  <span>{label}</span>
                </span>
                <span className="font-semibold text-slate-900 text-xs">
                  {score}/{max}
                </span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-1 mb-1.5">
                <div
                  className="bg-emerald-600 h-1 rounded-full transition-all duration-300"
                  style={{ width: `${pct}%` }}
                />
              </div>
              <p className="text-[11px] text-slate-400 line-clamp-1">{factor?.explanation}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
