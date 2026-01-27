import { createClient } from './client';

export interface CreateQuoteInput {
  user_id: string;
  cargo_type: string;
  shipment_value: number;
  origin: any;
  destination: any;
  start_date: string;
  end_date: string;
  transportation_mode: 'sea' | 'air' | 'road';
  selected_coverage: 'standard' | 'premium' | 'enterprise';
  calculated_premium: number;
  deductible: number;
  quote_expires_at: string;
  shipper_name?: string;
  reference_number?: string;
  status?: 'draft' | 'submitted' | 'under_review' | 'approved' | 'rejected' | 'expired' | 'converted';
  payment_status?: 'pending' | 'paid' | 'refunded';
}

export interface QuoteResponse {
  id: string;
  quote_number: string;
  status: string;
  payment_status: string;
  calculated_premium: number;
  quote_expires_at: string;
  created_at: string;
}


export const quotes = {
  // Ստեղծել նոր quote
  // quotes.ts-ում ավելացրու
async update(id: string, data: any) {
  const supabase = createClient();
  
  const { data: result, error } = await supabase
    .from('quotes')
    .update({
      ...data,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .select()
    .single();
  
  if (error) throw error;
  return result;
}, 
  async create(input: CreateQuoteInput): Promise<QuoteResponse> {
    const supabase = createClient();
    
    // Generate quote number
    const quoteNumber = `Q-${Date.now().toString().slice(-6).padStart(6, '0')}`;
    
    const quoteData = {
      quote_number: quoteNumber,
      user_id: input.user_id,
      status:  'approved',
      payment_status: input.payment_status || 'pending',
      cargo_type: input.cargo_type,
      shipment_value: input.shipment_value,
      origin: input.origin,
      destination: input.destination,
      start_date: input.start_date,
      end_date: input.end_date,
      transportation_mode: input.transportation_mode,
      selected_coverage: input.selected_coverage,
      calculated_premium: input.calculated_premium,
      deductible: input.deductible,
      quote_expires_at: input.quote_expires_at,
      shipper_name: input.shipper_name,
      reference_number: input.reference_number,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    console.log('Creating quote:', quoteData);
    
    const { data, error } = await supabase
      .from('quotes')
      .insert([quoteData])
      .select()
      .single();

    if (error) {
      console.error('Error creating quote:', error);
      throw error;
    }
    
    return data;
  },

  // Ստանալ quote ID-ով
  async getById(id: string) {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('quotes')
      .select(`
        *,
        documents (*)
      `)
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },
  
  // Ստանալ quote-ը quote_number-ով
  async getByQuoteNumber(quoteNumber: string) {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('quotes')
      .select('*')
      .eq('quote_number', quoteNumber)
      .single();

    if (error) throw error;
    return data;
  },

  // Ստանալ բոլոր quotes օգտատիրոջ համար
  async getByUser(userId: string, status?: string) {
    const supabase = createClient();
    
    let query = supabase
      .from('quotes')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (status) {
      query = query.eq('status', status);
    }
    
    const { data, error } = await query;

    if (error) throw error;
    return data;
  },

  // Թարմացնել quote status
  async updateStatus(id: string, status: string, paymentStatus?: string) {
    const supabase = createClient();
    
    const updateData: any = { 
      status,
      updated_at: new Date().toISOString()
    };
    
    if (paymentStatus) {
      updateData.payment_status = paymentStatus;
    }
    
    if (status === 'approved') {
      updateData.approved_at = new Date().toISOString();
    }
    
    const { data, error } = await supabase
      .from('quotes')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Շարունակել draft quote
 async continueDraft(quoteId: string, updates: Partial<CreateQuoteInput>) {
    const supabase = createClient();
    
    console.log('continueDraft called with:', { quoteId, updates });
    
    const { data, error } = await supabase
      .from('quotes')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', quoteId)
      .select()  // ✅ Սա կարևոր է - պետք է .select() ավելացնել
      .single(); // ✅ Եթե ցանկանում ենք միայն մեկ row վերադարձնել
    
    if (error) {
      console.error('Supabase update error:', error);
      throw error;
    }
    
    console.log('continueDraft successful:', data);
    return data;
  },
  
  // Delete quote
  async delete(id: string) {
    const supabase = createClient();
    const { error } = await supabase
      .from('quotes')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return { success: true };
  },
  
  // Search quotes
  async search(userId: string, filters: {
    status?: string;
    cargoType?: string;
    startDate?: string;
    endDate?: string;
  }) {
    const supabase = createClient();
    
    let query = supabase
      .from('quotes')
      .select('*')
      .eq('user_id', userId);
    
    if (filters.status) {
      query = query.eq('status', filters.status);
    }
    
    if (filters.cargoType) {
      query = query.eq('cargo_type', filters.cargoType);
    }
    
    if (filters.startDate) {
      query = query.gte('created_at', filters.startDate);
    }
    
    if (filters.endDate) {
      query = query.lte('created_at', filters.endDate);
    }
    
    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  }
};