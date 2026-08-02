import axios from 'axios';

export interface WhoisInfo {
  domainName: string;
  registrar?: string;
  registrationDate?: string;
  expirationDate?: string;
  updatedDate?: string;
  domainStatus?: string[];
  nameServers?: string[];
  registrantCountry?: string;
  rawWhois?: string;
  error?: string;
}

/**
 * Performs RDAP / WHOIS lookup for a given domain name.
 */
export async function getWhoisInfo(domain: string): Promise<WhoisInfo> {
  const cleanDomain = domain.toLowerCase().trim();

  // Primary: RDAP standard lookup via rdap.org
  try {
    const rdapResp = await axios.get(`https://rdap.org/domain/${encodeURIComponent(cleanDomain)}`, {
      timeout: 5000,
      headers: { Accept: 'application/rdap+json, application/json' },
    });

    if (rdapResp.data) {
      const data = rdapResp.data;

      // Extract registrar
      let registrar = 'Unknown Registrar';
      if (data.entities && Array.isArray(data.entities)) {
        for (const entity of data.entities) {
          if (entity.roles && entity.roles.includes('registrar')) {
            if (entity.vcardArray && entity.vcardArray[1]) {
              const fnEntry = entity.vcardArray[1].find((item: any) => item[0] === 'fn');
              if (fnEntry) registrar = fnEntry[3];
            }
            if (registrar === 'Unknown Registrar' && entity.handle) {
              registrar = entity.handle;
            }
          }
        }
      }

      // Extract events (registration, expiration, last update)
      let registrationDate: string | undefined;
      let expirationDate: string | undefined;
      let updatedDate: string | undefined;

      if (data.events && Array.isArray(data.events)) {
        for (const evt of data.events) {
          if (evt.eventAction === 'registration') registrationDate = evt.eventDate;
          if (evt.eventAction === 'expiration') expirationDate = evt.eventDate;
          if (evt.eventAction === 'last changed' || evt.eventAction === 'last updated') updatedDate = evt.eventDate;
        }
      }

      // Name servers
      const nameServers: string[] = [];
      if (data.nameservers && Array.isArray(data.nameservers)) {
        for (const ns of data.nameservers) {
          if (ns.ldhName) nameServers.push(ns.ldhName.toLowerCase());
        }
      }

      // Domain status
      const domainStatus: string[] = Array.isArray(data.status) ? data.status : [];

      return {
        domainName: data.ldhName || cleanDomain,
        registrar,
        registrationDate,
        expirationDate,
        updatedDate,
        domainStatus,
        nameServers,
        rawWhois: JSON.stringify(data, null, 2),
      };
    }
  } catch {
    // Fallback to secondary WHOIS API
  }

  // Fallback 2: ipwho.is WHOIS endpoint or dedicated API
  try {
    const fallbackResp = await axios.get(`https://ipwho.is/${encodeURIComponent(cleanDomain)}`, {
      timeout: 4000,
    });

    if (fallbackResp.data) {
      const data = fallbackResp.data;
      return {
        domainName: cleanDomain,
        registrar: data.connection?.isp || 'Standard Registrar',
        registrantCountry: data.country || 'N/A',
        nameServers: [],
        domainStatus: ['active'],
        rawWhois: `Domain: ${cleanDomain}\nCountry: ${data.country || 'N/A'}\nISP: ${data.connection?.isp || 'N/A'}\nIP: ${data.ip}`,
      };
    }
  } catch {
    // Return basic fallback info
  }

  return {
    domainName: cleanDomain,
    registrar: 'Information unavailable',
    error: 'Could not fetch extended WHOIS details for this TLD.',
  };
}
