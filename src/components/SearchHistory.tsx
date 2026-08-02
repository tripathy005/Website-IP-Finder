import React from 'react';
import { History, Trash2, ArrowUpRight, Clock, Globe } from 'lucide-react';
import { HistoryItem } from '../types';

interface SearchHistoryProps {
  history: HistoryItem[];
  onSelectDomain: (domain: string) => void;
  onDeleteItem: (id: string) => void;
  onClearHistory: () => void;
}

export const SearchHistory: React.FC<SearchHistoryProps> = ({
  history,
  onSelectDomain,
  onDeleteItem,
  onClearHistory,
}) => {
  if (!history || history.length === 0) return null;

  const formatTimeAgo = (timestamp: number) => {
    const diffSec = Math.floor((Date.now() - timestamp) / 1000);
    if (diffSec < 60) return 'Just now';
    if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
    if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ago`;
    return `${Math.floor(diffSec / 86400)}d ago`;
  };

  return (
    <div className="relative z-10 max-w-7xl mx-auto my-8 px-4">
      <div className="rounded-2xl bg-slate-900/80 border border-slate-800/80 p-5 shadow-xl backdrop-blur-xl">
        {/* Header */}
        <div className="flex items-center justify-between pb-3.5 mb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-slate-800/80 text-cyan-400">
              <History className="w-4 h-4" />
            </div>
            <h4 className="font-bold text-sm text-white font-sans">Recent Searches</h4>
            <span className="px-2 py-0.5 text-[10px] font-mono rounded-full bg-slate-800 text-slate-400">
              {history.length} Saved
            </span>
          </div>

          <button
            type="button"
            onClick={onClearHistory}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono text-slate-400 hover:text-rose-400 hover:bg-rose-950/40 rounded-lg transition-colors cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear History</span>
          </button>
        </div>

        {/* History Items Grid / List */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {history.map((item) => (
            <div
              key={item.id}
              className="group relative flex flex-col justify-between p-3 rounded-xl bg-slate-950/70 border border-slate-800 hover:border-cyan-500/50 transition-all hover:shadow-[0_0_15px_rgba(6,182,212,0.15)]"
            >
              {/* Item Domain & Delete Button */}
              <div className="flex items-start justify-between gap-1 mb-2">
                <button
                  type="button"
                  onClick={() => onSelectDomain(item.domain)}
                  className="text-left font-mono text-xs font-bold text-cyan-300 group-hover:text-cyan-200 truncate flex items-center gap-1 cursor-pointer"
                >
                  <Globe className="w-3.5 h-3.5 shrink-0 text-cyan-400" />
                  <span className="truncate">{item.domain}</span>
                  <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteItem(item.id);
                  }}
                  title="Remove from history"
                  className="text-slate-500 hover:text-rose-400 p-1 rounded hover:bg-slate-800 transition-colors shrink-0"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>

              {/* IP & Timestamp */}
              <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 pt-1 border-t border-slate-900">
                <span className="text-slate-300 font-medium truncate">{item.ip || 'Resolved'}</span>
                <span className="flex items-center gap-1 text-[10px] text-slate-500">
                  <Clock className="w-2.5 h-2.5" />
                  {formatTimeAgo(item.timestamp)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
