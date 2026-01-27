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
import { formatCombinedData, calculateDaysUntilExpiry, getQuoteStatusConfig, getPolicyStatusConfig, formatQuoteId, formatDate } from './dashboardHelpers';
import { calculateCoverageUtilization, calculateAverageCoverage, calculateArrowConfig } from './dashboardCalculations';
import { dashboardColumns } from './dashboardColumns';

export default function DashboardPage() {
  const [loading, setLoading] = useState(true)
  const [dashboardRows, setDashboardRows] = useState<any[]>([])
  const [userName, setUserName] = useState<string>('')
  const [sortedRows, setSortedRows] = useState<any[]>([]);
  
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
        const { data: userProfile, error: profileError } = await supabase
          .from('profiles')
          .select('full_name, email')
          .eq('id', user.id)
          .single()

        if (profileError) {
          const emailName = user?.email?.split('@')[0] || 'User'
          setUserName(emailName.charAt(0).toUpperCase() + emailName.slice(1))
        } else if (userProfile?.full_name) {
          const firstName = userProfile.full_name.split(' ')[0]
          setUserName(firstName)
        } else {
          const emailName = userProfile?.email?.split('@')[0] || user?.email?.split('@')[0] || 'User'
          setUserName(emailName.charAt(0).toUpperCase() + emailName.slice(1))
        }

        const { data: quotes, error: quotesError } = await supabase
          .from('quotes')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(50)

        if (quotesError) throw quotesError

        const { data: policies, error: policiesError } = await supabase
          .from('policies')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(50)

        if (policiesError) throw policiesError

        const formattedData = formatCombinedData(
          quotes || [],
          policies || [],
          getQuoteStatusConfig,
          getPolicyStatusConfig,
          formatQuoteId,
          formatDate,
          calculateDaysUntilExpiry
        )
        setDashboardRows(formattedData)

        const periods = ['This Week', 'This Month', 'Last Month', 'Last Quarter'];
        const newConversionData: Record<string, ConversionChartData> = {};
        
        periods.forEach(period => {
          newConversionData[period] = calculateConversionData(quotes || [], period);
        });
        
        setConversionData(newConversionData);

        const totalInsuredAmount = (policies || []).reduce((sum, policy) => 
          sum + (parseFloat(policy.coverage_amount) || 0), 0);

        const activePoliciesCount = (policies || []).filter(p => p.status === 'active').length;
        const totalPoliciesCount = policies?.length || 1;

        let requiredDocumentUploadsCount = 0;

        try {
          const userQuoteIds = (quotes || []).map(q => q.id);
          const userPolicyIds = (policies || []).map(p => p.id);
          
          if (userQuoteIds.length > 0 || userPolicyIds.length > 0) {
            const { data: userDocuments, error: userDocsError } = await supabase
              .from('documents')
              .select('*')
              .or(`quote_id.in.(${userQuoteIds.join(',')}),policy_id.in.(${userPolicyIds.join(',')})`);

            if (!userDocsError && userDocuments) {
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

        const underReviewCount = (quotes || []).filter(q => q.status === 'under_review').length;

        const readyToPayCount = (quotes || []).filter(q => 
          q.status === 'approved' && q.payment_status !== 'paid'
        ).length;

        const totalQuotes = quotes?.length || 1;

        const totalInsuredInK = Math.floor(totalInsuredAmount / 1000);
        const decimalPart = Math.round((totalInsuredAmount % 1000) / 10);

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
            count: underReviewCount, 
            percentage: Math.round((underReviewCount / totalQuotes) * 100) || 0
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

  useEffect(() => {
    if (dashboardRows.length > 0) {
      const sorted = [...dashboardRows].sort((a, b) => {
        const dateA = new Date(a.rawData?.created_at || a.date || '1970-01-01').getTime();
        const dateB = new Date(b.rawData?.created_at || b.date || '1970-01-01').getTime();
        return dateB - dateA;
      });
      setSortedRows(sorted);
    }
  }, [dashboardRows]);

  const handleQuoteAction = (row: any, quote: any) => {
    const quoteId = row.rawData?.id || row.id;
    const status = quote.status;
    const paymentStatus = quote.payment_status;
    
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
                showExpiringIcon: true
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
              widgetType="coverage-utilization"
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
                  widgetType="coverage-utilization"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}