import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { FileText, X, ShieldCheck, Server, Calendar, Globe, Copy, Check, RefreshCw } from 'lucide-react';
import axios from 'axios';
import { WhoisData } from '../types';

interface WhoisModalProps {
  isOpen: boolean;
  domainName: string;
  onClose: () => void;
  onCopySuccess: (text: string) => void;
}

export const WhoisModal: React.FC<WhoisModalProps> = ({
  isOpen,
  domainName,
  onClose,
  onCopySuccess,
}) => {
  const [whoisData, setWhoisData] = useState<WhoisData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'structured' | 'raw'>('structured');
  const [copiedRaw, setCopiedRaw] = useState(false);

  useEffect(() => {
    if (isOpen && domainName) {
      fetchWhois();
    }
  }, [isOpen, domainName]);

  const fetchWhois = async () => {
    setLoading(true);
    setError(null);
    try {
      const resp = await axios.get(`/api/whois/${encodeURIComponent(domainName)}`);
      setWhoisData(resp.data);
    } catch (err: any) {
      const respErr = err.response?.data?.error;
      let msg = 'Failed to fetch WHOIS information.';

      if (typeof respErr === 'string') {
        msg = respErr;
      } else if (respErr && typeof respErr === 'object') {
        msg = typeof respErr.message === 'string' ? respErr.message : JSON.stringify(respErr);
      } else if (typeof err.message === 'string') {
        msg = err.message;
      }

      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return 'N/A';
    try {
      return new Date(dateStr).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  const handleCopyRaw = () => {
    if (whoisData?.rawWhois) {
      navigator.clipboard.writeText(whoisData.rawWhois);
      setCopiedRaw(true);
      onCopySuccess('Copied raw WHOIS output');
      setTimeout(() => setCopiedRaw(false), 2000);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="relative w-full max-w-3xl max-h-[85vh] flex flex-col bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden text-slate-200"
        >
          {/* Modal Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/50">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-purple-950/80 border border-purple-800/80 text-purple-400">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-white font-sans flex items-center gap-2">
                  <span>WHOIS & RDAP Lookup</span>
                  <span className="text-xs font-mono font-normal px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
                    {domainName}
                  </span>
                </h3>
                <p className="text-xs text-slate-400 font-mono">Domain Registration & Administrative Records</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={fetchWhois}
                disabled={loading}
                title="Refresh WHOIS data"
                className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              </button>
              <button
                type="button"
                onClick={onClose}
                className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Modal Body */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {loading ? (
              <div className="py-16 text-center space-y-3 font-mono">
                <div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-sm text-cyan-300">Querying ICANN RDAP & Registry Databases...</p>
              </div>
            ) : error ? (
              <div className="p-4 rounded-xl bg-rose-950/50 border border-rose-800/80 text-rose-300 font-mono text-sm text-center">
                ⚠️ {error}
              </div>
            ) : whoisData ? (
              <>
                {/* Tabs selection */}
                <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
                  <button
                    type="button"
                    onClick={() => setActiveTab('structured')}
                    className={`px-4 py-2 text-xs font-mono font-semibold rounded-lg transition-all ${
                      activeTab === 'structured'
                        ? 'bg-purple-950 text-purple-300 border border-purple-800 shadow-[0_0_10px_rgba(168,85,247,0.2)]'
                        : 'bg-slate-800/60 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Structured Summary
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('raw')}
                    className={`px-4 py-2 text-xs font-mono font-semibold rounded-lg transition-all ${
                      activeTab === 'raw'
                        ? 'bg-purple-950 text-purple-300 border border-purple-800 shadow-[0_0_10px_rgba(168,85,247,0.2)]'
                        : 'bg-slate-800/60 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Raw RDAP/WHOIS Data
                  </button>
                </div>

                {activeTab === 'structured' ? (
                  <div className="space-y-4 font-sans text-sm">
                    {/* Registrar & Country */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800">
                        <div className="flex items-center gap-2 text-xs font-mono text-slate-400 mb-1">
                          <ShieldCheck className="w-4 h-4 text-purple-400" />
                          <span>Registrar Name</span>
                        </div>
                        <div className="font-bold text-white text-base">
                          {whoisData.registrar || 'Unknown Registrar'}
                        </div>
                      </div>

                      <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800">
                        <div className="flex items-center gap-2 text-xs font-mono text-slate-400 mb-1">
                          <Globe className="w-4 h-4 text-cyan-400" />
                          <span>Registrant Country</span>
                        </div>
                        <div className="font-bold text-white text-base">
                          {whoisData.registrantCountry || 'Privacy Protected / N/A'}
                        </div>
                      </div>
                    </div>

                    {/* Registration Dates */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono">
                      <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800">
                        <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
                          <Calendar className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Creation Date</span>
                        </div>
                        <div className="text-sm font-bold text-emerald-300">
                          {formatDate(whoisData.registrationDate)}
                        </div>
                      </div>

                      <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800">
                        <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
                          <Calendar className="w-3.5 h-3.5 text-rose-400" />
                          <span>Expiration Date</span>
                        </div>
                        <div className="text-sm font-bold text-rose-300">
                          {formatDate(whoisData.expirationDate)}
                        </div>
                      </div>

                      <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800">
                        <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
                          <Calendar className="w-3.5 h-3.5 text-cyan-400" />
                          <span>Last Updated</span>
                        </div>
                        <div className="text-sm font-bold text-cyan-300">
                          {formatDate(whoisData.updatedDate)}
                        </div>
                      </div>
                    </div>

                    {/* Name Servers */}
                    {whoisData.nameServers && whoisData.nameServers.length > 0 && (
                      <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 font-mono">
                        <div className="flex items-center gap-2 text-xs text-slate-400 mb-2">
                          <Server className="w-4 h-4 text-teal-400" />
                          <span>Authoritative Name Servers</span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {whoisData.nameServers.map((ns, idx) => (
                            <div
                              key={idx}
                              className="px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-xs text-teal-300 font-medium"
                            >
                              {ns}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Domain Status */}
                    {whoisData.domainStatus && whoisData.domainStatus.length > 0 && (
                      <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 font-mono">
                        <div className="text-xs text-slate-400 mb-2">Domain Status Flags</div>
                        <div className="flex flex-wrap gap-2">
                          {whoisData.domainStatus.map((st, idx) => (
                            <span
                              key={idx}
                              className="px-2.5 py-1 text-xs rounded bg-purple-950/80 text-purple-300 border border-purple-800"
                            >
                              {st}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  /* Raw WHOIS Output */
                  <div className="relative">
                    <div className="absolute top-3 right-3">
                      <button
                        type="button"
                        onClick={handleCopyRaw}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg border border-slate-700 transition-colors"
                      >
                        {copiedRaw ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                            <span>Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>Copy Raw JSON</span>
                          </>
                        )}
                      </button>
                    </div>

                    <pre className="p-4 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs text-slate-300 overflow-x-auto max-h-[400px] leading-relaxed">
                      {whoisData.rawWhois || 'No raw WHOIS text available.'}
                    </pre>
                  </div>
                )}
              </>
            ) : null}
          </div>

          {/* Modal Footer */}
          <div className="px-6 py-3 border-t border-slate-800 bg-slate-950/50 flex justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-white font-mono text-xs font-semibold rounded-xl transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
