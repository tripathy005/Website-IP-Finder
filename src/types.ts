/**
 * Shared Type Definitions for Website IP Finder
 */

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
}

export interface DomainInfo {
  rawInput: string;
  domain: string;
  hostname: string;
  reverseDns: string;
  isIp: boolean;
  ipVersion: string;
  status: string;
}

export interface IpAddresses {
  ipv4: string[];
  ipv6: string[];
  primaryIp: string;
}

export interface IspDetails {
  isp: string;
  org: string;
  asn: string;
  networkProvider: string;
}

export interface HostingDetails {
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
  responseTimeMs: number;
  dnsResolutionTimeMs: number;
  httpsEnabled: boolean;
  httpStatusCode?: number;
  serverHeader: string;
  ssl: SslInfo;
}

export interface LookupResult {
  domainInfo: DomainInfo;
  ipAddresses: IpAddresses;
  dnsRecords: DnsRecords;
  ispDetails: IspDetails;
  hostingDetails: HostingDetails;
  networkHealth: NetworkHealth;
  timestamp?: number;
}

export interface WhoisData {
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

export interface HistoryItem {
  id: string;
  domain: string;
  ip: string;
  country: string;
  countryCode: string;
  timestamp: number;
}

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
}
