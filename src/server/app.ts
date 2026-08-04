import express from 'express';
import cors from 'cors';
import { normalizeDomain } from './domainUtils';
import { resolveDnsRecords, DnsRecords } from './dnsService';
import { getIpGeoDetails, IpGeoDetails } from './ipService';
import { inspectNetworkAndSsl, NetworkHealth } from './sslService';
import { getWhoisInfo } from './whoisService';

const app = express();

app.use(cors());
app.use(express.json());

// Middleware to handle raw string bodies or serverless body issues gracefully
app.use((req: express.Request, _res: express.Response, next: express.NextFunction) => {
  if (typeof req.body === 'string' && req.body.trim()) {
    try {
      req.body = JSON.parse(req.body);
    } catch {
      // Keep as string if parsing fails
    }
  }
  next();
});

// Primary Comprehensive Lookup Endpoint
const handleLookup = async (req: express.Request, res: express.Response) => {
  try {
    let input = req.body?.input || req.query?.input || req.query?.domain || req.query?.q;

    // Additional fallback if body is stringified JSON
    if (!input && typeof req.body === 'string') {
      try {
        const parsed = JSON.parse(req.body);
        input = parsed?.input || parsed?.domain || parsed?.q;
      } catch {
        // ignore
      }
    }

    if (!input || typeof input !== 'string' || !input.trim()) {
      if (req.path === '/api' || req.path === '/api/') {
        return res.json({ message: 'Website IP Finder API operational. Send a POST or GET request with an "input" field (e.g. "example.com").' });
      }
      return res.status(400).json({ error: 'Please provide a valid domain name or IP address.' });
    }

    const normalized = normalizeDomain(input.trim());
    if (!normalized.isValid) {
      return res.status(400).json({ error: normalized.error || 'Invalid domain or IP format.' });
    }

    const domain = normalized.domain;

    // Parallel data gather with individual fail-safes
    const [dnsRecords, networkHealth] = await Promise.all([
      resolveDnsRecords(domain).catch((): DnsRecords => ({
        a: [],
        aaaa: [],
        cname: [],
        mx: [],
        ns: [],
        txt: [],
        soa: null,
        reverseDns: null,
        resolutionTimeMs: 0,
        error: 'DNS resolution unavailable',
      })),
      inspectNetworkAndSsl(domain).catch((): NetworkHealth => ({
        ssl: { valid: false, error: 'SSL check unavailable' },
        httpsEnabled: false,
        responseTimeMs: 0,
      })),
    ]);

    // Determine primary target IP for Geolocation
    let targetIp = domain;
    if (!normalized.isIp) {
      if (dnsRecords.a && dnsRecords.a.length > 0) {
        targetIp = dnsRecords.a[0];
      } else if (dnsRecords.aaaa && dnsRecords.aaaa.length > 0) {
        targetIp = dnsRecords.aaaa[0];
      }
    }

    // Fetch ISP & Geolocation for primary IP with fail-safe
    const geoDetails: IpGeoDetails = await getIpGeoDetails(targetIp).catch(() => ({
      ip: targetIp,
      ipVersion: targetIp.includes(':') ? 'IPv6' : 'IPv4',
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
    }));

    const responsePayload = {
      domainInfo: {
        rawInput: input,
        domain: domain,
        hostname: normalized.domain,
        reverseDns: dnsRecords.reverseDns || geoDetails.ip,
        isIp: normalized.isIp,
        ipVersion: geoDetails.ipVersion,
        status: networkHealth.httpStatusCode ? `Active (${networkHealth.httpStatusCode})` : 'Online',
      },
      ipAddresses: {
        ipv4: dnsRecords.a || [],
        ipv6: dnsRecords.aaaa || [],
        primaryIp: targetIp,
      },
      dnsRecords: dnsRecords,
      ispDetails: {
        isp: geoDetails.isp || 'Unknown ISP',
        org: geoDetails.org || 'Unknown Org',
        asn: geoDetails.asn || 'N/A',
        networkProvider: geoDetails.networkProvider || 'Unknown',
      },
      hostingDetails: {
        country: geoDetails.country || 'Unknown',
        countryCode: geoDetails.countryCode || 'XX',
        region: geoDetails.region || 'Unknown',
        city: geoDetails.city || 'Unknown',
        timezone: geoDetails.timezone || 'UTC',
        latitude: geoDetails.latitude,
        longitude: geoDetails.longitude,
        isHosting: geoDetails.isHosting || false,
        isProxy: geoDetails.isProxy || false,
      },
      networkHealth: {
        responseTimeMs: networkHealth.responseTimeMs || 0,
        dnsResolutionTimeMs: dnsRecords.resolutionTimeMs || 0,
        httpsEnabled: networkHealth.httpsEnabled || false,
        httpStatusCode: networkHealth.httpStatusCode,
        serverHeader: networkHealth.serverHeader || 'Unknown',
        ssl: networkHealth.ssl || { valid: false },
      },
    };

    return res.json(responsePayload);
  } catch (err: any) {
    console.error('Unhandled Lookup Error:', err);
    return res.status(500).json({ error: String(err?.message || 'Failed to complete DNS and IP resolution.') });
  }
};

app.post(['/api/lookup', '/lookup', '/api', '/'], handleLookup);
app.get(['/api/lookup', '/lookup', '/api'], handleLookup);

// WHOIS Lookup Endpoint
app.get(['/api/whois/:domain', '/whois/:domain', '/:domain'], async (req, res) => {
  try {
    const { domain } = req.params;
    if (!domain) return res.status(400).json({ error: 'Domain required.' });
    const normalized = normalizeDomain(domain);
    if (!normalized.isValid) {
      return res.status(400).json({ error: 'Invalid domain name.' });
    }

    const whoisData = await getWhoisInfo(normalized.domain).catch(() => ({
      domainName: normalized.domain,
      registrar: 'Information unavailable',
      error: 'Failed to retrieve WHOIS records.',
    }));

    return res.json(whoisData);
  } catch (err: any) {
    return res.status(500).json({ error: String(err?.message || 'WHOIS request failed.') });
  }
});

// Health / Ping Endpoint
app.get(['/api/ping/:domain', '/ping/:domain'], async (req, res) => {
  try {
    const { domain } = req.params;
    if (!domain) return res.status(400).json({ error: 'Domain required.' });
    const normalized = normalizeDomain(domain);
    if (!normalized.isValid) {
      return res.status(400).json({ error: 'Invalid domain' });
    }

    const health = await inspectNetworkAndSsl(normalized.domain).catch(() => ({
      ssl: { valid: false, error: 'Ping check failed' },
      httpsEnabled: false,
      responseTimeMs: 0,
    }));

    return res.json({ domain: normalized.domain, health });
  } catch (err: any) {
    return res.status(500).json({ error: String(err?.message || 'Ping failed') });
  }
});

// Global Express Error Handler Middleware for Serverless Failures
app.use((err: any, _req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Global Express Error:', err);
  if (res.headersSent) {
    return next(err);
  }
  return res.status(500).json({
    error: String(err?.message || 'An unexpected server error occurred.'),
  });
});

export default app;
