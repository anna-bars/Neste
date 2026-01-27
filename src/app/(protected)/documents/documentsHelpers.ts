import { DocumentStatus } from './documentsTypes';

export const loadDocumentsData = async (user: any, supabase: any, formatDocumentStatus: Function): Promise<DocumentStatus[]> => {
  try {
    const { data: policies, error: policiesError } = await supabase
      .from('policies')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(50)

    if (policiesError) {
      console.error('Error loading policies:', policiesError)
      return []
    }

    if (!policies || policies.length === 0) {
      return []
    }

    const policyIds = policies.map((policy: { id: string }) => policy.id)
    const { data: documents, error: docsError } = await supabase
      .from('documents')
      .select('*')
      .in('policy_id', policyIds)
      .order('created_at', { ascending: false })

    if (docsError) {
      console.error('Error loading documents:', docsError)
      return []
    }

    const formattedDocuments: DocumentStatus[] = []

    policies.forEach((policy: { 
      id: string; 
      policy_number?: string; 
      cargo_type?: string; 
    }) => {
      const policyDocuments = documents?.filter((doc: { policy_id: string }) => doc.policy_id === policy.id) || []
      const docStatus = formatDocumentStatus(policyDocuments, policy)
      
      formattedDocuments.push({
        type: 'Policy:',
        id: policy.policy_number || `POL-${policy.id.slice(-6)}`,
        status: docStatus.status,
        cargoType: policy.cargo_type || 'Unknown',
        summary: docStatus.summary,
        policyId: policy.id // policy.id-ն արդեն string է
      })
    })

    return formattedDocuments

  } catch (error) {
    console.error('Error loading documents data:', error)
    return []
  }
}

// Մնացած ֆունկցիաները մնում են նույնը...
export const formatDocumentStatus = (documents: any[], policy: any): { status: DocumentStatus['status'], summary: string } => {
  if (!documents || documents.length === 0) {
    return {
      status: 'Missing',
      summary: 'No Documents Uploaded'
    }
  }

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

export const calculateDocumentStats = (documentsData: DocumentStatus[]) => {
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

export const calculateDocumentsData = (documentStats: any) => {
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

export const calculateInfoWidgetData = (documentsData: DocumentStatus[], documentStats: any) => {
  const totalDocuments = documentsData.length
  const rejectedCount = documentStats.rejectedCount
  
  const rejectionRate = totalDocuments > 0 
    ? Math.round((rejectedCount / totalDocuments) * 100) 
    : 0
  
  const improvementRate = totalDocuments > 0 ? 100 - rejectionRate : 0
  
  return {
    rateValue: improvementRate,
    totalDocuments: totalDocuments,
    rejectedCount: rejectedCount,
    rejectionRate: rejectionRate,
    getMostCommonRejectionReason: () => {
      if (totalDocuments === 0) {
        return {
          reason: 'No documents yet',
          percentage: 0
        }
      }
      
      if (rejectedCount > 0) {
        return {
          reason: 'Low-Resolution Scans',
          percentage: 92
        }
      }
      return {
        reason: 'All documents approved',
        percentage: 0
      }
    }
  }
}