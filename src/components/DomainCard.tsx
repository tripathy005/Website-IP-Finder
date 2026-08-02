import React from 'react';
import { Globe, ShieldCheck, ShieldAlert, Activity, Server, Clock } from 'lucide-react';
import { InfoCard } from './InfoCard';
import { CopyButton } from './CopyButton';
import { DomainInfo, NetworkHealth } from '../types';

interface DomainCardProps {
  domainInfo: DomainInfo;
  networkHealth: NetworkHealth;
  onCopySuccess: (text: string) => void;
}

export const DomainCard: React.FC<DomainCardProps> = ({
  domainInfo,
  networkHealth,
  onCopySuccess,
}) => {
  const { domain, hostname, reverseDns, ipVersion, status } = domainInfo;
  const { responseTimeMs, dnsResolutionTimeMs, httpsEnabled, ssl, serverHeader } = networkHealth;

  return (
    <InfoCard title="Domain & Server Health" icon={Globe} badge={status} badgeColor="emerald">
      <div className="space-y-3.5">
        {/* Domain Name */}
        <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950/70 border border-slate-800">
          <div>
            <div className="text-[11px] font-mono text-slate-400">Domain Name</div>
            <div className="font-mono text-sm font-bold text-cyan-300">{domain}</div>
          </div>
          <CopyButton textToCopy={domain} size="sm" onCopySuccess={onCopySuccess} />
        </div>

        {/* Hostname & Reverse DNS */}
        <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-mono text-slate-400">Reverse DNS (PTR):</span>
            <span className="font-mono text-slate-200 text-xs truncate max-w-[180px]">
              {reverseDns || 'None'}
            </span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="font-mono text-slate-400">Server Banner:</span>
            <span className="font-mono text-teal-300 text-xs truncate">{serverHeader}</span>
          </div>
        </div>

        {/* Latency & DNS Speed Metrics */}
        <div className="grid grid-cols-2 gap-2 font-mono">
          <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center gap-2">
            <Activity className="w-4 h-4 text-cyan-400 shrink-0" />
            <div>
              <div className="text-[10px] text-slate-400">HTTP Response Time</div>
              <div className="text-sm font-bold text-cyan-300">{responseTimeMs} ms</div>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center gap-2">
            <Clock className="w-4 h-4 text-purple-400 shrink-0" />
            <div>
              <div className="text-[10px] text-slate-400">DNS Resolution</div>
              <div className="text-sm font-bold text-purple-300">{dnsResolutionTimeMs} ms</div>
            </div>
          </div>
        </div>

        {/* SSL Status Panel */}
        <div className={`p-3.5 rounded-xl border ${
          ssl?.valid
            ? 'bg-emerald-950/30 border-emerald-500/40'
            : 'bg-rose-950/30 border-rose-500/40'
        }`}>
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-2 font-semibold text-xs text-white">
              {ssl?.valid ? (
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
              ) : (
                <ShieldAlert className="w-4 h-4 text-rose-400" />
              )}
              <span>SSL / TLS Certificate</span>
            </div>
            <span className={`px-2 py-0.5 text-[10px] font-mono font-bold rounded ${
              ssl?.valid ? 'bg-emerald-900 text-emerald-200' : 'bg-rose-900 text-rose-200'
            }`}>
              {ssl?.valid ? 'VALID SSL' : 'NO SSL / EXPIRED'}
            </span>
          </div>

          {ssl?.issuer && (
            <div className="text-xs text-slate-300 font-mono space-y-1 mt-2">
              <div className="flex justify-between">
                <span className="text-slate-400">Issuer:</span>
                <span className="text-slate-200 font-medium truncate max-w-[200px]">{ssl.issuer}</span>
              </div>
              {ssl.daysRemaining !== undefined && (
                <div className="flex justify-between">
                  <span className="text-slate-400">Expires in:</span>
                  <span className="text-emerald-300 font-semibold">{ssl.daysRemaining} Days</span>
                </div>
              )}
              {ssl.protocol && (
                <div className="flex justify-between">
                  <span className="text-slate-400">TLS Protocol:</span>
                  <span className="text-cyan-300">{ssl.protocol}</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </InfoCard>
  );
};
