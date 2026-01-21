// src/lib/actions/policy.ts
'use server';

import { createClient } from '@/lib/supabase/server';
import { randomBytes } from 'crypto';

export async function createPolicyFromQuote(quoteId: string) {
  const supabase = createClient();
  
  try {
    // 1. Ստանում ենք quote-ը
    const { data: quote, error: quoteError } = await (await supabase)
      .from('quote_requests')
      .select('*')
      .eq('id', quoteId)
      .single();
    
    if (quoteError || !quote) {
      throw new Error('Quote not found');
    }
    
    // 2. Ստուգում ենք, արդյոք quote-ը approved է
    if (quote.status !== 'approved') {
      throw new Error('Quote is not approved');
    }
    
    // 3. Ստուգում ենք, արդյոք policy արդեն կա
    const { data: existingPolicy } = await (await supabase)
      .from('policies')
      .select('*')
      .eq('quote_request_id', quoteId)
      .maybeSingle();
    
    if (existingPolicy) {
      return existingPolicy;
    }
    
    // 4. Ստեղծում ենք policy number
    const policyNumber = `P-${String(quote.quote_id).replace('Q-', '')}`;
    
    // 5. Ստեղծում ենք նոր policy
    const policyData = {
      policy_number: policyNumber,
      quote_request_id: quoteId,
      user_id: quote.user_id,
      status: 'pending_payment',
      premium_amount: quote.calculated_premium,
      coverage_amount: quote.shipment_value,
      deductible: quote.deductible,
      coverage_start: new Date(quote.start_date),
      coverage_end: new Date(quote.end_date),
      cargo_type: quote.cargo_type,
      transportation_mode: quote.transportation_mode,
      origin: quote.origin,
      destination: quote.destination,
      payment_status: quote.payment_status || 'pending',
    };
    
    const { data: policy, error: policyError } = await (await supabase)
      .from('policies')
      .insert(policyData)
      .select()
      .single();
    
    if (policyError) {
      throw policyError;
    }
    
    return policy;
    
  } catch (error) {
    console.error('Error creating policy:', error);
    throw error;
  }
}