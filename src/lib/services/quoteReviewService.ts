import { createClient } from '../supabase/client';
import { quotes } from '@/lib/supabase/quotes';

export interface ReviewDecision {
  decision: 'approved' | 'rejected' | 'needs_more_info';
  reason?: string;
  underwriterNotes?: string;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  estimatedResolution?: string; // 'within_24h', 'within_48h', 'escalated'
}

export class QuoteReviewService {
  // Ավտոմատ decision making based on risk score and business rules
  static async makeAutomaticDecision(quoteId: string): Promise<ReviewDecision> {
    const supabase = createClient();
    
    // Get quote with risk score
    const { data: quote, error } = await supabase
      .from('quotes')
      .select('*')
      .eq('id', quoteId)
      .single();

    if (error) throw error;
    if (!quote) throw new Error('Quote not found');

    // Business decision rules
    const decision = this.calculateDecision(quote);
    
    // Update quote status
    await this.applyDecision(quoteId, decision);
    
    return decision;
  }

  private static calculateDecision(quote: any): ReviewDecision {
    const riskScore = quote.risk_score || 0;
    const shipmentValue = quote.shipment_value || 0;
    const cargoType = quote.cargo_type?.toLowerCase() || '';
    
    // Decision matrix based on risk score and value
    if (riskScore <= 3) {
      return {
        decision: 'approved',
        reason: 'Low risk profile meets automatic approval criteria',
        priority: 'low',
        estimatedResolution: 'immediate'
      };
    }
    
    if (riskScore >= 8) {
      return {
        decision: 'rejected',
        reason: 'High risk score exceeds acceptable threshold',
        priority: 'high',
        estimatedResolution: 'immediate'
      };
    }
    
    // Medium risk - check specific conditions
    if (cargoType === 'machinery' && shipmentValue > 10000) {
      return {
        decision: 'needs_more_info',
        reason: 'High-value machinery requires additional documentation',
        underwriterNotes: 'Request safety certificates and packaging details',
        priority: 'medium',
        estimatedResolution: 'within_24h'
      };
    }
    
    if (cargoType === 'chemicals') {
      return {
        decision: 'needs_more_info',
        reason: 'Hazardous materials require MSDS and handling procedures',
        underwriterNotes: 'Request Material Safety Data Sheet',
        priority: 'high',
        estimatedResolution: 'within_24h'
      };
    }
    
    // Default for medium risk
    return {
      decision: 'approved',
      reason: 'Medium risk approved with standard conditions',
      priority: 'medium',
      estimatedResolution: 'immediate'
    };
  }

  private static async applyDecision(quoteId: string, decision: ReviewDecision) {
    const supabase = createClient();
    
    let newStatus = 'under_review';
    let updateData: any = {
      updated_at: new Date().toISOString(),
      review_decision: decision.decision,
      review_reason: decision.reason,
      underwriter_notes: decision.underwriterNotes
    };

    switch (decision.decision) {
      case 'approved':
        newStatus = 'approved';
        updateData.approved_at = new Date().toISOString();
        break;
      case 'rejected':
        newStatus = 'rejected';
        updateData.rejection_reason = decision.reason;
        break;
      case 'needs_more_info':
        newStatus = 'needs_info';
        break;
    }

    // Update quote
    await supabase
      .from('quotes')
      .update({
        status: newStatus,
        ...updateData
      })
      .eq('id', quoteId);
  }

  // Ստուգել և process անել բոլոր under_review quotes-ները
  static async processPendingReviews() {
    const supabase = createClient();
    
    const { data: pendingQuotes, error } = await supabase
      .from('quotes')
      .select('*')
      .eq('status', 'under_review')
      .order('created_at', { ascending: true });

    if (error) throw error;

    const results = [];
    for (const quote of pendingQuotes) {
      try {
        const decision = await this.makeAutomaticDecision(quote.id);
        results.push({
          quoteId: quote.id,
          quoteNumber: quote.quote_number,
          decision: decision.decision,
          reason: decision.reason
        });
        
        // Add delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 100));
      } catch (error) {
        console.error(`Error processing quote ${quote.id}:`, error);
        results.push({
          quoteId: quote.id,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    return results;
  }

  // Manual review by underwriter
  static async manualReview(
    quoteId: string, 
    decision: 'approved' | 'rejected',
    notes?: string,
    conditions?: string[]
  ) {
    const supabase = createClient();
    
    const updateData: any = {
      status: decision,
      updated_at: new Date().toISOString(),
      reviewed_at: new Date().toISOString(),
      reviewed_by: 'system', // In real app, this would be the underwriter's ID
      underwriter_notes: notes
    };

    if (decision === 'approved') {
      updateData.approved_at = new Date().toISOString();
      if (conditions && conditions.length > 0) {
        updateData.approval_conditions = conditions;
      }
    } else {
      updateData.rejection_reason = notes || 'Rejected during manual review';
    }

    const { data, error } = await supabase
      .from('quotes')
      .update(updateData)
      .eq('id', quoteId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Որոշել, թե արդյոք quote-ը պետք է ընդունվի, եթե ունենք լրացուցիչ տեղեկություն
  static async reviewWithAdditionalInfo(
    quoteId: string,
    info: {
      hasSafetyCertificates?: boolean;
      hasProperPackaging?: boolean;
      hasTransportPermits?: boolean;
      additionalNotes?: string;
    }
  ) {
    const supabase = createClient();
    
    const { data: quote, error } = await supabase
      .from('quotes')
      .select('*')
      .eq('id', quoteId)
      .single();

    if (error) throw error;

    let decision: 'approved' | 'rejected' = 'rejected';
    let reason = 'Insufficient information';

    // Business logic based on additional info
    if (info.hasSafetyCertificates && info.hasProperPackaging) {
      if (quote.cargo_type === 'machinery') {
        decision = 'approved';
        reason = 'Safety certificates and proper packaging verified';
      } else if (quote.cargo_type === 'chemicals' && info.hasTransportPermits) {
        decision = 'approved';
        reason = 'All required permits and certificates verified';
      }
    }

    return this.manualReview(quoteId, decision, reason);
  }

  // Ստանալ review statistics
  static async getReviewStats() {
    const supabase = createClient();
    
    const { data: stats, error } = await supabase
      .from('quotes')
      .select('status, created_at')
      .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()); // Last 7 days

    if (error) throw error;

    const result = {
      total: stats.length,
      under_review: stats.filter(q => q.status === 'under_review').length,
      approved: stats.filter(q => q.status === 'approved').length,
      rejected: stats.filter(q => q.status === 'rejected').length,
      needs_info: stats.filter(q => q.status === 'needs_info').length,
      avgReviewTime: 0 // Calculate average review time in hours
    };

    return result;
  }
}