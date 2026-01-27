'use client'

import DashboardLayout from '../DashboardLayout'
import { useEffect, useState } from 'react'
import { ConversionChart } from '../../components/charts/ConversionChart'
import { UniversalTable, renderStatus, renderButton } from '@/app/components/tables/UniversalTable';
import QuotesExpirationCard from '@/app/components/charts/QuotesExpirationCard'
import InfoWidget from '@/app/components/widgets/InfoWidget'
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { useUser } from '@/app/context/UserContext';
import { 
  loadQuotesData, 
  getStatusConfig, 
  formatQuoteId, 
  formatDate, 
  formatExpirationDate,
  formatQuotesData,
  calculateInfoWidgetData,
  calculateQuotesData,
  calculateQuotesData2
} from './quotesHelpers';
import { quotesColumns } from './quotesColumns';
import { quotesTypeLabels, quotesChartColors } from './quotesConstants';

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

  useEffect(() => {
    const loadData = async () => {
      if (!user) return
      
      try {
        const data = await loadQuotesData(user, supabase, handleQuoteAction, getStatusConfig, formatQuoteId, formatDate, formatExpirationDate)
        setQuotesRows(data)
      } catch (error) {
        console.error('Error loading quotes data:', error)
        setQuotesRows([])
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [user])

  const infoWidgetData = calculateInfoWidgetData(quotesRows);
  const quotesData = calculateQuotesData(quotesRows);
  const quotesData2 = calculateQuotesData2(quotesRows);

  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth <= 768)
    }
    
    checkScreenSize()
    window.addEventListener('resize', checkScreenSize)
    
    return () => window.removeEventListener('resize', checkScreenSize)
  }, []);

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
                colors={quotesChartColors}
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

          <div className="
            max-h-[89%] min-h-[88%] flex flex-col gap-2 xl:min-h-[100vh] xl:max-h-[89vh]
            max-[1336px]:flex max-[1336px]:flex-col max-[1336px]:gap-2
            max-[1280px]:min-h-auto max-[1280px]:max-h-none max-[1280px]:row-start-1
            max-[1280px]:hidden
          ">
            <div className="flex-grow min-h-[calc(31%-4px)] xl:flex-[0_0_31%] xl:min-h-auto xl:h-auto">
              <ConversionChart 
                title="Quote Conversion Overview"
                data={quotesData}
                defaultActiveTime="This Week"
                showTimeDropdown={true}
                typeLabels={quotesTypeLabels}
                colors={quotesChartColors}
              />
            </div>

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
                  {infoWidgetData.totalQuotes === 0 ? (
                    'Create your first quote to get started'
                  ) : (
                    <>
                      Your Quotes are often Declined due to 
                      <strong className="font-medium tracking-[0.03px]"> {infoWidgetData.mostCommonReason.reason}</strong>
                    </>
                  )}
                </>
              }
              subText={infoWidgetData.totalQuotes > 0 ? `${infoWidgetData.rejectedQuotes} of ${infoWidgetData.totalQuotes} quotes declined` : 'No quotes yet'}
            />
          </div>

          <div className="
            hidden max-[1280px]:block min-[769px]:block
            max-[768px]:hidden
            max-[1280px]:row-start-1 max-[1280px]:w-full
            max-[1280px]:mb-2
          ">
            <div className="grid grid-cols-3 gap-2 w-full">
              <InfoWidget 
                title="Improve Your Quote Rate"
                rateValue={infoWidgetData.rateValue}
                description={
                  <>
                    {infoWidgetData.totalQuotes === 0 ? (
                      'Create your first quote to get started'
                    ) : (
                      <>
                        Your Quotes are often Declined due to 
                        <strong className="font-medium tracking-[0.03px]"> {infoWidgetData.mostCommonReason.reason}</strong>
                      </>
                    )}
                  </>
                }
                subText={infoWidgetData.totalQuotes > 0 ? `${infoWidgetData.rejectedQuotes} of ${infoWidgetData.totalQuotes} quotes declined` : 'No quotes yet'}
              />

              <div className="w-full">
                <ConversionChart 
                  title="Quote Conversion Overview"
                  data={quotesData}
                  defaultActiveTime="This Week"
                  showTimeDropdown={true}
                  typeLabels={quotesTypeLabels}
                  colors={quotesChartColors}
                />
              </div>

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