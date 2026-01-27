// src/app/(protected)/dashboard/dashboardCalculations.ts

export const calculateCoverageUtilization = (data: any[]): number => {
  if (!data.length) return 0;
  
  // 1. Ստանալ բոլոր ակտիվ պոլիսիները
  const activePolicies = data.filter(item => 
    item.dataType === 'policy' && item.policyStatus === 'active'
  );
  
  // 2. Ստանալ բոլոր quotes-ները, որոնք approved և paid են (հաջողված փոխակերպումներ)
  const approvedPaidQuotes = data.filter(item => 
    item.dataType === 'quote' && 
    item.quoteStatus === 'approved' && 
    item.paymentStatus === 'paid'
  );
  
  // 3. Հաշվել ընդհանուր փորձերը (quotes, որոնք ավարտված են կամ փոխակերպվել)
  const totalAttempts = data.filter(item => 
    item.dataType === 'quote' && 
    item.quoteStatus !== 'draft' && 
    item.quoteStatus !== 'rejected' &&
    item.quoteStatus !== 'expired' &&
    (item.rawData?.status !== 'approved' || item.paymentStatus === 'paid')
  );
  
  // 4. Հաշվել հաջողված փոխակերպումներ
  const successfulConversions = activePolicies.length + 
    approvedPaidQuotes.filter(q => {
      const hasActivePolicy = activePolicies.some(policy => 
        policy.rawData?.quote_id === q.rawData?.id
      );
      return !hasActivePolicy;
    }).length;
  
  if (totalAttempts.length === 0) return 0;
  
  // 5. Հաշվել տոկոսը
  const percentage = (successfulConversions / totalAttempts.length) * 100;
  
  return Math.min(Math.max(0, percentage), 100);
};

export const calculateAverageCoverage = (data: any[]): string => {
  if (!data.length) return '0';
  
  const activePolicies = data.filter(item => 
    item.dataType === 'policy' && item.policyStatus === 'active'
  );
  
  if (activePolicies.length === 0) return '0';
  
  const totalValue = activePolicies.reduce((sum, item) => sum + (item.value || 0), 0);
  const averageValue = totalValue / activePolicies.length;
  
  if (averageValue >= 1000000) {
    return `$${(averageValue / 1000000).toFixed(1)}M`;
  } else if (averageValue >= 1000) {
    return `$${(averageValue / 1000).toFixed(1)}k`;
  }
  
  return `$${Math.round(averageValue).toLocaleString()}`;
};

export const calculateDocumentsStatus = async (policies: any[], supabase: any) => {
  if (!policies?.length) return { pending: 0, approved: 0, rejected: 0 };
  
  let pendingCount = 0;
  let approvedCount = 0;
  let rejectedCount = 0;
  
  const policyIds = policies.map(p => p.id);
  
  if (policyIds.length > 0) {
    const { data: documents, error } = await supabase
      .from('documents')
      .select('*')
      .in('policy_id', policyIds);
    
    if (!error && documents) {
      documents.forEach((doc: { commercial_invoice_status: any; packing_list_status: any; bill_of_lading_status: any; }) => {
        const requiredDocs = [
          doc.commercial_invoice_status,
          doc.packing_list_status,
          doc.bill_of_lading_status
        ];
        
        const hasPending = requiredDocs.some(status => !status || status === 'pending');
        const hasRejected = requiredDocs.some(status => status === 'rejected');
        const allApproved = requiredDocs.every(status => status === 'approved');
        
        if (hasPending) {
          pendingCount++;
        } else if (hasRejected) {
          rejectedCount++;
        } else if (allApproved) {
          approvedCount++;
        }
      });
    }
  }
  
  return { pending: pendingCount, approved: approvedCount, rejected: rejectedCount };
};

export const calculateQuotesAwaiting = (policies: any[], documentsStatus: any) => {
  const activePoliciesCount = policies.filter(p => p.status === 'active').length;
  const pendingDocumentsCount = documentsStatus.pending;
  
  return Math.min(pendingDocumentsCount, activePoliciesCount);
};

export const calculateContractsDueToExpire = (formattedData: any[]) => {
  const now = new Date();
  return formattedData.filter(item => {
    if (item.expiringDays === null || item.expiringDays === undefined) return false;
    
    const isActiveOrApprovedPaid = 
      (item.dataType === 'policy' && item.policyStatus === 'active') ||
      (item.dataType === 'quote' && item.quoteStatus === 'approved' && item.paymentStatus === 'paid');
    
    return isActiveOrApprovedPaid && item.expiringDays >= 1 && item.expiringDays <= 3;
  }).length;
};

export const calculateArrowConfig = (metricId: string, count: number) => {
  switch(metricId) {
    case 'active-policies':
      return {
        arrowDirection: 'up' as const,
        arrowColor: 'blue' as const,
        isPositive: true
      };
      
    case 'quotes-awaiting':
      return count > 0 ? {
        arrowDirection: 'up' as const,
        arrowColor: 'red' as const,
        isPositive: false
      } : {
        arrowDirection: 'down' as const,
        arrowColor: 'blue' as const,
        isPositive: true
      };
      
    case 'under-review':
      return count > 0 ? {
        arrowDirection: 'up' as const,
        arrowColor: 'red' as const,
        isPositive: false
      } : {
        arrowDirection: 'down' as const,
        arrowColor: 'blue' as const,
        isPositive: true
      };
      
    case 'ready-to-pay':
      return count > 0 ? {
        arrowDirection: 'up' as const,
        arrowColor: 'blue' as const,
        isPositive: true
      } : {
        arrowDirection: 'down' as const,
        arrowColor: 'red' as const,
        isPositive: false
      };
      
    default:
      return {
        arrowDirection: 'up' as const,
        arrowColor: 'blue' as const,
        isPositive: true
      };
  }
};