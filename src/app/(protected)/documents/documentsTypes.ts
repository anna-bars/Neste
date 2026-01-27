export interface DocumentStatus {
  type: string;
  id: string;
  status: 'Pending Review' | 'Missing' | 'Rejected' | 'Approved' | 'In Progress';
  cargoType: string;
  summary: string;
  policyId?: string;
  quoteId?: string;
}

export interface DocumentStats {
  approvedCount: number;
  pendingCount: number;
  rejectedCount: number;
  missingCount: number;
  approvalRate: number;
}

export interface InfoWidgetData {
  rateValue: number;
  totalDocuments: number;
  rejectedCount: number;
  rejectionRate: number;
  getMostCommonRejectionReason: () => { reason: string; percentage: number };
}

export const quotesTypeLabels = {
  approved: 'Pending',
  declined: 'Missing',
  expired: 'Rejected'
} as const;