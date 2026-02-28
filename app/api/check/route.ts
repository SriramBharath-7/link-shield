import { NextRequest, NextResponse } from 'next/server';

const VIRUSTOTAL_API_KEY = process.env.VIRUSTOTAL_API_KEY;

export async function POST(request: NextRequest) {
  try {
    if (!VIRUSTOTAL_API_KEY) {
      return NextResponse.json(
        { success: false, message: 'Service configuration error' },
        { status: 500 }
      );
    }

    const { analysisId } = await request.json();

    if (!analysisId) {
      return NextResponse.json(
        { success: false, message: 'Analysis ID is required' },
        { status: 400 }
      );
    }

    // Check analysis status
    const analysisResponse = await fetch(`https://www.virustotal.com/api/v3/analyses/${analysisId}`, {
      method: 'GET',
      headers: {
        'x-apikey': VIRUSTOTAL_API_KEY
      }
    });

    if (!analysisResponse.ok) {
      throw new Error('Failed to fetch analysis results');
    }

    const analysisData = await analysisResponse.json();
    const attributes = analysisData.data.attributes;
    const status = attributes.status;

    // If still queued or in progress, return pending
    if (status === 'queued' || status === 'in-progress') {
      return NextResponse.json({
        success: true,
        status: 'PENDING',
        color: '#64748b',
        emoji: '⏳',
        message: 'VirusTotal is still analyzing this URL. Please wait a bit longer.',
        url: '',
        analysisId: analysisId,
        stats: {
          malicious: 0,
          suspicious: 0,
          harmless: 0,
          undetected: 0,
          total: 0
        },
        timestamp: new Date().toISOString()
      });
    }

    // Analysis complete - get the stats
    const stats = attributes.stats;
    const malicious = stats.malicious || 0;
    const suspicious = stats.suspicious || 0;
    const harmless = stats.harmless || 0;
    const undetected = stats.undetected || 0;
    const total = malicious + suspicious + harmless + undetected;

    let statusText, color, emoji, message;

    if (malicious >= 40) {
      statusText = 'CRITICAL';
      color = '#8b0000';
      emoji = '💀';
      message = `CRITICAL THREAT: ${malicious} security vendors flagged this as malicious! This URL is extremely dangerous - DO NOT VISIT!`;
    } else if (malicious >= 20) {
      statusText = 'DANGEROUS';
      color = '#ef4444';
      emoji = '🚨';
      message = `High Risk: ${malicious} security vendors flagged this as malicious! Do not visit this URL.`;
    } else if (malicious >= 5 || suspicious >= 10) {
      statusText = 'SUSPICIOUS';
      color = '#f59e0b';
      emoji = '🟠';
      message = `Warning: ${malicious} malicious and ${suspicious} suspicious detections. Proceed with extreme caution.`;
    } else if (malicious >= 1 || suspicious >= 1) {
      statusText = 'LOW RISK';
      color = '#fbbf24';
      emoji = '⚠️';
      message = `Low Risk: ${malicious + suspicious} minor detection(s) found. This could be a false positive, but stay cautious.`;
    } else {
      statusText = 'SAFE';
      color = '#10b981';
      emoji = '✅';
      message = 'No threats detected. This URL appears to be safe.';
    }

    // Get engine results
    const engineResults: any[] = [];
    if (attributes.results) {
      const analysisResults = attributes.results;
      
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
        
        for (const [engine, result] of cleanEngines as [string, any][]) {
          engineResults.push({
            engine: engine,
            result: result.result || 'clean',
            category: result.category
          });
        }
      }
    }

    return NextResponse.json({
      success: true,
      url: '',
      status: statusText,
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
      engineResults: engineResults.slice(0, 10),
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: 'Unable to check analysis results. Please try again later.'
      },
      { status: 500 }
    );
  }
}
