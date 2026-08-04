import tls from 'tls';
import https from 'https';
import http from 'http';
import type { PeerCertificate } from 'tls';

export interface SslInfo {
  valid: boolean;
  issuer?: string;
  subject?: string;
  validFrom?: string;
  validTo?: string;
  daysRemaining?: number;
  protocol?: string;
  error?: string;
}

export interface NetworkHealth {
  ssl: SslInfo;
  httpsEnabled: boolean;
  httpStatusCode?: number;
  serverHeader?: string;
  responseTimeMs: number;
  redirectUrl?: string;
}

/**
 * Checks SSL certificate status and measures HTTP/HTTPS latency with fail-safe timeouts.
 */
export async function inspectNetworkAndSsl(domain: string, port = 443): Promise<NetworkHealth> {
  const startTime = Date.now();

  const sslPromise = new Promise<SslInfo>((resolve) => {
    let resolved = false;
    const safeResolve = (val: SslInfo) => {
      if (!resolved) {
        resolved = true;
        resolve(val);
      }
    };

    try {
      const socket = tls.connect(
        {
          host: domain,
          port: port,
          servername: domain,
          rejectUnauthorized: false,
          timeout: 2000,
        },
        () => {
          try {
            const cert = socket.getPeerCertificate() as PeerCertificate;
            const protocol = socket.getProtocol() || undefined;
            const isAuthorized = socket.authorized;

            if (!cert || Object.keys(cert).length === 0) {
              try { socket.destroy(); } catch {}
              return safeResolve({ valid: false, error: 'No SSL certificate found' });
            }

            const validToDate = cert.valid_to ? new Date(cert.valid_to) : new Date(0);
            const validFromDate = cert.valid_from ? new Date(cert.valid_from) : new Date(0);
            const now = new Date();
            const daysRemaining = Math.max(0, Math.floor((validToDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));

            const getFirstOrStr = (val: string | string[] | undefined): string => {
              if (!val) return '';
              if (Array.isArray(val)) return val[0] || '';
              return String(val);
            };

            let issuerStr = 'Unknown Issuer';
            if (cert.issuer) {
              if (typeof cert.issuer === 'object') {
                issuerStr = getFirstOrStr(cert.issuer.O || cert.issuer.CN) || 'Unknown Issuer';
              } else if (typeof cert.issuer === 'string') {
                issuerStr = cert.issuer;
              }
            }

            let subjectStr = domain;
            if (cert.subject) {
              if (typeof cert.subject === 'object') {
                subjectStr = getFirstOrStr(cert.subject.CN || cert.subject.O) || domain;
              } else if (typeof cert.subject === 'string') {
                subjectStr = cert.subject;
              }
            }

            const isValid = isAuthorized || (now >= validFromDate && now <= validToDate);

            try { socket.destroy(); } catch {}
            safeResolve({
              valid: isValid,
              issuer: issuerStr,
              subject: subjectStr,
              validFrom: cert.valid_from,
              validTo: cert.valid_to,
              daysRemaining: isNaN(daysRemaining) ? 0 : daysRemaining,
              protocol: protocol,
            });
          } catch (err: any) {
            try { socket.destroy(); } catch {}
            safeResolve({ valid: false, error: err?.message || 'Certificate parsing error' });
          }
        }
      );

      socket.on('error', (err) => {
        try { socket.destroy(); } catch {}
        safeResolve({ valid: false, error: err?.message || 'TLS connection failed' });
      });

      socket.on('timeout', () => {
        try { socket.destroy(); } catch {}
        safeResolve({ valid: false, error: 'SSL check timed out' });
      });
    } catch (err: any) {
      safeResolve({ valid: false, error: err?.message || 'SSL verification error' });
    }
  });

  const httpPromise = new Promise<{
    httpsEnabled: boolean;
    statusCode?: number;
    serverHeader?: string;
    redirectUrl?: string;
  }>((resolve) => {
    let resolved = false;
    const safeResolve = (val: { httpsEnabled: boolean; statusCode?: number; serverHeader?: string; redirectUrl?: string }) => {
      if (!resolved) {
        resolved = true;
        resolve(val);
      }
    };

    try {
      const req = https.get(
        `https://${domain}`,
        {
          timeout: 2000,
          headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) WebsiteIPFinder/1.0' },
        },
        (res) => {
          res.on('error', () => {});
          try {
            const rawServer = res.headers['server'];
            const serverHeader = Array.isArray(rawServer) ? rawServer[0] : rawServer;
            const rawLoc = res.headers['location'];
            const redirectUrl = Array.isArray(rawLoc) ? rawLoc[0] : rawLoc;

            res.resume();
            safeResolve({
              httpsEnabled: true,
              statusCode: res.statusCode,
              serverHeader,
              redirectUrl,
            });
          } catch {
            res.resume();
            safeResolve({ httpsEnabled: true, statusCode: res.statusCode });
          }
        }
      );

      req.on('timeout', () => {
        try { req.destroy(); } catch {}
      });

      req.on('error', () => {
        // Fallback to HTTP check
        try {
          const httpReq = http.get(
            `http://${domain}`,
            {
              timeout: 1800,
              headers: { 'User-Agent': 'WebsiteIPFinder/1.0' },
            },
            (res) => {
              res.on('error', () => {});
              try {
                const rawServer = res.headers['server'];
                const serverHeader = Array.isArray(rawServer) ? rawServer[0] : rawServer;
                res.resume();
                safeResolve({
                  httpsEnabled: false,
                  statusCode: res.statusCode,
                  serverHeader,
                });
              } catch {
                res.resume();
                safeResolve({ httpsEnabled: false, statusCode: res.statusCode });
              }
            }
          );

          httpReq.on('timeout', () => {
            try { httpReq.destroy(); } catch {}
          });

          httpReq.on('error', () => {
            safeResolve({ httpsEnabled: false });
          });

          httpReq.end();
        } catch {
          safeResolve({ httpsEnabled: false });
        }
      });

      req.end();
    } catch {
      safeResolve({ httpsEnabled: false });
    }
  });

  // Safe timeout promise wrapper
  const timeoutPromise = new Promise<null>((resolve) => setTimeout(() => resolve(null), 2500));

  const [ssl, httpRes] = await Promise.all([
    Promise.race([sslPromise.catch(() => ({ valid: false, error: 'SSL check error' })), timeoutPromise]).then(
      (res) => res || { valid: false, error: 'SSL check timed out' }
    ),
    Promise.race([
      httpPromise.catch(() => ({ httpsEnabled: false, statusCode: undefined, serverHeader: undefined, redirectUrl: undefined })),
      timeoutPromise
    ]).then(
      (res) => res || { httpsEnabled: false, statusCode: undefined, serverHeader: undefined, redirectUrl: undefined }
    ),
  ]);

  const responseTimeMs = Date.now() - startTime;

  return {
    ssl,
    httpsEnabled: httpRes.httpsEnabled,
    httpStatusCode: httpRes.statusCode,
    serverHeader: httpRes.serverHeader,
    redirectUrl: httpRes.redirectUrl,
    responseTimeMs,
  };
}
