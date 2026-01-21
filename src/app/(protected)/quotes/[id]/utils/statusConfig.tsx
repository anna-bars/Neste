import {
  BadgeCheck,
  AlertCircle,
  Receipt,
  Sparkles,
  AlertTriangle,
  CreditCardIcon,
  Clock,
  FileSearch,
  Edit,
  Check,
} from 'lucide-react';

export const getStatusConfig = (
  status: string, 
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded' = 'pending'
) => {
  const lowerStatus = status.toLowerCase();
  
  if (lowerStatus === 'approved') {
    return getApprovedStatusConfig(paymentStatus);
  }

  switch (lowerStatus) {
    case 'submitted':
      return {
        color: 'bg-gradient-to-r from-blue-50 to-blue-100 text-blue-700',
        border: 'border border-blue-200',
        icon: <Sparkles className="w-5 h-5" />,
        label: 'Submitted',
        description: 'AI analysis in progress',
        accent: 'border-l-4 border-blue-500',
        showActions: {
          downloadQuote: true,
          makePayment: false,
          viewPolicy: false,
          resubmit: false,
          checkStatus: false,
          delete: true,
          edit: false
        }
      };
    case 'rejected':
      return {
        color: 'bg-gradient-to-r from-rose-50 to-rose-100 text-rose-700',
        border: 'border border-rose-200',
        icon: <AlertCircle className="w-5 h-5" />,
        label: 'Rejected',
        description: 'Requires adjustment',
        accent: 'border-l-4 border-rose-500',
        showActions: {
          downloadQuote: false,
          makePayment: false,
          viewPolicy: false,
          resubmit: false,
          checkStatus: false,
          delete: true,
          edit: false
        }
      };
    case 'fix_and_resubmit':
      return {
        color: 'bg-gradient-to-r from-amber-50 to-amber-100 text-amber-700',
        border: 'border border-amber-200',
        icon: <AlertTriangle className="w-5 h-5" />,
        label: 'Fix & Resubmit',
        description: 'Please fix and resubmit',
        accent: 'border-l-4 border-amber-500',
        showActions: {
          downloadQuote: false,
          makePayment: false,
          viewPolicy: false,
          resubmit: true,
          checkStatus: false,
          delete: true,
          edit: true
        }
      };
    case 'pay_to_activate':
      return {
        color: 'bg-gradient-to-r from-purple-50 to-purple-100 text-purple-700',
        border: 'border border-purple-200',
        icon: <CreditCardIcon className="w-5 h-5" />,
        label: 'Pay to Activate',
        description: 'Payment required',
        accent: 'border-l-4 border-purple-500',
        showActions: {
          downloadQuote: true,
          makePayment: true,
          viewPolicy: false,
          resubmit: false,
          checkStatus: false,
          delete: false,
          edit: false
        }
      };
    case 'waiting_for_review':
      return {
        color: 'bg-gradient-to-r from-cyan-50 to-cyan-100 text-cyan-700',
        border: 'border border-cyan-200',
        icon: <Clock className="w-5 h-5" />,
        label: 'Waiting for Review',
        description: 'Under initial assessment',
        accent: 'border-l-4 border-cyan-500',
        showActions: {
          downloadQuote: false,
          makePayment: false,
          viewPolicy: false,
          resubmit: false,
          checkStatus: false,
          delete: true,
          edit: false
        }
      };
    case 'documents_under_review':
      return {
        color: 'bg-gradient-to-r from-indigo-50 to-indigo-100 text-indigo-700',
        border: 'border border-indigo-200',
        icon: <FileSearch className="w-5 h-5" />,
        label: 'Documents Under Review',
        description: 'Documents being verified',
        accent: 'border-l-4 border-indigo-500',
        showActions: {
          downloadQuote: false,
          makePayment: false,
          viewPolicy: false,
          resubmit: false,
          checkStatus: true,
          delete: true,
          edit: false
        }
      };
    case 'draft':
      return {
        color: 'bg-gradient-to-r from-gray-50 to-gray-100 text-gray-700',
        border: 'border border-gray-200',
        icon: <Edit className="w-5 h-5" />,
        label: 'Draft',
        description: 'Not submitted yet',
        accent: 'border-l-4 border-gray-500',
        showActions: {
          downloadQuote: false,
          makePayment: false,
          viewPolicy: false,
          resubmit: false,
          checkStatus: false,
          delete: true,
          edit: true
        }
      };
    case 'pending':
      return {
        color: 'bg-gradient-to-r from-amber-50 to-amber-100 text-amber-700',
        border: 'border border-amber-200',
        icon: <Clock className="w-5 h-5" />,
        label: 'Processing',
        description: 'Initial assessment',
        accent: 'border-l-4 border-amber-500',
        showActions: {
          downloadQuote: false,
          makePayment: false,
          viewPolicy: false,
          resubmit: false,
          checkStatus: true,
          delete: false,
          edit: false
        }
      };
    default:
      return {
        color: 'bg-gradient-to-r from-gray-50 to-gray-100 text-gray-700',
        border: 'border border-gray-200',
        icon: <Clock className="w-5 h-5" />,
        label: status,
        description: '',
        accent: 'border-l-4 border-gray-500',
        showActions: {
          downloadQuote: true,
          makePayment: false,
          viewPolicy: false,
          resubmit: false,
          checkStatus: false,
          delete: false,
          edit: false
        }
      };
  }
};

const getApprovedStatusConfig = (paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded') => {
  if (paymentStatus === 'paid') {
    return {
      color: 'bg-gradient-to-r from-emerald-50 to-emerald-100 text-emerald-700',
      border: 'border border-emerald-200',
      icon: <BadgeCheck className="w-5 h-5" />,
      label: 'Approved & Paid',
      description: 'Policy is active',
      accent: 'border-l-4 border-emerald-500',
      showActions: {
        downloadQuote: true,
        makePayment: false,
        viewPolicy: true,
        resubmit: false,
        checkStatus: false,
        delete: false,
        edit: false,
        viewReceipt: true
      }
    };
  } else if (paymentStatus === 'failed') {
    return {
      color: 'bg-gradient-to-r from-red-50 to-red-100 text-red-700',
      border: 'border border-red-200',
      icon: <AlertCircle className="w-5 h-5" />,
      label: 'Payment Failed',
      description: 'Payment unsuccessful',
      accent: 'border-l-4 border-red-500',
      showActions: {
        downloadQuote: true,
        makePayment: true,
        viewPolicy: false,
        resubmit: false,
        checkStatus: false,
        delete: false,
        edit: false
      }
    };
  } else if (paymentStatus === 'refunded') {
    return {
      color: 'bg-gradient-to-r from-gray-50 to-gray-100 text-gray-700',
      border: 'border border-gray-200',
      icon: <Receipt className="w-5 h-5" />,
      label: 'Refunded',
      description: 'Payment has been refunded',
      accent: 'border-l-4 border-gray-500',
      showActions: {
        downloadQuote: true,
        makePayment: false,
        viewPolicy: false,
        resubmit: false,
        checkStatus: false,
        delete: false,
        edit: false
      }
    };
  } else {
    return {
      color: 'bg-gradient-to-r from-emerald-50 to-emerald-100 text-emerald-700',
      border: 'border border-emerald-200',
      icon: <BadgeCheck className="w-5 h-5" />,
      label: 'Approved',
      description: 'Payment required to activate',
      accent: 'border-l-4 border-emerald-500',
      showActions: {
        downloadQuote: true,
        makePayment: true,
        viewPolicy: false,
        resubmit: false,
        checkStatus: false,
        delete: false,
        edit: false
      }
    };
  }
};