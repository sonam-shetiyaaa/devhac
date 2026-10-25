import React from 'react';

export default function StatusBadge({ status, className = '' }) {
  const norm = (status || '').toUpperCase();

  let styles = 'bg-slate-100 text-slate-700 border-slate-300';
  let label = norm;

  if (norm === 'DISRUPTED') {
    styles = 'bg-rose-50 text-rose-700 border-rose-200';
    label = 'Disrupted';
  } else if (norm === 'IMPACTED') {
    styles = 'bg-amber-50 text-amber-800 border-amber-200';
    label = 'Cascade Impacted';
  } else if (norm === 'RECOVERED' || norm === 'CONFIRMED' || norm === 'PRESERVED' || norm === 'CONFIRMED_ALTERNATIVE') {
    styles = 'bg-emerald-50 text-emerald-800 border-emerald-200';
    label = norm === 'CONFIRMED_ALTERNATIVE' ? 'Confirmed Alternative' : (norm === 'PRESERVED' ? 'Preserved' : 'Recovered');
  } else if (norm === 'PLANNED') {
    styles = 'bg-slate-100 text-slate-800 border-slate-200';
    label = 'Planned';
  } else if (norm === 'CANCELLED') {
    styles = 'bg-red-50 text-red-800 border-red-200';
    label = 'Cancelled';
  } else if (norm === 'RESCHEDULED') {
    styles = 'bg-indigo-50 text-indigo-800 border-indigo-200';
    label = 'Rescheduled';
  }

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${styles} ${className}`}
    >
      <span className="w-1.5 h-1.5 rounded-full mr-1.5 bg-current opacity-70"></span>
      {label}
    </span>
  );
}
