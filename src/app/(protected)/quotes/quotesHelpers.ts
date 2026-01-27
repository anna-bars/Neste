export const getStatusConfig = (quote: any) => {
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
  const daysText = quote.quote_expires_at ? calculateDaysText(quote.quote_expires_at) : '';

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
  
  if (['approved', 'pay_to_activate', 'submitted'].includes(quote.status) && quote.quote_expires_at && !isApprovedAndPaid) {
    return {
      ...baseConfig,
      text: baseConfig.text + daysText
    };
  }
  
  return baseConfig;
};

export const calculateInfoWidgetData = (quotesRows: any[]) => {
  const totalQuotes = quotesRows.length;
  const rejectedQuotes = quotesRows.filter(q => q.quoteStatus === 'rejected').length;
  
  const rejectionRate = totalQuotes > 0 
    ? Math.round((rejectedQuotes / totalQuotes) * 100) 
    : 0;
  
  const improvementRate = totalQuotes > 0 ? 100 - rejectionRate : 0;
  
  const getMostCommonRejectionReason = () => {
    if (totalQuotes === 0) {
      return {
        reason: 'No quotes yet',
        percentage: 0,
        otherReasons: []
      };
    }
    
    if (rejectedQuotes > 0) {
      return {
        reason: 'Inaccurate Cargo Value',
        percentage: 72,
        otherReasons: [
          'Missing Documentation',
          'Incorrect Shipping Details',
          'Risk Assessment Issues'
        ]
      };
    }
    return {
      reason: 'All quotes approved',
      percentage: 0,
      otherReasons: []
    };
  };
  
  const mostCommonReason = getMostCommonRejectionReason();
  
  return {
    rateValue: improvementRate,
    totalQuotes,
    rejectedQuotes,
    rejectionRate,
    mostCommonReason
  };
};

export const formatQuoteId = (id: string, quoteNumber?: string) => {
  if (quoteNumber) {
    return quoteNumber;
  }
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

export const formatExpirationDate = (startDate: string, endDate: string) => {
  if (!startDate || !endDate) return 'N/A';
  
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  return `${start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} – ${end.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: '2-digit' })}`;
};

export const formatQuotesData = (quotes: any[], handleQuoteAction: Function, getStatusConfig: Function, formatQuoteId: Function, formatDate: Function, formatExpirationDate: Function) => {
  const formattedData: any[] = []

  quotes.forEach(quote => {
    const statusConfig = getStatusConfig(quote)
    
    const buttonAction = { 
      text: statusConfig.buttonText, 
      variant: statusConfig.buttonVariant,
      onClick: (row: any) => handleQuoteAction(row, quote)
    }
    
    formattedData.push({
      id: formatQuoteId(quote.id, quote.quote_number),
      cargo: quote.cargo_type || 'Unknown',
      shipmentValue: `$${(quote.shipment_value || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      premiumAmount: `$${(quote.premium_amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      expirationDate: formatExpirationDate(quote.coverage_start_date || quote.created_at, quote.coverage_end_date || quote.quote_expires_at),
      status: {
        text: statusConfig.text,
        color: statusConfig.color,
        dot: statusConfig.dot,
        textColor: statusConfig.textColor
      },
      button: buttonAction,
      rawData: quote,
      quoteStatus: quote.status,
      paymentStatus: quote.payment_status
    })
  })

  return formattedData.sort((a, b) => new Date(b.rawData.created_at).getTime() - new Date(a.rawData.created_at).getTime())
};

export const loadQuotesData = async (user: any, supabase: any, handleQuoteAction: Function, getStatusConfig: Function, formatQuoteId: Function, formatDate: Function, formatExpirationDate: Function) => {
  try {
    const { data: quotes, error: quotesError } = await supabase
      .from('quotes')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(50)

    if (quotesError) {
      console.error('Error loading quotes:', quotesError)
      return []
    }

    if (quotes && quotes.length > 0) {
      return formatQuotesData(quotes, handleQuoteAction, getStatusConfig, formatQuoteId, formatDate, formatExpirationDate)
    } else {
      return []
    }

  } catch (error) {
    console.error('Error loading quotes data:', error)
    return []
  }
}

export const calculateQuotesData = (quotesRows: any[]) => {
  return {
    'This Week': { 
      approved: quotesRows.filter(q => {
        const date = new Date(q.rawData?.created_at);
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        return q.quoteStatus === 'approved' && q.paymentStatus === 'paid' && date >= weekAgo;
      }).length,
      declined: quotesRows.filter(q => {
        const date = new Date(q.rawData?.created_at);
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        return q.quoteStatus === 'approved' && q.paymentStatus !== 'paid' && date >= weekAgo;
      }).length,
      expired: quotesRows.filter(q => {
        const date = new Date(q.rawData?.created_at);
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        return q.quoteStatus === 'rejected' && date >= weekAgo;
      }).length
    },
    'This Month': { 
      approved: quotesRows.filter(q => {
        const date = new Date(q.rawData?.created_at);
        const monthAgo = new Date();
        monthAgo.setMonth(monthAgo.getMonth() - 1);
        return q.quoteStatus === 'approved' && q.paymentStatus === 'paid' && date >= monthAgo;
      }).length,
      declined: quotesRows.filter(q => {
        const date = new Date(q.rawData?.created_at);
        const monthAgo = new Date();
        monthAgo.setMonth(monthAgo.getMonth() - 1);
        return q.quoteStatus === 'approved' && q.paymentStatus !== 'paid' && date >= monthAgo;
      }).length,
      expired: quotesRows.filter(q => {
        const date = new Date(q.rawData?.created_at);
        const monthAgo = new Date();
        monthAgo.setMonth(monthAgo.getMonth() - 1);
        return q.quoteStatus === 'rejected' && date >= monthAgo;
      }).length
    },
    'Last Month': { 
      approved: quotesRows.filter(q => {
        const date = new Date(q.rawData?.created_at);
        const currentMonth = new Date();
        const lastMonthStart = new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1);
        const lastMonthEnd = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 0);
        return q.quoteStatus === 'approved' && q.paymentStatus === 'paid' && date >= lastMonthStart && date <= lastMonthEnd;
      }).length,
      declined: quotesRows.filter(q => {
        const date = new Date(q.rawData?.created_at);
        const currentMonth = new Date();
        const lastMonthStart = new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1);
        const lastMonthEnd = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 0);
        return q.quoteStatus === 'approved' && q.paymentStatus !== 'paid' && date >= lastMonthStart && date <= lastMonthEnd;
      }).length,
      expired: quotesRows.filter(q => {
        const date = new Date(q.rawData?.created_at);
        const currentMonth = new Date();
        const lastMonthStart = new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1);
        const lastMonthEnd = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 0);
        return q.quoteStatus === 'rejected' && date >= lastMonthStart && date <= lastMonthEnd;
      }).length
    },
    'Last Quarter': { 
      approved: quotesRows.filter(q => {
        const date = new Date(q.rawData?.created_at);
        const now = new Date();
        const quarterAgo = new Date(now);
        quarterAgo.setMonth(now.getMonth() - 3);
        return q.quoteStatus === 'approved' && q.paymentStatus === 'paid' && date >= quarterAgo;
      }).length,
      declined: quotesRows.filter(q => {
        const date = new Date(q.rawData?.created_at);
        const now = new Date();
        const quarterAgo = new Date(now);
        quarterAgo.setMonth(now.getMonth() - 3);
        return q.quoteStatus === 'approved' && q.paymentStatus !== 'paid' && date >= quarterAgo;
      }).length,
      expired: quotesRows.filter(q => {
        const date = new Date(q.rawData?.created_at);
        const now = new Date();
        const quarterAgo = new Date(now);
        quarterAgo.setMonth(now.getMonth() - 3);
        return q.quoteStatus === 'rejected' && date >= quarterAgo;
      }).length
    }
  };
};

export const calculateQuotesData2 = (quotesRows: any[]) => {
  return {
    'This Week': { 
      totalQuotes: quotesRows.length, 
      expiringQuotes: quotesRows.filter(q => {
        const isApprovedPaid = q.quoteStatus === 'approved' && q.paymentStatus === 'paid';
        const isRecent = q.rawData?.created_at ? 
          (Date.now() - new Date(q.rawData.created_at).getTime()) < (7 * 24 * 60 * 60 * 1000) : 
          false;
        return (isApprovedPaid && isRecent) || 
               (q.quoteStatus === 'submitted' && isRecent) || 
               (q.quoteStatus === 'under_review' && isRecent);
      }).length, 
      expiringRate: quotesRows.length > 0 
        ? Math.round((quotesRows.filter(q => {
            const isApprovedPaid = q.quoteStatus === 'approved' && q.paymentStatus === 'paid';
            const isRecent = q.rawData?.created_at ? 
              (Date.now() - new Date(q.rawData.created_at).getTime()) < (7 * 24 * 60 * 60 * 1000) : 
              false;
            return (isApprovedPaid && isRecent) || 
                   (q.quoteStatus === 'submitted' && isRecent) || 
                   (q.quoteStatus === 'under_review' && isRecent);
          }).length / quotesRows.length) * 100) 
        : 0
    },
    'Next Week': { 
      totalQuotes: quotesRows.length, 
      expiringQuotes: quotesRows.filter(q => {
        const isApprovedNotPaid = q.quoteStatus === 'approved' && q.paymentStatus !== 'paid';
        
        const hasPaymentDeadline = q.rawData?.quote_expires_at || q.rawData?.coverage_end_date;
        let isPaymentDueSoon = false;
        
        if (hasPaymentDeadline) {
          const paymentDate = new Date(q.rawData.quote_expires_at || q.rawData.coverage_end_date);
          const now = new Date();
          const daysUntilPayment = Math.ceil((paymentDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
          isPaymentDueSoon = daysUntilPayment > 0 && daysUntilPayment <= 7;
        }
        
        return isApprovedNotPaid || (q.quoteStatus === 'pay_to_activate') || isPaymentDueSoon;
      }).length, 
      expiringRate: quotesRows.length > 0 
        ? Math.round((quotesRows.filter(q => {
            const isApprovedNotPaid = q.quoteStatus === 'approved' && q.paymentStatus !== 'paid';
            const hasPaymentDeadline = q.rawData?.quote_expires_at || q.rawData?.coverage_end_date;
            let isPaymentDueSoon = false;
            
            if (hasPaymentDeadline) {
              const paymentDate = new Date(q.rawData.quote_expires_at || q.rawData.coverage_end_date);
              const now = new Date();
              const daysUntilPayment = Math.ceil((paymentDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
              isPaymentDueSoon = daysUntilPayment > 0 && daysUntilPayment <= 7;
            }
            
            return isApprovedNotPaid || (q.quoteStatus === 'pay_to_activate') || isPaymentDueSoon;
          }).length / quotesRows.length) * 100) 
        : 0
    }
  };
};