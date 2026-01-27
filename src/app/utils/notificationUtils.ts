// app/utils/notificationUtils.ts
export const mapNotificationType = (dbType: string): 'info' | 'warning' | 'success' | 'error' => {
  // Map database notification types to UI types
  const typeMap: Record<string, 'info' | 'warning' | 'success' | 'error'> = {
    // Info types
    'quote_created': 'info',
    'quote_expiring': 'info',
    'policy_issued': 'info',
    'document_required': 'info',
    'claim_submitted': 'info',
    'claim_requires_info': 'info',
    'system_alert': 'info',
    'info': 'info',
    
    // Warning types
    'quote_expired': 'warning',
    'policy_expiring': 'warning',
    'document_missing': 'warning',
    'warning': 'warning',
    
    // Success types
    'payment_success': 'success',
    'policy_active': 'success',
    'document_approved': 'success',
    'claim_approved': 'success',
    'claim_paid': 'success',
    'success': 'success',
    
    // Error types
    'payment_failed': 'error',
    'policy_expired': 'error',
    'document_rejected': 'error',
    'claim_rejected': 'error',
    'error': 'error'
  }
  
  return typeMap[dbType] || 'info'
}

export const getNotificationIcon = (type: string) => {
  switch(type) {
    case 'info':
    case 'quote_created':
    case 'quote_expiring':
    case 'policy_issued':
    case 'document_required':
      return '💡'
    case 'warning':
    case 'quote_expired':
    case 'policy_expiring':
    case 'document_missing':
      return '⚠️'
    case 'success':
    case 'payment_success':
    case 'policy_active':
    case 'document_approved':
    case 'claim_approved':
      return '✅'
    case 'error':
    case 'payment_failed':
    case 'policy_expired':
    case 'document_rejected':
    case 'claim_rejected':
      return '❌'
    default:
      return '📢'
  }
}

export const getNotificationColor = (type: string) => {
  switch(type) {
    case 'info':
    case 'quote_created':
    case 'quote_expiring':
    case 'policy_issued':
    case 'document_required':
      return 'bg-blue-50 border-blue-100'
    case 'warning':
    case 'quote_expired':
    case 'policy_expiring':
    case 'document_missing':
      return 'bg-amber-50 border-amber-100'
    case 'success':
    case 'payment_success':
    case 'policy_active':
    case 'document_approved':
    case 'claim_approved':
      return 'bg-emerald-50 border-emerald-100'
    case 'error':
    case 'payment_failed':
    case 'policy_expired':
    case 'document_rejected':
    case 'claim_rejected':
      return 'bg-red-50 border-red-100'
    default:
      return 'bg-gray-50 border-gray-100'
  }
}