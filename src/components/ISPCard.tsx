import React from 'react';
import { Cpu, ShieldAlert, Wifi } from 'lucide-react';
import { InfoCard } from './InfoCard';
import { CopyButton } from './CopyButton';
import { IspDetails, HostingDetails } from '../types';

interface ISPCardProps {
  ispDetails: IspDetails;
  hostingDetails: HostingDetails;
  onCopySuccess: (text: string) => void;
}

export const ISPCard: React.FC<ISPCardProps> = ({ ispDetails, hostingDetails, onCopySuccess }) => {
  const { isp, org, asn, networkProvider } = ispDetails;
  const { isHosting, isProxy } = hostingDetails;

  return (
    <InfoCard title="ISP & Network Details" icon={Cpu} badge={asn !== 'N/A' ? asn : 'ASN'} badgeColor="amber">
      <div className="space-y-3.5">
        {/* ISP Name */}
        <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950/70 border border-slate-800">
          <div>
            <div className="text-[11px] font-mono text-slate-400">ISP Name</div>
            <div className="font-semibold text-white text-sm tracking-wide">{isp}</div>
          </div>
          <CopyButton textToCopy={isp} size="sm" onCopySuccess={onCopySuccess} />
        </div>

        {/* Organization */}
        <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950/70 border border-slate-800">
          <div>
            <div className="text-[11px] font-mono text-slate-400">Organization</div>
            <div className="font-medium text-slate-200 text-sm">{org}</div>
          </div>
          <CopyButton textToCopy={org} size="sm" onCopySuccess={onCopySuccess} />
        </div>

        {/* ASN Number */}
        <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950/70 border border-slate-800">
          <div>
            <div className="text-[11px] font-mono text-slate-400">ASN Number</div>
            <div className="font-mono text-amber-300 font-bold text-sm">{asn}</div>
          </div>
          <CopyButton textToCopy={asn} size="sm" onCopySuccess={onCopySuccess} />
        </div>

        {/* Network Provider */}
        <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950/70 border border-slate-800">
          <div>
            <div className="text-[11px] font-mono text-slate-400">Network Provider</div>
            <div className="font-sans text-slate-300 text-xs">{networkProvider}</div>
          </div>
        </div>

        {/* Infrastructure Badges */}
        <div className="flex items-center gap-2 pt-1 font-mono text-xs">
          {isHosting && (
            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-950/80 text-emerald-300 border border-emerald-800">
              <Wifi className="w-3.5 h-3.5" /> Data Center / Cloud Host
            </span>
          )}
          {isProxy && (
            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-950/80 text-amber-300 border border-amber-800">
              <ShieldAlert className="w-3.5 h-3.5" /> Proxy / VPN Node
            </span>
          )}
        </div>
      </div>
    </InfoCard>
  );
};
