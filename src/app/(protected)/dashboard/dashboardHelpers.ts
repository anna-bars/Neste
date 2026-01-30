export const calculateDaysUntilExpiry = (item: any) => {
  const now = new Date();
  let expirationDate: Date | null = null;
  
  if (item.dataType === 'quote') {
    const quote = item.rawData;
    
    if (quote.status === 'rejected') {
      return null;
    }
    
    if (quote.status === 'approved' && quote.payment_status === 'paid') {
      return null;
    }
    
    if (quote.quote_expires_at) {
      expirationDate = new Date(quote.quote_expires_at);
    }
  } else if (item.dataType === 'policy') {
    if (item.rawData?.coverage_end) {
      expirationDate = new Date(item.rawData.coverage_end);
    }
  }
  
  if (!expirationDate) return null;
  
  const diffTime = expirationDate.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays;
};

export const getQuoteStatusConfig = (quote: any) => {
  const calculateDaysText = (expirationTime: string) => {
    if (!expirationTime) return '';
    
    const now = new Date();
    const expiration = new Date(expirationTime);
    const diffTime = expiration.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays > 0) {
      return ` (${diffDays} day${diffDays !== 1 ? 's' : ''} left)`;
    } else if (diffDays < 0) {
      const daysAgo = Math.abs(diffDays);
      return ` (${daysAgo} day${daysAgo !== 1 ? 's' : ''} ago)`;
    } else {
      return ' (Today)';
    }
  };

  const isPaid = quote.payment_status === 'paid';
  const isExpired = quote.quote_expires_at && new Date(quote.quote_expires_at) < new Date();
  const daysText = quote.expiration_time ? calculateDaysText(quote.expiration_time) : '';

  const isApprovedAndPaid = quote.status === 'approved' && isPaid;
  
  const statusMap: Record<string, any> = {
    'draft': { 
      text: 'Continue Quote', 
      color: 'bg-gray-100', 
      dot: 'bg-gray-500', 
      textColor: 'text-gray-700',
      buttonText: 'Continue Quote',
      buttonVariant: 'primary' as const
    },
    'submitted': { 
      text: 'Waiting for review', 
      color: 'bg-blue-50', 
      dot: 'bg-blue-500', 
      textColor: 'text-blue-700',
      buttonText: 'View Details',
      buttonVariant: 'secondary' as const
    },
    'under_review': { 
      text: 'Documents under review', 
      color: 'bg-amber-50', 
      dot: 'bg-amber-500', 
      textColor: 'text-amber-700',
      buttonText: 'View Details',
      buttonVariant: 'secondary' as const
    },
    'approved': { 
      text: isPaid ? 'Approved & Paid' : 'Pay to Activate', 
      color: isPaid ? 'bg-emerald-50' : 'bg-amber-50', 
      dot: isPaid ? 'bg-emerald-500' : 'bg-amber-500', 
      textColor: isPaid ? 'text-emerald-700' : 'text-amber-700',
      buttonText: isPaid ? 'View Policy' : 'Pay Now',
      buttonVariant: isPaid ? 'success' as const : 'primary' as const
    },
    'rejected': { 
      text: 'Rejected', 
      color: 'bg-rose-50', 
      dot: 'bg-rose-500', 
      textColor: 'text-rose-700',
      buttonText: 'View Details',
      buttonVariant: 'secondary' as const
    },
    'expired': { 
      text: 'Expired', 
      color: 'bg-gray-100', 
      dot: 'bg-gray-400', 
      textColor: 'text-gray-600',
      buttonText: 'View Details',
      buttonVariant: 'secondary' as const
    },
    'converted': { 
      text: 'Converted to Policy', 
      color: 'bg-emerald-50', 
      dot: 'bg-emerald-500', 
      textColor: 'text-emerald-700',
      buttonText: 'View Policy',
      buttonVariant: 'success' as const
    },
    'waiting_for_docs': { 
      text: 'Waiting for Documents', 
      color: 'bg-cyan-50', 
      dot: 'bg-cyan-500', 
      textColor: 'text-cyan-700',
      buttonText: 'View Details',
      buttonVariant: 'secondary' as const
    }
  };

  if (isExpired) {
    return {
      text: 'Expired' + daysText,
      color: 'bg-gray-100',
      dot: 'bg-gray-400',
      textColor: 'text-gray-600',
      buttonText: 'View Details',
      buttonVariant: 'secondary' as const,
      isActuallyExpired: true
    };
  }

  if (isApprovedAndPaid) {
    return {
      text: 'Approved & Paid',
      color: 'bg-emerald-50',
      dot: 'bg-emerald-500',
      textColor: 'text-emerald-700',
      buttonText: 'View Policy',
      buttonVariant: 'success' as const
    };
  }

  const baseConfig = statusMap[quote.status] || statusMap['draft'];
  
  if (['approved', 'pay_to_activate', 'submitted'].includes(quote.status) && quote.expiration_time && !isApprovedAndPaid) {
    return {
      ...baseConfig,
      text: baseConfig.text + daysText
    };
  }
  
  return baseConfig;
};

export const getPolicyStatusConfig = (policy: any) => {
  const statusMap: Record<string, any> = {
    'active': { 
      text: 'Active', 
      color: 'bg-emerald-50', 
      dot: 'bg-emerald-500', 
      textColor: 'text-emerald-700',
      buttonText: 'View Shipment',
      buttonVariant: 'success' as const
    },
    'pending': { 
      text: 'Pending Activation', 
      color: 'bg-blue-50', 
      dot: 'bg-blue-500', 
      textColor: 'text-blue-700',
      buttonText: 'View Details',
      buttonVariant: 'secondary' as const
    },
    'expired': { 
      text: 'Expired', 
      color: 'bg-gray-100', 
      dot: 'bg-gray-400', 
      textColor: 'text-gray-600',
      buttonText: 'View Details',
      buttonVariant: 'secondary' as const
    },
    'cancelled': { 
      text: 'Cancelled', 
      color: 'bg-rose-50', 
      dot: 'bg-rose-500', 
      textColor: 'text-rose-700',
      buttonText: 'View Details',
      buttonVariant: 'secondary' as const
    }
  };

  return statusMap[policy.status] || statusMap['pending'];
};

export const formatQuoteId = (id: string) => {
  if (id.startsWith('Q-')) {
    return id;
  }
  if (id.startsWith('temp-')) {
    const randomNum = Math.floor(Math.random() * 10000).toString().padStart(5, '0');
    return `Q-${randomNum}`;
  }
  return `Q-${id.slice(-5)}`;
};

export const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
};

export const formatCombinedData = (
  quotes: any[], 
  policies: any[],
  getQuoteStatusConfig: (quote: any) => any,
  getPolicyStatusConfig: (policy: any) => any,
  formatQuoteId: (id: string) => string,
  formatDate: (dateString: string) => string,
  calculateDaysUntilExpiry: (item: any) => number | null
) => {
  const allItems: any[] = [];

  quotes.forEach(quote => {
    const statusConfig = getQuoteStatusConfig(quote);
    const createdAt = new Date(quote.created_at);
    const expiringDays = calculateDaysUntilExpiry({ 
      dataType: 'quote', 
      rawData: quote 
    });
    
    // ✅ Փոխել button text-երը՝ ըստ պահանջի
    let buttonText = statusConfig.buttonText;
    if (quote.status === 'approved' && quote.payment_status === 'paid') {
      buttonText = 'View Policy';
    } else if (quote.status === 'approved' && quote.payment_status !== 'paid') {
      buttonText = 'Pay Now';
    } else if (quote.status === 'draft') {
      buttonText = 'Continue Quote';
    } else {
      buttonText = 'View Details';
    }
    
    const buttonAction = { 
      text: buttonText, 
      variant: statusConfig.buttonVariant,
      onClick: () => {}
    };
    
    allItems.push({
      // ✅ reference-ը փոխարինում է առանձին id-ին
      reference: `${formatQuoteId(quote.id)}|Insurance Quote`,
      cargo: quote.cargo_type || 'Unknown',
      amount: quote.shipment_value || 0,
      status: {
        text: statusConfig.text,
        color: statusConfig.color,
        dot: statusConfig.dot,
        textColor: statusConfig.textColor
      },
      validUntil: expiringDays, // ✅ պահպանում ենք օրերի քանակը
      created: formatDate(quote.created_at),
      button: buttonAction,
      rawData: quote,
      dataType: 'quote',
      quoteStatus: quote.status,
      paymentStatus: quote.payment_status,
      sortDate: quote.created_at,
      timestamp: createdAt.getTime(),
      expiringDays: expiringDays,
      // ✅ պահպանում ենք հին fields-ը backward compatibility-ի համար
      id: formatQuoteId(quote.id),
      value: quote.shipment_value || 0,
      date: formatDate(quote.created_at)
    });
  });

  policies.forEach(policy => {
    const statusConfig = getPolicyStatusConfig(policy);
    const createdAt = new Date(policy.created_at);
    const expiringDays = calculateDaysUntilExpiry({ 
      dataType: 'policy', 
      rawData: policy 
    });
    
    // ✅ Փոխել button text-երը՝ ըստ պահանջի
    let buttonText = statusConfig.buttonText;
    if (policy.status === 'active') {
      buttonText = 'View Policy';
    } else {
      buttonText = 'View Details';
    }
    
    const buttonAction = { 
      text: buttonText, 
      variant: statusConfig.buttonVariant,
      onClick: () => {}
    };
    
    allItems.push({
      // ✅ reference-ը փոխարինում է առանձին id-ին
      reference: `${policy.policy_number}|Insurance Policy`,
      cargo: policy.cargo_type || 'Unknown',
      amount: parseFloat(policy.coverage_amount) || 0,
      status: {
        text: statusConfig.text,
        color: statusConfig.color,
        dot: statusConfig.dot,
        textColor: statusConfig.textColor
      },
      validUntil: expiringDays, // ✅ պահպանում ենք օրերի քանակը
      created: formatDate(policy.created_at),
      button: buttonAction,
      rawData: policy,
      dataType: 'policy',
      policyStatus: policy.status,
      sortDate: policy.created_at,
      timestamp: createdAt.getTime(),
      expiringDays: expiringDays,
      // ✅ պահպանում ենք հին fields-ը backward compatibility-ի համար
      id: policy.policy_number,
      value: parseFloat(policy.coverage_amount) || 0,
      date: formatDate(policy.created_at)
    });
  });

  return allItems.sort((a, b) => {
    if (a.timestamp && b.timestamp) {
      return b.timestamp - a.timestamp;
    }
    return new Date(b.sortDate || b.rawData?.created_at).getTime() - 
           new Date(a.sortDate || a.rawData?.created_at).getTime();
  });
};