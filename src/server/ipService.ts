import axios from 'axios';

export interface IpGeoDetails {
  ip: string;
  ipVersion: 'IPv4' | 'IPv6';
  isp: string;
  org: string;
  asn: string;
  networkProvider: string;
  country: string;
  countryCode: string;
  region: string;
  city: string;
  timezone: string;
  latitude: number | null;
  longitude: number | null;
  isHosting: boolean;
  isProxy: boolean;
}

/**
 * Fetches ISP, ASN, and Geolocation metadata for an IP address or domain.
 */
export async function getIpGeoDetails(targetIpOrDomain: string): Promise<IpGeoDetails> {
  const isIpv6 = targetIpOrDomain.includes(':');
  const ipVersion = isIpv6 ? 'IPv6' : 'IPv4';

  const defaultDetails: IpGeoDetails = {
    ip: targetIpOrDomain,
    ipVersion,
    isp: 'Unknown ISP',
    org: 'Unknown Organization',
    asn: 'N/A',
    networkProvider: 'Unknown',
    country: 'Unknown',
    countryCode: 'XX',
    region: 'Unknown',
    city: 'Unknown',
    timezone: 'UTC',
    latitude: null,
    longitude: null,
    isHosting: false,
    isProxy: false,
  };

  // Provider 1: ipwho.is
  try {
    const resp = await axios.get(`https://ipwho.is/${encodeURIComponent(targetIpOrDomain)}`, {
      timeout: 4000,
      headers: { 'User-Agent': 'WebsiteIPFinder/1.0' },
    });

    if (resp.data && resp.data.success !== false) {
      const data = resp.data;
      return {
        ip: data.ip || targetIpOrDomain,
        ipVersion: (data.type === 'IPv6' || isIpv6) ? 'IPv6' : 'IPv4',
        isp: data.connection?.isp || data.connection?.org || 'Unknown ISP',
        org: data.connection?.org || data.connection?.isp || 'Unknown Org',
        asn: data.connection?.asn ? `AS${data.connection.asn}` : 'N/A',
        networkProvider: data.connection?.domain || data.connection?.isp || 'Unknown',
        country: data.country || 'Unknown',
        countryCode: data.country_code || 'XX',
        region: data.region || 'Unknown',
        city: data.city || 'Unknown',
        timezone: data.timezone?.id || 'UTC',
        latitude: typeof data.latitude === 'number' ? data.latitude : null,
        longitude: typeof data.longitude === 'number' ? data.longitude : null,
        isHosting: Boolean(data.security?.hosting),
        isProxy: Boolean(data.security?.proxy || data.security?.vpn),
      };
    }
  } catch {
    // Try Provider 2
  }

  // Provider 2: ip-api.com
  try {
    const resp = await axios.get(`http://ip-api.com/json/${encodeURIComponent(targetIpOrDomain)}?fields=status,message,country,countryCode,regionName,city,lat,lon,timezone,isp,org,as,hosting,proxy,query`, {
      timeout: 4000,
    });

    if (resp.data && resp.data.status === 'success') {
      const data = resp.data;
      return {
        ip: data.query || targetIpOrDomain,
        ipVersion,
        isp: data.isp || 'Unknown ISP',
        org: data.org || data.isp || 'Unknown Org',
        asn: data.as ? data.as.split(' ')[0] : 'N/A',
        networkProvider: data.as || data.org || 'Unknown',
        country: data.country || 'Unknown',
        countryCode: data.countryCode || 'XX',
        region: data.regionName || 'Unknown',
        city: data.city || 'Unknown',
        timezone: data.timezone || 'UTC',
        latitude: typeof data.lat === 'number' ? data.lat : null,
        longitude: typeof data.lon === 'number' ? data.lon : null,
        isHosting: Boolean(data.hosting),
        isProxy: Boolean(data.proxy),
      };
    }
  } catch {
    // Return default
  }

  return defaultDetails;
}
