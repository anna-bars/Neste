import { 
  Target, Package, Calendar, Globe, Building, 
  AlertCircle, AlertTriangle, Clock, FileSearch,
  ShieldIcon, PieChart, CreditCard, Zap,
  FileText, Upload, Eye, Download, Terminal
} from 'lucide-react';
import { QuoteData, StatusConfig } from '../types';
import StatusBanner from './StatusBanner';
import CoverageDetails from './CoverageDetails';
import AnalyticsContent from './AnalyticsContent';
import DocumentsList from './DocumentsList';

interface TabContentProps {
  activeTab: 'overview' | 'documents' | 'analytics';
  quoteData: QuoteData;
  statusConfig: StatusConfig;
  documents: any[];
  onMakePayment: () => void;
  onResubmit: () => void;
  onViewDocuments: () => void;
  formatCurrency: (amount: number) => string;
  formatDate: (dateString: string) => string;
  formatDateTime: (dateString: string) => string;
}

export default function TabContent({
  activeTab,
  quoteData,
  statusConfig,
  documents,
  onMakePayment,
  onResubmit,
  onViewDocuments,
  formatCurrency,
  formatDate,
  formatDateTime,
}: TabContentProps) {
  return (
    <div className="transition-all duration-300">
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <StatusBanner quoteData={quoteData} onMakePayment={onMakePayment} />

          <div className="bg-white/90 rounded-2xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-gradient-to-br from-blue-500/10 to-blue-600/10 rounded-xl">
                  <Target className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Shipment Details</h2>
                  <p className="text-sm text-gray-600">AI-powered risk assessment</p>
                </div>
              </div>
              {(quoteData.status === 'submitted' || quoteData.status === 'waiting_for_review') && (
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                  <span className="text-sm text-emerald-600">Live Analysis</span>
                </div>
              )}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <div className="flex items-center gap-2">
                      <Package className="w-4 h-4" />
                      Cargo Type
                    </div>
                  </label>
                  <div className="p-3 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl border border-gray-300">
                    <p className="font-semibold text-gray-900">{quoteData.cargo_type}</p>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      Coverage Timeline
                    </div>
                  </label>
                  <div className="p-3 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl border border-gray-300">
                    <p className="font-semibold text-gray-900">
                      {formatDate(quoteData.start_date)} → {formatDate(quoteData.end_date)}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <div className="flex items-center gap-2">
                      <Globe className="w-4 h-4" />
                      Route
                    </div>
                  </label>
                  <div className="p-3 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl border border-gray-300">
                    <div className="flex items-center justify-between">
                      <div className="text-center">
                        <p className="font-semibold text-gray-900">{quoteData.origin?.city || 'N/A'}</p>
                        <p className="text-xs text-blue-600 mt-1">Origin</p>
                      </div>
                      <div className="flex-1 px-4">
                        <div className="relative h-0.5 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full overflow-hidden">
                          <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-blue-400 to-blue-500 animate-shimmer"></div>
                        </div>
                      </div>
                      <div className="text-center">
                        <p className="font-semibold text-gray-900">{quoteData.destination?.city || 'N/A'}</p>
                        <p className="text-xs text-blue-600 mt-1">Destination</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <div className="flex items-center gap-2">
                      <Building className="w-4 h-4" />
                      Client Profile
                    </div>
                  </label>
                  <div className="p-3 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl border border-gray-300">
                    <p className="font-semibold text-gray-900">{quoteData.shipper_name || 'Not provided'}</p>
                    {quoteData.reference_number && (
                      <p className="text-sm text-gray-600 mt-1">Ref: {quoteData.reference_number}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Status-specific messages */}
          {quoteData.status === 'rejected' && (
            <div className="bg-gradient-to-br from-rose-50 to-rose-100 rounded-2xl border border-rose-200 p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2.5 bg-gradient-to-br from-rose-500 to-rose-600 rounded-xl">
                  <AlertCircle className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Quote Rejected</h2>
                  <p className="text-rose-600">This quote requires adjustments before it can be approved.</p>
                </div>
              </div>
            </div>
          )}

          {quoteData.status === 'fix_and_resubmit' && (
            <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-2xl border border-amber-200 p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2.5 bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl">
                  <AlertTriangle className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Fix Required</h2>
                  <p className="text-amber-600">Please review and resubmit your quote with the required changes.</p>
                </div>
              </div>
              <button
                onClick={onResubmit}
                className="px-6 py-3 bg-gradient-to-r from-amber-500 to-amber-600 text-white font-medium rounded-xl hover:from-amber-600 hover:to-amber-700 transition-all duration-300 transform hover:-translate-y-0.5"
              >
                Fix & Resubmit
              </button>
            </div>
          )}

          {quoteData.status === 'waiting_for_review' && (
            <div className="bg-gradient-to-br from-cyan-50 to-cyan-100 rounded-2xl border border-cyan-200 p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2.5 bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-xl">
                  <Clock className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Waiting for Review</h2>
                  <p className="text-cyan-600">Your quote is currently under review by our team. We'll notify you once it's processed.</p>
                </div>
              </div>
              <p className="text-sm text-cyan-700">Estimated review time: 1-2 business days</p>
            </div>
          )}

          {quoteData.status === 'documents_under_review' && (
            <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-2xl border border-indigo-200 p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2.5 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl">
                  <FileSearch className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Documents Under Review</h2>
                  <p className="text-indigo-600">Your documents are being verified. We'll update the status once complete.</p>
                </div>
              </div>
              <button
                onClick={onViewDocuments}
                className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-indigo-600 text-white font-medium rounded-xl hover:from-indigo-600 hover:to-indigo-700 transition-all duration-300 transform hover:-translate-y-0.5"
              >
                View Documents
              </button>
            </div>
          )}

          {quoteData.status === 'approved' && (
            <CoverageDetails quoteData={quoteData} formatCurrency={formatCurrency} />
          )}
        </div>
      )}

      {activeTab === 'documents' && (
  <DocumentsList 
    documents={documents} 
    status={quoteData.status} 
  />
)}

      {activeTab === 'analytics' && quoteData.status === 'approved' && quoteData.payment_status === 'paid' && (
        <AnalyticsContent quoteData={quoteData} formatDateTime={formatDateTime} />
      )}
    </div>
  );
}