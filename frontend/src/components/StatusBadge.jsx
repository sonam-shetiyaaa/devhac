import React from 'react';

export default function StatusBadge({ status, className = '' }) {
  const norm = (status || '').toUpperCase();

  let styles = 'bg-slate-100 text-slate-700 border-slate-200/80';
  let dotColor = 'bg-slate-400';
  let label = norm;

  if (norm === 'DISRUPTED') {
    styles = 'bg-rose-50 text-rose-700 border-rose-200/80';
    dotColor = 'bg-rose-500';
    label = 'Disrupted';
  } else if (norm === 'IMPACTED') {
    styles = 'bg-amber-50 text-amber-700 border-amber-200/80';
    dotColor = 'bg-amber-500';
    label = 'Cascade Impacted';
  } else if (norm === 'RECOVERED' || norm === 'CONFIRMED' || norm === 'PRESERVED' || norm === 'CONFIRMED_ALTERNATIVE') {
    styles = 'bg-emerald-50 text-emerald-700 border-emerald-200/80';
    dotColor = 'bg-emerald-500';
    label = norm === 'CONFIRMED_ALTERNATIVE' ? 'Alternative Booked' : (norm === 'PRESERVED' ? 'Preserved' : 'Recovered');
  } else if (norm === 'PLANNED') {
    styles = 'bg-slate-50 text-slate-600 border-slate-200/80';
    dotColor = 'bg-slate-400';
    label = 'Planned';
  } else if (norm === 'CANCELLED') {
    styles = 'bg-rose-50 text-rose-700 border-rose-200/80';
    dotColor = 'bg-rose-500';
    label = 'Cancelled';
  } else if (norm === 'RESCHEDULED') {
    styles = 'bg-indigo-50 text-indigo-700 border-indigo-200/80';
    dotColor = 'bg-indigo-500';
    label = 'Rescheduled';
  }

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium border ${styles} ${className}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${dotColor}`}></span>
      {label}
    </span>
  );
}
