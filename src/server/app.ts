import express from 'express';
import cors from 'cors';
import { normalizeDomain } from './domainUtils.ts';
import { resolveDnsRecords } from './dnsService.ts';
import { getIpGeoDetails } from './ipService.ts';
import { inspectNetworkAndSsl } from './sslService.ts';
import { getWhoisInfo } from './whoisService.ts';

const app = express();

app.use(cors());
app.use(express.json());

// Primary Comprehensive Lookup Endpoint (Supports POST & GET)
const handleLookup = async (req: express.Request, res: express.Response) => {
  try {
    const input = req.body?.input || req.query?.input || req.query?.domain || req.query?.q;
    if (!input || typeof input !== 'string') {
      return res.status(400).json({ error: 'Please provide a domain or URL.' });
    }

    const normalized = normalizeDomain(input);
    if (!normalized.isValid) {
      return res.status(400).json({ error: normalized.error || 'Invalid domain format.' });
    }

    const domain = normalized.domain;

    // Parallel data gather: DNS records, Network/SSL check
    const [dnsRecords, networkHealth] = await Promise.all([
      resolveDnsRecords(domain),
      inspectNetworkAndSsl(domain),
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

    // Fetch ISP & Geolocation for primary IP
    const geoDetails = await getIpGeoDetails(targetIp);

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
        ipv4: dnsRecords.a,
        ipv6: dnsRecords.aaaa,
        primaryIp: targetIp,
      },
      dnsRecords: dnsRecords,
      ispDetails: {
        isp: geoDetails.isp,
        org: geoDetails.org,
        asn: geoDetails.asn,
        networkProvider: geoDetails.networkProvider,
      },
      hostingDetails: {
        country: geoDetails.country,
        countryCode: geoDetails.countryCode,
        region: geoDetails.region,
        city: geoDetails.city,
        timezone: geoDetails.timezone,
        latitude: geoDetails.latitude,
        longitude: geoDetails.longitude,
        isHosting: geoDetails.isHosting,
        isProxy: geoDetails.isProxy,
      },
      networkHealth: {
        responseTimeMs: networkHealth.responseTimeMs,
        dnsResolutionTimeMs: dnsRecords.resolutionTimeMs,
        httpsEnabled: networkHealth.httpsEnabled,
        httpStatusCode: networkHealth.httpStatusCode,
        serverHeader: networkHealth.serverHeader || 'Unknown',
        ssl: networkHealth.ssl,
      },
    };

    return res.json(responsePayload);
  } catch (err: any) {
    console.error('Lookup Error:', err);
    return res.status(500).json({ error: String(err?.message || 'Failed to complete DNS and IP resolution.') });
  }
};

app.post('/api/lookup', handleLookup);
app.get('/api/lookup', handleLookup);

// WHOIS Lookup Endpoint
app.get('/api/whois/:domain', async (req, res) => {
  try {
    const { domain } = req.params;
    const normalized = normalizeDomain(domain);
    if (!normalized.isValid) {
      return res.status(400).json({ error: 'Invalid domain name.' });
    }

    const whoisData = await getWhoisInfo(normalized.domain);
    return res.json(whoisData);
  } catch (err: any) {
    return res.status(500).json({ error: String(err?.message || 'WHOIS request failed.') });
  }
});

// Health / Ping Endpoint
app.get('/api/ping/:domain', async (req, res) => {
  try {
    const { domain } = req.params;
    const normalized = normalizeDomain(domain);
    if (!normalized.isValid) {
      return res.status(400).json({ error: 'Invalid domain' });
    }

    const health = await inspectNetworkAndSsl(normalized.domain);
    return res.json({ domain: normalized.domain, health });
  } catch (err: any) {
    return res.status(500).json({ error: String(err?.message || 'Ping failed') });
  }
});

export default app;
