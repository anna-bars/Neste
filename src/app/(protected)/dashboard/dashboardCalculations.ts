export const calculateCoverageUtilization = (data: any[]): number => {
  if (!data.length) return 0;
  
  const activePolicies = data.filter(item => 
    item.dataType === 'policy' && item.policyStatus === 'active'
  );
  
  const approvedPaidQuotes = data.filter(item => 
    item.dataType === 'quote' && 
    item.quoteStatus === 'approved' && 
    item.paymentStatus === 'paid'
  );
  
  const totalQuotes = data.filter(item => 
    item.dataType === 'quote' && 
    item.quoteStatus !== 'draft' && 
    item.quoteStatus !== 'rejected' &&
    item.quoteStatus !== 'expired'
  ).length;
  
  const totalConverted = activePolicies.length;
  
  if (totalQuotes === 0) return 0;
  
  const percentage = (totalConverted / totalQuotes) * 100;
  
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

export const calculateArrowConfig = (metricId: string, count: number) => {
  switch(metricId) {
    case 'active-policies':
      return {
        arrowDirection: 'up' as const,
        arrowColor: 'blue' as const,
        isPositive: true
      };
      
    case 'quotes-awaiting':
      return {
        arrowDirection: 'up' as const,
        arrowColor: 'red' as const,
        isPositive: false
      };
      
    case 'under-review':
      return {
        arrowDirection: 'down' as const,
        arrowColor: 'blue' as const,
        isPositive: true
      };
      
    case 'ready-to-pay':
      return {
        arrowDirection: 'up' as const,
        arrowColor: 'blue' as const,
        isPositive: true
      };
      
    default:
      return {
        arrowDirection: 'up' as const,
        arrowColor: 'blue' as const,
        isPositive: true
      };
  }
};