// src/app/api/policies/create/route.ts
import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient();
    const { quoteId } = await request.json();
    
    if (!quoteId) {
      return NextResponse.json(
        { error: 'Quote ID is required' },
        { status: 400 }
      );
    }
    
    // 1. Get the quote
    const { data: quote, error: quoteError } = await (await supabase)
      .from('quote_requests')
      .select('*')
      .eq('id', quoteId)
      .single();
    
    if (quoteError || !quote) {
      return NextResponse.json(
        { error: 'Quote not found' },
        { status: 404 }
      );
    }
    
    // 2. Check if quote is approved
    if (quote.status !== 'approved') {
      return NextResponse.json(
        { error: 'Quote must be approved to create policy' },
        { status: 400 }
      );
    }
    
    // 3. Check if policy already exists
    const { data: existingPolicy } = await (await supabase)
      .from('policies')
      .select('*')
      .eq('quote_request_id', quoteId)
      .maybeSingle();
    
    if (existingPolicy) {
      return NextResponse.json({ policy: existingPolicy });
    }
    
    // 4. Generate policy number
    const quoteNumber = quote.quote_id.replace('Q-', '');
    const policyNumber = `P-${quoteNumber.padStart(5, '0')}`;
    
    // 5. Create policy
    const policyData = {
      policy_number: policyNumber,
      quote_request_id: quoteId,
      user_id: quote.user_id,
      status: 'pending_payment',
      premium_amount: quote.calculated_premium,
      coverage_amount: quote.shipment_value,
      deductible: quote.deductible,
      coverage_start: quote.start_date,
      coverage_end: quote.end_date,
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
      console.error('Policy creation error:', policyError);
      return NextResponse.json(
        { error: 'Failed to create policy' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({ policy });
    
  } catch (error) {
    console.error('Error in policy creation:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}