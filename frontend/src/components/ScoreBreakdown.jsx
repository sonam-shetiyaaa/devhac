import React from 'react';
import { Clock, DollarSign, Layers, Heart } from 'lucide-react';

export default function ScoreBreakdown({ factors, overallScore, isRecommended }) {
  if (!factors) return null;

  return (
    <div className="bg-slate-50 border border-slate-200 rounded-lg p-3.5 my-3">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
          Decision Engine Score Breakdown
        </span>
        <div className="flex items-center space-x-1.5">
          <span className="text-xs text-slate-500">Overall:</span>
          <span className={`text-base font-bold px-2 py-0.5 rounded ${
            overallScore >= 80 ? 'bg-emerald-100 text-emerald-800' : (overallScore >= 60 ? 'bg-amber-100 text-amber-800' : 'bg-slate-200 text-slate-700')
          }`}>
            {overallScore}/100
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
        {/* Factor 1: Time */}
        <div className="bg-white p-2 rounded border border-slate-200">
          <div className="flex items-center justify-between mb-1">
            <span className="flex items-center text-slate-700 font-medium">
              <Clock className="w-3.5 h-3.5 text-emerald-600 mr-1.5" />
              Timing & Arrival
            </span>
            <span className="font-semibold text-slate-800">
              {factors.time?.score || 0}/{factors.time?.max || 35} pts
            </span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-1.5 mb-1">
            <div
              className="bg-emerald-600 h-1.5 rounded-full"
              style={{ width: `${Math.round(((factors.time?.score || 0) / (factors.time?.max || 35)) * 100)}%` }}
            ></div>
          </div>
          <p className="text-[11px] text-slate-500 line-clamp-1">{factors.time?.explanation}</p>
        </div>

        {/* Factor 2: Budget */}
        <div className="bg-white p-2 rounded border border-slate-200">
          <div className="flex items-center justify-between mb-1">
            <span className="flex items-center text-slate-700 font-medium">
              <DollarSign className="w-3.5 h-3.5 text-emerald-600 mr-1.5" />
              Budget Feasibility
            </span>
            <span className="font-semibold text-slate-800">
              {factors.budget?.score || 0}/{factors.budget?.max || 25} pts
            </span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-1.5 mb-1">
            <div
              className="bg-emerald-600 h-1.5 rounded-full"
              style={{ width: `${Math.round(((factors.budget?.score || 0) / (factors.budget?.max || 25)) * 100)}%` }}
            ></div>
          </div>
          <p className="text-[11px] text-slate-500 line-clamp-1">{factors.budget?.explanation}</p>
        </div>

        {/* Factor 3: Cascade */}
        <div className="bg-white p-2 rounded border border-slate-200">
          <div className="flex items-center justify-between mb-1">
            <span className="flex items-center text-slate-700 font-medium">
              <Layers className="w-3.5 h-3.5 text-emerald-600 mr-1.5" />
              Cascade Healed
            </span>
            <span className="font-semibold text-slate-800">
              {factors.cascade?.score || 0}/{factors.cascade?.max || 25} pts
            </span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-1.5 mb-1">
            <div
              className="bg-emerald-600 h-1.5 rounded-full"
              style={{ width: `${Math.round(((factors.cascade?.score || 0) / (factors.cascade?.max || 25)) * 100)}%` }}
            ></div>
          </div>
          <p className="text-[11px] text-slate-500 line-clamp-1">{factors.cascade?.explanation}</p>
        </div>

        {/* Factor 4: Comfort */}
        <div className="bg-white p-2 rounded border border-slate-200">
          <div className="flex items-center justify-between mb-1">
            <span className="flex items-center text-slate-700 font-medium">
              <Heart className="w-3.5 h-3.5 text-emerald-600 mr-1.5" />
              Transit Comfort
            </span>
            <span className="font-semibold text-slate-800">
              {factors.comfort?.score || 0}/{factors.comfort?.max || 15} pts
            </span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-1.5 mb-1">
            <div
              className="bg-emerald-600 h-1.5 rounded-full"
              style={{ width: `${Math.round(((factors.comfort?.score || 0) / (factors.comfort?.max || 15)) * 100)}%` }}
            ></div>
          </div>
          <p className="text-[11px] text-slate-500 line-clamp-1">{factors.comfort?.explanation}</p>
        </div>
      </div>
    </div>
  );
}
