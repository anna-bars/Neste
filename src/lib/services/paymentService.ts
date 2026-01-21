import { createClient } from '@/lib/supabase/client';

export interface CreatePaymentInput {
  quote_id: string;
  user_id: string;
  amount: number;
  payment_method: 'credit_card' | 'bank_transfer';
  card_details?: {
    last_four: string;
    brand: string;
  };
  bank_details?: {
    name: string;
    account_last_four: string;
  };
}

export interface Payment {
  id: string;
  quote_id: string;
  policy_id?: string;
  user_id: string;
  amount: number;
  currency: string;
  payment_method: 'credit_card' | 'bank_transfer' | 'check' | 'cash';
  payment_status: 'pending' | 'processing' | 'completed' | 'failed' | 'refunded';
  card_last_four?: string;
  card_brand?: string;
  bank_name?: string;
  bank_account_last_four?: string;
  transaction_id?: string;
  gateway?: string;
  created_at: string;
  updated_at: string;
  processed_at?: string;
  completed_at?: string;
}

export class PaymentService {
  static async createPayment(input: CreatePaymentInput): Promise<Payment> {
    const supabase = createClient();
    
    const paymentData = {
      quote_id: input.quote_id,
      user_id: input.user_id,
      amount: input.amount,
      currency: 'USD',
      payment_method: input.payment_method,
      payment_status: 'processing',
      card_last_four: input.card_details?.last_four,
      card_brand: input.card_details?.brand,
      bank_name: input.bank_details?.name,
      bank_account_last_four: input.bank_details?.account_last_four,
      transaction_id: `TXN-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      gateway: 'demo',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    const { data, error } = await supabase
      .from('payments')
      .insert([paymentData])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }
  
  static async completePayment(paymentId: string, policyId?: string): Promise<Payment> {
    const supabase = createClient();
    
    const updateData: any = {
      payment_status: 'completed',
      completed_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    if (policyId) {
      updateData.policy_id = policyId;
    }
    
    const { data, error } = await supabase
      .from('payments')
      .update(updateData)
      .eq('id', paymentId)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }
  
  static async failPayment(paymentId: string): Promise<Payment> {
    const supabase = createClient();
    
    const { data, error } = await supabase
      .from('payments')
      .update({
        payment_status: 'failed',
        updated_at: new Date().toISOString()
      })
      .eq('id', paymentId)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }
  
  static async getPaymentByQuoteId(quoteId: string): Promise<Payment | null> {
    const supabase = createClient();
    
    const { data, error } = await supabase
      .from('payments')
      .select('*')
      .eq('quote_id', quoteId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') {
        return null; // No payment found
      }
      throw error;
    }
    
    return data;
  }
  
  static async getPaymentsByUserId(userId: string): Promise<Payment[]> {
    const supabase = createClient();
    
    const { data, error } = await supabase
      .from('payments')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  }
  
  static async updateQuotePaymentStatus(quoteId: string, status: 'pending' | 'paid' | 'failed'): Promise<void> {
    const supabase = createClient();
    
    const { error } = await supabase
      .from('quotes')
      .update({
        payment_status: status,
        updated_at: new Date().toISOString()
      })
      .eq('id', quoteId);
    
    if (error) throw error;
  }
}