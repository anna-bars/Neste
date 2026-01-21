import { JSX } from "react";

export interface QuoteData {
  id: string;
  quote_id: string;
  cargo_type: string;
  shipment_value: number;
  origin: any;
  destination: any;
  start_date: string;
  end_date: string;
  transportation_mode: string;
  selected_coverage: string;
  calculated_premium: number;
  deductible: number;
  status: 'submitted' | 'approved' | 'rejected' | 'pending' | 'draft' | 'pay_to_activate' | 'waiting_for_review' | 'documents_under_review' | 'fix_and_resubmit';
  payment_status: 'pending' | 'paid' | 'failed' | 'refunded';
  shipper_name: string;
  reference_number: string;
  created_at: string;
  documents?: any[];
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