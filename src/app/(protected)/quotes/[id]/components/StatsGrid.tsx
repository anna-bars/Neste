import { DollarSign, ShieldCheck, Package, Truck, TrendingUp, Network } from 'lucide-react';
import { QuoteData, StatusConfig } from '../types';
import { formatCurrency } from '../utils/formatters';

interface StatsGridProps {
  quoteData: QuoteData;
  statusConfig: StatusConfig;
}

export default function StatsGrid({ quoteData, statusConfig }: StatsGridProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Premium Card */}
      <div className="relative group">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-blue-600/5 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-500"></div>
        <div className={`relative bg-white/90 rounded-2xl border p-5 transition-all duration-300 ${
          quoteData.status === 'rejected' || quoteData.status === 'fix_and_resubmit' 
            ? 'border-rose-200' 
            : 'border-gray-200 hover:border-blue-500'
        }`}>
          <div className="flex items-center justify-between mb-3">
            <div className={`p-2.5 bg-gradient-to-br rounded-xl ${
              quoteData.status === 'rejected' || quoteData.status === 'fix_and_resubmit' 
                ? 'from-rose-500/10 to-rose-600/10' 
                : 'from-blue-500/10 to-blue-600/10'
            }`}>
              <DollarSign className={`w-6 h-6 ${
                quoteData.status === 'rejected' || quoteData.status === 'fix_and_resubmit' 
                  ? 'text-rose-600' 
                  : 'text-blue-600'
              }`} />
            </div>
            {quoteData.status === 'pay_to_activate' || (quoteData.status === 'approved' && quoteData.payment_status === 'pending') ? (
              <TrendingUp className="w-5 h-5 text-emerald-500" />
            ) : null}
          </div>
          <h3 className="text-sm font-medium text-gray-600 mb-1">Premium</h3>
          <p className={`text-2xl font-bold ${
            quoteData.status === 'rejected' || quoteData.status === 'fix_and_resubmit' 
              ? 'text-rose-700' 
              : 'text-gray-900'
          }`}>
            {formatCurrency(quoteData.calculated_premium)}
          </p>
          <div className="mt-3 h-1 w-full bg-gray-200 rounded-full overflow-hidden">
            <div className={`h-full rounded-full ${
              quoteData.status === 'rejected' || quoteData.status === 'fix_and_resubmit'
                ? 'bg-gradient-to-r from-rose-500 to-rose-600'
                : 'bg-gradient-to-r from-blue-500 to-blue-600 animate-pulse'
            }`}></div>
          </div>
        </div>
      </div>
      
      {/* Coverage Card */}
      <div className="relative group">
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 to-emerald-600/5 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-500"></div>
        <div className="relative bg-white/90 rounded-2xl border border-gray-200 p-5 hover:border-emerald-500 transition-all duration-300">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2.5 bg-gradient-to-br from-emerald-500/10 to-emerald-600/10 rounded-xl">
              <ShieldCheck className="w-6 h-6 text-emerald-600" />
            </div>
          </div>
          <h3 className="text-sm font-medium text-gray-600 mb-1">Coverage</h3>
          <p className="text-lg font-bold text-gray-900 truncate">{quoteData.selected_coverage}</p>
          <div className="mt-3 flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${
              quoteData.status === 'approved' && quoteData.payment_status === 'paid' 
                ? 'bg-emerald-500 animate-pulse' 
                : quoteData.payment_status === 'failed'
                ? 'bg-red-500'
                : 'bg-amber-500'
            }`}></div>
            <span className={`text-xs ${
              quoteData.status === 'approved' && quoteData.payment_status === 'paid'
                ? 'text-emerald-600'
                : quoteData.payment_status === 'failed'
                ? 'text-red-600'
                : 'text-amber-600'
            }`}>
              {quoteData.status === 'approved' && quoteData.payment_status === 'paid' 
                ? 'Active Protection' 
                : quoteData.payment_status === 'failed'
                ? 'Payment Failed'
                : 'Payment Required'}
            </span>
          </div>
        </div>
      </div>
      
      {/* Cargo Value Card */}
      <div className="relative group">
        <div className="absolute inset-0 bg-gradient-to-r from-amber-500/5 to-amber-600/5 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-500"></div>
        <div className="relative bg-white/90 rounded-2xl border border-gray-200 p-5 hover:border-amber-500 transition-all duration-300">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2.5 bg-gradient-to-br from-amber-500/10 to-amber-600/10 rounded-xl">
              <Package className="w-6 h-6 text-amber-600" />
            </div>
          </div>
          <h3 className="text-sm font-medium text-gray-600 mb-1">Cargo Value</h3>
          <p className="text-2xl font-bold text-gray-900">{formatCurrency(quoteData.shipment_value)}</p>
          <div className="mt-3 h-1 w-full bg-gray-200 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-amber-500 to-amber-600 rounded-full" style={{ width: '85%' }}></div>
          </div>
        </div>
      </div>
      
      {/* Transport Card */}
      <div className="relative group">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-purple-600/5 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-500"></div>
        <div className="relative bg-white/90 rounded-2xl border border-gray-200 p-5 hover:border-purple-500 transition-all duration-300">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2.5 bg-gradient-to-br from-purple-500/10 to-purple-600/10 rounded-xl">
              <Truck className="w-6 h-6 text-purple-600" />
            </div>
          </div>
          <h3 className="text-sm font-medium text-gray-600 mb-1">Transport</h3>
          <p className="text-lg font-bold text-gray-900">{quoteData.transportation_mode}</p>
          <div className="mt-3 flex items-center gap-2">
            <Network className="w-4 h-4 text-purple-600" />
            <span className="text-xs text-purple-600">Global Network</span>
          </div>
        </div>
      </div>
    </div>
  );
}