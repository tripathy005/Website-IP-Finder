import React, { useState } from 'react';
import { Database, ChevronDown, ChevronUp, Copy, Check } from 'lucide-react';
import { InfoCard } from './InfoCard';
import { DnsRecords } from '../types';

interface DNSCardProps {
  dnsRecords: DnsRecords;
  onCopySuccess: (text: string) => void;
}

export const DNSCard: React.FC<DNSCardProps> = ({ dnsRecords, onCopySuccess }) => {
  const [expandedSection, setExpandedSection] = useState<string | null>('ALL');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const handleCopyRecord = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    onCopySuccess(`Copied: ${text}`);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const sections = [
    {
      key: 'A',
      title: 'A Records (IPv4)',
      count: dnsRecords.a?.length || 0,
      render: () => (
        <div className="space-y-1.5">
          {dnsRecords.a?.length ? (
            dnsRecords.a.map((ip, i) => (
              <div key={i} className="flex items-center justify-between p-2 rounded bg-slate-950/80 border border-slate-800 text-xs font-mono">
                <span className="text-cyan-300 font-semibold">{ip}</span>
                <button
                  onClick={() => handleCopyRecord(ip, `a-${i}`)}
                  className="text-slate-400 hover:text-white p-1 rounded hover:bg-slate-800"
                >
                  {copiedKey === `a-${i}` ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            ))
          ) : (
            <div className="text-xs text-slate-500 font-mono italic p-2">None</div>
          )}
        </div>
      ),
    },
    {
      key: 'AAAA',
      title: 'AAAA Records (IPv6)',
      count: dnsRecords.aaaa?.length || 0,
      render: () => (
        <div className="space-y-1.5">
          {dnsRecords.aaaa?.length ? (
            dnsRecords.aaaa.map((ip, i) => (
              <div key={i} className="flex items-center justify-between p-2 rounded bg-slate-950/80 border border-slate-800 text-xs font-mono">
                <span className="text-indigo-300 break-all">{ip}</span>
                <button
                  onClick={() => handleCopyRecord(ip, `aaaa-${i}`)}
                  className="text-slate-400 hover:text-white p-1 rounded hover:bg-slate-800 shrink-0"
                >
                  {copiedKey === `aaaa-${i}` ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            ))
          ) : (
            <div className="text-xs text-slate-500 font-mono italic p-2">None</div>
          )}
        </div>
      ),
    },
    {
      key: 'MX',
      title: 'MX Records (Mail Servers)',
      count: dnsRecords.mx?.length || 0,
      render: () => (
        <div className="space-y-1.5">
          {dnsRecords.mx?.length ? (
            dnsRecords.mx.map((mx, i) => (
              <div key={i} className="flex items-center justify-between p-2 rounded bg-slate-950/80 border border-slate-800 text-xs font-mono">
                <div className="flex items-center gap-2">
                  <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 text-[10px]">
                    Priority {mx.priority}
                  </span>
                  <span className="text-amber-300">{mx.exchange}</span>
                </div>
                <button
                  onClick={() => handleCopyRecord(mx.exchange, `mx-${i}`)}
                  className="text-slate-400 hover:text-white p-1 rounded hover:bg-slate-800"
                >
                  {copiedKey === `mx-${i}` ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            ))
          ) : (
            <div className="text-xs text-slate-500 font-mono italic p-2">None</div>
          )}
        </div>
      ),
    },
    {
      key: 'NS',
      title: 'NS Records (Name Servers)',
      count: dnsRecords.ns?.length || 0,
      render: () => (
        <div className="space-y-1.5">
          {dnsRecords.ns?.length ? (
            dnsRecords.ns.map((ns, i) => (
              <div key={i} className="flex items-center justify-between p-2 rounded bg-slate-950/80 border border-slate-800 text-xs font-mono">
                <span className="text-teal-300">{ns}</span>
                <button
                  onClick={() => handleCopyRecord(ns, `ns-${i}`)}
                  className="text-slate-400 hover:text-white p-1 rounded hover:bg-slate-800"
                >
                  {copiedKey === `ns-${i}` ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            ))
          ) : (
            <div className="text-xs text-slate-500 font-mono italic p-2">None</div>
          )}
        </div>
      ),
    },
    {
      key: 'CNAME',
      title: 'CNAME Records',
      count: dnsRecords.cname?.length || 0,
      render: () => (
        <div className="space-y-1.5">
          {dnsRecords.cname?.length ? (
            dnsRecords.cname.map((cname, i) => (
              <div key={i} className="flex items-center justify-between p-2 rounded bg-slate-950/80 border border-slate-800 text-xs font-mono">
                <span className="text-purple-300">{cname}</span>
                <button
                  onClick={() => handleCopyRecord(cname, `cname-${i}`)}
                  className="text-slate-400 hover:text-white p-1 rounded hover:bg-slate-800"
                >
                  {copiedKey === `cname-${i}` ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            ))
          ) : (
            <div className="text-xs text-slate-500 font-mono italic p-2">None</div>
          )}
        </div>
      ),
    },
    {
      key: 'TXT',
      title: 'TXT Records (SPF / DKIM / Verification)',
      count: dnsRecords.txt?.length || 0,
      render: () => (
        <div className="space-y-1.5">
          {dnsRecords.txt?.length ? (
            dnsRecords.txt.map((txtArr, i) => {
              const fullTxt = Array.isArray(txtArr) ? txtArr.join(' ') : String(txtArr);
              return (
                <div key={i} className="flex items-start justify-between gap-2 p-2 rounded bg-slate-950/80 border border-slate-800 text-xs font-mono">
                  <span className="text-slate-300 break-all select-all leading-relaxed">{fullTxt}</span>
                  <button
                    onClick={() => handleCopyRecord(fullTxt, `txt-${i}`)}
                    className="text-slate-400 hover:text-white p-1 rounded hover:bg-slate-800 shrink-0 mt-0.5"
                  >
                    {copiedKey === `txt-${i}` ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              );
            })
          ) : (
            <div className="text-xs text-slate-500 font-mono italic p-2">None</div>
          )}
        </div>
      ),
    },
  ];

  return (
    <InfoCard
      title="DNS Records"
      icon={Database}
      badge={`${dnsRecords.resolutionTimeMs || 0}ms`}
      badgeColor="purple"
    >
      <div className="space-y-3">
        {/* Toggle Expand / Collapse All */}
        <div className="flex items-center justify-between pb-2 border-b border-slate-800/80 text-xs text-slate-400">
          <span>Expandable Record Sections</span>
          <button
            type="button"
            onClick={() => setExpandedSection(expandedSection === 'ALL' ? null : 'ALL')}
            className="text-cyan-400 hover:text-cyan-300 font-mono text-[11px] underline"
          >
            {expandedSection === 'ALL' ? 'Collapse All' : 'Expand All'}
          </button>
        </div>

        {sections.map((sec) => {
          const isOpen = expandedSection === 'ALL' || expandedSection === sec.key;

          return (
            <div key={sec.key} className="rounded-xl bg-slate-950/60 border border-slate-800/80 overflow-hidden">
              <button
                type="button"
                onClick={() =>
                  setExpandedSection(
                    expandedSection === 'ALL'
                      ? null
                      : expandedSection === sec.key
                      ? null
                      : sec.key
                  )
                }
                className="w-full flex items-center justify-between p-3 text-left hover:bg-slate-900/60 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2 font-mono text-xs font-semibold text-slate-200">
                  <span>{sec.title}</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] ${sec.count > 0 ? 'bg-cyan-950 text-cyan-300 border border-cyan-800' : 'bg-slate-800 text-slate-500'}`}>
                    {sec.count}
                  </span>
                </div>
                {isOpen ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
              </button>

              {isOpen && <div className="p-3 pt-0 border-t border-slate-900/80">{sec.render()}</div>}
            </div>
          );
        })}
      </div>
    </InfoCard>
  );
};
