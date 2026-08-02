import dns from 'dns/promises';

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
 * Perform full DNS resolution for a domain.
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

  // Helper safe resolver
  const safeResolve = async <T>(fn: () => Promise<T>, defaultValue: T): Promise<T> => {
    try {
      return await fn();
    } catch {
      return defaultValue;
    }
  };

  const [a, aaaa, cname, mx, ns, txt, soa] = await Promise.all([
    safeResolve(() => dns.resolve4(domain), []),
    safeResolve(() => dns.resolve6(domain), []),
    safeResolve(() => dns.resolveCname(domain), []),
    safeResolve(() => dns.resolveMx(domain), []),
    safeResolve(() => dns.resolveNs(domain), []),
    safeResolve(() => dns.resolveTxt(domain), []),
    safeResolve(() => dns.resolveSoa(domain), null),
  ]);

  results.a = a;
  results.aaaa = aaaa;
  results.cname = cname;
  results.mx = mx;
  results.ns = ns;
  results.txt = txt;
  results.soa = soa;

  // Try reverse DNS for the primary IPv4 address if available
  if (a.length > 0) {
    try {
      const hostnames = await dns.reverse(a[0]);
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
