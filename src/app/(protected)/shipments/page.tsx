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
    return []
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

  // Docs compliance տվյալներ (ըստ ժամանակահատվածների)
// shipments/page.tsx - ՓՈԽԱՐԵՆՔ calculateDocsComplianceByTimePeriod ֆունկցիան

// Docs compliance տվյալներ (ըստ ժամանակահատվածների) - ՈՒՂՂՎԱԾ
// Docs compliance տվյալներ (ըստ ժամանակահատվածների) - ՆՈՐ ՏԱՐԲԵՐԱԿ
// Docs compliance տվյալներ (ըստ ժամանակահատվածների) - ԼՐԻՎ ՈՒՂՂՎԱԾ
// Docs compliance տվյալներ (ըստ ժամանակահատվածների) - ԼՐԻՎ ՈՒՂՂՎԱԾ ԻՆՔՆԱԳՈՐԾՈՒՆ ԼՈԳԵՐՈՎ
// Docs compliance տվյալներ (ըստ ժամանակահատվածների) - ԼՐԻՎ ՈՒՂՂՎԱԾ coverage period-ով
const calculateDocsComplianceByTimePeriod = () => {
  const now = new Date()
  
  console.log('=== DOCS COMPLIANCE CALCULATION STARTED (COVERAGE PERIOD) ===')
  console.log('Now:', now.toISOString())
  console.log('Today date:', now.getDate(), now.getMonth() + 1, now.getFullYear())
  
  // Սահմանել շաբաթների միջակայքերը
  // This Week: 19.01 - 25.01
  const thisWeekStart = new Date(2026, 0, 19) // 19 հունվար
  const thisWeekEnd = new Date(2026, 0, 25)   // 25 հունվար
  
  // Next Week: 26.01 - 01.02
  const nextWeekStart = new Date(2026, 0, 26) // 26 հունվար  
  const nextWeekEnd = new Date(2026, 1, 1)    // 1 փետրվար
  
  // In 2-4 Weeks: 02.02 - 22.02
  const in24WeeksStart = new Date(2026, 1, 2)  // 2 փետրվար
  const in24WeeksEnd = new Date(2026, 1, 22)   // 22 փետրվար
  
  // Next Month: 23.02 - 24.03 (մոտավորապես)
  const nextMonthStart = new Date(2026, 1, 23) // 23 փետրվար
  const nextMonthEnd = new Date(2026, 2, 24)   // 24 մարտ
  
  console.log('This Week:', thisWeekStart.toDateString(), '-', thisWeekEnd.toDateString())
  console.log('Next Week:', nextWeekStart.toDateString(), '-', nextWeekEnd.toDateString())
  
  // Ֆիլտրել միայն ակտիվ պոլիսիները
  const activePolicies = policiesRows.filter(policy => 
    policy.rawData?.status === 'active'
  )
  
  console.log('Total active policies:', activePolicies.length)
  
  const complianceData = {
    thisWeek: { missingDocs: 0, total: 0 },
    nextWeek: { missingDocs: 0, total: 0 },
    in24Weeks: { missingDocs: 0, total: 0 },
    nextMonth: { missingDocs: 0, total: 0 }
  }

  // Վերլուծել յուրաքանչյուր ակտիվ պոլիսի
  activePolicies.forEach((policy, index) => {
    const rawData = policy.rawData
    if (!rawData) return

    const coverageStart = rawData.coverage_start
    const coverageEnd = rawData.coverage_end
    
    if (!coverageStart || !coverageEnd) {
      console.log(`Policy ${policy.id}: No coverage dates`)
      return
    }

    try {
      // Ստեղծել ամսաթվերը
      const startDate = new Date(coverageStart)
      const endDate = new Date(coverageEnd)
      
      // Ստուգել, թե coverage period-ը ընկնում է որ ժամանակահատվածում
      // Policy-ի coverage period-ը համընկնում է, եթե այն հատվում է շաբաթի հետ
      const overlapsWithThisWeek = (
        (startDate <= thisWeekEnd && endDate >= thisWeekStart) ||
        (startDate <= thisWeekStart && endDate >= thisWeekEnd)
      )
      
      const overlapsWithNextWeek = (
        (startDate <= nextWeekEnd && endDate >= nextWeekStart) ||
        (startDate <= nextWeekStart && endDate >= nextWeekEnd)
      )
      
      const overlapsWith24Weeks = (
        (startDate <= in24WeeksEnd && endDate >= in24WeeksStart) ||
        (startDate <= in24WeeksStart && endDate >= in24WeeksEnd)
      )
      
      const overlapsWithNextMonth = (
        (startDate <= nextMonthEnd && endDate >= nextMonthStart) ||
        (startDate <= nextMonthStart && endDate >= nextMonthEnd)
      )
      
      const isMissingDocs = policy.missingDocs?.text?.includes('Missing') || 
                           policy.missingDocs?.text === 'No Docs' ||
                           policy.missingDocs?.text?.includes('Rejected') ||
                           (policy.missingDocs?.text !== 'Approved' && 
                            !policy.missingDocs?.text?.includes('Under Review') &&
                            !policy.missingDocs?.text?.includes('Docs'))
      
      console.log(`\n--- Policy ${index + 1}: ${policy.id} ---`)
      console.log('Coverage Period:', policy.expirationDate)
      console.log('Start Date:', startDate.toDateString())
      console.log('End Date:', endDate.toDateString())
      console.log('Docs Status:', policy.missingDocs?.text)
      console.log('Is Missing Docs:', isMissingDocs)
      
      // Ստուգել համընկնումները
      if (overlapsWithThisWeek) {
        complianceData.thisWeek.total++
        if (isMissingDocs) complianceData.thisWeek.missingDocs++
        console.log(`✅ Overlaps with This Week`)
      }
      
      if (overlapsWithNextWeek) {
        complianceData.nextWeek.total++
        if (isMissingDocs) complianceData.nextWeek.missingDocs++
        console.log(`✅ Overlaps with Next Week`)
      }
      
      if (overlapsWith24Weeks) {
        complianceData.in24Weeks.total++
        if (isMissingDocs) complianceData.in24Weeks.missingDocs++
        console.log(`✅ Overlaps with In 2-4 Weeks`)
      }
      
      if (overlapsWithNextMonth) {
        complianceData.nextMonth.total++
        if (isMissingDocs) complianceData.nextMonth.missingDocs++
        console.log(`✅ Overlaps with Next Month`)
      }
      
      if (!overlapsWithThisWeek && !overlapsWithNextWeek && 
          !overlapsWith24Weeks && !overlapsWithNextMonth) {
        console.log(`➖ Does not overlap with any time period`)
      }
    } catch (error) {
      console.error(`Error processing policy ${policy.id}:`, error)
    }
  })

  console.log('\n=== FINAL COMPLIANCE DATA ===')
  console.log('This Week:', complianceData.thisWeek)
  console.log('Next Week:', complianceData.nextWeek)
  console.log('In 2-4 Weeks:', complianceData.in24Weeks)
  console.log('Next Month:', complianceData.nextMonth)
  
  return complianceData
}

const timeBasedComplianceData = calculateDocsComplianceByTimePeriod()

// Փոփոխական տվյալներ tabs-ների համար
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

console.log('\n=== SHIPMENTS DATA FOR CARDS ===')
console.log('Shipments Data:', shipmentsData)
console.log('\n=== SHIPMENTS DATA FOR CARDS ===')
console.log('Shipments Data:', shipmentsData)
  // Docs compliance տվյալներ (ընդհանուր)
  const calculateOverallDocsComplianceData = () => {
    // Ֆիլտրել միայն ակտիվ պոլիսիները
    const activePolicies = policiesRows.filter(policy => 
      policy.rawData?.status === 'active'
    )
    
    const activePoliciesCount = activePolicies.length
    
    if (activePoliciesCount === 0) {
      return {
        totalPoliciesRequiringDocs: 0,
        policiesWithAllDocsApproved: 0,
        policiesWithMissingDocs: 0,
        complianceRate: 0
      }
    }

    // Հաշվել այն պոլիսիները, որոնք ունեն բոլոր 3 փաստաթղթերը approved
    let policiesWithAllDocsApproved = 0
    let policiesWithMissingDocs = 0
    
    activePolicies.forEach(policy => {
      // Ստուգել docs status-ը
      if (policy.missingDocs?.text === 'Approved') {
        policiesWithAllDocsApproved++
      } else if (policy.missingDocs?.text?.includes('Missing') || 
                 policy.missingDocs?.text === 'No Docs') {
        policiesWithMissingDocs++
      }
    })
    
    // Հաշվել compliance rate
    const complianceRate = activePoliciesCount > 0 
      ? Math.round((policiesWithAllDocsApproved / activePoliciesCount) * 100)
      : 0
    
    return {
      totalPoliciesRequiringDocs: activePoliciesCount,
      policiesWithAllDocsApproved,
      policiesWithMissingDocs,
      complianceRate
    }
  }



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
                chartType='shipments'
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
              chartType='shipments'
            />

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