// app/shipments/[id]/types.ts

export interface PolicyData {
  id: string;
  policy_number: string;
  status: string;
  coverage_amount: number;
  deductible: number;
  cargo_type: string;
  transportation_mode: string;
  origin: any;
  destination: any;
  coverage_start: string;
  coverage_end: string;
  premium_amount: number;
  payment_status: string;
  insurance_certificate_url: string;
  terms_url: string;
  receipt_url: string;
  created_at: string;
}

export interface ShipmentDocument {
  id: string;
  policy_id: string;
  commercial_invoice_status: 'pending' | 'uploaded' | 'approved' | 'rejected';
  commercial_invoice_url: string | null;
  commercial_invoice_rejection_reason?: string;
  packing_list_status: 'pending' | 'uploaded' | 'approved' | 'rejected';
  packing_list_url: string | null;
  packing_list_rejection_reason?: string;
  bill_of_lading_status: 'pending' | 'uploaded' | 'approved' | 'rejected';
  bill_of_lading_url: string | null;
  bill_of_lading_rejection_reason?: string;
  created_at: string;
  updated_at: string;
}

export interface PolicyNotification {
  id: string;
  type: 'document_required' | 'document_rejected' | 'policy_warning' | 'document_approved';
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

export interface EligibilityCheck {
  policyActive: boolean;
  paymentCompleted: boolean;
  coverageValid: boolean;
  documentsComplete: boolean;
  canFileClaim: boolean;
  missingDocs: string[];
}