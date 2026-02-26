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

    if (lookupResponse.ok) {
      const data = await lookupResponse.json();
      stats = data.data.attributes.last_analysis_stats;
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
          status: 'Pending',
          color: '#64748b',
          emoji: '⏳',
          message: 'Scan submitted. Please try again in a few moments.',
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

    if (malicious > 0) {
      status = 'Dangerous';
      color = '#ef4444';
      emoji = '🚨';
      message = `Danger: ${malicious} security vendor(s) flagged this URL as malicious! Do not visit.`;
    } else if (suspicious > 0) {
      status = 'Suspicious';
      color = '#f59e0b';
      emoji = '⚠️';
      message = `Warning: ${suspicious} vendor(s) marked this URL as suspicious. Proceed with caution.`;
    } else {
      status = 'Safe';
      color = '#10b981';
      emoji = '✅';
      message = 'No threats detected. This URL appears to be safe.';
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
