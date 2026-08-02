import React, { useState } from 'react';
import { Search, Globe, ArrowRight, Zap, Sparkles } from 'lucide-react';

interface HeroSectionProps {
  onSearch: (domain: string) => void;
  isLoading: boolean;
  initialValue?: string;
  errorMessage?: string | null;
}

const EXAMPLE_DOMAINS = [
  'google.com',
  'github.com',
  'openai.com',
  'cloudflare.com',
  'wikipedia.org',
  'vercel.com',
];

export const HeroSection: React.FC<HeroSectionProps> = ({
  onSearch,
  isLoading,
  initialValue = '',
  errorMessage,
}) => {
  const [input, setInput] = useState(initialValue);
  const [localError, setLocalError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);

    const trimmed = input.trim();
    if (!trimmed) {
      setLocalError('Please enter a website URL or domain name.');
      return;
    }

    onSearch(trimmed);
  };

  const handleExampleClick = (domain: string) => {
    setInput(domain);
    setLocalError(null);
    onSearch(domain);
  };

  return (
    <div className="relative z-10 pt-8 pb-12 sm:pt-16 sm:pb-20 text-center max-w-4xl mx-auto px-4">
      {/* Top Cyber Badge */}
      <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-950/60 border border-cyan-500/30 text-cyan-300 text-xs font-mono mb-6 shadow-[0_0_20px_rgba(6,182,212,0.15)]">
        <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-spin" style={{ animationDuration: '4s' }} />
        <span>Instant IPv4, IPv6, DNS & WHOIS Resolution</span>
      </div>

      {/* Main Title */}
      <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white mb-4">
        Website <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-teal-300 to-indigo-400">IP Finder</span>
      </h1>

      {/* Subtitle */}
      <p className="text-base sm:text-xl text-slate-300 max-w-2xl mx-auto mb-10 leading-relaxed font-normal">
        Find the IP address and network details of any website instantly.
      </p>

      {/* Search Bar Form */}
      <form onSubmit={handleSubmit} className="max-w-2xl mx-auto mb-6">
        <div className="relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-600 rounded-2xl blur-md opacity-30 group-hover:opacity-60 transition duration-500 group-focus-within:opacity-80" />
          
          <div className="relative flex flex-col sm:flex-row items-center bg-slate-900/90 border border-slate-700/80 rounded-2xl p-2 shadow-2xl backdrop-blur-xl group-focus-within:border-cyan-400/80 transition-all">
            <div className="flex items-center gap-3 px-3.5 py-2 w-full sm:w-auto flex-1">
              <Globe className="w-5 h-5 text-cyan-400 shrink-0" />
              <input
                type="text"
                value={input}
                onChange={(e) => {
                  setInput(e.target.value);
                  if (localError) setLocalError(null);
                }}
                placeholder="Enter Website URL or Domain (e.g. example.com)"
                className="w-full bg-transparent text-white placeholder-slate-400 text-sm sm:text-base focus:outline-none font-mono"
                disabled={isLoading}
              />
              {input && (
                <button
                  type="button"
                  onClick={() => setInput('')}
                  className="text-slate-500 hover:text-slate-300 text-xs px-2 py-1 rounded bg-slate-800"
                >
                  Clear
                </button>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full sm:w-auto mt-2 sm:mt-0 flex items-center justify-center gap-2 px-6 py-3.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold text-sm rounded-xl transition-all duration-200 shadow-[0_0_20px_rgba(6,182,212,0.4)] active:scale-95 disabled:opacity-50 shrink-0 cursor-pointer"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Searching...</span>
                </>
              ) : (
                <>
                  <Search className="w-4 h-4" />
                  <span>Find IP Address</span>
                  <ArrowRight className="w-4 h-4 hidden sm:inline" />
                </>
              )}
            </button>
          </div>
        </div>

        {/* Local Error or Props Error */}
        {(localError || errorMessage) && (
          <div className="mt-3 text-sm text-rose-400 bg-rose-950/50 border border-rose-800/60 rounded-lg p-2.5 text-center font-mono animate-fadeIn">
            ⚠️ {localError || errorMessage}
          </div>
        )}
      </form>

      {/* Example Quick Domains */}
      <div className="flex flex-wrap items-center justify-center gap-2 text-xs font-mono text-slate-400">
        <span className="flex items-center gap-1 text-slate-400">
          <Zap className="w-3.5 h-3.5 text-amber-400" />
          Try examples:
        </span>
        {EXAMPLE_DOMAINS.map((domain) => (
          <button
            key={domain}
            type="button"
            onClick={() => handleExampleClick(domain)}
            disabled={isLoading}
            className="px-2.5 py-1 rounded-lg bg-slate-900/80 hover:bg-slate-800 border border-slate-800 hover:border-cyan-500/50 text-slate-300 hover:text-cyan-300 transition-all active:scale-95 cursor-pointer"
          >
            {domain}
          </button>
        ))}
      </div>
    </div>
  );
};
