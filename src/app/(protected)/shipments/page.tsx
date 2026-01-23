'use client'

import DashboardLayout from '../DashboardLayout'
import { useEffect, useState } from 'react'
import { UniversalTable, renderStatus, renderButton } from '@/app/components/tables/UniversalTable';
import QuotesExpirationCard from '@/app/components/charts/QuotesExpirationCard'
import InfoWidget from '@/app/components/widgets/InfoWidget'
import { PolicyTimelineWidget } from '@/app/components/charts/PolicyTimeline';
import { createClient } from '@/lib/supabase/client';
import { useUser } from '@/app/context/UserContext';

export default function ShipmentsPage() {
  const [activeTab, setActiveTab] = useState('This Week')
  const [loading, setLoading] = useState(true)
  const [isMobile, setIsMobile] = useState(false)
  const [policiesRows, setPoliciesRows] = useState<any[]>([])
  const [documentsData, setDocumentsData] = useState<any>({})
  
  const { user } = useUser()
  const supabase = createClient()

  // Ստանալ policies և documents տվյալները Supabase-ից
  useEffect(() => {
    const loadPoliciesData = async () => {
      if (!user) return
      
      try {
        // Ստանալ բոլոր policies-ը
        const { data: policies, error: policiesError } = await supabase
          .from('policies')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(50)

        if (policiesError) {
          console.error('Error loading policies:', policiesError)
          setPoliciesRows(getFallbackData())
          return
        }

        if (policies && policies.length > 0) {
          // Ստանալ բոլոր documents-ը այս օգտատիրոջ պոլիսիների համար
          const policyIds = policies.map(policy => policy.id)
          const { data: documents, error: docsError } = await supabase
            .from('documents')
            .select('*')
            .in('policy_id', policyIds)

          if (docsError) {
            console.error('Error loading documents:', docsError)
          }

          // Group documents by policy_id
          const documentsByPolicy: any = {}
          if (documents) {
            documents.forEach(doc => {
              if (!documentsByPolicy[doc.policy_id]) {
                documentsByPolicy[doc.policy_id] = []
              }
              documentsByPolicy[doc.policy_id].push(doc)
            })
          }

          setDocumentsData(documentsByPolicy)

          const formattedData = formatPoliciesData(policies, documentsByPolicy)
          setPoliciesRows(formattedData)
        } else {
          setPoliciesRows(getFallbackData())
        }

      } catch (error) {
        console.error('Error loading policies data:', error)
        setPoliciesRows(getFallbackData())
      } finally {
        setLoading(false)
      }
    }

    loadPoliciesData()
  }, [user])

  // Ֆորմատավորել policies տվյալները UniversalTable-ի համար
  const formatPoliciesData = (policies: any[], documentsByPolicy: any) => {
    const formattedData: any[] = []

    policies.forEach(policy => {
      const statusConfig = getStatusConfig(policy)
      
      // Գտնել փաստաթղթերի տվյալները այս պոլիսիի համար
      const policyDocuments = documentsByPolicy[policy.id] || []
      const docsStatus = calculateDocsStatus(policyDocuments)
      
      const buttonAction = { 
        text: statusConfig.buttonText, 
        variant: statusConfig.buttonVariant,
        onClick: (row: any) => handlePolicyAction(row, policy)
      }
      
      formattedData.push({
        id: policy.policy_number || `POL-${policy.id.slice(-6)}`,
        cargo: policy.cargo_type || 'Unknown',
        shipmentValue: `$${(policy.coverage_amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
        premiumAmount: `$${(policy.premium_amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
        expirationDate: formatCoveragePeriod(policy.coverage_start, policy.coverage_end),
        status: {
          text: statusConfig.text,
          color: statusConfig.color,
          dot: statusConfig.dot,
          textColor: statusConfig.textColor
        },
        missingDocs: {
          text: docsStatus.text,
          color: docsStatus.color,
          textColor: docsStatus.textColor
        },
        button: buttonAction,
        rawData: policy
      })
    })

    return formattedData.sort((a, b) => 
      new Date(b.rawData.created_at).getTime() - new Date(a.rawData.created_at).getTime()
    )
  }

  // Հաշվել փաստաթղթերի կարգավիճակը
  const calculateDocsStatus = (documents: any[]) => {
    if (!documents || documents.length === 0) {
      return {
        text: 'No Docs',
        color: 'bg-red-100',
        textColor: 'text-red-700'
      }
    }

    // Վերցնել վերջին փաստաթղթի գրառումը (ամենավերջինը)
    const latestDocument = documents[documents.length - 1]
    
    const requiredDocs = [
      { key: 'commercial_invoice_status', label: 'Commercial Invoice' },
      { key: 'packing_list_status', label: 'Packing List' },
      { key: 'bill_of_lading_status', label: 'Bill of Lading' }
    ]

    let missingCount = 0
    let uploadedCount = 0
    let approvedCount = 0
    let rejectedCount = 0

    requiredDocs.forEach(doc => {
      const status = latestDocument[doc.key]
      
      if (status === 'pending' || !status) {
        missingCount++
      } else if (status === 'uploaded') {
        uploadedCount++
      } else if (status === 'approved') {
        approvedCount++
      } else if (status === 'rejected') {
        rejectedCount++
      }
    })

    // Ստեղծել տեքստային նկարագրություն
    if (approvedCount === 3) {
      return {
        text: 'Approved',
        color: 'bg-green-100',
        textColor: 'text-green-700'
      }
    } else if (missingCount === 3) {
      return {
        text: '3 Missing Docs',
        color: 'bg-red-100',
        textColor: 'text-red-700'
      }
    } else if (missingCount === 2) {
      return {
        text: '2 Missing Docs',
        color: 'bg-red-50',
        textColor: 'text-red-600'
      }
    } else if (missingCount === 1) {
      return {
        text: '1 Missing Doc',
        color: 'bg-amber-100',
        textColor: 'text-amber-700'
      }
    } else if (uploadedCount > 0 && missingCount === 0) {
      return {
        text: `${uploadedCount} Under Review`,
        color: 'bg-blue-100',
        textColor: 'text-blue-700'
      }
    } else if (rejectedCount > 0) {
      return {
        text: `${rejectedCount} Rejected`,
        color: 'bg-red-100',
        textColor: 'text-red-700'
      }
    } else {
      // Mixed status
      const totalDocs = 3
      const completedDocs = approvedCount + uploadedCount
      return {
        text: `${completedDocs}/${totalDocs} Docs`,
        color: 'bg-gray-100',
        textColor: 'text-gray-700'
      }
    }
  }

  // Ստատուսի կոնֆիգուրացիան policy-ի համար
  const getStatusConfig = (policy: any) => {
    const now = new Date()
    const coverageEnd = new Date(policy.coverage_end)
    const daysUntilExpiry = Math.ceil((coverageEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    
    const isActive = policy.status === 'active'
    const isExpiringSoon = isActive && daysUntilExpiry <= 30 && daysUntilExpiry > 0
    const isExpiringIn3Days = isActive && daysUntilExpiry <= 3 && daysUntilExpiry > 0
    const isExpired = isActive && daysUntilExpiry <= 0
    const isPending = policy.status === 'pending'

    if (isExpired) {
      return {
        text: 'Expired',
        color: 'bg-gray-100',
        dot: 'bg-gray-400',
        textColor: 'text-gray-600',
        buttonText: 'View Details',
        buttonVariant: 'secondary' as const
      }
    }

    if (isExpiringIn3Days) {
      return {
        text: `Expiring in ${daysUntilExpiry} days`,
        color: 'bg-red-50',
        dot: 'bg-red-500',
        textColor: 'text-red-700',
        buttonText: 'Renew Now',
        buttonVariant: 'danger' as const,
        isExpiringCritical: true
      }
    }

    if (isExpiringSoon) {
      return {
        text: `Expiring in ${daysUntilExpiry} days`,
        color: 'bg-amber-50',
        dot: 'bg-amber-500',
        textColor: 'text-amber-700',
        buttonText: 'Renew Policy',
        buttonVariant: 'primary' as const,
        isExpiringSoon: true
      }
    }

    if (isActive) {
      return {
        text: 'Active',
        color: 'bg-emerald-50',
        dot: 'bg-emerald-500',
        textColor: 'text-emerald-700',
        buttonText: 'Download Cert',
        buttonVariant: 'primary' as const
      }
    }

    if (isPending) {
      return {
        text: 'Pending Activation',
        color: 'bg-blue-50',
        dot: 'bg-blue-500',
        textColor: 'text-blue-700',
        buttonText: 'View Details',
        buttonVariant: 'secondary' as const
      }
    }

    // Default
    return {
      text: policy.status || 'Unknown',
      color: 'bg-gray-100',
      dot: 'bg-gray-500',
      textColor: 'text-gray-700',
      buttonText: 'View Details',
      buttonVariant: 'secondary' as const
    }
  }

  // Հաշվել փաստաթղթերի կոմպլայենսը policy-ի համար
  const calculateDocsComplianceForPolicy = (policyId: string) => {
    const policyDocuments = documentsData[policyId] || [];
    
    if (!policyDocuments || policyDocuments.length === 0) {
      return { isCompliant: false, approvedDocs: 0, totalDocs: 3 };
    }

    // Վերցնել վերջին փաստաթղթի գրառումը
    const latestDocument = policyDocuments[policyDocuments.length - 1];
    
    const requiredDocs = [
      { key: 'commercial_invoice_status', label: 'Commercial Invoice' },
      { key: 'packing_list_status', label: 'Packing List' },
      { key: 'bill_of_lading_status', label: 'Bill of Lading' }
    ];

    let approvedCount = 0;
    let totalDocs = 0;

    requiredDocs.forEach(doc => {
      const status = latestDocument[doc.key];
      
      if (status) {
        totalDocs++;
        if (status === 'approved') {
          approvedCount++;
        }
      }
    });

    const isCompliant = approvedCount === 3 && totalDocs === 3;
    
    return { isCompliant, approvedDocs: approvedCount, totalDocs };
  };

  // Ֆորմատավորել ծածկույթի ժամանակահատվածը
  const formatCoveragePeriod = (startDate: string, endDate: string) => {
    if (!startDate || !endDate) return 'N/A'
    
    const start = new Date(startDate)
    const end = new Date(endDate)
    
    const formatDate = (date: Date) => {
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        year: '2-digit'
      })
    }
    
    return `${formatDate(start)} – ${formatDate(end)}`
  }

  // Policy գործողությունների մշակում
// Policy գործողությունների մշակում - ՓՈԽԱՐԵՆՔ
const handlePolicyAction = (row: any, policy: any) => {
  const policyId = policy.id
  
  // Որոշել ուր տանել՝ կախված status-ից
  switch (policy.status) {
    case 'active':
      // Եթե ակտիվ է, տանել policy-ի դետալների էջ
      window.location.href = `/shipments/${policyId}`
      break
    case 'pending':
    case 'draft':
    case 'submitted':
      // Եթե pending կամ այլ status է, նաև տանել policy-ի էջ
      window.location.href = `/shipments/${policyId}`
      break
    default:
      // Ամեն դեպքում տանել policy-ի էջ
      window.location.href = `/shipments/${policyId}`
  }
}

  // Fallback տվյալներ
  const getFallbackData = () => {
    return [
      {
        id: 'P-3401',
        cargo: 'Electronics',
        shipmentValue: '$12,500.00',
        premiumAmount: '$170.00',
        expirationDate: `Dec 1, '25 – Dec 1, '26`,
        status: { 
          text: 'Active', 
          color: 'bg-emerald-50', 
          dot: 'bg-emerald-500', 
          textColor: 'text-emerald-700' 
        },
        missingDocs: {
          text: 'Approved',
          color: 'bg-green-100',
          textColor: 'text-green-700'
        },
        button: { 
          text: 'Download Cert', 
          variant: 'primary' as const,
          onClick: (row: any) => console.log('Download Certificate', row.id)
        },
        rawData: {
          status: 'active',
          coverage_end: '2026-12-01T00:00:00Z'
        }
      },
      {
        id: 'P-2015',
        cargo: 'Textiles',
        shipmentValue: '$25,800.00',
        premiumAmount: '$285.00',
        expirationDate: `Oct 15, '25 – Dec 15, '25`,
        status: { 
          text: 'Expiring in 2 days', 
          color: 'bg-red-50', 
          dot: 'bg-red-500', 
          textColor: 'text-red-700' 
        },
        missingDocs: {
          text: '2 Missing Docs',
          color: 'bg-red-50',
          textColor: 'text-red-600'
        },
        button: { 
          text: 'Renew Now', 
          variant: 'danger' as const,
          onClick: (row: any) => console.log('Renew Policy', row.id)
        },
        rawData: {
          status: 'active',
          coverage_end: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString()
        }
      },
      {
        id: 'P-2016',
        cargo: 'Machinery',
        shipmentValue: '$45,000.00',
        premiumAmount: '$420.00',
        expirationDate: `Nov 20, '25 – Jan 20, '26`,
        status: { 
          text: 'Active', 
          color: 'bg-emerald-50', 
          dot: 'bg-emerald-500', 
          textColor: 'text-emerald-700' 
        },
        missingDocs: {
          text: '1 Missing Doc',
          color: 'bg-amber-100',
          textColor: 'text-amber-700'
        },
        button: { 
          text: 'Download Cert', 
          variant: 'primary' as const,
          onClick: (row: any) => console.log('Download Certificate', row.id)
        },
        rawData: {
          status: 'active',
          coverage_end: '2026-01-20T00:00:00Z'
        }
      }
    ]
  }

  // Հաշվել 3 օրվա ընթացքում ավարտվող պոլիսիների թիվը
const calculateExpiringIn3Days = () => {
  const now = new Date()
  
  const expiringIn3Days = policiesRows.filter(policy => {
    const rawData = policy.rawData
    if (!rawData || rawData.status !== 'active') return false
    
    const coverageEnd = new Date(rawData.coverage_end)
    const daysUntilExpiry = Math.ceil((coverageEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    
    // Ստուգել միայն 1-3 օրվա ընթացքում ավարտվող պոլիսիները
    return daysUntilExpiry >= 1 && daysUntilExpiry <= 3
  }).length
  
  return expiringIn3Days
}


  // Policy timelines-ի տվյալներ
  const calculatePolicyTimelineData = () => {
    const totalPolicies = policiesRows.length
    const expiringIn3Days = calculateExpiringIn3Days()
    const percentage = totalPolicies > 0 
      ? Math.round((expiringIn3Days / totalPolicies) * 100)
      : 0
    
    return {
      percentage,
      expiringPolicies: expiringIn3Days,
      totalPolicies
    }
  }

  const policyTimelineData = calculatePolicyTimelineData()

  // Docs compliance տվյալներ (իրական տվյալների հիման վրա)
  const calculateDocsComplianceData = () => {
    const totalPolicies = policiesRows.length
    
    if (totalPolicies === 0) {
      return {
        totalPoliciesRequiringDocs: 0,
        policiesWithAllDocsApproved: 0,
        policiesWithMissingDocs: 0,
        complianceRate: 0
      };
    }

    // Հաշվել այն պոլիսիները, որոնք ունեն բոլոր 3 փաստաթղթերը approved
    let policiesWithAllDocsApproved = 0
    let policiesWithMissingDocs = 0
    
    policiesRows.forEach(policy => {
      // Ստուգել, թե արդյոք պոլիսին պահանջում է փաստաթղթեր (Active կամ Expired)
      const isActiveOrExpired = policy.rawData?.status === 'active' || policy.rawData?.status === 'expired'
      
      if (!isActiveOrExpired) {
        return // Մի հաշվիր Pending կամ այլ status-ներ
      }
      
      // Ստուգել docs status-ը
      if (policy.missingDocs?.text === 'Approved') {
        policiesWithAllDocsApproved++
      } else if (policy.missingDocs?.text?.includes('Missing')) {
        policiesWithMissingDocs++
      }
    })
    
    // Հաշվել ընդհանուր պոլիսիների թիվը, որոնք պահանջում են փաստաթղթեր
    const totalPoliciesRequiringDocs = policiesRows.filter(policy => {
      return policy.rawData?.status === 'active' || policy.rawData?.status === 'expired'
    }).length
    
    // Հաշվել compliance rate
    const complianceRate = totalPoliciesRequiringDocs > 0 
      ? Math.round((policiesWithAllDocsApproved / totalPoliciesRequiringDocs) * 100)
      : 0
    
    return {
      totalPoliciesRequiringDocs,
      policiesWithAllDocsApproved,
      policiesWithMissingDocs,
      complianceRate
    }
  }

  const docsComplianceData = calculateDocsComplianceData()

  // Փոփոխական տվյալներ tabs-ների համար - թարմացված
  const shipmentsData = {
    'This Week': { 
      totalQuotes: docsComplianceData.totalPoliciesRequiringDocs, 
      expiringQuotes: docsComplianceData.policiesWithAllDocsApproved,
      expiringRate: docsComplianceData.complianceRate
    },
    'Next Week': { 
      totalQuotes: docsComplianceData.totalPoliciesRequiringDocs, 
      expiringQuotes: Math.floor(docsComplianceData.totalPoliciesRequiringDocs * 0.8),
      expiringRate: docsComplianceData.complianceRate
    },
    'In 2–4 Weeks': { 
      totalQuotes: docsComplianceData.totalPoliciesRequiringDocs, 
      expiringQuotes: Math.floor(docsComplianceData.totalPoliciesRequiringDocs * 0.6),
      expiringRate: docsComplianceData.complianceRate
    },
    'Next Month': { 
      totalQuotes: docsComplianceData.totalPoliciesRequiringDocs, 
      expiringQuotes: Math.floor(docsComplianceData.totalPoliciesRequiringDocs * 0.4),
      expiringRate: 40
    }
  }

  // Policy risk տվյալներ InfoWidget-ի համար
// Policy risk տվյալներ InfoWidget-ի համար
const calculatePolicyRiskData = () => {
  const totalPolicies = policiesRows.length
  
  // Միայն ակտիվ պոլիսիները
  const activePolicies = policiesRows.filter(policy => 
    policy.rawData?.status === 'active'
  ).length
  
  const expiringIn3Days = calculateExpiringIn3Days()
  
  // Expiration Risk (1-3 օրում ավարտվող պոլիսիների տոկոս)
  const expirationRisk = activePolicies > 0 
    ? Math.round((expiringIn3Days / activePolicies) * 100)
    : 0
  
  // Improvement Rate (ինչքան է բարելավվել/փոքր է ռիսկը)
  const improvementRate = 100 - expirationRisk
  
  return {
    expirationRisk, // Սա է իրական ռիսկը (25%)
    improvementRate, // Սա է բարելավումը (75%)
    totalPolicies: activePolicies,
    expiringIn3Days
  }
}

const policyRiskData = calculatePolicyRiskData()

  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth <= 768)
    }
    
    checkScreenSize()
    window.addEventListener('resize', checkScreenSize)
    
    return () => window.removeEventListener('resize', checkScreenSize)
  }, [])

  // Docs compliance տեքստերի թարմացում
  const renderDocsStatus = (missingDocs: any) => {
    return (
      <span className={`
        text-xs font-medium px-2 py-1 rounded-full ${missingDocs.color} ${missingDocs.textColor}
      `}>
        {missingDocs.text}
      </span>
    )
  }

  const policiesColumns = [
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
      key: 'missingDocs',
      label: 'Docs Status',
      sortable: true,
      renderDesktop: (missingDocs: any) => renderDocsStatus(missingDocs)
    },
    {
      key: 'button',
      label: 'Action',
      renderDesktop: (button: any, row: any) => renderButton(button, row),
      className: 'flex justify-end'
    }
  ]

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
              />
            </div>

            {/* Universal Table for Policies */}
            <div className='max-h-[85%'>
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

            {/* Policy Risk Card */}
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

            {/* Updated Policy Timeline Widget */}
            <PolicyTimelineWidget 
              percentage={policyTimelineData.percentage}
              expiringPolicies={policyTimelineData.expiringPolicies}
              totalPolicies={policyTimelineData.totalPolicies}
            />

            {/* Docs Compliance Card */}
            <QuotesExpirationCard 
              activeTab={activeTab}
              onTabChange={setActiveTab}
              data={shipmentsData}
              title='Docs Compliance'
              info='Policies w/ missing docs'
              total='Total policies'
              sub='Policies w/ missing docs'
              percentageInfo='Docs Compliance'
            />
          </div>

          {/* Tablet View (768px - 1279px) */}
          <div className="
            hidden max-[1280px]:block min-[769px]:block
            max-[768px]:hidden
            max-[1280px]:row-start-1 max-[1280px]:w-full
            max-[1280px]:mb-2
          ">
            <div className="grid grid-cols-3 gap-2 w-full">
              {/* Policy Risk Card */}
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

              {/* Docs Compliance Card */}
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
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}