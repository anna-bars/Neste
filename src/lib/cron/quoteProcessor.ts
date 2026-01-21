import { QuoteReviewService } from '@/lib/services/quoteReviewService';
import { quotes } from '@/lib/supabase/quotes';

export async function processQuoteReviews() {
  console.log('Starting quote review processing...');
  
  try {
    // Process pending under_review quotes
    const results = await QuoteReviewService.processPendingReviews();
    
    console.log(`Processed ${results.length} quotes:`, {
      approved: results.filter(r => r.decision === 'approved').length,
      rejected: results.filter(r => r.decision === 'rejected').length,
      needs_info: results.filter(r => r.decision === 'needs_more_info').length
    });
    
    return {
      success: true,
      processed: results.length,
      details: results
    };
  } catch (error) {
    console.error('Error processing quote reviews:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

export async function checkAndExpireQuotes() {
  console.log('Checking for expired quotes...');
  
  try {
    const expiredCount = await QuoteReviewService.checkExpiredQuotes();
    console.log(`Expired ${expiredCount} quotes`);
    
    return {
      success: true,
      expiredCount
    };
  } catch (error) {
    console.error('Error checking expired quotes:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}