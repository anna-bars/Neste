import { JSX } from "react";

// types.ts
export interface Document {
  id: string;
  name: string;
  type: string;
  file_url: string;
  file_name: string;
  file_size: number;
  uploaded_at: string;
  original_name: string;
}
// ./types.ts
export interface QuoteData {
  id: string;
  quote_number: string;
  cargo_type: string;
  shipment_value: number;
  origin: any;
  destination: any;
  start_date: string;
  end_date: string;
  transportation_mode: string;
  status: string;
  payment_status: 'pending' | 'paid' | 'failed' | 'refunded'; // Fix type
  selected_coverage?: 'standard' | 'premium' | 'enterprise';
  calculated_premium?: number;
  deductible?: number;
  created_at: string;
  updated_at: string;
  user_id?: string;
  
  // Add these fields
  policy_id?: string | null;
  policy_number?: string | null;
  policy_status?: string | null;
  payment_id?: string | null;
  transaction_id?: string | null;
  payment_amount?: number;
  payment_completed_at?: string;
  coverage_start?: string;
  coverage_end?: string;
  premium_amount?: number;
}
export interface StatusConfig {
  color: string;
  border: string;
  icon: JSX.Element;
  label: string;
  description: string;
  accent: string;
  showActions: {
    downloadQuote: boolean;
    makePayment: boolean;
    viewPolicy: boolean;
    resubmit: boolean;
    checkStatus: boolean;
    delete: boolean;
    edit: boolean;
    viewReceipt?: boolean;
  };
}