'use client'

import DashboardLayout from '../DashboardLayout'
import { useEffect, useState, useRef } from 'react'
import { ConversionChart, ConversionChartData } from '../../components/charts/ConversionChart'
import { WelcomeWidget } from '@/app/components/widgets/WelcomeWidget'
import { HighValueCargoWidget } from '@/app/components/widgets/HighValueCargoWidget'
import { PerformanceOverview } from '@/app/components/widgets/PerformanceOverview'
import { UniversalTable, renderStatus, renderButton } from '@/app/components/tables/UniversalTable';
import { createClient } from '@/lib/supabase/client';
import { useUser } from '@/app/context/UserContext';
import { useRouter } from 'next/navigation';

// Dashboard-ի columns
const dashboardColumns = [
  {
    key: 'id',
    label: 'ID',
    sortable: true,
    renderDesktop: (value: string) => (
      <span className="font-poppins text-sm text-[#2563eb] underline hover:text-[#1d4ed8] transition-colors duration-300 cursor-pointer">
        {value}
      </span>
    )
  },
  {
    key: 'type',
    label: 'Type',
    sortable: true,
    renderDesktop: (type: string) => (
      <div className={`px-2 py-1 rounded-full text-xs font-medium ${
        type === 'Quote' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
      }`}>
        {type}
      </div>
    )
  },
  {
    key: 'cargo',
    label: 'Cargo',
    sortable: true,
    renderDesktop: (_: any, row: any) => (
      <span className="font-poppins text-sm text-black">
        {row.cargo}
      </span>
    )
  },
  {
    key: 'value',
    label: 'Value',
    sortable: true,
    renderDesktop: (_: any, row: any) => (
      <span className="font-poppins text-sm text-black">
        ${row.value?.toLocaleString('en-US') || '0'}
      </span>
    )
  },
  {
    key: 'status',
    label: 'Status',
    sortable: true,
    renderDesktop: (status: any) => renderStatus(status)
  },
  {
    key: 'expiring',
    label: 'Expiring',
    sortable: true,
    renderDesktop: (_: any, row: any) => {
      // Ստուգել, թե արդյոք կա expiringDays հատկությունը
      if (row.expiringDays !== undefined) {
        if (row.expiringDays === 0) {
          return (
            <span className="font-poppins text-sm text-amber-600 font-medium">
              Today
            </span>
          );
        } else if (row.expiringDays > 0) {
          return (
            <span className="font-poppins text-sm text-gray-700">
              {row.expiringDays} day{row.expiringDays !== 1 ? 's' : ''} left
            </span>
          );
        } else if (row.expiringDays < 0) {
          const daysAgo = Math.abs(row.expiringDays);
          return (
            <span className="font-poppins text-sm text-rose-600">
              {daysAgo} day{daysAgo !== 1 ? 's' : ''} ago
            </span>
          );
        }
      }
      return (
        <span className="font-poppins text-sm text-gray-400">
          -
        </span>
      );
    }
  },
  {
    key: 'date',
    label: 'Created',
    sortable: true
  },
  {
    key: 'button',
    label: 'Action',
    renderDesktop: (button: any, row: any) => renderButton(button, row),
    className: 'flex justify-end'
  }
];

export default function DashboardPage() {
  const [loading, setLoading] = useState(true)
  const [dashboardRows, setDashboardRows] = useState<any[]>([])
  const [userName, setUserName] = useState<string>('')
  const [sortedRows, setSortedRows] = useState<any[]>([]);
  // Performance metrics
  const [performanceMetrics, setPerformanceMetrics] = useState({
    totalInsured: { value: '84', decimal: '5k', total: 84500 },
    activePolicies: { count: 8, percentage: 47 },
    quotesAwaiting: { count: 3, percentage: 25 },
    underReview: { count: 0, percentage: 0 },
    readyToPay: { count: 2, percentage: 17 }
  })
  
  const [activeWidget, setActiveWidget] = useState(0)
  const [isMobile, setIsMobile] = useState(false)
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const { user } = useUser()
  const router = useRouter()
  const supabase = createClient()

  // Conversion data հաշվարկ
  const calculateConversionData = (quotes: any[], period: string = 'This Month'): ConversionChartData => {
    if (!quotes || !quotes.length) {
      return { approved: 0, declined: 0, expired: 0 };
    }

    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();
    
    let startDate: Date;
    let endDate: Date = now;

    switch (period) {
      case 'This Week':
        startDate = new Date(now);
        startDate.setDate(now.getDate() - 7);
        break;
        
      case 'This Month':
        startDate = new Date(currentYear, currentMonth, 1);
        break;
        
      case 'Last Month':
        if (currentMonth === 0) {
          startDate = new Date(currentYear - 1, 11, 1);
          endDate = new Date(currentYear, 0, 1);
        } else {
          startDate = new Date(currentYear, currentMonth - 1, 1);
          endDate = new Date(currentYear, currentMonth, 1);
        }
        endDate.setMilliseconds(endDate.getMilliseconds() - 1);
        break;
        
      case 'Last Quarter':
        const currentQuarter = Math.floor(currentMonth / 3);
        let lastQuarterStartMonth: number;
        let lastQuarterYear: number = currentYear;
        
        if (currentQuarter === 0) {
          lastQuarterStartMonth = 9;
          lastQuarterYear = currentYear - 1;
        } else {
          lastQuarterStartMonth = (currentQuarter - 1) * 3;
        }
        
        startDate = new Date(lastQuarterYear, lastQuarterStartMonth, 1);
        endDate = new Date(currentYear, currentQuarter * 3, 1);
        endDate.setMilliseconds(endDate.getMilliseconds() - 1);
        break;
        
      default:
        startDate = new Date(currentYear, currentMonth, 1);
    }

    // Ֆիլտրել quotes ըստ ժամանակահատվածի
    const filteredQuotes = quotes.filter(quote => {
      if (!quote.created_at) return false;
      const quoteDate = new Date(quote.created_at);
      
      if (quoteDate.getFullYear() === 2026 && 
          quoteDate.getMonth() === 0 && 
          quoteDate.getDate() === 19) {
        
        if (period === 'This Week') {
          const daysDiff = Math.floor((now.getTime() - quoteDate.getTime()) / (1000 * 60 * 60 * 24));
          return daysDiff <= 7;
        } else if (period === 'This Month') {
          return now.getFullYear() === 2026 && now.getMonth() === 0;
        } else if (period === 'Last Month') {
          return false;
        } else if (period === 'Last Quarter') {
          return false;
        }
      }
      
      return quoteDate >= startDate && quoteDate <= endDate;
    });

    const approvedCount = filteredQuotes.filter(q => 
      q.status === 'approved' && q.payment_status === 'paid'
    ).length;

    const declinedCount = filteredQuotes.filter(q => 
      q.status === 'rejected'
    ).length;

    const expiredCount = filteredQuotes.filter(q => {
      if (q.status === 'expired') return true;
      
      if (q.quote_expires_at) {
        const expirationDate = new Date(q.quote_expires_at);
        return expirationDate < now;
      }
      
      return false;
    }).length;

    return {
      approved: approvedCount,
      declined: declinedCount,
      expired: expiredCount
    };
  };
// Ֆունկցիա՝ հաշվարկելու մնացած օրերը մինչև ժամկետի լրանալը
// Ֆունկցիա՝ հաշվարկելու մնացած օրերը մինչև ժամկետի լրանալը
const calculateDaysUntilExpiry = (item: any) => {
  const now = new Date();
  let expirationDate: Date | null = null;
  
  // Ստուգել, թե quote-ը rejected է կամ approved & paid
  if (item.dataType === 'quote') {
    const quote = item.rawData;
    
    // Եթե quote-ը rejected է, չցուցադրել expiration date
    if (quote.status === 'rejected') {
      return null;
    }
    
    // Եթե quote-ը approved & paid է, չցուցադրել expiration date
    if (quote.status === 'approved' && quote.payment_status === 'paid') {
      return null;
    }
    
    // Quote-ի համար օգտագործել quote_expires_at
    if (quote.quote_expires_at) {
      expirationDate = new Date(quote.quote_expires_at);
    }
  } else if (item.dataType === 'policy') {
    // Policy-ի համար օգտագործել coverage_end
    if (item.rawData?.coverage_end) {
      expirationDate = new Date(item.rawData.coverage_end);
    }
  }
  
  if (!expirationDate) return null;
  
  const diffTime = expirationDate.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays;
};
  const [conversionData, setConversionData] = useState<Record<string, ConversionChartData>>({
    'This Week': { approved: 0, declined: 0, expired: 0 },
    'This Month': { approved: 0, declined: 0, expired: 0 },
    'Last Month': { approved: 0, declined: 0, expired: 0 },
    'Last Quarter': { approved: 0, declined: 0, expired: 0 }
  });

  const [activeConversionPeriod, setActiveConversionPeriod] = useState<string>('This Month');

  useEffect(() => {
    const loadDashboardData = async () => {
      if (!user) return
      
      try {
        // Ստանալ օգտատիրոջ տվյալները profiles աղյուսակից
        const { data: userProfile, error: profileError } = await supabase
          .from('profiles')
          .select('full_name, email')
          .eq('id', user.id)
          .single()

        if (profileError) {
          console.error('Error fetching user profile:', profileError)
          const emailName = user?.email?.split('@')[0] || 'User'
          setUserName(emailName.charAt(0).toUpperCase() + emailName.slice(1))
        } else if (userProfile?.full_name) {
          const firstName = userProfile.full_name.split(' ')[0]
          setUserName(firstName)
        } else {
          const emailName = userProfile?.email?.split('@')[0] || user?.email?.split('@')[0] || 'User'
          setUserName(emailName.charAt(0).toUpperCase() + emailName.slice(1))
        }

        // Ստանալ quote_requests-ները
        const { data: quotes, error: quotesError } = await supabase
          .from('quotes')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(50)

        if (quotesError) throw quotesError

        // Ստանալ policies-ները
        const { data: policies, error: policiesError } = await supabase
          .from('policies')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(50)

        if (policiesError) throw policiesError

        // Միավորել և format անել տվյալները - ԹԱՐՄԵՐԸ ՎԵՐԵՎՈՒՄ
        const formattedData = formatCombinedData(
          quotes || [],
          policies || []
        )
        setDashboardRows(formattedData)

        // Հաշվել conversion data բոլոր ժամանակահատվածների համար
        const periods = ['This Week', 'This Month', 'Last Month', 'Last Quarter'];
        const newConversionData: Record<string, ConversionChartData> = {};
        
        periods.forEach(period => {
          newConversionData[period] = calculateConversionData(quotes || [], period);
        });
        
        setConversionData(newConversionData);

        // Կոդի հատվածը, որը պետք է փոխարինել `loadDashboardData` ֆունկցիայում

// Հաշվել ավելի ճշգրիտ performance metrics
// Կոդի հատվածը, որը պետք է փոխարինել `loadDashboardData` ֆունկցիայում
// dashboard/page.tsx-ում loadDashboardData ֆունկցիայում
// Այս մասը փոխարինեք ձեր ներկայիս metrics-ի հաշվարկի հետ

// ...ձեր գոյություն ունեցող կոդը...

// Տվյալների հաշվարկից հետո՝ հաշվել metrics-ը
const totalInsuredAmount = (policies || []).reduce((sum, policy) => 
  sum + (parseFloat(policy.coverage_amount) || 0), 0);

const activePoliciesCount = (policies || []).filter(p => p.status === 'active').length;
const totalPoliciesCount = policies?.length || 1;

// 1. Contracts Due to Expire
const contractsDueToExpireCount = formattedData.filter(item => {
  if (item.expiringDays === null || item.expiringDays === undefined) return false;
  
  const isActiveOrApprovedPaid = 
    (item.dataType === 'policy' && item.policyStatus === 'active') ||
    (item.dataType === 'quote' && item.quoteStatus === 'approved' && item.paymentStatus === 'paid');
  
  return isActiveOrApprovedPaid && item.expiringDays >= 0 && item.expiringDays <= 2;
}).length;

// 2. Required Document Uploads - փաստաթղթերի հիման վրա
// 2. Required Document Uploads - փաստաթղթերի հիման վրա
let requiredDocumentUploadsCount = 0;

try {
  // Ստանալ quote-ների և policy-ների ID-ները
  const userQuoteIds = (quotes || []).map(q => q.id);
  const userPolicyIds = (policies || []).map(p => p.id);
  
  if (userQuoteIds.length > 0 || userPolicyIds.length > 0) {
    // Փնտրել փաստաթղթեր, որոնք կապված են օգտատիրոջ quote-ների կամ policy-ների հետ
    const { data: userDocuments, error: userDocsError } = await supabase
      .from('documents')
      .select('*')
      .or(`quote_id.in.(${userQuoteIds.join(',')}),policy_id.in.(${userPolicyIds.join(',')})`);

    if (!userDocsError && userDocuments) {
      // Հաշվել pending փաստաթղթերը
      requiredDocumentUploadsCount = userDocuments.filter(doc => {
        return doc.commercial_invoice_status === 'pending' ||
               doc.packing_list_status === 'pending' ||
               doc.bill_of_lading_status === 'pending';
      }).length;
    }
  }
} catch (error) {
  console.error("Error fetching user documents:", error);
}

// 3. Under Review
const underReviewCount = (quotes || []).filter(q => q.status === 'under_review').length;

// 4. Ready to Pay
const readyToPayCount = (quotes || []).filter(q => 
  q.status === 'approved' && q.payment_status !== 'paid'
).length;

const totalQuotes = quotes?.length || 1;

// Ավելի ճշգրիտ հաշվարկներ
const totalInsuredInK = Math.floor(totalInsuredAmount / 1000);
const decimalPart = Math.round((totalInsuredAmount % 1000) / 10);

// Հիմա հաշվարկենք arrowDirection և arrowColor
// Մենթալ տրամաբանություն. Եթե count > 0, ապա up arrow (բացի Ready to Pay-ից, որը ունի հակառակ տրամաբանություն)
// Ready to Pay-ի համար՝ count > 0 = good (blue up), count === 0 = bad (red down)
// Մյուսների համար՝ count > 0 = bad (red up), count === 0 = good (blue down)

const calculateArrowConfig = (metricId: string, count: number, previousCount?: number) => {
  switch(metricId) {
    case 'active-policies':
      // Active Policies: count > 0 = good (blue up)
      return {
        arrowDirection: 'up' as const,
        arrowColor: 'blue' as const,
        isPositive: true
      };
      
    case 'quotes-awaiting':
      // Required Document Uploads: count > 0 = bad (red up)
      return {
        arrowDirection: 'up' as const,
        arrowColor: 'red' as const,
        isPositive: false
      };
      
    case 'under-review':
      // Contracts Due to Expire: count > 0 = bad (red up)
      return {
        arrowDirection: 'up' as const,
        arrowColor: 'red' as const,
        isPositive: false
      };
      
    case 'ready-to-pay':
      // Ready to Pay: count > 0 = good (blue up)
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

// Տեղադրել metrics-ը state-ում
setPerformanceMetrics({
  totalInsured: { 
    value: totalInsuredInK.toString(), 
    decimal: `${decimalPart}k`, 
    total: totalInsuredAmount 
  },
  activePolicies: { 
    count: activePoliciesCount, 
    percentage: Math.round((activePoliciesCount / totalPoliciesCount) * 100) || 0
  },
  quotesAwaiting: {
    count: requiredDocumentUploadsCount, 
    percentage: Math.round((requiredDocumentUploadsCount / totalQuotes) * 100) || 0
  },
  underReview: {
    count: contractsDueToExpireCount, 
    percentage: Math.round((contractsDueToExpireCount / totalQuotes) * 100) || 0
  },
  readyToPay: { 
    count: readyToPayCount, 
    percentage: Math.round((readyToPayCount / totalQuotes) * 100) || 0
  }
});
      } catch (error) {
        console.error('Error loading dashboard data:', error)
        
      } finally {
        setLoading(false)
      }
    }

    loadDashboardData()
  }, [user])

  // Status config ֆունկցիա quotes-ի համար
  const getQuoteStatusConfig = (quote: any) => {
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
    if (['approved', 'pay_to_activate', 'submitted'].includes(quote.status) && quote.expiration_time && !isApprovedAndPaid) {
      return {
        ...baseConfig,
        text: baseConfig.text + daysText
      };
    }
    
    return baseConfig;
  };

  // Status config ֆունկցիա policies-ի համար
  const getPolicyStatusConfig = (policy: any) => {
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
useEffect(() => {
  if (dashboardRows.length > 0) {
    // Sort ըստ ամսաթվի - ամենանորերը վերևում
    const sorted = [...dashboardRows].sort((a, b) => {
      const dateA = new Date(a.rawData?.created_at || a.date || '1970-01-01').getTime();
      const dateB = new Date(b.rawData?.created_at || b.date || '1970-01-01').getTime();
      return dateB - dateA;
    });
    setSortedRows(sorted);
  } else {
    
  }
}, [dashboardRows]);

  const formatQuoteId = (id: string) => {
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

// formatCombinedData ֆունկցիան պետք է ուղղենք
// formatCombinedData ֆունկցիան պետք է ուղղենք
const formatCombinedData = (quotes: any[], policies: any[]) => {
  const allItems: any[] = [];

  // Ստեղծել quotes-ի տարրերը
  quotes.forEach(quote => {
    const statusConfig = getQuoteStatusConfig(quote);
    const createdAt = new Date(quote.created_at);
    const expiringDays = calculateDaysUntilExpiry({ 
      dataType: 'quote', 
      rawData: quote 
    });
    
    const buttonAction = { 
      text: statusConfig.buttonText, 
      variant: statusConfig.buttonVariant,
      onClick: (row: any) => handleQuoteAction(row, quote)
    };
    
    allItems.push({
      type: 'Quote',
      id: quote.quote_number || formatQuoteId(quote.id),
      cargo: quote.cargo_type || 'Unknown',
      value: quote.shipment_value || 0,
      status: {
        text: statusConfig.text,
        color: statusConfig.color,
        dot: statusConfig.dot,
        textColor: statusConfig.textColor
      },
      date: formatDate(quote.created_at),
      button: buttonAction,
      rawData: quote,
      dataType: 'quote',
      quoteStatus: quote.status,
      paymentStatus: quote.payment_status,
      // Կարևոր! - պահպանել ISO ամսաթիվը sort-ի համար
      sortDate: quote.created_at, // Պահպանել ISO string-ը
      timestamp: createdAt.getTime(), // Պահպանել timestamp-ը
      expiringDays: expiringDays // Ավելացնել expiring օրերը
    });
  });

  // Ստեղծել policies-ի տարրերը
  policies.forEach(policy => {
    const statusConfig = getPolicyStatusConfig(policy);
    const createdAt = new Date(policy.created_at);
    const expiringDays = calculateDaysUntilExpiry({ 
      dataType: 'policy', 
      rawData: policy 
    });
    
    const buttonAction = { 
      text: statusConfig.buttonText, 
      variant: statusConfig.buttonVariant,
      onClick: (row: any) => handlePolicyAction(row, policy)
    };
    
    allItems.push({
      type: 'Policy',
      id: policy.policy_number,
      cargo: policy.cargo_type || 'Unknown',
      value: parseFloat(policy.coverage_amount) || 0,
      status: {
        text: statusConfig.text,
        color: statusConfig.color,
        dot: statusConfig.dot,
        textColor: statusConfig.textColor
      },
      date: formatDate(policy.created_at),
      button: buttonAction,
      rawData: policy,
      dataType: 'policy',
      policyStatus: policy.status,
      // Կարևոր! - պահպանել ISO ամսաթիվը sort-ի համար
      sortDate: policy.created_at, // Պահպանել ISO string-ը
      timestamp: createdAt.getTime(), // Պահպանել timestamp-ը
      expiringDays: expiringDays // Ավելացնել expiring օրերը
    });
  });

  // SORT անել ըստ ամսաթվի - ԹԱՐՄԵՐԸ ՎԵՐԵՎՈՒՄ
  // Օգտագործել timestamp-ը կամ ISO string-ը
  return allItems.sort((a, b) => {
    // Ստուգել, թե արդյոք տվյալներն ունեն timestamp
    if (a.timestamp && b.timestamp) {
      return b.timestamp - a.timestamp;
    }
    // Հակառակ դեպքում օգտագործել ISO string-ը
    return new Date(b.sortDate || b.rawData?.created_at).getTime() - 
           new Date(a.sortDate || a.rawData?.created_at).getTime();
  });
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

  const handlePolicyAction = (row: any, policy: any) => {
    const policyId = row.rawData?.id || row.id;
    
    if (policy.status === 'active') {
      router.push(`/shipments/${policyId}`)
    } else {
      router.push(`/quotes/${policy.quote_id}`)
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

  const handleScroll = () => {
    if (!scrollContainerRef.current || !isMobile) return
    
    const container = scrollContainerRef.current
    const scrollLeft = container.scrollLeft
    const widgetWidth = container.clientWidth
    const currentIndex = Math.round(scrollLeft / widgetWidth)
    
    setActiveWidget(currentIndex)
  };
const calculateArrowConfig = (metricId: string, count: number, previousCount?: number) => {
  switch(metricId) {
    case 'active-policies':
      // Active Policies: count > 0 = good (blue up)
      return {
        arrowDirection: 'up' as const,
        arrowColor: 'blue' as const,
        isPositive: true
      };
      
    case 'quotes-awaiting':
      // Required Document Uploads: count > 0 = bad (red up)
      return {
        arrowDirection: 'up' as const,
        arrowColor: 'red' as const,
        isPositive: false
      };
      
    case 'under-review':
      // Contracts Due to Expire: count > 0 = bad (red up)
      return {
        arrowDirection: 'down' as const,
        arrowColor: 'blue' as const,
        isPositive: true
      };
      
    case 'ready-to-pay':
      // Ready to Pay: count > 0 = good (blue up)
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

  const scrollToWidget = (index: number) => {
    if (!scrollContainerRef.current || !isMobile) return
    
    const container = scrollContainerRef.current
    const widgetWidth = container.clientWidth
    container.scrollTo({
      left: index * widgetWidth,
      behavior: 'smooth'
    })
  };

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
        <div className="flex gap-2 items-center mt-4 mb-2 xl:hidden">
          <img
            src="/dashboard/hashtag.svg"
            alt=""
            className="w-[22px] h-[22px] sm:w-5 sm:h-5"
          />
          <h2 className="font-normal text-[18px] sm:text-lg">
            Dashboard
          </h2>
        </div>

        <div className="
          grid grid-cols-1 xl:grid-cols-[76.5%_23%] gap-2 
          h-[calc(100vh-140px)] xl:min-h-[100vh] xl:max-h-[100vh]
          max-[1336px]:grid-cols-[76.5%_23%]
          max-[1280px]:h-auto max-[1280px]:min-h-auto max-[1280px]:max-h-none
          max-[1280px]:grid-cols-1 max-[1280px]:grid-rows-[auto_auto]
          max-[1024px]:flex max-[1024px]:flex-col-reverse
        ">
          <div className="
            max-h-[89%] min-h-[88%] flex flex-col gap-2 xl:min-h-[100vh] xl:max-h-[89vh]
            max-[1280px]:min-h-auto max-[1280px]:max-h-none max-[1280px]:row-start-2
            max-[1024px]:min-h-auto max-[1024px]:max-h-none
          ">
<PerformanceOverview 
  title="Performance Overview"
  timePeriod="This Month"
  metrics={[
    {
      id: 'total-insured-amount',
      value: performanceMetrics.totalInsured.value,
      decimal: performanceMetrics.totalInsured.decimal,
      prefix: '$',
      label: 'Total Insured Amount',
      hasArrow: false
    },
    {
      id: 'active-policies',
      value: performanceMetrics.activePolicies.count.toString(),
      decimal: '',
      suffix: '%',
      label: 'Active Policies',
      hasArrow: true,
      ...calculateArrowConfig('active-policies', performanceMetrics.activePolicies.count)
    },
    {
      id: 'quotes-awaiting',
      value: performanceMetrics.quotesAwaiting.count.toString(),
      decimal: '',
      suffix: '%',
      label: 'Required Document Uploads',
      hasArrow: true,
      ...calculateArrowConfig('quotes-awaiting', performanceMetrics.quotesAwaiting.count)
    },
    {
      id: 'under-review',
      value: performanceMetrics.underReview.count.toString(),
      decimal: '',
      suffix: '%',
      label: 'Contracts Due to Expire',
      hasArrow: true,
      ...calculateArrowConfig('under-review', performanceMetrics.underReview.count)
    },
    {
      id: 'ready-to-pay',
      value: performanceMetrics.readyToPay.count.toString(),
      decimal: '',
      suffix: '%',
      label: 'Ready to Pay',
      hasArrow: true,
      ...calculateArrowConfig('ready-to-pay', performanceMetrics.readyToPay.count)
    }
  ]}
/>

            <div className="block md:hidden">
              <ConversionChart 
                title="Quote Conversion Rate"
                data={conversionData}
                defaultActiveTime={activeConversionPeriod}
                showTimeDropdown={true}
                typeLabels={{
                  approved: 'approved',
                  declined: 'declined',
                  expired: 'expired'
                }}
                colors={{
                  approved: { start: '#BED5F8', end: '#669CEE' },
                  declined: { start: '#F8E2BE', end: '#EEDE66' },
                  expired: { start: '#FFA4A4', end: '#EB6025' }
                }}
                onTimeChange={(time) => setActiveConversionPeriod(time)}
              />
            </div>

<UniversalTable
  title="Recent Activity"
  showMobileHeader={false}
  rows={sortedRows}
  columns={dashboardColumns}
  filterConfig={{
    showActivityFilter: true,
    showTimeframeFilter: true,
    showSortFilter: false,
    activityOptions: [
      'All Activity', 
      'Quotes',
      'Policies',
      'Draft', 
      'Submitted', 
      'Under Review', 
      'Approved', 
      'Rejected',
      'Active'
    ],
    timeframeOptions: ['Last 7 days', 'Last 30 days', 'Last 3 months', 'All time']
  }}
  mobileDesign={{
    showType: true,
    showCargoIcon: true,
    showDateIcon: true,
    dateLabel: 'Created',
    buttonWidth: '47%',
    showExpiringIcon: true // Ավելացնել նոր prop
  }}
  mobileDesignType="dashboard"
  desktopGridCols="0.55fr 0.35fr 0.55fr 0.45fr 0.8fr 0.6fr 0.8fr 0.7fr"
/>
          </div>

          <div className="
            max-h-[89%] min-h-[88%] flex flex-col gap-2 xl:min-h-[100vh] xl:max-h-[89vh]
            max-[1336px]:flex max-[1336px]:flex-col max-[1336px]:gap-2
            max-[1280px]:min-h-auto max-[1280px]:max-h-none max-[1280px]:row-start-1
            max-[1280px]:hidden
          ">
            <WelcomeWidget userName={userName} />

            <div className="flex-grow min-h-[calc(31%-4px)] xl:flex-[0_0_31%] xl:min-h-auto xl:h-auto">
              <ConversionChart 
                title="Quote Conversion Rate"
                data={conversionData}
                defaultActiveTime={activeConversionPeriod}
                showTimeDropdown={true}
                typeLabels={{
                  approved: 'approved',
                  declined: 'declined',
                  expired: 'expired'
                }}
                colors={{
                  approved: { start: '#BED5F8', end: '#669CEE' },
                  declined: { start: '#F8E2BE', end: '#EEDE66' },
                  expired: { start: '#FFA4A4', end: '#EB6025' }
                }}
                onTimeChange={(time) => setActiveConversionPeriod(time)}
              />
            </div>

            <HighValueCargoWidget 
  percentage={calculateCoverageUtilization(dashboardRows)}
  mtdValue={calculateAverageCoverage(dashboardRows)}
  widgetType="coverage-utilization" // Ավելացնել նոր prop
/>
          </div>

          <div className="
            hidden max-[1280px]:block min-[769px]:block
            max-[768px]:hidden
            max-[1280px]:row-start-1 max-[1280px]:w-full
            max-[1280px]:mb-2
          ">
            <div className="grid grid-cols-3 gap-2 w-full">
              <div className="w-full h-[240px]">
                <WelcomeWidget userName={userName} />
              </div>

              <div className="w-full h-[240px]">
                <div className="h-full w-full">
                  <ConversionChart 
                    title="Quote Conversion Rate"
                    data={conversionData}
                    defaultActiveTime={activeConversionPeriod}
                    showTimeDropdown={true}
                    typeLabels={{
                      approved: 'approved',
                      declined: 'declined',
                      expired: 'expired'
                    }}
                    colors={{
                      approved: { start: '#BED5F8', end: '#669CEE' },
                      declined: { start: '#F8E2BE', end: '#EEDE66' },
                      expired: { start: '#FFA4A4', end: '#EB6025' }
                    }}
                    onTimeChange={(time) => setActiveConversionPeriod(time)}
                  />
                </div> 
              </div>

              <div className="w-full h-[240px]">
                <HighValueCargoWidget 
  percentage={calculateCoverageUtilization(dashboardRows)}
  mtdValue={calculateAverageCoverage(dashboardRows)}
  widgetType="coverage-utilization" // Ավելացնել նոր prop
/>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}

function calculateHighValuePercentage(data: any[]) {
  if (!data.length) return 0
  
  const highValueThreshold = 10000  // <-- Սա 10,000$ է
  const highValueCount = data.filter(item => item.value >= highValueThreshold).length
  return (highValueCount / data.length) * 100  // <-- Բաժանում է բոլոր items-ների քանակի վրա
}
// Հաշվել ապահովագրական ծածկույթի օգտագործումը
// Փոխարինիր սա քո DashboardPage.tsx-ում
function calculateCoverageUtilization(data: any[]): number {
  if (!data.length) return 0;
  
  // 1. Հաշվել ակտիվ ապահովագրությունները
  const activePolicies = data.filter(item => 
    item.dataType === 'policy' && item.policyStatus === 'active'
  );
  
  // 2. Հաշվել quotes-ները, որոնք approved և paid են (և դարձել են policies)
  const approvedPaidQuotes = data.filter(item => 
    item.dataType === 'quote' && 
    item.quoteStatus === 'approved' && 
    item.paymentStatus === 'paid'
  );
  
  // 3. Հաշվել quotes-ների ընդհանուր քանակը (բացառել draft-ները և rejected-ները)
  const totalQuotes = data.filter(item => 
    item.dataType === 'quote' && 
    item.quoteStatus !== 'draft' && 
    item.quoteStatus !== 'rejected' &&
    item.quoteStatus !== 'expired'
  ).length;
  
  // 4. Հաշվել փոխակերպված քանակը
  // Նախընտրելի է՝ activePolicies + approvedPaidQuotes
  // Բայց որոշ approvedPaidQuotes-ներ արդեն ունեն իրենց policy-ները
  const totalConverted = activePolicies.length;
  
  if (totalQuotes === 0) return 0;
  
  // 5. Հաշվել տոկոսը, բայց սահմանափակել 100%-ով
  const percentage = (totalConverted / totalQuotes) * 100;
  
  // 6. Սահմանափակել 0-ից 100 միջակայքում
  return Math.min(Math.max(0, percentage), 100);
}
// Հաշվել միջին ապահովագրական գումարը
// Փոխարինիր սա քո DashboardPage.tsx-ում
function calculateAverageCoverage(data: any[]): string {
  if (!data.length) return '0';
  
  // Ֆիլտրել միայն ակտիվ ապահովագրությունները
  const activePolicies = data.filter(item => 
    item.dataType === 'policy' && item.policyStatus === 'active'
  );
  
  if (activePolicies.length === 0) return '0';
  
  // Հաշվել ընդհանուր ապահովագրական գումարը
  const totalValue = activePolicies.reduce((sum, item) => sum + (item.value || 0), 0);
  const averageValue = totalValue / activePolicies.length;
  
  // Ձևաչափել
  if (averageValue >= 1000000) {
    return `$${(averageValue / 1000000).toFixed(1)}M`;
  } else if (averageValue >= 1000) {
    return `$${(averageValue / 1000).toFixed(1)}k`;
  }
  
  return `$${Math.round(averageValue).toLocaleString()}`;
}