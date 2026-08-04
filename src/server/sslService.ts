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
    try {
      const socket = tls.connect(
        {
          host: domain,
          port: port,
          servername: domain,
          rejectUnauthorized: false,
          timeout: 3000,
        },
        () => {
          const cert = socket.getPeerCertificate() as PeerCertificate;
          const protocol = socket.getProtocol() || undefined;
          const isAuthorized = socket.authorized;

          if (!cert || Object.keys(cert).length === 0) {
            socket.destroy();
            return resolve({ valid: false, error: 'No SSL certificate found' });
          }

          const validToDate = new Date(cert.valid_to);
          const validFromDate = new Date(cert.valid_from);
          const now = new Date();
          const daysRemaining = Math.floor((validToDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

          const getFirstOrStr = (val: string | string[] | undefined): string => {
            if (!val) return '';
            if (Array.isArray(val)) return val[0];
            return String(val);
          };

          const rawIssuer =
            typeof cert.issuer === 'object' ? cert.issuer.O || cert.issuer.CN || 'Unknown Issuer' : cert.issuer;
          const issuerStr = getFirstOrStr(rawIssuer) || 'Unknown Issuer';

          const rawSubject =
            typeof cert.subject === 'object' ? cert.subject.CN || cert.subject.O || domain : cert.subject;
          const subjectStr = getFirstOrStr(rawSubject) || domain;

          const isValid = isAuthorized || (now >= validFromDate && now <= validToDate);

          socket.destroy();
          resolve({
            valid: isValid,
            issuer: issuerStr,
            subject: subjectStr,
            validFrom: cert.valid_from,
            validTo: cert.valid_to,
            daysRemaining: daysRemaining > 0 ? daysRemaining : 0,
            protocol: protocol,
          });
        }
      );

      socket.on('error', (err) => {
        socket.destroy();
        resolve({ valid: false, error: err.message || 'TLS connection failed' });
      });

      socket.on('timeout', () => {
        socket.destroy();
        resolve({ valid: false, error: 'SSL check timed out' });
      });
    } catch (err: any) {
      resolve({ valid: false, error: err.message || 'SSL verification error' });
    }
  });

  const httpPromise = new Promise<{
    httpsEnabled: boolean;
    statusCode?: number;
    serverHeader?: string;
    redirectUrl?: string;
  }>((resolve) => {
    try {
      const req = https.get(
        `https://${domain}`,
        {
          timeout: 3000,
          headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) WebsiteIPFinder/1.0' },
        },
        (res) => {
          const rawServer = res.headers['server'];
          const serverHeader = Array.isArray(rawServer) ? rawServer[0] : rawServer;
          const rawLoc = res.headers['location'];
          const redirectUrl = Array.isArray(rawLoc) ? rawLoc[0] : rawLoc;

          res.resume();
          resolve({
            httpsEnabled: true,
            statusCode: res.statusCode,
            serverHeader,
            redirectUrl,
          });
        }
      );

      req.on('timeout', () => {
        req.destroy();
      });

      req.on('error', () => {
        // Fallback to HTTP check
        try {
          const httpReq = http.get(
            `http://${domain}`,
            {
              timeout: 2500,
              headers: { 'User-Agent': 'WebsiteIPFinder/1.0' },
            },
            (res) => {
              const rawServer = res.headers['server'];
              const serverHeader = Array.isArray(rawServer) ? rawServer[0] : rawServer;
              res.resume();
              resolve({
                httpsEnabled: false,
                statusCode: res.statusCode,
                serverHeader,
              });
            }
          );

          httpReq.on('timeout', () => {
            httpReq.destroy();
          });

          httpReq.on('error', () => {
            resolve({ httpsEnabled: false });
          });

          httpReq.end();
        } catch {
          resolve({ httpsEnabled: false });
        }
      });

      req.end();
    } catch {
      resolve({ httpsEnabled: false });
    }
  });

  // Safe timeout promise wrapper
  const timeoutPromise = new Promise<null>((resolve) => setTimeout(() => resolve(null), 3500));

  const [ssl, httpRes] = await Promise.all([
    Promise.race([sslPromise, timeoutPromise]).then((res) => res || { valid: false, error: 'SSL check timed out' }),
    Promise.race([httpPromise, timeoutPromise]).then(
      (res) => res || { httpsEnabled: false, statusCode: undefined, serverHeader: undefined }
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
