'use client';

import { useState, useEffect } from 'react';

interface EngineResult {
  engine: string;
  result: string;
  category: string;
}

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
  engineResults?: EngineResult[];
  categories?: string[];
  domainInfo?: {
    age?: string;
    reputation?: number;
    registrar?: string;
  };
}

export default function Home() {
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [threatScore, setThreatScore] = useState(0);
  const [loadingText, setLoadingText] = useState('');
  const [pendingUrl, setPendingUrl] = useState('');
  const [analysisId, setAnalysisId] = useState('');

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
      
      // Calculate threat score (0-100) based on detection percentage
      // Weight malicious detections more heavily
      const threatCount = (malicious * 2) + suspicious;
      const maxPossible = total * 2; // Maximum if all were malicious
      const score = Math.min(100, Math.round((threatCount / maxPossible) * 100));
      
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
    setAnalysisId('');

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
          stats: data.stats,
          engineResults: data.engineResults || [],
          categories: data.categories || [],
          domainInfo: data.domainInfo || {}
        };
        setScanResult(result);
        
        // If status is pending, save the URL and analysis ID for later checks
        if (data.status === 'Pending') {
          setPendingUrl(url.trim());
          setAnalysisId(data.analysisId || '');
        }
      } else {
        setScanResult({
          status: 'ERROR',
          color: '#ff003c',
          emoji: '❌',
          message: data.message || 'Failed to scan URL',
          url: url,
          timestamp: new Date().toLocaleString(),
          stats: { malicious: 0, suspicious: 0, harmless: 0, undetected: 0, total: 0 },
          engineResults: [],
          categories: [],
          domainInfo: {}
        });
      }
    } catch (error) {
      setScanResult({
        status: 'ERROR',
        color: '#ff003c',
        emoji: '❌',
        message: 'Network error. Please try again.',
        url: url,
        timestamp: new Date().toLocaleString(),
        stats: { malicious: 0, suspicious: 0, harmless: 0, undetected: 0, total: 0 },
        engineResults: [],
        categories: [],
        domainInfo: {}
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCheckResults = async () => {
    if (!analysisId) return;

    setIsLoading(true);
    setLoadingText('🔄 Fetching updated results...');

    try {
      const response = await fetch('/api/check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ analysisId: analysisId })
      });

      const data = await response.json();

      if (data.success) {
        const result = {
          status: data.status,
          color: data.color,
          emoji: data.emoji,
          message: data.message,
          url: pendingUrl,
          timestamp: new Date(data.timestamp).toLocaleString(),
          stats: data.stats,
          engineResults: data.engineResults || [],
          categories: data.categories || [],
          domainInfo: data.domainInfo || {}
        };
        setScanResult(result);
        
        // If still pending, keep the IDs for another check
        const isPending = data.status.toUpperCase() === 'PENDING';
        if (!isPending) {
          setPendingUrl('');
          setAnalysisId('');
        }
      } else {
        setScanResult({
          status: 'ERROR',
          color: '#ff003c',
          emoji: '❌',
          message: data.message || 'Failed to check results',
          url: pendingUrl,
          timestamp: new Date().toLocaleString(),
          stats: { malicious: 0, suspicious: 0, harmless: 0, undetected: 0, total: 0 },
          engineResults: [],
          categories: [],
          domainInfo: {}
        });
      }
    } catch (error) {
      setScanResult({
        status: 'ERROR',
        color: '#ff003c',
        emoji: '❌',
        message: 'Network error. Please try again.',
        url: pendingUrl,
        timestamp: new Date().toLocaleString(),
        stats: { malicious: 0, suspicious: 0, harmless: 0, undetected: 0, total: 0 },
        engineResults: [],
        categories: [],
        domainInfo: {}
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getThreatLevel = (score: number): string => {
    if (score === 0) return 'safe';
    if (score <= 10) return 'low-risk';
    if (score <= 40) return 'suspicious';
    if (score <= 70) return 'dangerous';
    return 'critical';
  };

  const getStatusClass = (status: string): string => {
    const upperStatus = status.toUpperCase();
    if (upperStatus === 'SAFE') return 'safe';
    if (upperStatus === 'LOW RISK') return 'low-risk';
    if (upperStatus === 'SUSPICIOUS') return 'suspicious';
    if (upperStatus === 'DANGEROUS') return 'dangerous';
    if (upperStatus === 'CRITICAL') return 'critical';
    if (upperStatus === 'PENDING') return 'pending';
    return 'dangerous';
  };

  const isPendingStatus = (status: string): boolean => {
    return status.toUpperCase() === 'PENDING';
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
          {scanResult && isPendingStatus(scanResult.status) && (
            <>
              {/* Explanation Box */}
              <div className="explanation-box">
                <p>{scanResult.message}</p>
                <p style={{ marginTop: '1rem', fontSize: '0.9rem', opacity: 0.8 }}>
                  VirusTotal is analyzing this URL across 70+ security engines. 
                  Wait 30-60 seconds, then click the button below to fetch results.
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
                Analysis complete? Click above to fetch your results
              </p>
            </>
          )}

          {/* Normal Result State - Show Stats */}
          {scanResult && !isPendingStatus(scanResult.status) && (
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

              {/* Extended Information Grid */}
              <div className="extended-info-grid">
                {/* Engine Verdicts */}
                {scanResult.engineResults && scanResult.engineResults.length > 0 && (
                  <div className="info-section">
                    <h3 className="info-title">🛡️ Security Engine Verdicts</h3>
                    <p className="info-description">
                      Individual results from top antivirus and security engines
                    </p>
                    <div className="engine-list">
                      {scanResult.engineResults.map((engine, idx) => (
                        <div key={idx} className={`engine-item ${engine.result.toLowerCase()}`}>
                          <span className="engine-icon">
                            {engine.result === 'malicious' ? '🚨' : 
                             engine.result === 'suspicious' ? '⚠️' : '✅'}
                          </span>
                          <span className="engine-name">{engine.engine}</span>
                          <span className="engine-verdict">{engine.category || engine.result}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Threat Categories - Only show when threats detected */}
                {scanResult.categories && scanResult.categories.length > 0 && (scanResult.stats?.malicious || 0) > 0 && (
                  <div className="info-section">
                    <h3 className="info-title">🎯 Detected Threat Types</h3>
                    <p className="info-description">
                      Categories of malicious content found by security engines
                    </p>
                    <div className="category-badges">
                      {scanResult.categories.map((category, idx) => (
                        <span key={idx} className="category-badge">
                          {category === 'phishing' ? '🎣' :
                           category === 'malware' ? '🦠' :
                           category === 'scam' ? '💰' :
                           category === 'spam' ? '📧' : '⚠️'} {category}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Safety Tips */}
                <div className="info-section">
                  <h3 className="info-title">💡 Safety Tips</h3>
                  <p className="info-description">
                    {scanResult.status === 'SAFE' || scanResult.status === 'LOW RISK' 
                      ? 'Best practices to stay protected online'
                      : 'Critical safety advice for this threat level'}
                  </p>
                  <div className="safety-tips-list">
                    {scanResult.status === 'CRITICAL' || scanResult.status === 'DANGEROUS' ? (
                      <>
                        <div className="safety-tip critical">
                          <span className="tip-icon">🚫</span>
                          <div>
                            <strong>DO NOT VISIT THIS URL</strong>
                            <p>This link has been flagged as highly malicious by multiple security vendors.</p>
                          </div>
                        </div>
                        <div className="safety-tip">
                          <span className="tip-icon">🛡️</span>
                          <div>
                            <strong>Protect Your Device</strong>
                            <p>Visiting this URL could result in malware infection, data theft, or financial loss.</p>
                          </div>
                        </div>
                        <div className="safety-tip">
                          <span className="tip-icon">📞</span>
                          <div>
                            <strong>Report It</strong>
                            <p>If you received this link via email or message, report it as phishing or spam.</p>
                          </div>
                        </div>
                      </>
                    ) : scanResult.status === 'SUSPICIOUS' ? (
                      <>
                        <div className="safety-tip warning">
                          <span className="tip-icon">⚠️</span>
                          <div>
                            <strong>Exercise Caution</strong>
                            <p>Multiple security engines flagged this URL. Avoid entering personal information.</p>
                          </div>
                        </div>
                        <div className="safety-tip">
                          <span className="tip-icon">🔒</span>
                          <div>
                            <strong>Use Protection</strong>
                            <p>Only visit with a VPN and updated antivirus if absolutely necessary.</p>
                          </div>
                        </div>
                        <div className="safety-tip">
                          <span className="tip-icon">🔍</span>
                          <div>
                            <strong>Verify Source</strong>
                            <p>Double-check who sent you this link and if it's legitimate.</p>
                          </div>
                        </div>
                      </>
                    ) : scanResult.status === 'LOW RISK' ? (
                      <>
                        <div className="safety-tip">
                          <span className="tip-icon">👁️</span>
                          <div>
                            <strong>Stay Alert</strong>
                            <p>Some engines detected minor issues. This could be a false positive.</p>
                          </div>
                        </div>
                        <div className="safety-tip">
                          <span className="tip-icon">🚪</span>
                          <div>
                            <strong>Proceed Carefully</strong>
                            <p>Avoid downloading files or entering sensitive information until you verify the site.</p>
                          </div>
                        </div>
                        <div className="safety-tip">
                          <span className="tip-icon">🎯</span>
                          <div>
                            <strong>Trust Your Instincts</strong>
                            <p>If something feels off, it probably is. When in doubt, don't click.</p>
                          </div>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="safety-tip safe">
                          <span className="tip-icon">✅</span>
                          <div>
                            <strong>URL Appears Safe</strong>
                            <p>No security engines detected threats, but always stay vigilant online.</p>
                          </div>
                        </div>
                        <div className="safety-tip">
                          <span className="tip-icon">🔑</span>
                          <div>
                            <strong>Look for HTTPS</strong>
                            <p>Always verify the URL starts with "https://" for encrypted connections.</p>
                          </div>
                        </div>
                        <div className="safety-tip">
                          <span className="tip-icon">📧</span>
                          <div>
                            <strong>Beware of Phishing</strong>
                            <p>Scammers can make fake sites look real. Check the URL carefully for typos.</p>
                          </div>
                        </div>
                        <div className="safety-tip">
                          <span className="tip-icon">💳</span>
                          <div>
                            <strong>Never Share Sensitive Data</strong>
                            <p>Legitimate sites won't ask for passwords or credit cards via email links.</p>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </div>
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
