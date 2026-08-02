/**
 * Utility functions for domain parsing, normalization, and validation.
 */

export interface NormalizedDomain {
  rawInput: string;
  domain: string; // Clean hostname e.g. "example.com" or "sub.example.com"
  protocol?: string; // "http:" or "https:" if provided
  port?: number;
  isValid: boolean;
  error?: string;
  isIp: boolean;
}

/**
 * Normalizes input URL or domain string into clean domain/hostname.
 */
export function normalizeDomain(input: string): NormalizedDomain {
  if (!input || typeof input !== 'string') {
    return {
      rawInput: input || '',
      domain: '',
      isValid: false,
      error: 'Domain or URL cannot be empty.',
      isIp: false,
    };
  }

  let cleaned = input.trim();

  // Strip trailing slashes and quotes
  cleaned = cleaned.replace(/^["']|["']$/g, '').trim();

  let protocol: string | undefined;
  let port: number | undefined;

  // Check if starts with http:// or https://
  if (/^https?:\/\//i.test(cleaned)) {
    try {
      const parsedUrl = new URL(cleaned);
      protocol = parsedUrl.protocol;
      cleaned = parsedUrl.hostname;
      if (parsedUrl.port) {
        port = parseInt(parsedUrl.port, 10);
      }
    } catch {
      // Fallback clean if URL constructor fails
      cleaned = cleaned.replace(/^https?:\/\//i, '').split('/')[0].split('?')[0].split('#')[0];
    }
  } else {
    // If user typed example.com/path or example.com:8080
    cleaned = cleaned.split('/')[0].split('?')[0].split('#')[0];
    if (cleaned.includes(':') && !cleaned.includes('[')) {
      const parts = cleaned.split(':');
      cleaned = parts[0];
      if (parts[1] && !isNaN(Number(parts[1]))) {
        port = parseInt(parts[1], 10);
      }
    }
  }

  // Remove trailing dots
  cleaned = cleaned.replace(/\.$/, '').toLowerCase();

  // Check if IPv4 or IPv6
  const isIpv4 = /^(\d{1,3}\.){3}\d{1,3}$/.test(cleaned);
  const isIpv6 = cleaned.includes(':') || /^[0-9a-fA-F:]+$/.test(cleaned);
  const isIp = isIpv4 || isIpv6;

  if (isIpv4) {
    const octets = cleaned.split('.').map(Number);
    const validOctets = octets.every(o => o >= 0 && o <= 255);
    if (!validOctets) {
      return {
        rawInput: input,
        domain: cleaned,
        isValid: false,
        error: 'Invalid IP address octets.',
        isIp: true,
      };
    }
  }

  // Domain name validation regex (allows subdomains and IDNs)
  const domainRegex = /^(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,63}$/;

  const isValidDomain = domainRegex.test(cleaned);

  if (!isIp && !isValidDomain && cleaned !== 'localhost') {
    return {
      rawInput: input,
      domain: cleaned,
      isValid: false,
      error: 'Invalid domain format. Example: example.com or www.example.com',
      isIp: false,
    };
  }

  return {
    rawInput: input,
    domain: cleaned,
    protocol,
    port,
    isValid: true,
    isIp,
  };
}
