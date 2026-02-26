'use client';

import { useState, useEffect } from 'react';

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
  const [threatScore, setThreatScore] = useState(0);
  const [loadingText, setLoadingText] = useState('');
  const [pendingUrl, setPendingUrl] = useState('');

  const fullLoadingText = 'Scanning security engines';

  // Typing effect for loading
  useEffect(() => {
    if (isLoading) {
      let index = 0;
      setLoadingText('');
      const interval = setInterval(() => {
        if (index < fullLoadingText.length) {
          setLoadingText(fullLoadingText.substring(0, index + 1));
          index++;
        } else {
          clearInterval(interval);
        }
      }, 80);
      return () => clearInterval(interval);
    }
  }, [isLoading]);

  // Animate threat meter
  useEffect(() => {
    if (scanResult && scanResult.stats) {
      const total = scanResult.stats.total;
      const malicious = scanResult.stats.malicious || 0;
      const suspicious = scanResult.stats.suspicious || 0;
      
      // Calculate threat score (0-100)
      const score = Math.round(((malicious * 2 + suspicious) / total) * 100);
      
      setTimeout(() => {
        setThreatScore(score);
      }, 300);
    } else {
      setThreatScore(0);
    }
  }, [scanResult]);

  const handleScan = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!url.trim()) return;

    setIsLoading(true);
    setScanResult(null);
    setThreatScore(0);
    setPendingUrl('');

    try {
      const response = await fetch('/api/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: url.trim() })
      });

      const data = await response.json();

      if (data.success) {
        const result = {
          status: data.status,
          color: data.color,
          emoji: data.emoji,
          message: data.message,
          url: data.url,
          timestamp: new Date(data.timestamp).toLocaleString(),
          stats: data.stats
        };
        setScanResult(result);
        
        // If status is pending, save the URL for later checks
        if (data.status === 'Pending') {
          setPendingUrl(url.trim());
        }
      } else {
        setScanResult({
          status: 'ERROR',
          color: '#ff003c',
          emoji: '❌',
          message: data.message || 'Failed to scan URL',
          url: url,
          timestamp: new Date().toLocaleString()
        });
      }
    } catch (error) {
      setScanResult({
        status: 'ERROR',
        color: '#ff003c',
        emoji: '❌',
        message: 'Network error. Please try again.',
        url: url,
        timestamp: new Date().toLocaleString()
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCheckResults = async () => {
    if (!pendingUrl) return;

    setIsLoading(true);

    try {
      const response = await fetch('/api/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: pendingUrl })
      });

      const data = await response.json();

      if (data.success) {
        const result = {
          status: data.status,
          color: data.color,
          emoji: data.emoji,
          message: data.message,
          url: data.url,
          timestamp: new Date(data.timestamp).toLocaleString(),
          stats: data.stats
        };
        setScanResult(result);
        
        // If still pending, keep the pendingUrl for another check
        if (data.status !== 'Pending') {
          setPendingUrl('');
        }
      } else {
        setScanResult({
          status: 'ERROR',
          color: '#ff003c',
          emoji: '❌',
          message: data.message || 'Failed to check results',
          url: pendingUrl,
          timestamp: new Date().toLocaleString()
        });
      }
    } catch (error) {
      setScanResult({
        status: 'ERROR',
        color: '#ff003c',
        emoji: '❌',
        message: 'Network error. Please try again.',
        url: pendingUrl,
        timestamp: new Date().toLocaleString()
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getThreatLevel = (score: number): string => {
    if (score <= 30) return 'safe';
    if (score <= 70) return 'suspicious';
    return 'dangerous';
  };

  const getStatusClass = (status: string): string => {
    if (status === 'SAFE') return 'safe';
    if (status === 'SUSPICIOUS') return 'suspicious';
    if (status === 'PENDING' || status === 'Pending') return 'pending';
    return 'dangerous';
  };

  return (
    <main className="app-container">
      {/* Header */}
      <header className="header">
        <h1>🛡️ LinkShield AI</h1>
        <p>Scan Before You Click</p>
      </header>

      {/* Input Section */}
      <section className="input-section">
        <form onSubmit={handleScan}>
          <input
            type="text"
            className="url-input"
            placeholder="Paste suspicious link here..."
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            disabled={isLoading}
          />
          <button
            type="submit"
            className="scan-button"
            disabled={!url.trim() || isLoading}
          >
            {isLoading ? '⏳ SCANNING...' : '🔍 SCAN URL'}
          </button>
        </form>
      </section>

      {/* Loading Animation */}
      {isLoading && (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p className="loading-text">
            {loadingText}
            <span className="cursor">▊</span>
          </p>
          <p style={{ fontSize: '0.9rem', opacity: 0.6, marginTop: '0.5rem' }}>
            Analyzing with VirusTotal...
          </p>
        </div>
      )}

      {/* Result Card */}
      {scanResult && !isLoading && (
        <div className="result-card">
          {/* Result Header */}
          <div className="result-header">
            <span className="result-icon">{scanResult.emoji}</span>
            <div>
              <h2 className={`result-status ${getStatusClass(scanResult.status)}`}>
                {scanResult.status}
              </h2>
              <p style={{ fontSize: '0.8rem', opacity: 0.6, margin: '0.3rem 0 0 0' }}>
                {scanResult.timestamp}
              </p>
            </div>
          </div>

          {/* Pending State - Show Check Results Button */}
          {(scanResult.status === 'Pending' || scanResult.status === 'PENDING') && (
            <>
              {/* Explanation Box */}
              <div className="explanation-box">
                <p>{scanResult.message}</p>
                <p style={{ marginTop: '1rem', fontSize: '0.9rem', opacity: 0.8 }}>
                  VirusTotal is analyzing this URL across 70+ security engines. 
                  This usually takes 30-60 seconds.
                </p>
              </div>

              {/* URL Display */}
              <div className="url-display">
                <div className="url-label">SCANNING URL:</div>
                <div>{scanResult.url}</div>
              </div>

              {/* Check Results Button */}
              <button
                className="scan-button"
                onClick={handleCheckResults}
                style={{ marginTop: '1.5rem' }}
              >
                🔄 CHECK RESULTS
              </button>

              <p style={{ 
                textAlign: 'center', 
                fontSize: '0.85rem', 
                opacity: 0.6, 
                marginTop: '1rem' 
              }}>
                Wait at least 30 seconds before checking
              </p>
            </>
          )}

          {/* Normal Result State - Show Stats */}
          {scanResult.status !== 'Pending' && scanResult.status !== 'PENDING' && (
            <>
              {/* Threat Meter */}
              {scanResult.stats && (
                <div className="threat-meter">
                  <div className="threat-meter-label">
                    <span>THREAT LEVEL</span>
                    <span>{threatScore}%</span>
                  </div>
                  <div className="threat-meter-bar">
                    <div
                      className={`threat-meter-fill ${getThreatLevel(threatScore)}`}
                      style={{ width: `${threatScore}%` }}
                    ></div>
                  </div>
                </div>
              )}

              {/* Stats Grid */}
              {scanResult.stats && (
                <div className="stats-grid">
                  <div className="stat-item">
                    <div className="stat-value total">{scanResult.stats.total}</div>
                    <div className="stat-label">Engines Scanned</div>
                  </div>
                  <div className="stat-item">
                    <div className="stat-value malicious">{scanResult.stats.malicious}</div>
                    <div className="stat-label">Malicious</div>
                  </div>
                  <div className="stat-item">
                    <div className="stat-value suspicious">{scanResult.stats.suspicious}</div>
                    <div className="stat-label">Suspicious</div>
                  </div>
                  <div className="stat-item">
                    <div className="stat-value clean">{scanResult.stats.harmless}</div>
                    <div className="stat-label">Clean</div>
                  </div>
                </div>
              )}

              {/* Explanation Box */}
              <div className="explanation-box">
                <p>{scanResult.message}</p>
              </div>

              {/* URL Display */}
              <div className="url-display">
                <div className="url-label">SCANNED URL:</div>
                <div>{scanResult.url}</div>
              </div>

              {/* Scan Again Button */}
              <button
                className="scan-again-button"
                onClick={() => {
                  setScanResult(null);
                  setUrl('');
                  setThreatScore(0);
                  setPendingUrl('');
                }}
              >
                🔄 SCAN ANOTHER URL
              </button>
            </>
          )}
        </div>
      )}

      {/* Footer */}
      <footer className="footer">
        <p>Powered by VirusTotal API</p>
      </footer>
    </main>
  );
}
