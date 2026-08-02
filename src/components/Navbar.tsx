import React from 'react';
import { Globe, ShieldCheck, Activity, Terminal } from 'lucide-react';

interface NavbarProps {
  onResetSearch?: () => void;
  systemStatus?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({ onResetSearch, systemStatus = true }) => {
  return (
    <header className="sticky top-0 z-40 backdrop-blur-xl bg-slate-950/70 border-b border-slate-800/80 px-4 sm:px-8 py-3.5 transition-all">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Brand Logo & Name */}
        <button
          onClick={onResetSearch}
          className="flex items-center gap-3 group text-left focus:outline-none"
        >
          <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500/20 via-blue-500/10 to-purple-500/20 border border-cyan-500/40 shadow-[0_0_15px_rgba(6,182,212,0.25)] group-hover:scale-105 group-hover:border-cyan-400 transition-all duration-300">
            <Globe className="w-5 h-5 text-cyan-400 animate-pulse" />
            <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-cyan-400 rounded-full animate-ping" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-100 to-cyan-300">
                Website IP Finder
              </span>
              <span className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-mono tracking-wider text-cyan-400 bg-cyan-950/60 border border-cyan-800/60 rounded-full uppercase">
                v2.4 Pro
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">
              DNS Resolution & Network Telemetry Suite
            </p>
          </div>
        </button>

        {/* Status Pills & Badges */}
        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900/80 border border-slate-800 text-xs text-slate-300 font-mono">
            <Terminal className="w-3.5 h-3.5 text-purple-400" />
            <span>DNS Node: <strong className="text-purple-300">Active</strong></span>
          </div>

          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900/80 border border-slate-800/80 text-xs font-mono">
            <span className={`w-2 h-2 rounded-full ${systemStatus ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]' : 'bg-amber-400'}`} />
            <span className="text-slate-300">{systemStatus ? 'SYSTEM READY' : 'DEGRADED'}</span>
          </div>

          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-950/40 border border-cyan-800/40 text-xs text-cyan-300 font-medium">
            <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
            <span>SSL Inspector</span>
          </div>
        </div>
      </div>
    </header>
  );
};
