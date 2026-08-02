import React from 'react';
import { LucideIcon } from 'lucide-react';

interface InfoCardProps {
  title: string;
  icon: LucideIcon;
  badge?: string;
  badgeColor?: 'cyan' | 'emerald' | 'amber' | 'purple' | 'rose';
  children: React.ReactNode;
  className?: string;
}

export const InfoCard: React.FC<InfoCardProps> = ({
  title,
  icon: Icon,
  badge,
  badgeColor = 'cyan',
  children,
  className = '',
}) => {
  const badgeStyles = {
    cyan: 'bg-cyan-950/80 text-cyan-300 border-cyan-800/80',
    emerald: 'bg-emerald-950/80 text-emerald-300 border-emerald-800/80',
    amber: 'bg-amber-950/80 text-amber-300 border-amber-800/80',
    purple: 'bg-purple-950/80 text-purple-300 border-purple-800/80',
    rose: 'bg-rose-950/80 text-rose-300 border-rose-800/80',
  };

  return (
    <div
      className={`relative flex flex-col rounded-2xl bg-slate-900/80 border border-slate-800/80 hover:border-slate-700/80 p-5 sm:p-6 shadow-xl backdrop-blur-xl transition-all duration-300 group hover:shadow-[0_0_30px_rgba(6,182,212,0.1)] ${className}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700/60 text-cyan-400 group-hover:text-cyan-300 group-hover:bg-slate-800 transition-colors">
            <Icon className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-lg text-white tracking-tight">{title}</h3>
        </div>
        {badge && (
          <span
            className={`px-2.5 py-1 text-xs font-mono font-medium rounded-lg border ${badgeStyles[badgeColor]}`}
          >
            {badge}
          </span>
        )}
      </div>

      {/* Body */}
      <div className="flex-1 text-slate-300 text-sm">{children}</div>
    </div>
  );
};
