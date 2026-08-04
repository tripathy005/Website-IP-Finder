import dns from 'dns/promises';
import axios from 'axios';

export interface MxRecord {
  exchange: string;
  priority: number;
}

export interface SoaRecord {
  nsname: string;
  hostmaster: string;
  serial: number;
  refresh: number;
  retry: number;
  expire: number;
  minttl: number;
}

export interface DnsRecords {
  a: string[];
  aaaa: string[];
  cname: string[];
  mx: MxRecord[];
  ns: string[];
  txt: string[][];
  soa: SoaRecord | null;
  reverseDns: string | null;
  resolutionTimeMs: number;
  error?: string;
}

/**
 * Cloudflare / Google DoH query fallback for environments where UDP port 53 is restricted (e.g. Vercel Serverless).
 */
async function dohQuery(domain: string, type: string): Promise<any[]> {
  try {
    const res = await axios.get(`https://cloudflare-dns.com/dns-query`, {
      params: { name: domain, type },
      headers: { Accept: 'application/dns-json' },
      timeout: 2500,
    });
    if (res.data && res.data.Answer && Array.isArray(res.data.Answer)) {
      return res.data.Answer;
    }
  } catch {
    // Fallback to Google DoH if Cloudflare fails
    try {
      const res = await axios.get(`https://dns.google/resolve`, {
        params: { name: domain, type },
        timeout: 2500,
      });
      if (res.data && res.data.Answer && Array.isArray(res.data.Answer)) {
        return res.data.Answer;
      }
    } catch {
      // return empty array on failure
    }
  }
  return [];
}

/**
 * Perform full DNS resolution for a domain with DoH fallback.
 */
export async function resolveDnsRecords(domain: string): Promise<DnsRecords> {
  const startTime = Date.now();

  const results: DnsRecords = {
    a: [],
    aaaa: [],
    cname: [],
    mx: [],
    ns: [],
    txt: [],
    soa: null,
    reverseDns: null,
    resolutionTimeMs: 0,
  };

  const safeWithTimeout = async <T>(fn: () => Promise<T>, defaultValue: T, timeoutMs = 2000): Promise<T> => {
    try {
      const timeoutPromise = new Promise<T>((_, reject) =>
        setTimeout(() => reject(new Error('DNS Timeout')), timeoutMs)
      );
      return await Promise.race([fn(), timeoutPromise]);
    } catch {
      return defaultValue;
    }
  };

  try {
    const [aNative, aaaaNative, cnameNative, mxNative, nsNative, txtNative, soaNative] = await Promise.all([
      safeWithTimeout(() => dns.resolve4(domain), []),
      safeWithTimeout(() => dns.resolve6(domain), []),
      safeWithTimeout(() => dns.resolveCname(domain), []),
      safeWithTimeout(() => dns.resolveMx(domain), []),
      safeWithTimeout(() => dns.resolveNs(domain), []),
      safeWithTimeout(() => dns.resolveTxt(domain), []),
      safeWithTimeout(() => dns.resolveSoa(domain), null),
    ]);

    results.a = Array.isArray(aNative) ? aNative : [];
    results.aaaa = Array.isArray(aaaaNative) ? aaaaNative : [];
    results.cname = Array.isArray(cnameNative) ? cnameNative : [];
    results.mx = Array.isArray(mxNative) ? mxNative : [];
    results.ns = Array.isArray(nsNative) ? nsNative : [];
    results.txt = Array.isArray(txtNative) ? txtNative : [];
    results.soa = soaNative;
  } catch {
    // Native DNS lookup completely unsupported on platform; rely on DoH below
  }

  // DoH Fallbacks for Serverless Environments
  try {
    if (results.a.length === 0) {
      const dohA = await dohQuery(domain, 'A');
      results.a = dohA
        .filter((rec: any) => rec && rec.type === 1 && rec.data)
        .map((rec: any) => String(rec.data));
    }

    if (results.aaaa.length === 0) {
      const dohAAAA = await dohQuery(domain, 'AAAA');
      results.aaaa = dohAAAA
        .filter((rec: any) => rec && rec.type === 28 && rec.data)
        .map((rec: any) => String(rec.data));
    }

    if (results.cname.length === 0) {
      const dohCname = await dohQuery(domain, 'CNAME');
      results.cname = dohCname
        .filter((rec: any) => rec && rec.type === 5 && rec.data)
        .map((rec: any) => String(rec.data).replace(/\.$/, ''));
    }

    if (results.ns.length === 0) {
      const dohNs = await dohQuery(domain, 'NS');
      results.ns = dohNs
        .filter((rec: any) => rec && rec.type === 2 && rec.data)
        .map((rec: any) => String(rec.data).replace(/\.$/, ''));
    }

    if (results.mx.length === 0) {
      const dohMx = await dohQuery(domain, 'MX');
      results.mx = dohMx
        .filter((rec: any) => rec && rec.type === 15 && rec.data)
        .map((rec: any) => {
          const parts = String(rec.data).split(' ');
          return {
            priority: parseInt(parts[0] || '10', 10),
            exchange: (parts[1] || '').replace(/\.$/, ''),
          };
        });
    }

    if (results.txt.length === 0) {
      const dohTxt = await dohQuery(domain, 'TXT');
      results.txt = dohTxt
        .filter((rec: any) => rec && rec.type === 16 && rec.data)
        .map((rec: any) => [String(rec.data).replace(/^"|"$/g, '')]);
    }
  } catch {
    // Fail-safe catch for DoH parsing
  }

  // Try reverse DNS for the primary IPv4 address
  if (results.a.length > 0) {
    try {
      const hostnames = await safeWithTimeout(() => dns.reverse(results.a[0]), [], 1500);
      if (hostnames && hostnames.length > 0) {
        results.reverseDns = hostnames[0];
      }
    } catch {
      results.reverseDns = null;
    }
  }

  results.resolutionTimeMs = Date.now() - startTime;
  return results;
}
