import { NextRequest, NextResponse } from 'next/server';
// import { processQuoteReviews, checkAndExpireQuotes } from '@/lib/cron/quoteProcessor';

// Add authentication token for cron job security
const CRON_SECRET = process.env.CRON_SECRET || 'your-secret-token';

export async function GET(request: NextRequest) {
  // Verify cron secret
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Process both review and expiration
    // const [reviewResult, expireResult] = await Promise.all([
    //   processQuoteReviews(),
    //   checkAndExpireQuotes()
    // ]);

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Cron job error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Also allow POST for webhook/callback style
export async function POST(request: NextRequest) {
  return GET(request);
}