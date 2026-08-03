import React from 'react';
import { Globe, Terminal, Shield, Cpu } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="relative z-10 border-t border-slate-800/80 bg-slate-950/80 backdrop-blur-xl py-8 px-4 mt-auto text-slate-400 text-xs font-mono">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Left info */}
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-cyan-400">
            <Globe className="w-4 h-4" />
          </div>
          <div>
            <div className="font-bold text-white tracking-wide">Website IP Finder</div>
            <div className="text-[11px] text-slate-500">
              Real-time DNS, IPv4/IPv6, Geolocation & WHOIS Telemetry Engine
            </div>
          </div>
        </div>

        {/* Tech Stack Badges */}
        <div className="flex flex-wrap items-center justify-center gap-2">
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800 text-slate-300">
            <Terminal className="w-3 h-3 text-purple-400" />
            <span>Node DNS</span>
          </span>
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800 text-slate-300">
            <Shield className="w-3 h-3 text-emerald-400" />
            <span>TLS Inspector</span>
          </span>
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800 text-slate-300">
            <Cpu className="w-3 h-3 text-cyan-400" />
            <span>ICANN RDAP</span>
          </span>
        </div>

        {/* Right status */}
        <div className="text-right text-[11px] text-slate-500">
          <div>Built with React & Express • Ultra-Low Latency • devloped by @tripathy05 </div>
        </div> 
      </div>
    </footer>
  );
};
