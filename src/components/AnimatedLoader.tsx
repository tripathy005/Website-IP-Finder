import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { ShieldCheck, Database, Server, Radio, Cpu } from 'lucide-react';

const LOADING_STEPS = [
  { icon: Radio, text: 'Resolving DNS records...', subtext: 'Querying A, AAAA, MX, NS root name servers' },
  { icon: Database, text: 'Finding IP Address & Hostname...', subtext: 'Extracting primary IPv4 and IPv6 coordinates' },
  { icon: Server, text: 'Fetching Hosting & ISP Information...', subtext: 'Connecting to geolocation and ASN database' },
  { icon: ShieldCheck, text: 'Verifying SSL Certificate & Latency...', subtext: 'Testing TLS protocol handshakes and response time' },
];

export const AnimatedLoader: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStep((prev) => (prev < LOADING_STEPS.length - 1 ? prev + 1 : prev));
    }, 700);

    return () => clearInterval(interval);
  }, []);

  const StepIcon = LOADING_STEPS[currentStep].icon;

  return (
    <div className="relative z-10 max-w-xl mx-auto my-12 p-8 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-[0_0_50px_rgba(6,182,212,0.15)] backdrop-blur-xl text-center">
      {/* Central Pulsing Network Node Visual */}
      <div className="relative w-24 h-24 mx-auto mb-6 flex items-center justify-center">
        {/* Outer Ring Animation */}
        <div className="absolute inset-0 rounded-full border-2 border-cyan-500/30 animate-ping" />
        <div className="absolute inset-2 rounded-full border border-purple-500/40 animate-spin" style={{ animationDuration: '6s' }} />
        <div className="absolute inset-4 rounded-full border-2 border-dashed border-teal-400/50 animate-spin" style={{ animationDirection: 'reverse', animationDuration: '10s' }} />

        {/* Central Core */}
        <div className="relative z-10 w-12 h-12 rounded-xl bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center shadow-[0_0_20px_rgba(6,182,212,0.6)]">
          <StepIcon className="w-6 h-6 text-white animate-pulse" />
        </div>
      </div>

      {/* Progress Title */}
      <h3 className="text-xl font-bold text-white mb-2 tracking-wide font-sans">
        {LOADING_STEPS[currentStep].text}
      </h3>
      <p className="text-xs font-mono text-cyan-400 mb-6">
        {LOADING_STEPS[currentStep].subtext}
      </p>

      {/* Step Progress Bar */}
      <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden mb-6 p-0.5 border border-slate-700">
        <motion.div
          className="h-full bg-gradient-to-r from-cyan-500 via-teal-400 to-purple-500 rounded-full shadow-[0_0_10px_rgba(6,182,212,0.8)]"
          initial={{ width: '15%' }}
          animate={{ width: `${((currentStep + 1) / LOADING_STEPS.length) * 100}%` }}
          transition={{ duration: 0.4 }}
        />
      </div>

      {/* Mini Node Packets Animation */}
      <div className="flex items-center justify-center gap-6 font-mono text-xs text-slate-400 border-t border-slate-800/80 pt-4">
        <span className="flex items-center gap-1.5">
          <Cpu className="w-3.5 h-3.5 text-cyan-400" />
          <span>Packet Traversal</span>
        </span>
        <span className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <span className="text-emerald-400">DNS ROUTE OK</span>
        </span>
      </div>
    </div>
  );
};
