'use client'

import DashboardLayout from '../DashboardLayout'
import { useEffect, useState, useRef } from 'react'
import { ConversionChart, ConversionChartData } from '../../components/charts/ConversionChart'
import { UniversalTable, renderStatus, renderButton } from '@/app/components/tables/UniversalTable';
import QuotesExpirationCard from '@/app/components/charts/QuotesExpirationCard'
import InfoWidget from '@/app/components/widgets/InfoWidget'
import { ApprovalRate } from '@/app/components/charts/ApprovalRate';
import DocumentItem from '@/app/components/documents/DocumentItem';
import { ActivityTableFilter } from '@/app/components/tables/ActivityTableFilter';

// Dashboard-ի տվյալներ - ԼՐԱՑՈՒՄ
const quotesRows = [
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
      onClick: (row: any) => console.log('Approve Quote', row.id)
    }
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
      onClick: (row: any) => console.log('Approve Quote', row.id)
    }
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
      onClick: (row: any) => console.log('View Reason', row.id)
    }
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
      onClick: (row: any) => console.log('Approve Quote', row.id)
    }
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
      onClick: (row: any) => console.log('Approve Quote', row.id)
    }
  }
]

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
 
export default function DocumentsPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedFilter, setSelectedFilter] = useState('All Activity')
  const [selectedTimeframe, setSelectedTimeframe] = useState('Last 30 days')
  const [selectedSort, setSelectedSort] = useState('Status')

  const documents = [
  { 
    type: 'Policy:', 
    id: 'P-0812', 
    status: 'Pending Review', 
    cargoType: 'Electronics', 
    summary: '1 Document Pending Review' 
  },
  { 
    type: 'Policy:',
    id: 'P-3401',
    status: 'Missing',
    cargoType: 'Machinery',
    summary: '1 of 3 Documents Missing' 
  },
  { 
    type: 'Policy:',
    id: 'P-0812',
    status: 'Rejected', // ✅ Rejected ստատուս
    cargoType: 'Textiles',
    summary: '2 of 3 Documents Approved' 
  },
  { 
    type: 'Quote:',
    id: 'Q-0072',
    status: 'Pending Review',
    cargoType: 'Clothing',
    summary: '1 Document Pending Review' 
  },
  { 
    type: 'Policy:',
    id: 'P-4419',
    status: 'Approved', // ✅ Approved ստատուս
    cargoType: 'Perishables',
    summary: 'All Documents Approved' 
  },
  { 
    type: 'Quote:',
    id: 'Q-4102',
    status: 'Rejected', // ✅ Rejected ստատուս
    cargoType: 'Furniture',
    summary: '2 of 3 Documents Approved' 
  },
  { 
    type: 'Policy:',
    id: 'P-4419',
    status: 'Approved', // ✅ Approved ստատուս
    cargoType: 'Perishables',
    summary: 'All Documents Approved' 
  },
  { 
    type: 'Policy:',
    id: 'P-4419',
    status: 'Approved', // ✅ Approved ստատուս
    cargoType: 'Perishables',
    summary: 'All Documents Approved' 
  },
  { 
    type: 'Policy:',
    id: 'P-4419',
    status: 'Approved', // ✅ Approved ստատուս
    cargoType: 'Perishables',
    summary: 'All Documents Approved' 
  },
  { 
    type: 'Policy:',
    id: 'P-4419',
    status: 'Approved', // ✅ Approved ստատուս
    cargoType: 'Perishables',
    summary: 'All Documents Approved' 
  },
]

  const filteredDocuments = documents.filter(doc => {
    // Search filter
    const matchesSearch = searchQuery === '' || 
      doc.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.cargoType.toLowerCase().includes(searchQuery.toLowerCase())
    
    // Activity filter
    const matchesActivity = selectedFilter === 'All Activity' || 
      doc.status === selectedFilter
    
    return matchesSearch && matchesActivity
  })
  const quotesDatas = {
  'This Week': { approved: 17, declined: 2, expired: 18 },
  'This Month': { approved: 35, declined: 5, expired: 42 },
  'Last Month': { approved: 28, declined: 3, expired: 31 },
  'Last Quarter': { approved: 120, declined: 15, expired: 135 }
};
  const defaultData: Record<string, ConversionChartData> = {
      'This Week': { approved: 12, declined: 5, expired: 8 },
      'This Month': { approved: 17, declined: 9, expired: 18 },
      'Last Month': { approved: 22, declined: 7, expired: 15 },
      'Last Quarter': { approved: 65, declined: 28, expired: 42 }
    };
  const quotesData2 = {
    'This Week': { totalQuotes: 22, expiringQuotes: 7, expiringRate: 32 },
    'Next Week': { totalQuotes: 18, expiringQuotes: 12, expiringRate: 67 },
    'In 2–4 Weeks': { totalQuotes: 35, expiringQuotes: 4, expiringRate: 11 },
    'Next Month': { totalQuotes: 42, expiringQuotes: 38, expiringRate: 90 }
  }
  
  // Quotes էջի հատուկ լեյբլները
  const quotesTypeLabels = {
    approved: 'Pending',
    declined: 'Missing',
    expired: 'Rejected'
  };
  const [activeTab, setActiveTab] = useState('This Week')
  const [loading, setLoading] = useState(true)
  const [isMobile, setIsMobile] = useState(false)

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
      <div className="min-w-[96%] max-w-[95.5%] !sm:min-w-[90.5%] mx-auto document">
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
             
             <div className="flex items-center gap-3 mt-4 mb-2 sm:mt-0 sm:hidden">
                  <img
                    src="/quotes/header-ic.svg"
                    alt=""
                    className="w-[22px] h-[22px] sm:w-6 sm:h-6"
                  />
                  <h2 className="font-normal text-[18px] sm:text-[26px]">Documents</h2>
                   
                </div> 

            <div className="block md:hidden">
              <ConversionChart 
                title="Documents Requiring Action"
                data={quotesDatas}
                defaultActiveTime="This Week"
                showTimeDropdown={true} // Քանի որ միայն մեկ ժամանակահատված կա
                typeLabels={quotesTypeLabels}
              />
            </div>
            <div className="block md:hidden">
               <div style={{ maxWidth: '380px' }}>
              <ApprovalRate 
                title="Quote Approval Rate"
                subtitle="Approved quotes percentage."
                approvalPercentage={78}
                approvedCount={42}
                typeLabel="Quote"
                autoUpdate={false}
                colors={{
                  primary: '#1a202c',
                  secondary: '#718096',
                  progressStart: 'rgba(102, 156, 238, 0.3)',
                  progressEnd: 'rgba(66, 153, 225, 0.6)',
                  textPrimary: '#2d3748',
                  textSecondary: '#4a5568'
                }}
              />
            </div>
            </div>
           <div className="">
      {/* ActivityTableFilter օգտագործումը */}
      <div className='mb-2'>
        <ActivityTableFilter
         pxValue="0"
        showGetNewQuote={false}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        selectedFilter={selectedFilter}
        setSelectedFilter={setSelectedFilter}
        selectedTimeframe={selectedTimeframe}
        setSelectedTimeframe={setSelectedTimeframe}
        selectedSort={selectedSort}
        setSelectedSort={setSelectedSort}
        title="Documents" // Փոխում ենք վերնագիրը
        filterConfig={{
          showActivityFilter: true,
          showTimeframeFilter: true,
          showSortFilter: true,
          // Կարգավորում ենք ըստ փաստաթղթերի
          activityOptions: ['All Activity', 'Pending Review', 'Approved', 'Rejected', 'In Progress'],
          timeframeOptions: ['Last 7 days', 'Last 30 days', 'Last 3 months', 'Last year', 'All time'],
          sortOptions: ['Date', 'Status', 'Document Type', 'ID']
        }}
      />
      </div>

      {/* Փաստաթղթերի ցուցադրում */}
      <div className="overflow-y-scroll max-h-[82vh]  sm:max-h-[84%] pb-22 rounded sm:max-h-max-content flex justify-start flex-wrap gap-y-3 sm:gap-2.5">
        {filteredDocuments.map((doc, index) => (
          <DocumentItem
            key={index}
            type={doc.type}
            id={doc.id}
            status={doc.status}
            cargoType={doc.cargoType}
            summary={doc.summary}
            buttonText="View Details"
          />
        ))}
      </div>
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
              

            

            {/* Quotes Expiration Card */}
            <div style={{ maxWidth: '380px' }}>
              <ApprovalRate 
                title="Quote Approval Rate"
                subtitle="Approved quotes percentage."
                approvalPercentage={78}
                approvedCount={42}
                typeLabel="Quote"
                autoUpdate={false}
                colors={{
                  primary: '#1a202c',
                  secondary: '#718096',
                  progressStart: 'rgba(102, 156, 238, 0.3)',
                  progressEnd: 'rgba(66, 153, 225, 0.6)',
                  textPrimary: '#2d3748',
                  textSecondary: '#4a5568'
                }}
              />
            </div>

{/* Quote Conversion Rate */}
            <div className="flex-grow min-h-[calc(31%-4px)] xl:flex-[0_0_31%] xl:min-h-auto xl:h-auto">
             <ConversionChart 
                title="Documents Requiring Action"
                data={quotesDatas}
                defaultActiveTime="This Week"
                showTimeDropdown={true} // Քանի որ միայն մեկ ժամանակահատված կա
                typeLabels={quotesTypeLabels}
              />
            </div>

            <InfoWidget 
                title="Improve Submission Quality"
                rateValue={92}
                description={
                  <>
                    Your documents are often Rejected due to
                    <strong className="font-medium tracking-[0.03px]"> Low-Resolution Scans</strong>
                  </>
                }
                perecntageInfo="Approved Submissions"
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
           

            {/* Quote Conversion Rate */}
            <div className="flex-grow min-h-[calc(31%-4px)] xl:flex-[0_0_31%] xl:min-h-auto xl:h-auto">
              <ConversionChart 
                title="Documents Requiring Action"
                data={quotesDatas}
                defaultActiveTime="This Week"
                showTimeDropdown={true} // Քանի որ միայն մեկ ժամանակահատված կա
                typeLabels={quotesTypeLabels}
              />
            </div>

            {/* Quotes Expiration Card */}
            <div className="w-full h-[100%]">
              <div style={{ maxWidth: '380px' }}>
              <ApprovalRate 
                title="Quote Approval Rate"
                subtitle="Approved quotes percentage."
                approvalPercentage={78}
                approvedCount={42}
                typeLabel="Quote"
                autoUpdate={false}
                colors={{
                  primary: '#1a202c',
                  secondary: '#718096',
                  progressStart: 'rgba(102, 156, 238, 0.3)',
                  progressEnd: 'rgba(66, 153, 225, 0.6)',
                  textPrimary: '#2d3748',
                  textSecondary: '#4a5568'
                }}
              />
            </div>
            </div>
            
            </div>
          </div>
        </div>
        
      </div>
    </DashboardLayout>
  )
}