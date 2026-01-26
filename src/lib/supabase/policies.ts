import { createClient } from './client';

export const policies = {
  create: async (data: any) => {
    const supabase = createClient();  // Օգտագործում ենք createClient-ը
    
    const { data: result, error } = await supabase
      .from('policies')
      .insert(data)
      .select()
      .single();
    
    if (error) throw error;
    return result;
  }
};