'use client';

import { useState } from 'react';

interface ScanResult {
  status: string;
  color: string;
  emoji: string;
  message: string;
  url: string;
  timestamp: string;
  stats?: {
    malicious: number;
    suspicious: number;
    harmless: number;
    undetected: number;
    total: number;
  };
}

export default function Home() {
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [isHovered, setIsHovered] = useState(false);

  const handleScan =async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!url.trim()) return;

    setIsLoading(true);
    setScanResult(null);

    try {
      const response = await fetch('/api/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: url.trim() })
      });

      const data = await response.json();

      if (data.success) {
        setScanResult({
          status: data.status,
          color: data.color,
          emoji: data.emoji,
          message: data.message,
          url: data.url,
          timestamp: new Date(data.timestamp).toLocaleString(),
          stats: data.stats
        });
      } else {
        setScanResult({
          status: 'Error',
          color: '#ef4444',
          emoji: '❌',
          message: data.message || 'Failed to scan URL',
          url: url,
          timestamp: new Date().toLocaleString()
        });
      }
    } catch (error) {
      setScanResult({
        status: 'Error',
        color: '#ef4444',
        emoji: '❌',
        message: 'Network error. Please try again.',
        url: url,
        timestamp: new Date().toLocaleString()
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#0f172a] text-white flex flex-col items-center justify-center p-5 font-['Segoe_UI',_Tahoma,_Geneva,_Verdana,_sans-serif]">
      {/* Header */}
      <div className="text-center mb-10">
        <h1 className="text-5xl md:text-6xl font-bold mb-3 tracking-tight">
          🛡️ LinkShield AI
        </h1>
        <p className="text-xl text-slate-400 font-light">
          Scan Before You Click
        </p>
      </div>

      {/* URL Scanner Form */}
      <form onSubmit={handleScan} className="w-full max-w-2xl flex flex-col gap-4">
        <input
          type="text"
          placeholder="Enter URL to scan (e.g., https://example.com)"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          disabled={isLoading}
          className="w-full px-5 py-4 text-base bg-slate-800 text-white border-2 border-slate-700 rounded-xl outline-none transition-all duration-300 disabled:opacity-50 focus:border-blue-500 focus:bg-[#0f172a]"
        />

        <button
          type="submit"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          disabled={!url.trim() || isLoading}
          className={`w-full px-5 py-4 text-lg font-semibold text-white border-none rounded-xl cursor-pointer transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed ${
            isHovered && url.trim() && !isLoading
              ? 'bg-blue-700 -translate-y-0.5 shadow-[0_10px_25px_rgba(59,130,246,0.4)]'
              : 'bg-blue-600 shadow-[0_4px_15px_rgba(59,130,246,0.2)]'
          }`}
        >
          {isLoading ? '🔄 Scanning...' : '🔍 Scan URL'}
        </button>
      </form>

      {/* Loading */}
      {isLoading && (
        <div className="mt-8 text-center">
          <div className="w-12 h-12 border-4 border-slate-800 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-400 text-sm">Scanning with VirusTotal API...</p>
          <p className="text-slate-600 text-xs mt-2">This may take a few seconds</p>
        </div>
      )}

      {/* Result Card */}
      {scanResult && !isLoading && (
        <div
          className="w-full max-w-2xl mt-8 p-6 bg-slate-800 rounded-2xl animate-slideIn"
          style={{
            border: `2px solid ${scanResult.color}`,
            boxShadow: `0 8px 30px ${scanResult.color}40`
          }}
        >
          {/* Result Header */}
          <div className="flex items-center gap-3 mb-5 pb-4 border-b border-slate-700">
            <span className="text-3xl">{scanResult.emoji}</span>
            <div>
              <h2 className="text-2xl font-bold m-0" style={{ color: scanResult.color }}>
                {scanResult.status}
              </h2>
              <p className="text-slate-400 text-xs mt-1">
                Scanned on {scanResult.timestamp}
              </p>
            </div>
          </div>

          {/* Message */}
          <p className="text-slate-300 text-base leading-relaxed mb-4">
            {scanResult.message}
          </p>

          {/* Stats Grid */}
          {scanResult.stats && (
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="bg-[#0f172a] p-3 rounded-lg text-center">
                <div className="text-2xl font-bold text-red-500">{scanResult.stats.malicious}</div>
                <div className="text-[11px] text-slate-400 uppercase tracking-wide">Malicious</div>
              </div>
              <div className="bg-[#0f172a] p-3 rounded-lg text-center">
                <div className="text-2xl font-bold text-yellow-500">{scanResult.stats.suspicious}</div>
                <div className="text-[11px] text-slate-400 uppercase tracking-wide">Suspicious</div>
              </div>
              <div className="bg-[#0f172a] p-3 rounded-lg text-center">
                <div className="text-2xl font-bold text-green-500">{scanResult.stats.harmless}</div>
                <div className="text-[11px] text-slate-400 uppercase tracking-wide">Harmless</div>
              </div>
              <div className="bg-[#0f172a] p-3 rounded-lg text-center">
                <div className="text-2xl font-bold text-slate-500">{scanResult.stats.undetected}</div>
                <div className="text-[11px] text-slate-400 uppercase tracking-wide">Undetected</div>
              </div>
            </div>
          )}

          {/* URL Display */}
          <div className="bg-[#0f172a] p-3 rounded-lg break-all mb-4">
            <span className="text-slate-500 text-xs font-semibold uppercase tracking-wide">URL:</span>
            <p className="text-slate-200 text-sm mt-1">{scanResult.url}</p>
          </div>

          {/* Scan Again Button */}
          <button
            onClick={() => {
              setScanResult(null);
              setUrl('');
            }}
            className="w-full p-3 text-sm font-semibold text-slate-400 bg-[#0f172a] border border-slate-700 rounded-lg cursor-pointer transition-all duration-200 hover:bg-slate-800 hover:text-white"
          >
            🔄 Scan Another URL
          </button>
        </div>
      )}

      {/* Footer */}
      <p className="mt-10 text-slate-600 text-sm text-center">
        Powered by VirusTotal API
      </p>

      <style jsx>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-slideIn {
          animation: slideIn 0.5s ease-out;
        }
      `}</style>
    </main>
  );
}
