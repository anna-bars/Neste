'use client'

import DashboardLayout from '../DashboardLayout'
import { useEffect, useState, useRef } from 'react'
import { ConversionChart } from '../../components/charts/ConversionChart'
import { UniversalTable, renderStatus, renderButton } from '@/app/components/tables/UniversalTable';
import QuotesExpirationCard from '@/app/components/charts/QuotesExpirationCard'
import InfoWidget from '@/app/components/widgets/InfoWidget'
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { useUser } from '@/app/context/UserContext';

export default function QuotesPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [quotesRows, setQuotesRows] = useState<any[]>([])
  const [activeTab, setActiveTab] = useState('This Week')
  const [isMobile, setIsMobile] = useState(false)
  const { user } = useUser()
  const supabase = createClient()

  const handleGetNewQuote = () => {
    router.push('/quotes/new/shipping')
  }

  // Dashboard-ից վերցված helper ֆունկցիաներ
  const getStatusConfig = (quote: any) => {
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

    // Եթե quote-ը արդեն approved և paid է, ապա հաշվի չառնել expiration-ը
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

    // 1. Ստուգենք, արդյոք quote-ն expired է
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

    // 2. Եթե արդեն approved և paid է, ապա պարզապես ցույց տալ "Approved & Paid"
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
    
    // 3. Մնացած դեպքերում ավելացնել ժամանակ, եթե կա
    if (['approved', 'pay_to_activate', 'submitted'].includes(quote.status) && quote.quote_expires_at && !isApprovedAndPaid) {
      return {
        ...baseConfig,
        text: baseConfig.text + daysText
      };
    }
    
    return baseConfig;
  };
// Ինֆո վիջեթի տվյալները
const calculateInfoWidgetData = () => {
  const totalQuotes = quotesRows.length;
  const rejectedQuotes = quotesRows.filter(q => q.quoteStatus === 'rejected').length;
  
  // Հաշվել rejection rate (որքան տոկոս են rejected)
  const rejectionRate = totalQuotes > 0 
    ? Math.round((rejectedQuotes / totalQuotes) * 100) 
    : 0;
  
  // Գտնել ամենահաճախակի մերժման պատճառը
  const getMostCommonRejectionReason = () => {
    // Այստեղ կարող եք ավելացնել իրական տվյալներ ձեր Supabase-ից
    // Այժմ օգտագործենք պարզ տրամաբանություն
    if (rejectedQuotes > 0) {
      // Այս օրինակում ասում ենք, որ մերժումների 72%-ը Inaccurate Cargo Value-ի պատճառով է
      return {
        reason: 'Inaccurate Cargo Value',
        percentage: 72,
        // Կարող եք ավելացնել այլ պատճառներ
        otherReasons: [
          'Missing Documentation',
          'Incorrect Shipping Details',
          'Risk Assessment Issues'
        ]
      };
    }
    return {
      reason: 'N/A',
      percentage: 0,
      otherReasons: []
    };
  };
  
  const mostCommonReason = getMostCommonRejectionReason();
  
  // Հաշվել improvement rate (100 - rejectionRate)
  const improvementRate = 100 - rejectionRate;
  
  return {
    rateValue: improvementRate, // Ցույց տալ improvement rate
    totalQuotes,
    rejectedQuotes,
    rejectionRate,
    mostCommonReason
  };
};

const infoWidgetData = calculateInfoWidgetData();
  const formatQuoteId = (id: string, quoteNumber?: string) => {
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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  };

  const formatExpirationDate = (startDate: string, endDate: string) => {
    if (!startDate || !endDate) return 'N/A';
    
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    return `${start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} – ${end.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: '2-digit' })}`;
  };

  const formatQuotesData = (quotes: any[]) => {
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

  const handleQuoteAction = (row: any, quote: any) => {
    const quoteId = row.rawData?.id || row.id;
    const status = quote.status;
    const paymentStatus = quote.payment_status;
    const isExpired = quote.quote_expires_at && new Date(quote.quote_expires_at) < new Date();
    
    const checkPolicyAndRedirect = async () => {
      try {
        const { data: policy } = await supabase
          .from('policies')
          .select('*')
          .eq('quote_id', quoteId)
          .maybeSingle();
        
        if (policy?.status === 'active') {
          router.push(`/shipments/${policy.id}`)
          return true;
        }
        
        return false;
      } catch (error) {
        console.error('Error checking policy:', error)
        return false;
      }
    }
    
    switch (status) {
      case 'draft':
        router.push(`/quotes/new?quote_id=${quoteId}&continue=true`)
        break
      case 'submitted':
      case 'under_review':
      case 'waiting_for_review':
      case 'documents_under_review':
        router.push(`/quotes/${quoteId}`)
        break
      case 'approved':
        if (paymentStatus === 'paid') {
          checkPolicyAndRedirect().then((hasPolicy) => {
            if (!hasPolicy) {
              router.push(`/quotes/${quoteId}`)
            }
          })
        } else {
          router.push(`/quotes/${quoteId}`)
        }
        break
      case 'rejected':
      case 'fix_and_resubmit':
        router.push(`/quotes/${quoteId}`)
        break
      case 'expired':
        if (confirm('This quote has expired. Would you like to create a new one based on this?')) {
          router.push(`/quotes/new?duplicate=${quoteId}`);
        }
        break
      case 'pay_to_activate':
        router.push(`/quotes/${quoteId}`)
        break
      default:
        router.push(`/quotes/${quoteId}`)
    }
  };

  // Ստանալ quotes տվյալները Supabase-ից
  useEffect(() => {
    const loadQuotesData = async () => {
      if (!user) return
      
      try {
        // Ստանալ բոլոր quotes-ը օգտատիրոջ համար
        const { data: quotes, error: quotesError } = await supabase
          .from('quotes')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(50)

        if (quotesError) {
          console.error('Error loading quotes:', quotesError)
          // Օգտագործել fallback տվյալները
          setQuotesRows(getFallbackData())
          return
        }

        if (quotes && quotes.length > 0) {
          const formattedData = formatQuotesData(quotes)
          setQuotesRows(formattedData)
        } else {
          // Օգտագործել fallback տվյալները, եթե quotes չկան
          setQuotesRows(getFallbackData())
        }

      } catch (error) {
        console.error('Error loading quotes data:', error)
        setQuotesRows(getFallbackData())
      } finally {
        setLoading(false)
      }
    }

    loadQuotesData()
  }, [user])

  // Fallback տվյալներ եթե Supabase-ից տվյալներ չկան
  const getFallbackData = () => {
    return [
      {
        id: 'Q-005',
        cargo: 'Electronics',
        shipmentValue: '$15,400.00',
        premiumAmount: '$450.00',
        expirationDate: `Oct 25 – Nov 5, '25`,
        status: { 
          text: 'Pending Approval', 
          color: 'bg-[#cbd03c]/10', 
          dot: 'bg-[#cbd03c]', 
          textColor: 'text-[#cbd03c]' 
        },
        button: { 
          text: 'Approve Quote', 
          variant: 'primary' as const,
          onClick: (row: any) => handleQuoteAction(row, { status: 'submitted' })
        },
        quoteStatus: 'submitted'
      },
      {
        id: 'Q-021',
        cargo: 'Furniture',
        shipmentValue: '$20,000.00',
        premiumAmount: '$255.00',
        expirationDate: `Oct 20 – Nov 1, '25`,
        status: { 
          text: 'Approved', 
          color: 'bg-[#16a34a]/10', 
          dot: 'bg-[#16a34a]', 
          textColor: 'text-[#16a34a]' 
        },
        button: { 
          text: 'Approve Quote', 
          variant: 'primary' as const,
          onClick: (row: any) => handleQuoteAction(row, { status: 'approved', payment_status: 'paid' })
        },
        quoteStatus: 'approved'
      },
      {
        id: 'Q-054',
        cargo: 'Clothing',
        shipmentValue: '$5,500.00',
        premiumAmount: '$600.00',
        expirationDate: `Oct 22 – Nov 3, '25`,
        status: { 
          text: 'Declined', 
          color: 'bg-[#8ea0b0]/10', 
          dot: 'bg-[#8ea0b0]', 
          textColor: 'text-[#8ea0b0]' 
        },
        button: { 
          text: 'View Reason', 
          variant: 'secondary' as const,
          onClick: (row: any) => handleQuoteAction(row, { status: 'rejected' })
        },
        quoteStatus: 'rejected'
      },
      {
        id: 'Q-005-2',
        cargo: 'Machinery',
        shipmentValue: '$8,500.00',
        premiumAmount: '$165.00',
        expirationDate: `Oct 24 – Nov 4, '25`,
        status: { 
          text: 'Pending Approval', 
          color: 'bg-[#cbd03c]/10', 
          dot: 'bg-[#cbd03c]', 
          textColor: 'text-[#cbd03c]' 
        },
        button: { 
          text: 'Approve Quote', 
          variant: 'primary' as const,
          onClick: (row: any) => handleQuoteAction(row, { status: 'submitted' })
        },
        quoteStatus: 'submitted'
      },
      {
        id: 'Q-014',
        cargo: 'Chemicals',
        shipmentValue: '$12,800.00',
        premiumAmount: '$360.00',
        expirationDate: `Oct 21 – Nov 2, '25`,
        status: { 
          text: 'Approved', 
          color: 'bg-[#16a34a]/10', 
          dot: 'bg-[#16a34a]', 
          textColor: 'text-[#16a34a]' 
        },
        button: { 
          text: 'Approve Quote', 
          variant: 'primary' as const,
          onClick: (row: any) => handleQuoteAction(row, { status: 'approved', payment_status: 'paid' })
        },
        quoteStatus: 'approved'
      }
    ]
  };

 // Quotes էջի հատուկ լեյբլները - ՓՈԽԱՐԵԼ
const quotesTypeLabels = {
  approved: 'Converted',  // approved & paid -> կանաչ
  declined: 'Pending',    // approved բայց not paid -> դեղին
  expired: 'Declined'     // rejected -> կարմիր
};

// Quotes տվյալները chart-ների համար - ՓՈԽԱՐԵԼ
// Փոխել quotesData-ն բազմաթիվ ժամանակահատվածների համար
const quotesData = {
  'This Week': { 
    // Converted: approved & paid (կանաչ)
    approved: quotesRows.filter(q => {
      const date = new Date(q.rawData?.created_at);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return q.quoteStatus === 'approved' && q.paymentStatus === 'paid' && date >= weekAgo;
    }).length,
    // Pending: approved բայց not paid (դեղին)
    declined: quotesRows.filter(q => {
      const date = new Date(q.rawData?.created_at);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return q.quoteStatus === 'approved' && q.paymentStatus !== 'paid' && date >= weekAgo;
    }).length,
    // Declined: rejected (կարմիր)
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
// ՓՈԽԱՐԵԼ նաև գույները quotesData-ի համար
const quotesChartColors = {
  approved: { start: '#accff0', end: '#66ACEE' }, // Converted: բաց կանաչից մուգ կանաչ
  declined: { start: '#F8E2BE', end: '#EEDE66' }, // Pending: դեղին/նարնջագույն
  expired: { start: '#F8BEBE', end: '#EE6666' }   // Declined: կարմիր
};
// Փոփոխենք quotesData2 օբյեկտը:
const quotesData2 = {
  'This Week': { 
    totalQuotes: quotesRows.length, 
    expiringQuotes: quotesRows.filter(q => {
      // Հաշվել քանի quote-ներ են approved և paid (converted to policy)
      return q.quoteStatus === 'approved' && q.paymentStatus === 'paid';
    }).length, 
    expiringRate: Math.round((quotesRows.filter(q => {
      return q.quoteStatus === 'approved' && q.paymentStatus === 'paid';
    }).length / quotesRows.length) * 100) || 0 
  },
  'Next Week': { 
    totalQuotes: quotesRows.length, 
    expiringQuotes: quotesRows.filter(q => {
      // Հաշվել բոլոր quote-ները որոնք ներկայումս under review են (converting)
      return q.quoteStatus === 'submitted' || q.quoteStatus === 'under_review';
    }).length, 
    expiringRate: Math.round((quotesRows.filter(q => {
      return q.quoteStatus === 'submitted' || q.quoteStatus === 'under_review';
    }).length / quotesRows.length) * 100) || 0 
  },
  'In 2–4 Weeks': { 
    totalQuotes: quotesRows.length, 
    expiringQuotes: quotesRows.filter(q => {
      // Հաշվել quote-ները որոնք approved են բայց not yet paid
      return q.quoteStatus === 'approved' && q.paymentStatus !== 'paid';
    }).length, 
    expiringRate: Math.round((quotesRows.filter(q => {
      return q.quoteStatus === 'approved' && q.paymentStatus !== 'paid';
    }).length / quotesRows.length) * 100) || 0 
  },
  'Next Month': { 
    totalQuotes: quotesRows.length, 
    expiringQuotes: quotesRows.filter(q => {
      // Հաշվել draft quote-ները
      return q.quoteStatus === 'draft';
    }).length, 
    expiringRate: Math.round((quotesRows.filter(q => {
      return q.quoteStatus === 'draft';
    }).length / quotesRows.length) * 100) || 0 
  }
};

  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth <= 768)
    }
    
    checkScreenSize()
    window.addEventListener('resize', checkScreenSize)
    
    return () => window.removeEventListener('resize', checkScreenSize)
  }, []);

  const quotesColumns = [
    {
      key: 'id',
      label: 'Quote ID',
      sortable: true,
      renderDesktop: (value: string) => (
        <span className="font-poppins text-sm text-[#2563eb] underline hover:text-[#1d4ed8] transition-colors duration-300 cursor-pointer">
          {value}
        </span>
      )
    },
    {
      key: 'cargo',
      label: 'Cargo',
      sortable: true
    },
    {
      key: 'shipmentValue',
      label: 'Value',
      sortable: true
    },
    {
      key: 'premiumAmount',
      label: 'Premium',
      sortable: true
    },
    {
      key: 'expirationDate',
      label: 'Expiration Date',
      sortable: true
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      renderDesktop: (status: any) => renderStatus(status)
    },
    {
      key: 'button',
      label: 'Action',
      renderDesktop: (button: any, row: any) => renderButton(button, row),
      className: 'flex justify-end'
    }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f3f3f6] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#778B8E]"></div>
      </div>
    )
  }
  
  return (
    <DashboardLayout>
      <div className="min-w-[96%] max-w-[95.5%] !sm:min-w-[90.5%] mx-auto">
        {/* Main Content Grid */}
        <div className="
          grid grid-cols-1 xl:grid-cols-[76.5%_23%] gap-2 
          h-[calc(100vh-140px)] xl:min-h-[100vh] xl:max-h-[100vh]
          max-[1336px]:grid-cols-[76.5%_23%]
          max-[1280px]:h-auto max-[1280px]:min-h-auto max-[1280px]:max-h-none
          max-[1280px]:grid-cols-1 max-[1280px]:grid-rows-[auto_auto]
          max-[1024px]:flex max-[1024px]:flex-col-reverse
        ">
          {/* Left Column - 75% */}
          <div className="
            max-h-[89%] min-h-[88%] flex flex-col gap-2 xl:min-h-[100vh] xl:max-h-[89vh]
            max-[1280px]:min-h-auto max-[1280px]:max-h-none max-[1280px]:row-start-2
            max-[1024px]:min-h-auto max-[1024px]:max-h-none
          ">
            <div className="flex items-center gap-3 mt-4 mb-2 sm:mt-0">
              <img
                src="/quotes/header-ic.svg"
                alt=""
                className="w-[22px] h-[22px] sm:w-6 sm:h-6"
              />
              <h2 className="font-normal text-[18px] sm:text-[26px]">Quotes</h2>
            </div>

            <div className="block md:hidden">
              <ConversionChart 
  title="Quote Conversion Overview"
  data={quotesData}
  defaultActiveTime="This Week"
  showTimeDropdown={true}
  typeLabels={quotesTypeLabels}
  colors={quotesChartColors}  // Ավելացրեք այս տողը
/>
            </div>
            <div className="block md:hidden">
              <QuotesExpirationCard 
  activeTab={activeTab}
  onTabChange={setActiveTab}
  data={quotesData2}
  title="Conversion Rate"
  info="Total converting quotes"
  total="Total quotes"
  sub="Converting"
  percentageInfo="Converting"
  chartType="quotes"
/>
            </div>

            {/* Universal Table for Recent Activity */}
            <div className='max-h-[85%'>
              <UniversalTable
                title="Quotes Overview"
                showMobileHeader={true}
                rows={quotesRows}
                columns={quotesColumns}
                filterConfig={{
                  showActivityFilter: true,
                  showTimeframeFilter: true,
                  showSortFilter: true,
                  activityOptions: [
                    'All Activity', 
                    'Draft', 
                    'Submitted', 
                    'Under Review', 
                    'Approved', 
                    'Rejected'
                  ],
                  timeframeOptions: ['Last 7 days', 'Last 30 days', 'Last 3 months', 'All time'],
                  sortOptions: ['Status', 'Date', 'Value', 'Type']
                }}
                mobileDesign={{
                  showType: false,
                  showCargoIcon: true,
                  showDateIcon: true,
                  dateLabel: 'Expires',
                  buttonWidth: '47%'
                }}
                mobileDesignType="quotes"
                desktopGridCols="0.6fr 0.8fr 0.8fr 0.7fr 1.1fr 0.9fr 1fr"
              />
            </div>
          </div>

          {/* Right Column - 25% - Desktop View */}
          <div className="
            max-h-[89%] min-h-[88%] flex flex-col gap-2 xl:min-h-[100vh] xl:max-h-[89vh]
            max-[1336px]:flex max-[1336px]:flex-col max-[1336px]:gap-2
            max-[1280px]:min-h-auto max-[1280px]:max-h-none max-[1280px]:row-start-1
            max-[1280px]:hidden
          ">
            

            {/* Improve Your Quote Rate Card */}


            {/* Quote Conversion Rate */}
            <div className="flex-grow min-h-[calc(31%-4px)] xl:flex-[0_0_31%] xl:min-h-auto xl:h-auto">
              <ConversionChart 
                title="Quote Conversion Overview"
                data={quotesData}
                defaultActiveTime="This Week"
                showTimeDropdown={true}
                typeLabels={quotesTypeLabels}
                colors={quotesChartColors}  // Ավելացրեք այս տողը
              />
            </div>

            {/* Quotes Expiration Card */}
            <QuotesExpirationCard 
              activeTab={activeTab}
              onTabChange={setActiveTab}
              data={quotesData2}
              title="Conversion Rate"
              info="Total converting quotes"
              total="Total quotes"
              sub="Converting"
              percentageInfo="Converting"
              chartType="quotes"
            />

           <InfoWidget 
  title="Improve Your Quote Rate"
  rateValue={infoWidgetData.rateValue}
  description={
    <>
      Your Quotes are often Declined due to 
      <strong className="font-medium tracking-[0.03px]"> {infoWidgetData.mostCommonReason.reason}</strong>
    </>
  }
  subText={`${infoWidgetData.rejectedQuotes} of ${infoWidgetData.totalQuotes} quotes declined`}
/>
          </div>

          {/* Tablet View (768px - 1279px) - Three Widgets Side by Side */}
          <div className="
            hidden max-[1280px]:block min-[769px]:block
            max-[768px]:hidden
            max-[1280px]:row-start-1 max-[1280px]:w-full
            max-[1280px]:mb-2
          ">
            <div className="grid grid-cols-3 gap-2 w-full">
              {/* Improve Your Quote Rate Card */}
              <InfoWidget 
  title="Improve Your Quote Rate"
  rateValue={infoWidgetData.rateValue}
  description={
    <>
      Your Quotes are often Declined due to 
      <strong className="font-medium tracking-[0.03px]"> {infoWidgetData.mostCommonReason.reason}</strong>
    </>
  }
  subText={`${infoWidgetData.rejectedQuotes} of ${infoWidgetData.totalQuotes} quotes declined`}
/>

              {/* Quote Conversion Rate */}
              <div className="w-full">
                <ConversionChart 
  title="Quote Conversion Overview"
  data={quotesData}
  defaultActiveTime="This Week"
  showTimeDropdown={true}
  typeLabels={quotesTypeLabels}
  colors={quotesChartColors}  // Ավելացրեք այս տողը
/>
              </div>

              {/* Quotes Expiration Card */}
              <div className="w-full">
                <QuotesExpirationCard 
  activeTab={activeTab}
  onTabChange={setActiveTab}
  data={quotesData2}
  title="Conversion Rate"
  info="Total converting quotes"
  total="Total quotes"
  sub="Converting"
  percentageInfo="Converting"
  chartType="quotes"
/>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}