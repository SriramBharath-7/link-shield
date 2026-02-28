import { NextRequest, NextResponse } from 'next/server';

const VIRUSTOTAL_API_KEY = process.env.VIRUSTOTAL_API_KEY || '76345dea6ea3eeb3c1dbeeb45fa96b346d4328bdbf4466068cd7d91bccf17ced';

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json();

    if (!url) {
      return NextResponse.json(
        { success: false, message: 'URL is required' },
        { status: 400 }
      );
    }

    // Encode URL for VirusTotal
    const urlId = Buffer.from(url).toString('base64').replace(/=/g, '');

    // Try to get existing scan results
    const lookupResponse = await fetch(`https://www.virustotal.com/api/v3/urls/${urlId}`, {
      method: 'GET',
      headers: {
        'x-apikey': VIRUSTOTAL_API_KEY
      }
    });

    let stats;
    let vtData;

    if (lookupResponse.ok) {
      const data = await lookupResponse.json();
      vtData = data.data.attributes;
      stats = vtData.last_analysis_stats;
    } else if (lookupResponse.status === 404) {
      // URL not in database, submit for scanning
      const formData = new URLSearchParams();
      formData.append('url', url);

      const submitResponse = await fetch('https://www.virustotal.com/api/v3/urls', {
        method: 'POST',
        headers: {
          'x-apikey': VIRUSTOTAL_API_KEY,
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: formData
      });

      if (submitResponse.ok) {
        return NextResponse.json({
          success: true,
          url: url,
          status: 'PENDING',
          color: '#64748b',
          emoji: '⏳',
          message: 'Scan submitted successfully. VirusTotal is analyzing this URL.',
          stats: {
            malicious: 0,
            suspicious: 0,
            harmless: 0,
            undetected: 0,
            total: 0
          },
          timestamp: new Date().toISOString()
        });
      } else {
        throw new Error('Failed to submit URL');
      }
    } else {
      throw new Error(`VirusTotal API error: ${lookupResponse.status}`);
    }

    // Calculate results
    const malicious = stats.malicious || 0;
    const suspicious = stats.suspicious || 0;
    const harmless = stats.harmless || 0;
    const undetected = stats.undetected || 0;
    const total = malicious + suspicious + harmless + undetected;

    let status, color, emoji, message;

    // Threshold-based detection
    if (malicious >= 40) {
      status = 'CRITICAL';
      color = '#8b0000';
      emoji = '💀';
      message = `CRITICAL THREAT: ${malicious} security vendors flagged this as malicious! This URL is extremely dangerous - DO NOT VISIT!`;
    } else if (malicious >= 20) {
      status = 'DANGEROUS';
      color = '#ef4444';
      emoji = '🚨';
      message = `High Risk: ${malicious} security vendors flagged this as malicious! Do not visit this URL.`;
    } else if (malicious >= 5 || suspicious >= 10) {
      status = 'SUSPICIOUS';
      color = '#f59e0b';
      emoji = '🟠';
      message = `Warning: ${malicious} malicious and ${suspicious} suspicious detections. Proceed with extreme caution.`;
    } else if (malicious >= 1 || suspicious >= 1) {
      status = 'LOW RISK';
      color = '#fbbf24';
      emoji = '⚠️';
      message = `Low Risk: ${malicious + suspicious} minor detection(s) found. This could be a false positive, but stay cautious.`;
    } else {
      status = 'SAFE';
      color = '#10b981';
      emoji = '✅';
      message = 'No threats detected. This URL appears to be safe.';
    }

    // Extract individual engine results (top flagged engines)
    const engineResults = [];
    if (vtData && vtData.last_analysis_results) {
      const analysisResults = vtData.last_analysis_results;
      
      // Get flagged engines first (malicious/suspicious)
      for (const [engine, result] of Object.entries(analysisResults) as [string, any][]) {
        if (result.category === 'malicious' || result.category === 'suspicious') {
          engineResults.push({
            engine: engine,
            result: result.result || result.category,
            category: result.category
          });
        }
      }
      
      // If no threats, show some clean engines
      if (engineResults.length === 0) {
        const cleanEngines = Object.entries(analysisResults)
          .filter(([_, result]: [string, any]) => result.category === 'harmless')
          .slice(0, 5);
        
        for (const [engine, result] of cleanEngines) {
          engineResults.push({
            engine: engine,
            result: result.result || 'clean',
            category: result.category
          });
        }
      }
    }

    // Extract threat categories/tags
    const categories = [];
    if (vtData && vtData.categories) {
      for (const category of Object.values(vtData.categories) as string[]) {
        if (category && !categories.includes(category)) {
          categories.push(category);
        }
      }
    }

    // Extract domain info
    let domainInfo = {};
    if (vtData) {
      const creationDate = vtData.last_submission_date || vtData.first_submission_date;
      const reputation = vtData.reputation;
      
      domainInfo = {
        age: creationDate ? new Date(creationDate * 1000).toLocaleDateString() : undefined,
        reputation: reputation || 0
      };
    }

    return NextResponse.json({
      success: true,
      url,
      status,
      color,
      emoji,
      message,
      stats: {
        malicious,
        suspicious,
        harmless,
        undetected,
        total
      },
      engineResults: engineResults.slice(0, 10), // Top 10 engines
      categories: categories,
      domainInfo: domainInfo,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'Internal server error'
      },
      { status: 500 }
    );
  }
}
