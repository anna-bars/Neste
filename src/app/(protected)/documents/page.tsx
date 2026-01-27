'use client'

import DashboardLayout from '../DashboardLayout'
import { useEffect, useState } from 'react'
import { ConversionChart } from '../../components/charts/ConversionChart'
import { UniversalTable, renderStatus, renderButton } from '@/app/components/tables/UniversalTable';
import QuotesExpirationCard from '@/app/components/charts/QuotesExpirationCard'
import InfoWidget from '@/app/components/widgets/InfoWidget'
import { ApprovalRate } from '@/app/components/charts/ApprovalRate';
import DocumentItem from '@/app/components/documents/DocumentItem';
import { ActivityTableFilter } from '@/app/components/tables/ActivityTableFilter';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { useUser } from '@/app/context/UserContext';
import { 
  loadDocumentsData, 
  formatDocumentStatus, 
  calculateDocumentStats,
  calculateDocumentsData,
  calculateInfoWidgetData 
} from './documentsHelpers';

interface DocumentStatus {
  type: string;
  id: string;
  status: 'Pending Review' | 'Missing' | 'Rejected' | 'Approved' | 'In Progress';
  cargoType: string;
  summary: string;
  policyId?: string;
  quoteId?: string;
}

export default function DocumentsPage() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedFilter, setSelectedFilter] = useState('All Activity')
  const [selectedTimeframe, setSelectedTimeframe] = useState('Last 30 days')
  const [selectedSort, setSelectedSort] = useState('Status')
  const [loading, setLoading] = useState(true)
  const [isMobile, setIsMobile] = useState(false)
  const [documentsData, setDocumentsData] = useState<DocumentStatus[]>([])
  
  const { user } = useUser()
  const supabase = createClient()

  useEffect(() => {
    const loadData = async () => {
      if (!user) return
      
      try {
        const data = await loadDocumentsData(user, supabase, formatDocumentStatus)
        setDocumentsData(data)
      } catch (error) {
        console.error('Error loading documents data:', error)
        setDocumentsData([])
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [user])

  const quotesTypeLabels = {
    approved: 'Pending',
    declined: 'Missing',
    expired: 'Rejected'
  }

  const [activeTab, setActiveTab] = useState('This Week')

  const documentStats = calculateDocumentStats(documentsData)
  const documentsChartData = calculateDocumentsData(documentStats)
  const infoWidgetData = calculateInfoWidgetData(documentsData, documentStats)
  const mostCommonReason = infoWidgetData.getMostCommonRejectionReason()

  const filteredDocuments = documentsData.filter(doc => {
    const matchesSearch = searchQuery === '' || 
      doc.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.cargoType.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesActivity = selectedFilter === 'All Activity' || 
      doc.status === selectedFilter
    
    return matchesSearch && matchesActivity
  })

  const handleDocumentClick = (doc: DocumentStatus) => {
    if (doc.policyId) {
      router.push(`/shipments/${doc.policyId}`)
    } else if (doc.quoteId) {
      router.push(`/quotes/${doc.quoteId}`)
    } else {
      console.log('Document clicked:', doc)
    }
  }

  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth <= 768)
    }
    
    checkScreenSize()
    window.addEventListener('resize', checkScreenSize)
    
    return () => window.removeEventListener('resize', checkScreenSize)
  }, [])

  const renderEmptyState = () => {
    return (
      <div className="relative flex flex-col items-center justify-center py-16 px-4 w-full">
        <div className="mb-8 relative group">
          <div className="relative w-24 h-24">
            <div className="
              absolute inset-0 
              bg-white/80 backdrop-blur-sm
              rounded-xl 
              border border-white/60
              shadow-[0_8px_32px_rgba(31,38,135,0.07)]
              flex items-center justify-center
              transform transition-all duration-500 
              group-hover:scale-110 group-hover:shadow-[0_12px_48px_rgba(37,99,235,0.15)]
              group-hover:border-blue-300/40
            ">
              <div className="relative">
                <div className="
                  w-14 h-14 
                  bg-gradient-to-br from-blue-500 via-blue-600 to-cyan-500
                  rounded-lg 
                  flex items-center justify-center 
                  shadow-lg shadow-blue-500/30
                  animate-gradient-x
                ">
                  <svg 
                    className="w-6 h-6 text-white" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2.2} 
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" 
                    />
                  </svg>
                </div>
                
                <div className="
                  absolute -inset-2 border-2 border-blue-300/20 rounded-xl
                  transform -rotate-3
                  transition-transform duration-700 group-hover:rotate-3
                "></div>
              </div>
            </div>
            
            <div className="absolute inset-0">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="
                    absolute w-1.5 h-1.5 
                    bg-gradient-to-r from-blue-400 to-cyan-400 
                    rounded-full
                    animate-float-fast
                  "
                  style={{
                    top: `${Math.sin(i * 2 * Math.PI/3) * 32 + 50}%`,
                    left: `${Math.cos(i * 2 * Math.PI/3) * 32 + 50}%`,
                    animationDelay: `${i * 0.2}s`
                  }}
                />
              ))}
            </div>
            
            <div className="
              absolute -inset-3 
              bg-gradient-to-r from-blue-400/20 via-cyan-400/10 to-purple-400/20
              rounded-2xl 
              blur-md 
              opacity-0 
              group-hover:opacity-60
              transition-opacity duration-500
            "></div>
          </div>
          
          <div className="
            absolute -bottom-1 inset-x-0 h-2 
            bg-gradient-to-t from-gray-200/30 to-transparent 
            blur-sm 
            rounded-full
            transform scale-x-90
          "></div>
        </div>
        
        <div className="text-center space-y-3 mb-8 max-w-md">
          <h3 className="font-poppins font-semibold text-xl text-gray-900 tracking-tight">
            {searchQuery ? (
              <span className="bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                No documents found
              </span>
            ) : (
              <span className="bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                No Documents Yet
              </span>
            )}
          </h3>
          
          <p className="font-poppins text-gray-500 text-sm leading-relaxed px-2">
            {searchQuery 
              ? `"${searchQuery}" didn't match any documents in the database`
              : "You don't have any documents yet. Documents will appear here after you create a policy or quote."}
          </p>
        </div>
        
        <div className="flex flex-col gap-3 items-center">
          <button 
            onClick={() => router.push('/quotes/new/shipment')}
            className="
              relative
              px-6 py-3
              bg-gradient-to-r from-blue-500 to-blue-600
              text-white 
              rounded-lg
              font-poppins font-medium text-sm
              hover:from-blue-600 hover:to-blue-700
              transition-all duration-300
              shadow-md hover:shadow-lg
              hover:-translate-y-0.5
              flex items-center gap-2
              overflow-hidden
              group/btn
            "
          >
            <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover/btn:translate-x-[100%] transition-transform duration-700"></span>
            
            <svg className="w-4 h-4 relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
            </svg>
            <span className="relative z-10">Create Your First Quote</span>
          </button>
          
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery('')}
              className="
                px-5 py-2.5
                bg-white 
                text-gray-700 
                rounded-lg
                font-poppins font-medium text-xs
                border border-gray-200
                hover:border-gray-300 hover:bg-gray-50
                transition-all duration-300
                shadow-sm hover:shadow
                hover:-translate-y-0.5
                flex items-center gap-1.5
              "
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
              Clear Search
            </button>
          )}
        </div>
        
        {!searchQuery && (
          <div className="mt-8 pt-6 border-t border-gray-100/60 w-full max-w-xs">
            <div className="flex flex-col items-center gap-2 text-xs text-gray-400">
              <p className="text-center mb-2">Documents will be available after:</p>
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1.5">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  Creating a quote
                </span>
                <div className="w-0.5 h-0.5 bg-gray-300 rounded-full"></div>
                <span className="flex items-center gap-1.5">
                  <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                  Policy approval
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }

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
                data={documentsChartData}
                defaultActiveTime="This Week"
                showTimeDropdown={true}
                typeLabels={quotesTypeLabels}
              />
            </div>
            <div className="block md:hidden">
               <div style={{ maxWidth: '380px' }}>
              <ApprovalRate 
                title="Documents Approval Rate"
                subtitle="Approved documents percentage."
                approvalPercentage={documentStats.approvalRate}
                approvedCount={documentStats.approvedCount}
                typeLabel="Document"
                autoUpdate={false}
                colors={{
                  primary: '#1a202c',
                  secondary: '#718096',
                  progressStart: 'rgba(102, 156, 238, 0.3)',
                  progressEnd: 'rgba(66, 153, 225, 0.6)',
                  textPrimary: '#2d3748',
                  textSecondary: '#4a5568'
                }}
                disabledProgress={false}
              />
            </div>
            </div>
            
            <div className="">
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
                  title="Documents"
                  filterConfig={{
                    showActivityFilter: true,
                    showTimeframeFilter: true,
                    showSortFilter: true,
                    activityOptions: ['All Activity', 'Pending Review', 'Approved', 'Rejected', 'In Progress', 'Missing'],
                    timeframeOptions: ['Last 7 days', 'Last 30 days', 'Last 3 months', 'Last year', 'All time'],
                    sortOptions: ['Date', 'Status', 'Document Type', 'ID']
                  }}
                />
              </div>

              <div className="overflow-y-auto max-h-[82vh] sm:max-h-[100%] rounded flex justify-start flex-wrap gap-y-3 sm:gap-2.5 p-2">
                {filteredDocuments.length > 0 ? (
                  filteredDocuments.map((doc, index) => (
                    <DocumentItem
                      key={index}
                      type={doc.type}
                      id={doc.id}
                      status={doc.status}
                      cargoType={doc.cargoType}
                      summary={doc.summary}
                      buttonText="View Details"
                      onClick={() => handleDocumentClick(doc)}
                    />
                  ))
                ) : (
                  renderEmptyState()
                )}
              </div>
            </div>

          </div>

          <div className="
            max-h-[89%] min-h-[88%] flex flex-col gap-2 xl:min-h-[100vh] xl:max-h-[89vh]
            max-[1336px]:flex max-[1336px]:flex-col max-[1336px]:gap-2
            max-[1280px]:min-h-auto max-[1280px]:max-h-none max-[1280px]:row-start-1
            max-[1280px]:hidden
          ">
            <div style={{ maxWidth: '380px' }}>
              <ApprovalRate 
                title="Documents Approval Rate"
                subtitle="Approved documents percentage."
                approvalPercentage={documentStats.approvalRate}
                approvedCount={documentStats.approvedCount}
                typeLabel="Document"
                autoUpdate={false}
                colors={{
                  primary: '#1a202c',
                  secondary: '#718096',
                  progressStart: 'rgba(102, 156, 238, 0.3)',
                  progressEnd: 'rgba(66, 153, 225, 0.6)',
                  textPrimary: '#2d3748',
                  textSecondary: '#4a5568'
                }}
                disabledProgress={false}
              />
            </div>

            <div className="flex-grow min-h-[calc(31%-4px)] xl:flex-[0_0_31%] xl:min-h-auto xl:h-auto">
              <ConversionChart 
                title="Documents Requiring Action"
                data={documentsChartData}
                defaultActiveTime="This Week"
                showTimeDropdown={true}
                typeLabels={quotesTypeLabels}
              />
            </div>

            <InfoWidget 
              title="Improve Submission Quality"
              rateValue={mostCommonReason.percentage}
              description={
                <>
                  {documentsData.length === 0 ? (
                    'Upload documents after creating your first policy'
                  ) : (
                    <>
                      Your documents are often Rejected due to
                      <strong className="font-medium tracking-[0.03px]"> {mostCommonReason.reason}</strong>
                    </>
                  )}
                </>
              }
              subText={documentsData.length > 0 ? `${infoWidgetData.rejectedCount} of ${documentsData.length} documents rejected` : 'No documents yet'}
              perecntageInfo="Approved Submissions"
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
                title="Improve Submission Quality"
                rateValue={mostCommonReason.percentage}
                description={
                  <>
                    {documentsData.length === 0 ? (
                      'Upload documents after creating your first policy'
                    ) : (
                      <>
                        Your documents are often Rejected due to
                        <strong className="font-medium tracking-[0.03px]"> {mostCommonReason.reason}</strong>
                      </>
                    )}
                  </>
                }
                subText={documentsData.length > 0 ? `${infoWidgetData.rejectedCount} of ${documentsData.length} documents rejected` : 'No documents yet'}
                perecntageInfo="Approved Submissions"
              />

              <div className="flex-grow min-h-[calc(31%-4px)] xl:flex-[0_0_31%] xl:min-h-auto xl:h-auto">
                <ConversionChart 
                  title="Documents Requiring Action"
                  data={documentsChartData}
                  defaultActiveTime="This Week"
                  showTimeDropdown={true}
                  typeLabels={quotesTypeLabels}
                />
              </div>

              <div className="w-full h-[100%]">
                <div style={{ maxWidth: '380px' }}>
                  <ApprovalRate 
                    title="Documents Approval Rate"
                    subtitle="Approved documents percentage."
                    approvalPercentage={documentStats.approvalRate}
                    approvedCount={documentStats.approvedCount}
                    typeLabel="Document"
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