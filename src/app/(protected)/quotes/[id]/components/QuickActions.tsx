// ./components/QuickActions.tsx
import React from 'react';
import { FileText, CreditCard, CheckCircle, AlertCircle, RefreshCw, Edit } from 'lucide-react';
import { QuoteData } from '../types';

interface QuickActionsProps {
  statusConfig: any;
  onMakePayment: () => void;
  onViewPolicy: () => void;
  onViewReceipt: () => void;
  onResubmit: () => void;
  onCheckStatus: () => void;
  quoteData: QuoteData;
}

export default function QuickActions({
  statusConfig,
  onMakePayment,
  onViewPolicy,
  onViewReceipt,
  onResubmit,
  onCheckStatus,
  quoteData
}: QuickActionsProps) {
  const showMakePayment = statusConfig?.showActions?.makePayment && quoteData.payment_status !== 'paid';
  const showViewPolicy = statusConfig?.showActions?.viewPolicy && quoteData.policy_id;
  const showViewReceipt = statusConfig?.showActions?.viewReceipt && quoteData.payment_status === 'paid';
  const showResubmit = statusConfig?.showActions?.resubmit;
  const showCheckStatus = statusConfig?.showActions?.checkStatus;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 rounded-lg bg-blue-100">
          <CreditCard className="w-5 h-5 text-blue-600" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-gray-900">Quick Actions</h3>
          <p className="text-sm text-gray-600">Manage your quote</p>
        </div>
      </div>
      
      <div className="space-y-3">
        {showMakePayment && (
          <button
            onClick={onMakePayment}
            className="w-full flex items-center gap-3 px-4 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors text-left"
          >
            <CreditCard className="w-5 h-5" />
            <span>Make Payment</span>
          </button>
        )}
        
        {showViewPolicy && (
          <button
            onClick={onViewPolicy}
            className="w-full flex items-center gap-3 px-4 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors text-left"
          >
            <FileText className="w-5 h-5" />
            <span>View Policy</span>
          </button>
        )}
        
        {showViewReceipt && (
          <button
            onClick={onViewReceipt}
            className="w-full flex items-center gap-3 px-4 py-3 bg-purple-600 text-white font-medium rounded-lg hover:bg-purple-700 transition-colors text-left"
          >
            <CheckCircle className="w-5 h-5" />
            <span>View Receipt</span>
          </button>
        )}
        
        {showResubmit && (
          <button
            onClick={onResubmit}
            className="w-full flex items-center gap-3 px-4 py-3 bg-yellow-600 text-white font-medium rounded-lg hover:bg-yellow-700 transition-colors text-left"
          >
            <Edit className="w-5 h-5" />
            <span>Resubmit Quote</span>
          </button>
        )}
        
        {showCheckStatus && (
          <button
            onClick={onCheckStatus}
            className="w-full flex items-center gap-3 px-4 py-3 bg-gray-600 text-white font-medium rounded-lg hover:bg-gray-700 transition-colors text-left"
          >
            <RefreshCw className="w-5 h-5" />
            <span>Check Status</span>
          </button>
        )}
        
        {!showMakePayment && !showViewPolicy && !showViewReceipt && !showResubmit && !showCheckStatus && (
          <div className="text-center py-4 text-gray-500">
            <AlertCircle className="w-8 h-8 mx-auto mb-2 text-gray-400" />
            <p>No actions available</p>
            <p className="text-sm mt-1">Complete the quote process to see available actions</p>
          </div>
        )}
      </div>
    </div>
  );
}