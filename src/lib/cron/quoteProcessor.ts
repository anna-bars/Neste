// src/lib/services/quoteReviewService.ts
import { createClient } from '@/lib/supabase/client';

export class QuoteReviewService {
  /**
   * Process pending quote reviews
   */
  static async processPendingReviews() {
    const supabase = createClient();
    
    // Get quotes that are under review
    const { data: pendingQuotes, error } = await supabase
      .from('quotes')
      .select('*')
      .eq('status', 'waiting_for_review')
      .order('created_at', { ascending: true })
      .limit(10);

    if (error) {
      console.error('Error fetching pending quotes:', error);
      throw error;
    }

    const results = [];

    for (const quote of pendingQuotes || []) {
      try {
        // Apply your review logic here
        // This is a simplified example - replace with your actual review logic
        const decision = await this.reviewQuote(quote);
        
        const { error: updateError } = await supabase
          .from('quotes')
          .update({
            status: decision.status,
            updated_at: new Date().toISOString(),
            ...(decision.reason && { review_notes: decision.reason })
          })
          .eq('id', quote.id);

        if (updateError) {
          console.error('Error updating quote:', updateError);
          continue;
        }

        results.push({
          quote_id: quote.id,
          quote_number: quote.quote_number,
          decision: decision.status,
          reason: decision.reason
        });

      } catch (error) {
        console.error(`Error processing quote ${quote.id}:`, error);
      }
    }

    return results;
  }

  /**
   * Review a single quote (simplified logic)
   */
  private static async reviewQuote(quote: any): Promise<{ status: string; reason?: string }> {
    // This is example logic - replace with your actual review criteria
    
    // Check if quote has all required documents
    const hasRequiredDocs = await this.checkRequiredDocuments(quote.id);
    
    if (!hasRequiredDocs) {
      return {
        status: 'needs_more_info',
        reason: 'Missing required documents'
      };
    }

    // Check risk score (example threshold)
    if (quote.risk_score > 7) {
      return {
        status: 'rejected',
        reason: 'High risk score'
      };
    }

    // Check coverage amount
    if (quote.coverage_amount > 1000000) {
      return {
        status: 'needs_manual_review',
        reason: 'High coverage amount requires manual review'
      };
    }

    // Default approval for low-risk quotes
    return {
      status: 'approved',
      reason: 'Automatic approval - meets all criteria'
    };
  }

  /**
   * Check if quote has required documents
   */
  private static async checkRequiredDocuments(quoteId: string): Promise<boolean> {
    const supabase = createClient();
    
    const { data: documents } = await supabase
      .from('documents')
      .select('*')
      .eq('quote_id', quoteId)
      .eq('is_required', true);

    return (documents?.length || 0) >= 2; // Example: at least 2 required documents
  }

  /**
   * Check and expire quotes that have been pending for too long
   */
  static async checkExpiredQuotes(): Promise<number> {
    const supabase = createClient();
    
    // Expire quotes that have been in 'waiting_for_review' status for more than 7 days
    const expirationDate = new Date();
    expirationDate.setDate(expirationDate.getDate() - 7);
    
    const { data: expiredQuotes, error } = await supabase
      .from('quotes')
      .select('id, quote_number, created_at')
      .eq('status', 'waiting_for_review')
      .lt('created_at', expirationDate.toISOString());

    if (error) {
      console.error('Error fetching expired quotes:', error);
      return 0;
    }

    if (!expiredQuotes || expiredQuotes.length === 0) {
      return 0;
    }

    // Update expired quotes
    const quoteIds = expiredQuotes.map(q => q.id);
    
    const { error: updateError } = await supabase
      .from('quotes')
      .update({
        status: 'expired',
        updated_at: new Date().toISOString(),
        review_notes: 'Automatically expired after 7 days of waiting for review'
      })
      .in('id', quoteIds);

    if (updateError) {
      console.error('Error updating expired quotes:', updateError);
      return 0;
    }

    console.log(`Expired ${expiredQuotes.length} quotes:`, expiredQuotes.map(q => q.quote_number));
    return expiredQuotes.length;
  }

  /**
   * Get quote statistics for dashboard
   */
  static async getQuoteStats() {
    const supabase = createClient();
    
    const { data, error } = await supabase
      .from('quotes')
      .select('status')
      .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());

    if (error) {
      console.error('Error fetching quote stats:', error);
      return null;
    }

    const stats = {
      pending: 0,
      approved: 0,
      rejected: 0,
      expired: 0,
      total: data?.length || 0
    };

    data?.forEach(quote => {
      switch (quote.status) {
        case 'waiting_for_review':
        case 'needs_more_info':
        case 'needs_manual_review':
          stats.pending++;
          break;
        case 'approved':
          stats.approved++;
          break;
        case 'rejected':
          stats.rejected++;
          break;
        case 'expired':
          stats.expired++;
          break;
      }
    });

    return stats;
  }
}