import React from 'react';
import { MapPin, ExternalLink, Clock, Compass } from 'lucide-react';
import { InfoCard } from './InfoCard';
import { HostingDetails } from '../types';

interface HostingCardProps {
  hostingDetails: HostingDetails;
  domainName: string;
}

export const HostingCard: React.FC<HostingCardProps> = ({ hostingDetails, domainName }) => {
  const { country, countryCode, region, city, timezone, latitude, longitude } = hostingDetails;

  // Convert countryCode to flag emoji
  const getFlagEmoji = (code: string) => {
    if (!code || code.length !== 2 || code === 'XX') return '🌐';
    const codePoints = code
      .toUpperCase()
      .split('')
      .map((char) => 127397 + char.charCodeAt(0));
    return String.fromCodePoint(...codePoints);
  };

  const hasCoords = typeof latitude === 'number' && typeof longitude === 'number';
  const googleMapsUrl = hasCoords
    ? `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`
    : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${city}, ${country}`)}`;

  return (
    <InfoCard
      title="Hosting Location"
      icon={MapPin}
      badge={`${getFlagEmoji(countryCode)} ${countryCode !== 'XX' ? countryCode : ''}`}
      badgeColor="emerald"
    >
      <div className="space-y-3.5">
        {/* Country & Flag */}
        <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950/70 border border-slate-800">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{getFlagEmoji(countryCode)}</span>
            <div>
              <div className="text-[11px] font-mono text-slate-400">Country</div>
              <div className="font-semibold text-white text-sm">{country}</div>
            </div>
          </div>
        </div>

        {/* City & Region */}
        <div className="grid grid-cols-2 gap-2">
          <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800">
            <div className="text-[11px] font-mono text-slate-400">City</div>
            <div className="font-medium text-slate-200 text-sm truncate">{city || 'Unknown'}</div>
          </div>

          <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800">
            <div className="text-[11px] font-mono text-slate-400">Region</div>
            <div className="font-medium text-slate-200 text-sm truncate">{region || 'Unknown'}</div>
          </div>
        </div>

        {/* Timezone & Lat/Long */}
        <div className="grid grid-cols-2 gap-2">
          <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center gap-2">
            <Clock className="w-4 h-4 text-cyan-400 shrink-0" />
            <div>
              <div className="text-[10px] font-mono text-slate-400">Time Zone</div>
              <div className="font-mono text-xs text-cyan-300 font-medium truncate">{timezone}</div>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center gap-2">
            <Compass className="w-4 h-4 text-teal-400 shrink-0" />
            <div>
              <div className="text-[10px] font-mono text-slate-400">Coordinates</div>
              <div className="font-mono text-[11px] text-teal-300 truncate">
                {hasCoords ? `${latitude?.toFixed(2)}, ${longitude?.toFixed(2)}` : 'N/A'}
              </div>
            </div>
          </div>
        </div>

        {/* Google Maps Button */}
        <a
          href={googleMapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600/30 via-teal-600/30 to-cyan-600/30 hover:from-emerald-600/50 hover:to-cyan-600/50 border border-emerald-500/40 text-emerald-200 hover:text-white font-mono text-xs font-semibold transition-all duration-200 shadow-[0_0_15px_rgba(16,185,129,0.2)]"
        >
          <MapPin className="w-4 h-4 text-emerald-400" />
          <span>View on Google Maps</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>
    </InfoCard>
  );
};
