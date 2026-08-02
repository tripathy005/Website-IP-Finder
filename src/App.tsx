import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Navbar } from './components/Navbar';
import { NetworkBackground } from './components/NetworkBackground';
import { HeroSection } from './components/HeroSection';
import { AnimatedLoader } from './components/AnimatedLoader';
import { ResultDashboard } from './components/ResultDashboard';
import { SearchHistory } from './components/SearchHistory';
import { ToastProvider } from './components/ToastProvider';
import { Footer } from './components/Footer';
import { LookupResult, HistoryItem, ToastMessage } from './types';

const HISTORY_STORAGE_KEY = 'website_ip_finder_history_v2';

export default function App() {
  const [lookupResult, setLookupResult] = useState<LookupResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Load history from localStorage on initial load
  useEffect(() => {
    try {
      const saved = localStorage.getItem(HISTORY_STORAGE_KEY);
      if (saved) {
        setHistory(JSON.parse(saved));
      }
    } catch (e) {
      console.error('Failed to parse search history:', e);
    }
  }, []);

  // Save history to localStorage whenever it changes
  const saveHistory = (items: HistoryItem[]) => {
    setHistory(items);
    try {
      localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(items));
    } catch (e) {
      console.error('Failed to save search history:', e);
    }
  };

  const addToast = (type: 'success' | 'error' | 'info', message: string) => {
    const id = Date.now().toString() + Math.random().toString().slice(2, 5);
    setToasts((prev) => [...prev, { id, type, message }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  };

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const handleSearch = async (domainInput: string) => {
    if (!domainInput || isLoading) return;

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const response = await axios.post<LookupResult>('/api/lookup', {
        input: domainInput,
      });

      const data = response.data;
      setLookupResult(data);

      // Add to search history
      const newHistoryItem: HistoryItem = {
        id: Date.now().toString(),
        domain: data.domainInfo.domain,
        ip: data.ipAddresses.primaryIp,
        country: data.hostingDetails.country,
        countryCode: data.hostingDetails.countryCode,
        timestamp: Date.now(),
      };

      // Filter existing item with same domain to avoid duplicates, keep last 10
      const updatedHistory = [
        newHistoryItem,
        ...history.filter((h) => h.domain.toLowerCase() !== data.domainInfo.domain.toLowerCase()),
      ].slice(0, 10);

      saveHistory(updatedHistory);
      addToast('success', `Resolved IP address for ${data.domainInfo.domain}`);
    } catch (err: any) {
      const msg =
        err.response?.data?.error ||
        err.message ||
        'Unable to resolve domain. Please check the website URL and try again.';
      setErrorMessage(msg);
      addToast('error', msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefreshCurrent = () => {
    if (lookupResult?.domainInfo?.domain) {
      handleSearch(lookupResult.domainInfo.domain);
    }
  };

  const handleDeleteHistoryItem = (id: string) => {
    const filtered = history.filter((item) => item.id !== id);
    saveHistory(filtered);
    addToast('info', 'Removed domain from search history.');
  };

  const handleClearHistory = () => {
    saveHistory([]);
    addToast('info', 'Search history cleared.');
  };

  const handleReset = () => {
    setLookupResult(null);
    setErrorMessage(null);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 font-sans selection:bg-cyan-500 selection:text-black antialiased relative overflow-x-hidden">
      {/* Animated Cyber Canvas Network Background */}
      <NetworkBackground />

      {/* Header Bar */}
      <Navbar onResetSearch={handleReset} systemStatus={!errorMessage} />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col">
        {/* Hero & Search Section */}
        <HeroSection
          onSearch={handleSearch}
          isLoading={isLoading}
          initialValue={lookupResult?.domainInfo?.domain || ''}
          errorMessage={errorMessage}
        />

        {/* Loading Animation Experience */}
        {isLoading && <AnimatedLoader />}

        {/* Search Results Dashboard */}
        {!isLoading && lookupResult && (
          <ResultDashboard
            result={lookupResult}
            onRefresh={handleRefreshCurrent}
            isLoading={isLoading}
            onCopySuccess={(msg) => addToast('success', msg)}
          />
        )}

        {/* Search History Panel */}
        <SearchHistory
          history={history}
          onSelectDomain={(domain) => handleSearch(domain)}
          onDeleteItem={handleDeleteHistoryItem}
          onClearHistory={handleClearHistory}
        />
      </main>

      {/* Toast Notification Overlay */}
      <ToastProvider toasts={toasts} onDismiss={dismissToast} />

      {/* Footer */}
      <Footer />
    </div>
  );
}
