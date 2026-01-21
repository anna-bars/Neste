import { ArrowLeft, Edit, Trash2, RefreshCw, Printer, Check } from 'lucide-react';
import { QuoteData, StatusConfig } from '../types';
import { formatDateTime } from '../utils/formatters';

interface QuoteHeaderProps {
  quoteData: QuoteData;
  statusConfig: StatusConfig;
  onBack: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onRefresh: () => void;
}

export default function QuoteHeader({
  quoteData,
  statusConfig,
  onBack,
  onEdit,
  onDelete,
  onRefresh,
}: QuoteHeaderProps) {
  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex-1">
          <button 
            onClick={onBack}
            className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 mb-6 group transition-all duration-300"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span className="group-hover:underline">Back to quotes</span>
          </button>
          
          <div className="block md:flex items-start justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-cyan-600 rounded-2xl blur opacity-30"></div>
                  <div className="relative px-4 py-2 rounded-2xl bg-gradient-to-r from-blue-500 to-cyan-600 text-white">
                    <span className="text-sm font-semibold">QUOTE #{quoteData.quote_id}</span>
                  </div>
                </div>
                <div className={`px-3 py-1.5 rounded-full flex items-center gap-2 ${statusConfig.color} ${statusConfig.border}`}>
                  {statusConfig.icon}
                  <span className="font-semibold text-sm">{statusConfig.label}</span>
                  {quoteData.status === 'approved' && quoteData.payment_status === 'paid' && (
                    <Check className="w-4 h-4 text-emerald-600" />
                  )}
                </div>
                {quoteData.status === 'approved' && quoteData.payment_status === 'pending' && (
                  <div className="px-3 py-1.5 rounded-full bg-gradient-to-r from-amber-50 to-amber-100 text-amber-700 border border-amber-200 flex items-center gap-2">
                    <Check className="w-4 h-4" />
                    <span className="font-semibold text-sm">Payment Pending</span>
                  </div>
                )}
                {quoteData.payment_status === 'failed' && (
                  <div className="px-3 py-1.5 rounded-full bg-gradient-to-r from-red-50 to-red-100 text-red-700 border border-red-200 flex items-center gap-2">
                    <Check className="w-4 h-4" />
                    <span className="font-semibold text-sm">Payment Failed</span>
                  </div>
                )}
              </div>
              <h1 className="text-4xl font-bold text-gray-900 mt-2">
                {quoteData.cargo_type.charAt(0).toUpperCase() + quoteData.cargo_type.slice(1)} Shipment
              </h1>
              <p className="text-gray-600 mt-2">
                Created on <span className="font-medium text-gray-900">{formatDateTime(quoteData.created_at)}</span>
                {statusConfig.description && (
                  <> • <span className="font-medium">{statusConfig.description}</span></>
                )}
              </p>
            </div>
            
            <div className="flex items-center gap-3 mt-2 md:pt-2">
              {statusConfig.showActions.edit && (
                <button
                  onClick={onEdit}
                  className="p-2.5 bg-white/80 border border-gray-300 rounded-2xl hover:bg-white hover:border-blue-500 transition-all duration-300"
                  title="Edit Quote"
                >
                  <Edit className="w-5 h-5 text-gray-700" />
                </button>
              )}
              {statusConfig.showActions.delete && (
                <button
                  onClick={onDelete}
                  className="p-2.5 bg-white/80 border border-gray-300 rounded-2xl hover:bg-white hover:border-red-500 transition-all duration-300"
                  title="Delete Quote"
                >
                  <Trash2 className="w-5 h-5 text-gray-700" />
                </button>
              )}
              <button
                onClick={onRefresh}
                className="p-2.5 bg-white/80 border border-gray-300 rounded-2xl hover:bg-white hover:border-blue-500 transition-all duration-300"
                title="Refresh"
              >
                <RefreshCw className="w-5 h-5 text-gray-700" />
              </button>
              <button
                onClick={() => window.print()}
                className="p-2.5 bg-white/80 border border-gray-300 rounded-2xl hover:bg-white hover:border-blue-500 transition-all duration-300"
                title="Print"
              >
                <Printer className="w-5 h-5 text-gray-700" />
              </button>
            </div>
          </div>
          
          
        </div>
      </div>
    </div>
  );
}