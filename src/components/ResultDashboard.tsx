import React, { useState } from 'react';
import { RefreshCw, Download, FileText, Share2, Globe, ShieldCheck } from 'lucide-react';
import { IpCard } from './IpCard';
import { DomainCard } from './DomainCard';
import { HostingCard } from './HostingCard';
import { ISPCard } from './ISPCard';
import { DNSCard } from './DNSCard';
import { WhoisModal } from './WhoisModal';
import { LookupResult } from '../types';

interface ResultDashboardProps {
  result: LookupResult;
  onRefresh: () => void;
  isLoading: boolean;
  onCopySuccess: (text: string) => void;
}

export const ResultDashboard: React.FC<ResultDashboardProps> = ({
  result,
  onRefresh,
  isLoading,
  onCopySuccess,
}) => {
  const [isWhoisOpen, setIsWhoisOpen] = useState(false);

  const { domainInfo, ipAddresses, dnsRecords, ispDetails, hostingDetails, networkHealth } = result;

  const handleExportJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(result, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `${domainInfo.domain}-network-report.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    onCopySuccess('Exported network report JSON!');
  };

  return (
    <div className="relative z-10 max-w-7xl mx-auto px-4 pb-16 space-y-6">
      {/* Top Controls & Meta Banner */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-5 rounded-2xl bg-slate-900/90 border border-slate-800 backdrop-blur-xl shadow-2xl">
        <div className="flex items-center gap-3.5">
          <div className="p-3 rounded-xl bg-gradient-to-tr from-cyan-500/20 to-blue-500/20 border border-cyan-500/40 text-cyan-400">
            <Globe className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-extrabold text-white font-mono tracking-tight">
                {domainInfo.domain}
              </h2>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-950/80 text-emerald-300 border border-emerald-800 text-xs font-mono">
                {domainInfo.status}
              </span>
            </div>
            <p className="text-xs text-slate-400 font-mono">
              Primary IP: <span className="text-cyan-300 font-bold">{ipAddresses.primaryIp}</span> • Resolved in {dnsRecords.resolutionTimeMs}ms
            </p>
          </div>
        </div>

        {/* Quick Dashboard Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          {/* Refresh Info */}
          <button
            type="button"
            onClick={onRefresh}
            disabled={isLoading}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-mono font-medium transition-all active:scale-95 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>

          {/* Export JSON */}
          <button
            type="button"
            onClick={handleExportJson}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-mono font-medium transition-all active:scale-95 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-cyan-400" />
            <span>Export Report</span>
          </button>

          {/* WHOIS Lookup Button */}
          <button
            type="button"
            onClick={() => setIsWhoisOpen(true)}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-mono font-bold shadow-[0_0_15px_rgba(168,85,247,0.3)] transition-all active:scale-95 cursor-pointer"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>WHOIS Lookup</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <IpCard ipAddresses={ipAddresses} onCopySuccess={onCopySuccess} />
        <DomainCard domainInfo={domainInfo} networkHealth={networkHealth} onCopySuccess={onCopySuccess} />
        <HostingCard hostingDetails={hostingDetails} domainName={domainInfo.domain} />
        <ISPCard ispDetails={ispDetails} hostingDetails={hostingDetails} onCopySuccess={onCopySuccess} />
        <div className="md:col-span-2 lg:col-span-2">
          <DNSCard dnsRecords={dnsRecords} onCopySuccess={onCopySuccess} />
        </div>
      </div>

      {/* WHOIS Modal */}
      <WhoisModal
        isOpen={isWhoisOpen}
        domainName={domainInfo.domain}
        onClose={() => setIsWhoisOpen(false)}
        onCopySuccess={onCopySuccess}
      />
    </div>
  );
};
