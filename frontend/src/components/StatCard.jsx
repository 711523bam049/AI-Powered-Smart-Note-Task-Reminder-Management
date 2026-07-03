import React from 'react';
import { StatSkeleton } from './SkeletonLoader';

export default function StatCard({ title, value, icon: Icon, trend, colorClass = 'text-brand-purple', loading }) {
  if (loading) {
    return <StatSkeleton />;
  }

  return (
    <div className="glass rounded-xl p-5 hover:translate-y-[-4px] transition-all duration-300 shadow-premium hover:shadow-2xl relative group overflow-hidden">
      {/* Decorative Glow Background */}
      <div className="absolute -right-4 -bottom-4 w-24 h-24 rounded-full bg-gradient-to-br from-brand-purple/5 to-transparent blur-2xl group-hover:scale-125 transition-transform duration-500" />
      
      <div className="flex justify-between items-start mb-3">
        <span className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
          {title}
        </span>
        <div className={`p-2 rounded-lg bg-[var(--bg-hover)] border border-[var(--border-color)] group-hover:border-brand-purple/20 transition-colors duration-300 ${colorClass}`}>
          <Icon size={18} />
        </div>
      </div>

      <div className="flex items-baseline gap-2">
        <span className="text-3xl font-bold font-display tracking-tight text-[var(--text-main)]">
          {value}
        </span>
      </div>

      {trend && (
        <p className="text-[10px] text-[var(--text-muted)] mt-2 flex items-center gap-1 font-sans">
          <span className="text-emerald-400 font-semibold">{trend.value}</span>
          {trend.label}
        </p>
      )}
    </div>
  );
}
