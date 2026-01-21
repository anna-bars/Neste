'use client'

import DashboardLayout from '../DashboardLayout'
import { useEffect, useState, useRef } from 'react'
import { UniversalTable, renderStatus, renderButton } from '@/app/components/tables/UniversalTable';
import QuotesExpirationCard from '@/app/components/charts/QuotesExpirationCard'
import InfoWidget from '@/app/components/widgets/InfoWidget'
import { PolicyTimelineWidget } from '@/app/components/charts/PolicyTimeline';

// Dashboard-ի տվյալներ - ԼՐԱՑՈՒՄ
const quotesRows = [
  {
    id: 'P-3401',
    cargo: 'Electronics',
    shipmentValue: '$12,500.00',
    premiumAmount: '$170.00',
    expirationDate: `Dec 1, '25 – Dec 1, '26`,
    status: { 
      text: 'Active', 
      color: 'bg-[#16a34a]/10', 
      dot: 'bg-[#16a34a]', 
      textColor: 'text-[#16a34a]' 
    },
    button: { 
      text: 'Download Cert', 
      variant: 'primary' as const,
      onClick: (row: any) => console.log('Download Certificate', row.id)
    }
  },
  {
    id: 'P-2015',
    cargo: 'Textiles',
    shipmentValue: '$25,800.00',
    premiumAmount: '$285.00',
    expirationDate: `Oct 15, '25 – Dec 15, '25`,
    status: { 
      text: 'Expiring Soon', 
      color: 'bg-[#cbd03c]/10', 
      dot: 'bg-[#cbd03c]', 
      textColor: 'text-[#cbd03c]' 
    },
    button: { 
      text: 'Renew Policy', 
      variant: 'primary' as const,
      onClick: (row: any) => console.log('Renew Policy', row.id)
    }
  }
];

const quotesColumns = [
  {
    key: 'id',
    label: 'Policy ID',
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
    label: 'Premium Paid',
    sortable: true
  },
  {
    key: 'expirationDate',
    label: 'Coverage Period',
    sortable: true
  },
  {
    key: 'status',
    label: 'Policy Status',
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
 
export default function ShipmentsPage() {
  const [activeTab, setActiveTab] = useState('This Week')
  const [loading, setLoading] = useState(true)
  const [isMobile, setIsMobile] = useState(false)

   const shipmentsData = {
    'This Week': { totalQuotes: 15, expiringQuotes: 7, expiringRate: 47 },
    'Next Week': { totalQuotes: 20, expiringQuotes: 5, expiringRate: 25 },
    'In 2–4 Weeks': { totalQuotes: 30, expiringQuotes: 10, expiringRate: 33 },
    'Next Month': { totalQuotes: 25, expiringQuotes: 15, expiringRate: 60 }
  }

  useEffect(() => {
    // Simulate loading data
    const timer = setTimeout(() => {
      setLoading(false)
    }, 1000)
    
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    // Check screen size for mobile
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
        {/* Mobile Header for Activity Section */}
       

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
                  <h2 className="font-normal text-[18px] sm:text-[26px]">Shipments / Policies</h2>
                   
                </div> 

            <div className="block md:hidden">
              <PolicyTimelineWidget 
                percentage={65}
                expiringPolicies={5}
                totalPolicies={15}
              />
            </div>
            <div className="block md:hidden">
              <QuotesExpirationCard 
        activeTab={activeTab}
        onTabChange={setActiveTab}
        data={shipmentsData}
        title='Docs Compliance'
         info = 'Policies with Missing Docs'
        total = 'Total policies'
        sub = 'Policies Missing Docs'
        percentageInfo = 'Policies'
      />
            </div>

               

           

            {/* Universal Table for Recent Activity */}
            <div className='max-h-[85%'>
            <UniversalTable
  title="Policies Overview"  // Changed from "Polices Overview" to "Policies Overview"
  showMobileHeader={true}
  rows={quotesRows}
  columns={quotesColumns}
  mobileDesign={{
    showType: false,
    showCargoIcon: true,
    showDateIcon: true,
    dateLabel: 'Expires',
    buttonWidth: '47%'
  }}
  mobileDesignType="quotes"
  desktopGridCols="0.5fr 0.8fr 0.8fr 0.7fr 1.1fr 0.9fr 1fr"
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
            <div className="flex justify-end items-center gap-3 !h-[39px]">
                  <button
                    className="inline-flex items-center justify-center gap-[10px] px-4 py-2 h-[35.68px] bg-[#f8fbff] border border-[#ffffff30] rounded-[6px] font-poppins text-base font-normal text-black cursor-pointer whitespace-nowrap"
                  >
                    <img
                      src="/quotes/download.svg"
                      alt=""
                      className="w-3 h-3 object-cover"
                    />
                    Download
                  </button>
                  <button className="inline-flex items-center justify-center gap-[10px] px-4 py-2 h-[35.68px] bg-[#0b0b0b] border-0 rounded-[6px] font-poppins text-base font-normal text-white cursor-pointer whitespace-nowrap">
                    Renew Policy
                  </button>
                </div>

                {/* Improve Your Quote Rate Card */}
              <InfoWidget 
                title="Reduce Policy Risk"
                rateValue={88}
                description={
                  <>
                    7 of your active policies are at risk due to
                    <strong className="font-medium tracking-[0.03px]"> Missing Documents</strong>
                  </>
                }
                perecntageInfo="Policy Risk Score"
              />
           

            <PolicyTimelineWidget 
            percentage={65}
            expiringPolicies={5}
            totalPolicies={15}
          />

            {/* Quotes Expiration Card */}
            <QuotesExpirationCard 
        activeTab={activeTab}
        onTabChange={setActiveTab}
        data={shipmentsData}
        title='Docs Compliance'
         info = 'Policies with Missing Docs'
        total = 'Total policies'
        sub = 'Policies Missing Docs'
        percentageInfo = 'Policies'
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
                rateValue={72}
                description={
                  <>
                    Your Quotes are often Declined due to 
                    <strong className="font-medium tracking-[0.03px]"> Inaccurate Cargo Value</strong>
                  </>
                }
                perecntageInfo="Approved Submissions"
              />
           

            <PolicyTimelineWidget 
            percentage={65}
            expiringPolicies={5}
            totalPolicies={15}
          />
            {/* Quotes Expiration Card */}
            <div className="w-full h-[100%]">
              <QuotesExpirationCard 
        activeTab={activeTab}
        onTabChange={setActiveTab}
        data={shipmentsData}
        title='Docs Compliance'
        info = 'Policies with Missing Docs'
        total = 'Total policies'
        sub = 'Policies Missing Docs'
        percentageInfo = 'Policies'
      />
            </div>
            
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}