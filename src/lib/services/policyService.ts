import { createClient } from '@/lib/supabase/client';

export interface CreatePolicyInput {
  quote_id: string;
  user_id: string;
  policy_number?: string;
  coverage_type: 'standard' | 'premium' | 'enterprise';
  premium_amount: number;
  deductible: number;
  start_date: string;
  end_date: string;
}

export class PolicyService {
  static async createPolicy(input: CreatePolicyInput) {
    const supabase = createClient();
    
    const policyNumber = input.policy_number || `POL-${Math.floor(100000 + Math.random() * 900000)}`;
    
    const policyData = {
      quote_id: input.quote_id,
      user_id: input.user_id,
      policy_number: policyNumber,
      status: 'active',
      coverage_type: input.coverage_type,
      premium_amount: input.premium_amount,
      deductible: input.deductible,
      start_date: input.start_date,
      end_date: input.end_date,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      activated_at: new Date().toISOString()
    };
    
    const { data, error } = await supabase
      .from('policies')
      .insert([policyData])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }
  
  static async getPolicyByQuoteId(quoteId: string) {
    const supabase = createClient();
    
    const { data, error } = await supabase
      .from('policies')
      .select('*')
      .eq('quote_id', quoteId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') {
        return null; // No policy found
      }
      throw error;
    }
    
    return data;
  }
}