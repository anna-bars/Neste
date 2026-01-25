'use client'

import DashboardLayout from '../DashboardLayout'
import { useEffect, useState } from 'react'
import { ConversionChart, ConversionChartData } from '../../components/charts/ConversionChart'
import { UniversalTable, renderStatus, renderButton } from '@/app/components/tables/UniversalTable';
import QuotesExpirationCard from '@/app/components/charts/QuotesExpirationCard'
import InfoWidget from '@/app/components/widgets/InfoWidget'
import { ApprovalRate } from '@/app/components/charts/ApprovalRate';
import DocumentItem from '@/app/components/documents/DocumentItem';
import { ActivityTableFilter } from '@/app/components/tables/ActivityTableFilter';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { useUser } from '@/app/context/UserContext';

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

  // Ստանալ փաստաթղթերի տվյալները Supabase-ից
  useEffect(() => {
    const loadDocumentsData = async () => {
      if (!user) return
      
      try {
        // 1. Ստանալ օգտատիրոջ բոլոր պոլիսիները
        const { data: policies, error: policiesError } = await supabase
          .from('policies')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(50)

        if (policiesError) {
          console.error('Error loading policies:', policiesError)
          setDocumentsData(getFallbackDocuments())
          setLoading(false)
          return
        }

        if (!policies || policies.length === 0) {
          setDocumentsData(getFallbackDocuments())
          setLoading(false)
          return
        }

        // 2. Ստանալ բոլոր փաստաթղթերը այս պոլիսիների համար
        const policyIds = policies.map(policy => policy.id)
        const { data: documents, error: docsError } = await supabase
          .from('documents')
          .select('*')
          .in('policy_id', policyIds)
          .order('created_at', { ascending: false })

        if (docsError) {
          console.error('Error loading documents:', docsError)
          setDocumentsData(getFallbackDocuments())
          setLoading(false)
          return
        }

        // 3. Ֆորմատավորել փաստաթղթերի տվյալները
        const formattedDocuments: DocumentStatus[] = []

        policies.forEach(policy => {
          // Գտնել այս պոլիսիի փաստաթղթերը
          const policyDocuments = documents?.filter(doc => doc.policy_id === policy.id) || []
          
          // Ֆորմատավորել փաստաթղթերի կարգավիճակը
          const docStatus = formatDocumentStatus(policyDocuments, policy)
          
          formattedDocuments.push({
            type: 'Policy:',
            id: policy.policy_number || `POL-${policy.id.slice(-6)}`,
            status: docStatus.status,
            cargoType: policy.cargo_type || 'Unknown',
            summary: docStatus.summary,
            policyId: policy.id
          })
        })

        setDocumentsData(formattedDocuments)

      } catch (error) {
        console.error('Error loading documents data:', error)
        setDocumentsData(getFallbackDocuments())
      } finally {
        setLoading(false)
      }
    }

    loadDocumentsData()
  }, [user])

  // Ֆորմատավորել փաստաթղթերի կարգավիճակը
  const formatDocumentStatus = (documents: any[], policy: any): { status: DocumentStatus['status'], summary: string } => {
    if (!documents || documents.length === 0) {
      return {
        status: 'Missing',
        summary: 'No Documents Uploaded'
      }
    }

    // Վերցնել վերջին փաստաթղթի գրառումը
    const latestDocument = documents[0]
    
    const requiredDocs = [
      { key: 'commercial_invoice_status', label: 'Commercial Invoice' },
      { key: 'packing_list_status', label: 'Packing List' },
      { key: 'bill_of_lading_status', label: 'Bill of Lading' }
    ]

    let approvedCount = 0
    let pendingCount = 0
    let rejectedCount = 0
    let missingCount = 0

    requiredDocs.forEach(doc => {
      const status = latestDocument[doc.key]
      
      if (!status || status === 'pending') {
        missingCount++
      } else if (status === 'uploaded') {
        pendingCount++
      } else if (status === 'approved') {
        approvedCount++
      } else if (status === 'rejected') {
        rejectedCount++
      }
    })

    // Ստեղծել կարգավիճակ և նկարագրություն
    if (approvedCount === 3) {
      return {
        status: 'Approved',
        summary: 'All Documents Approved'
      }
    } else if (rejectedCount > 0) {
      return {
        status: 'Rejected',
        summary: `${rejectedCount} of 3 Documents Rejected`
      }
    } else if (pendingCount > 0) {
      return {
        status: 'Pending Review',
        summary: `${pendingCount} Document${pendingCount > 1 ? 's' : ''} Pending Review`
      }
    } else if (missingCount > 0) {
      return {
        status: missingCount === 3 ? 'Missing' : 'In Progress',
        summary: `${missingCount} of 3 Documents Missing`
      }
    } else {
      return {
        status: 'In Progress',
        summary: `${approvedCount} of 3 Documents Approved`
      }
    }
  }

  // Fallback փաստաթղթերի տվյալներ
  const getFallbackDocuments = (): DocumentStatus[] => {
    return []
  }

  // Խորհուրդների տվյալներ chart-ների համար
  const quotesDatas = {
    'This Week': { approved: 17, declined: 2, expired: 18 },
    'This Month': { approved: 35, declined: 5, expired: 42 },
    'Last Month': { approved: 28, declined: 3, expired: 31 },
    'Last Quarter': { approved: 120, declined: 15, expired: 135 }
  }

  const quotesTypeLabels = {
    approved: 'Pending',
    declined: 'Missing',
    expired: 'Rejected'
  }

  const [activeTab, setActiveTab] = useState('This Week')

  // Հաշվել փաստաթղթերի վիճակագրությունը
  const calculateDocumentStats = () => {
    const totalDocuments = documentsData.length
    
    if (totalDocuments === 0) {
      return {
        approvedCount: 0,
        pendingCount: 0,
        rejectedCount: 0,
        missingCount: 0,
        approvalRate: 0
      }
    }

    const approvedCount = documentsData.filter(doc => doc.status === 'Approved').length
    const pendingCount = documentsData.filter(doc => doc.status === 'Pending Review').length
    const rejectedCount = documentsData.filter(doc => doc.status === 'Rejected').length
    const missingCount = documentsData.filter(doc => doc.status === 'Missing').length
    
    const approvalRate = totalDocuments > 0 
      ? Math.round((approvedCount / totalDocuments) * 100)
      : 0

    return {
      approvedCount,
      pendingCount,
      rejectedCount,
      missingCount,
      approvalRate
    }
  }

  const documentStats = calculateDocumentStats()

  // Խորհուրդների տվյալները charts-ների համար (իրական տվյալների հիման վրա)
  const calculateDocumentsData = () => {
    return {
      'This Week': { 
        approved: documentStats.pendingCount, 
        declined: documentStats.missingCount, 
        expired: documentStats.rejectedCount 
      },
      'This Month': { 
        approved: documentStats.pendingCount, 
        declined: documentStats.missingCount, 
        expired: documentStats.rejectedCount 
      },
      'Last Month': { 
        approved: documentStats.pendingCount, 
        declined: documentStats.missingCount, 
        expired: documentStats.rejectedCount 
      },
      'Last Quarter': { 
        approved: documentStats.pendingCount, 
        declined: documentStats.missingCount, 
        expired: documentStats.rejectedCount 
      }
    }
  }

  const documentsChartData = calculateDocumentsData()

  // InfoWidget-ի տվյալները
  const calculateInfoWidgetData = () => {
    return {
      rateValue: documentStats.approvalRate,
      totalDocuments: documentsData.length,
      approvedDocuments: documentStats.approvalRate,
      // Գտնել ամենատարածված մերժման պատճառը
      getMostCommonRejectionReason: () => {
        // Այստեղ կարող եք Supabase-ից ստանալ մերժման պատճառները
        // Առայժմ օգտագործենք պարզ տրամաբանություն
        if (documentStats.rejectedCount > 0) {
          return {
            reason: 'Low-Resolution Scans',
            percentage: 92
          }
        }
        return {
          reason: 'N/A',
          percentage: 0
        }
      }
    }
  }

  const infoWidgetData = calculateInfoWidgetData()
  const mostCommonReason = infoWidgetData.getMostCommonRejectionReason()

  // Ֆիլտրավորել փաստաթղթերը
  const filteredDocuments = documentsData.filter(doc => {
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

  // Փաստաթղթերի վրա կտտացնելու ֆունկցիա
  const handleDocumentClick = (doc: DocumentStatus) => {
    if (doc.policyId) {
      // Եթե ունի policyId, տանել policy-ի էջ
      router.push(`/shipments/${doc.policyId}`)
    } else if (doc.quoteId) {
      // Եթե ունի quoteId, տանել quote-ի էջ
      router.push(`/quotes/${doc.quoteId}`)
    } else {
      // Հակառակ դեպքում մնալ նույն էջում
      console.log('Document clicked:', doc)
    }
  }

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

              {/* Փաստաթղթերի ցուցադրում */}
              <div className="overflow-y-scroll max-h-[82vh] sm:max-h-[84%]  rounded sm:max-h-max-content flex justify-start flex-wrap gap-y-3 sm:gap-2.5">
                {filteredDocuments.map((doc, index) => (
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
            {/* Documents Approval Rate */}
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

            {/* Documents Requiring Action */}
            <div className="flex-grow min-h-[calc(31%-4px)] xl:flex-[0_0_31%] xl:min-h-auto xl:h-auto">
              <ConversionChart 
                title="Documents Requiring Action"
                data={documentsChartData}
                defaultActiveTime="This Week"
                showTimeDropdown={true}
                typeLabels={quotesTypeLabels}
              />
            </div>

            {/* Improve Submission Quality */}
            <InfoWidget 
              title="Improve Submission Quality"
              rateValue={mostCommonReason.percentage}
              description={
                <>
                  Your documents are often Rejected due to
                  <strong className="font-medium tracking-[0.03px]"> {mostCommonReason.reason}</strong>
                </>
              }
              subText={`${documentStats.rejectedCount} of ${documentsData.length} documents rejected`}
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
            
              {/* Improve Submission Quality */}
              <InfoWidget 
                title="Improve Submission Quality"
                rateValue={mostCommonReason.percentage}
                description={
                  <>
                    Your documents are often Rejected due to
                    <strong className="font-medium tracking-[0.03px]"> {mostCommonReason.reason}</strong>
                  </>
                }
                subText={`${documentStats.rejectedCount} of ${documentsData.length} documents rejected`}
                perecntageInfo="Approved Submissions"
              />

              {/* Documents Requiring Action */}
              <div className="flex-grow min-h-[calc(31%-4px)] xl:flex-[0_0_31%] xl:min-h-auto xl:h-auto">
                <ConversionChart 
                  title="Documents Requiring Action"
                  data={documentsChartData}
                  defaultActiveTime="This Week"
                  showTimeDropdown={true}
                  typeLabels={quotesTypeLabels}
                />
              </div>

              {/* Documents Approval Rate */}
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