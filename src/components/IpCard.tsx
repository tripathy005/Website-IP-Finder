import React from 'react';
import { Network, Server } from 'lucide-react';
import { InfoCard } from './InfoCard';
import { CopyButton } from './CopyButton';
import { IpAddresses } from '../types';

interface IpCardProps {
  ipAddresses: IpAddresses;
  onCopySuccess: (text: string) => void;
}

export const IpCard: React.FC<IpCardProps> = ({ ipAddresses, onCopySuccess }) => {
  const { ipv4, ipv6, primaryIp } = ipAddresses;

  return (
    <InfoCard title="IP Address" icon={Network} badge={primaryIp ? 'RESOLVED' : 'NONE'} badgeColor="cyan">
      <div className="space-y-4">
        {/* Primary IPv4 Highlight */}
        <div className="p-4 rounded-xl bg-slate-950/80 border border-cyan-500/30 shadow-[0_0_15px_rgba(6,182,212,0.1)]">
          <div className="flex items-center justify-between text-xs text-slate-400 font-mono mb-1.5">
            <span className="flex items-center gap-1.5 text-cyan-400 font-semibold">
              <Server className="w-3.5 h-3.5" /> IPv4 Address
            </span>
            <span className="text-[11px] bg-cyan-950 text-cyan-300 border border-cyan-800/80 px-2 py-0.5 rounded">
              Primary
            </span>
          </div>

          {ipv4 && ipv4.length > 0 ? (
            <div className="space-y-2">
              {ipv4.map((ip, idx) => (
                <div key={ip + idx} className="flex items-center justify-between gap-2">
                  <span className="font-mono text-base font-bold text-white tracking-wider select-all">
                    {ip}
                  </span>
                  <CopyButton
                    textToCopy={ip}
                    label="Copy IP"
                    onCopySuccess={onCopySuccess}
                    size="sm"
                  />
                </div>
              ))}
            </div>
          ) : (
            <span className="font-mono text-sm text-slate-500 italic">No IPv4 address returned</span>
          )}
        </div>

        {/* IPv6 Section */}
        <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80">
          <div className="flex items-center justify-between text-xs text-slate-400 font-mono mb-1.5">
            <span className="flex items-center gap-1.5 text-indigo-400 font-semibold">
              <Server className="w-3.5 h-3.5" /> IPv6 Address
            </span>
            {ipv6 && ipv6.length > 0 && (
              <span className="text-[11px] text-slate-400 font-mono">
                {ipv6.length} Record{ipv6.length > 1 ? 's' : ''}
              </span>
            )}
          </div>

          {ipv6 && ipv6.length > 0 ? (
            <div className="space-y-2">
              {ipv6.map((ip, idx) => (
                <div key={ip + idx} className="flex items-center justify-between gap-2">
                  <span className="font-mono text-xs sm:text-sm text-slate-200 tracking-tight break-all select-all">
                    {ip}
                  </span>
                  <CopyButton
                    textToCopy={ip}
                    label="Copy"
                    onCopySuccess={onCopySuccess}
                    size="sm"
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-xs text-slate-500 font-mono italic">
              No IPv6 (AAAA) record configured for this domain
            </div>
          )}
        </div>
      </div>
    </InfoCard>
  );
};
