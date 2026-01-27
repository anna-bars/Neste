export const formatCoveragePeriod = (startDate: string, endDate: string) => {
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

export const renderDocsStatus = (missingDocs: any) => {
  return (
    <span className={`
      text-xs font-medium px-2 py-1 rounded-full ${missingDocs.color} ${missingDocs.textColor}
    `}>
      {missingDocs.text}
    </span>
  )
}

export const getStatusConfig = (policy: any) => {
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

  return {
    text: policy.status || 'Unknown',
    color: 'bg-gray-100',
    dot: 'bg-gray-500',
    textColor: 'text-gray-700',
    buttonText: 'View Details',
    buttonVariant: 'secondary' as const
  }
}

export const calculateDocsStatus = (documents: any[]) => {
  if (!documents || documents.length === 0) {
    return {
      text: 'No Docs',
      color: 'bg-red-100',
      textColor: 'text-red-700'
    }
  }

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
    const totalDocs = 3
    const completedDocs = approvedCount + uploadedCount
    return {
      text: `${completedDocs}/${totalDocs} Docs`,
      color: 'bg-gray-100',
      textColor: 'text-gray-700'
    }
  }
}

export const handlePolicyAction = (row: any, policy: any) => {
  const policyId = policy.id
  
  switch (policy.status) {
    case 'active':
      window.location.href = `/shipments/${policyId}`
      break
    case 'pending':
    case 'draft':
    case 'submitted':
      window.location.href = `/shipments/${policyId}`
      break
    default:
      window.location.href = `/shipments/${policyId}`
  }
}

export const formatPoliciesData = (policies: any[], documentsByPolicy: any) => {
  const formattedData: any[] = []

  policies.forEach(policy => {
    const statusConfig = getStatusConfig(policy)
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

export const loadPoliciesData = async (user: any, supabase: any) => {
  try {
    const { data: policies, error: policiesError } = await supabase
      .from('policies')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(50)

    if (policiesError) {
      console.error('Error loading policies:', policiesError)
      return { policies: [], documents: {} }
    }

    if (!policies || policies.length === 0) {
      return { policies: [], documents: {} }
    }

    const policyIds = policies.map((policy: { id: any }) => policy.id)
    const { data: documents, error: docsError } = await supabase
      .from('documents')
      .select('*')
      .in('policy_id', policyIds)

    if (docsError) {
      console.error('Error loading documents:', docsError)
      return { policies: [], documents: {} }
    }

    const documentsByPolicy: any = {}
    if (documents) {
      documents.forEach((doc: { policy_id: string | number }) => {
        if (!documentsByPolicy[doc.policy_id]) {
          documentsByPolicy[doc.policy_id] = []
        }
        documentsByPolicy[doc.policy_id].push(doc)
      })
    }

    const formattedData = formatPoliciesData(policies, documentsByPolicy)
    
    return { 
      policies: formattedData, 
      documents: documentsByPolicy 
    }

  } catch (error) {
    console.error('Error loading policies data:', error)
    return { policies: [], documents: {} }
  }
}

export const calculateExpiringIn3Days = (policiesRows: any[]) => {
  const now = new Date()
  
  const expiringIn3Days = policiesRows.filter(policy => {
    const rawData = policy.rawData
    if (!rawData || rawData.status !== 'active') return false
    
    const coverageEnd = new Date(rawData.coverage_end)
    const daysUntilExpiry = Math.ceil((coverageEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    
    return daysUntilExpiry >= 1 && daysUntilExpiry <= 3
  }).length
  
  return expiringIn3Days
}

export const calculatePolicyTimelineData = (policiesRows: any[]) => {
  const totalPolicies = policiesRows.length
  const expiringIn3Days = calculateExpiringIn3Days(policiesRows)
  const percentage = totalPolicies > 0 
    ? Math.round((expiringIn3Days / totalPolicies) * 100)
    : 0
  
  return {
    percentage,
    expiringPolicies: expiringIn3Days,
    totalPolicies
  }
}

export const calculateDocsComplianceByTimePeriod = (policiesRows: any[]) => {
  const now = new Date()
  
  const getDateRange = (daysFromNow: number, durationDays: number) => {
    const start = new Date(now)
    start.setDate(start.getDate() + daysFromNow)
    
    const end = new Date(start)
    end.setDate(end.getDate() + durationDays)
    
    return { start, end }
  }
  
  const ranges = {
    thisWeek: getDateRange(0, 6),
    nextWeek: getDateRange(7, 6),
    in24Weeks: getDateRange(14, 14),
    nextMonth: getDateRange(30, 30)
  }
  
  const activePolicies = policiesRows.filter(policy => 
    policy.rawData?.status === 'active'
  )
  
  const complianceData = {
    thisWeek: { missingDocs: 0, total: 0 },
    nextWeek: { missingDocs: 0, total: 0 },
    in24Weeks: { missingDocs: 0, total: 0 },
    nextMonth: { missingDocs: 0, total: 0 }
  }

  activePolicies.forEach((policy) => {
    const rawData = policy.rawData
    if (!rawData) return
    
    const isMissingDocs = policy.missingDocs?.text?.includes('Missing') || 
                         policy.missingDocs?.text === 'No Docs' ||
                         policy.missingDocs?.text?.includes('Rejected')
    
    try {
      const coverageStart = rawData.coverage_start ? new Date(rawData.coverage_start) : null
      const coverageEnd = rawData.coverage_end ? new Date(rawData.coverage_end) : null
      
      if (!coverageStart || !coverageEnd) return
      
      Object.entries(ranges).forEach(([key, range]) => {
        const overlaps = (
          (coverageStart <= range.end && coverageEnd >= range.start) ||
          (coverageStart >= range.start && coverageEnd <= range.end)
        )
        
        if (overlaps) {
          complianceData[key as keyof typeof complianceData].total++
          if (isMissingDocs) {
            complianceData[key as keyof typeof complianceData].missingDocs++
          }
        }
      })
      
    } catch (error) {
      console.error('Error processing policy:', error)
    }
  })

  return complianceData
}

export const calculatePolicyRiskData = (policiesRows: any[]) => {
  const totalPolicies = policiesRows.length
  
  const activePolicies = policiesRows.filter(policy => 
    policy.rawData?.status === 'active'
  ).length
  
  const expiringIn3Days = calculateExpiringIn3Days(policiesRows)
  
  const expirationRisk = activePolicies > 0 
    ? Math.round((expiringIn3Days / activePolicies) * 100)
    : 0
  
  const improvementRate = 100 - expirationRisk
  
  return {
    expirationRisk,
    improvementRate,
    totalPolicies: activePolicies,
    expiringIn3Days
  }
}