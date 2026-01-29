'use client'

import DashboardLayout from '../DashboardLayout'
import { useEffect, useState } from 'react'
import { UniversalTable, renderStatus, renderButton } from '@/app/components/tables/UniversalTable';
import QuotesExpirationCard from '@/app/components/charts/QuotesExpirationCard'
import InfoWidget from '@/app/components/widgets/InfoWidget'
import { PolicyTimelineWidget } from '@/app/components/charts/PolicyTimeline';
import { createClient } from '@/lib/supabase/client';
import { useUser } from '@/app/context/UserContext';
import { 
  loadPoliciesData,
  calculateDocsComplianceByTimePeriod,
  calculatePolicyTimelineData,
  calculatePolicyRiskData,
  formatCoveragePeriod,
  renderDocsStatus
} from './shipmentsHelpers';
import { policiesColumns } from './shipmentsColumns';

export default function ShipmentsPage() {
  const [activeTab, setActiveTab] = useState('This Week')
  const [loading, setLoading] = useState(true)
  const [isMobile, setIsMobile] = useState(false)
  const [policiesRows, setPoliciesRows] = useState<any[]>([])
  const [documentsData, setDocumentsData] = useState<any>({})
  
  const { user } = useUser()
  const supabase = createClient()

  useEffect(() => {
    const loadData = async () => {
      if (!user) return
      
      try {
        const { policies, documents } = await loadPoliciesData(user, supabase)
        setDocumentsData(documents)
        setPoliciesRows(policies)
      } catch (error) {
        console.error('Error loading policies data:', error)
        setPoliciesRows([])
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [user])

  const timeBasedComplianceData = calculateDocsComplianceByTimePeriod(policiesRows)

  const shipmentsData = {
    'This Week': { 
      totalQuotes: timeBasedComplianceData.thisWeek.total, 
      expiringQuotes: timeBasedComplianceData.thisWeek.missingDocs,
      expiringRate: timeBasedComplianceData.thisWeek.total > 0 
        ? Math.round((timeBasedComplianceData.thisWeek.missingDocs / timeBasedComplianceData.thisWeek.total) * 100)
        : 0
    },
    'Next Week': { 
      totalQuotes: timeBasedComplianceData.nextWeek.total, 
      expiringQuotes: timeBasedComplianceData.nextWeek.missingDocs,
      expiringRate: timeBasedComplianceData.nextWeek.total > 0 
        ? Math.round((timeBasedComplianceData.nextWeek.missingDocs / timeBasedComplianceData.nextWeek.total) * 100)
        : 0
    },
    'In 2–4 Weeks': { 
      totalQuotes: timeBasedComplianceData.in24Weeks.total, 
      expiringQuotes: timeBasedComplianceData.in24Weeks.missingDocs,
      expiringRate: timeBasedComplianceData.in24Weeks.total > 0 
        ? Math.round((timeBasedComplianceData.in24Weeks.missingDocs / timeBasedComplianceData.in24Weeks.total) * 100)
        : 0
    },
    'Next Month': { 
      totalQuotes: timeBasedComplianceData.nextMonth.total, 
      expiringQuotes: timeBasedComplianceData.nextMonth.missingDocs,
      expiringRate: timeBasedComplianceData.nextMonth.total > 0 
        ? Math.round((timeBasedComplianceData.nextMonth.missingDocs / timeBasedComplianceData.nextMonth.total) * 100)
        : 0
    }
  }

  const policyTimelineData = calculatePolicyTimelineData(policiesRows)
  const policyRiskData = calculatePolicyRiskData(policiesRows)

  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth <= 768)
    }
    
    checkScreenSize()
    window.addEventListener('resize', checkScreenSize)
    
    return () => window.removeEventListener('resize', checkScreenSize)
  }, [])

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
              <h2 className="font-normal text-[18px] sm:text-[26px]">Shipments / Policies</h2>
            </div>

            <div className="block md:hidden">
              <PolicyTimelineWidget 
                percentage={policyTimelineData.percentage}
                expiringPolicies={policyTimelineData.expiringPolicies}
                totalPolicies={policyTimelineData.totalPolicies}
              />
            </div>
            <div className="block md:hidden">
              <QuotesExpirationCard 
                activeTab={activeTab}
                onTabChange={setActiveTab}
                data={shipmentsData}
                title='Docs Compliance'
                info='Policies w/ missing docs'
                total='Total policies'
                sub='Policies w/ missing docs'
                percentageInfo='Docs Compliance'
                chartType='shipments'
              />
            </div>

            <div className='max-h-[91%] h-[96%]'>
              <UniversalTable
                title="Policies Overview"
                showMobileHeader={true}
                rows={policiesRows}
                columns={policiesColumns}
                filterConfig={{
                  showActivityFilter: true,
                  showTimeframeFilter: true,
                  showSortFilter: true,
                  activityOptions: [
                    'All Policies', 
                    'Active', 
                    'Expiring in 3 Days', 
                    'Expiring Soon', 
                    'Expired', 
                    'Pending'
                  ],
                  timeframeOptions: ['Last 7 days', 'Last 30 days', 'Last 3 months', 'All time'],
                  sortOptions: ['Status', 'Date', 'Value', 'Cargo Type', 'Docs Status']
                }}
                mobileDesign={{
                  showType: false,
                  showCargoIcon: true,
                  showDateIcon: true,
                  dateLabel: 'Expires',
                  buttonWidth: '47%',
                }}
                mobileDesignType="quotes"
                desktopGridCols="0.7fr 0.7fr 0.6fr 0.7fr 1.2fr 0.9fr 0.8fr 0.7fr"
              />
            </div>
          </div>

          <div className="
            max-h-[89%] min-h-[88%] flex flex-col gap-2 xl:min-h-[100vh] xl:max-h-[89vh]
            max-[1336px]:flex max-[1336px]:flex-col max-[1336px]:gap-2
            max-[1280px]:min-h-auto max-[1280px]:max-h-none max-[1280px]:row-start-1
            max-[1280px]:hidden
          ">
            <PolicyTimelineWidget 
              percentage={policyTimelineData.percentage}
              expiringPolicies={policyTimelineData.expiringPolicies}
              totalPolicies={policyTimelineData.totalPolicies}
            />

            <QuotesExpirationCard 
              activeTab={activeTab}
              onTabChange={setActiveTab}
              data={shipmentsData}
              title='Docs Compliance'
              info='Policies w/ missing docs'
              total='Total policies'
              sub='Policies w/ missing docs'
              percentageInfo='Docs Compliance'
              chartType='shipments'
            />

            <InfoWidget 
              title="Policy Expiration Risk"
              rateValue={policyRiskData.expirationRisk}
              description={
                <>
                  {policyRiskData.expiringIn3Days} of your active policies are expiring in 
                  <strong className="font-medium tracking-[0.03px]"> 3 days or less</strong>
                </>
              }
              subText={`${policyRiskData.expiringIn3Days} of ${policyRiskData.totalPolicies} policies expiring soon`}
              perecntageInfo="Expiration Risk"
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
                title="Policy Expiration Risk"
                rateValue={policyRiskData.expirationRisk}
                description={
                  <>
                    {policyRiskData.expiringIn3Days} of your active policies are expiring in 
                    <strong className="font-medium tracking-[0.03px]"> 3 days or less</strong>
                  </>
                }
                subText={`${policyRiskData.expiringIn3Days} of ${policyRiskData.totalPolicies} policies expiring soon`}
                perecntageInfo="Expiration Risk"
              />

              <PolicyTimelineWidget 
                percentage={policyTimelineData.percentage}
                expiringPolicies={policyTimelineData.expiringPolicies}
                totalPolicies={policyTimelineData.totalPolicies}
              />

              <div className="w-full h-[100%]">
                <QuotesExpirationCard 
                  activeTab={activeTab}
                  onTabChange={setActiveTab}
                  data={shipmentsData}
                  title='Docs Compliance'
                  info='Policies w/ missing docs'
                  total='Total policies'
                  sub='Policies w/ missing docs'
                  percentageInfo='Docs Compliance'
                  chartType='shipments'
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}