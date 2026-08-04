import express from 'express';
import cors from 'cors';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { normalizeDomain } from './src/server/domainUtils.ts';
import { resolveDnsRecords } from './src/server/dnsService.ts';
import { getIpGeoDetails } from './src/server/ipService.ts';
import { inspectNetworkAndSsl } from './src/server/sslService.ts';
import { getWhoisInfo } from './src/server/whoisService.ts';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(cors());
  app.use(express.json());

  // API 1: Primary Comprehensive Lookup Endpoint (Supports POST & GET)
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

      // Parallel data gather: DNS records, Network/SSL check, and IP Geolocation
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

  // API 2: WHOIS Lookup Endpoint
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

  // API 3: Health / Ping Endpoint
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

  // API Catch-All 404 Handler (Prevents returning HTML index.html for invalid /api/ routes)
  app.all('/api/*', (req, res) => {
    res.status(404).json({ error: `API endpoint '${req.originalUrl}' not found.` });
  });

  // Serve Frontend via Vite Middleware or Production Static Files
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Website IP Finder server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
