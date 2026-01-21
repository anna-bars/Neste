import { createClient } from '../supabase/client';
import { QuoteValidator, ValidationResult } from './quoteValidator';
import { QuoteReviewService } from './quoteReviewService';

export interface ProcessQuoteResult {
  quote: any;
  validation: ValidationResult;
  immediateDecision: boolean;
  decision: 'approved' | 'rejected' | 'under_review' | 'needs_info';
  requiresDocuments?: boolean;
  message: string;
  autoApproved?: boolean;
}

export class QuoteProcessor {
  static async processQuote(quoteId: string, requestImmediateDecision = true): Promise<ProcessQuoteResult> {
    const supabase = createClient();
    
    // Get quote
    const { data: quote, error } = await supabase
      .from('quotes')
      .select('*')
      .eq('id', quoteId)
      .single();

    if (error) throw error;
    if (!quote) throw new Error('Quote not found');

    console.log('Processing quote:', {
      id: quote.id,
      cargo: quote.cargo_type,
      value: quote.shipment_value,
      status: quote.status
    });

    // Step 1: Validate quote
    const validation = QuoteValidator.validateQuote(quote);
    
    // Step 2: Calculate risk score
    const riskScore = QuoteValidator.calculateRiskScore(quote);
    
    console.log('Initial validation:', {
      isValid: validation.isValid,
      status: validation.status,
      reasons: validation.reasons,
      riskScore: riskScore
    });

    // If validation fails, reject immediately
    if (!validation.isValid || validation.status === 'rejected') {
      const updateData = {
        status: 'rejected' as const,
        rejection_reason: QuoteValidator.getRejectionMessage(validation.reasons),
        risk_score: riskScore,
        updated_at: new Date().toISOString()
      };

      const { data: updatedQuote, error: updateError } = await supabase
        .from('quotes')
        .update(updateData)
        .eq('id', quoteId)
        .select()
        .single();

      if (updateError) throw updateError;

      return {
        quote: updatedQuote,
        validation: validation,
        immediateDecision: true,
        decision: 'rejected',
        message: 'Quote rejected based on initial validation',
        autoApproved: false
      };
    }

    // Step 3: Apply risk score
    const initialUpdateData: any = {
      risk_score: riskScore,
      updated_at: new Date().toISOString()
    };

    // Step 4: Make immediate decision or mark for review
    let finalStatus: 'approved' | 'rejected' | 'under_review' | 'needs_info';
    let isImmediateDecision = false;
    let autoApproved = false;

    if (validation.status === 'approved' && riskScore <= 4) {
      // Auto-approve low risk quotes
      finalStatus = 'approved';
      isImmediateDecision = true;
      autoApproved = true;
      initialUpdateData.status = 'approved';
      initialUpdateData.approved_at = new Date().toISOString();
    } else if (validation.status === 'under_review' || riskScore > 4) {
      // Mark for review
      finalStatus = 'under_review';
      isImmediateDecision = false;
      initialUpdateData.status = 'under_review';
      initialUpdateData.review_queued_at = new Date().toISOString();
      
      // If immediate decision is requested, process now
      if (requestImmediateDecision) {
        try {
          const decision = await QuoteReviewService.makeAutomaticDecision(quoteId);
          finalStatus = decision.decision === 'approved' ? 'approved' : 
                       decision.decision === 'rejected' ? 'rejected' : 
                       decision.decision === 'needs_more_info' ? 'needs_info' : 'under_review';
          isImmediateDecision = decision.decision !== 'needs_more_info';
          autoApproved = decision.decision === 'approved';
        } catch (reviewError) {
          console.error('Error making automatic decision:', reviewError);
          // Keep as under_review if review fails
        }
      }
    } else {
      // Default to approved
      finalStatus = 'approved';
      isImmediateDecision = true;
      autoApproved = true;
      initialUpdateData.status = 'approved';
      initialUpdateData.approved_at = new Date().toISOString();
    }

    // Update quote with final status
    const { data: updatedQuote, error: updateError } = await supabase
      .from('quotes')
      .update(initialUpdateData)
      .eq('id', quoteId)
      .select()
      .single();

    if (updateError) throw updateError;

    // Log the action
    await this.logQuoteAction(quoteId, {
      fromStatus: quote.status,
      toStatus: finalStatus,
      validationResults: validation,
      riskScore,
      immediateDecision: isImmediateDecision
    });

    return {
      quote: updatedQuote,
      validation: validation,
      immediateDecision: isImmediateDecision,
      decision: finalStatus,
      requiresDocuments: finalStatus === 'approved',
      message: this.getStatusMessage(finalStatus, validation),
      autoApproved
    };
  }

  private static async logQuoteAction(quoteId: string, action: any) {
    const supabase = createClient();
    
    try {
      await supabase
        .from('quote_actions')
        .insert({
          quote_id: quoteId,
          action: 'status_change',
          details: action,
          created_at: new Date().toISOString()
        });
    } catch (error) {
      console.error('Failed to log quote action:', error);
      // Continue even if logging fails
    }
  }

  private static getStatusMessage(status: string, validation: ValidationResult): string {
    switch (status) {
      case 'approved':
        return 'Your quote has been approved! You can now proceed to payment and document submission.';
      case 'under_review':
        return 'Your quote requires additional review. Our team will process it shortly.';
      case 'rejected':
        return validation.reasons.length > 0 
          ? `Quote rejected: ${validation.reasons.join(', ')}`
          : 'Quote rejected. Please contact support for more information.';
      case 'needs_info':
        return 'Additional information is required to process your quote.';
      default:
        return 'Quote is being processed.';
    }
  }

  // Check and expire quotes
  static async checkExpiredQuotes() {
    const supabase = createClient();
    const now = new Date().toISOString();

    const { data: expiredQuotes, error } = await supabase
      .from('quotes')
      .select('*')
      .eq('status', 'submitted')
      .lt('quote_expires_at', now);

    if (error) throw error;

    // Update expired quotes
    for (const quote of expiredQuotes) {
      await supabase
        .from('quotes')
        .update({
          status: 'expired',
          updated_at: now
        })
        .eq('id', quote.id);
    }

    return expiredQuotes.length;
  }
}