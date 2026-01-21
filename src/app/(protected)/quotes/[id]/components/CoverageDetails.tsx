import { ShieldIcon, PieChart, CreditCard, Zap } from 'lucide-react';
import { QuoteData } from '../types';

interface CoverageDetailsProps {
  quoteData: QuoteData;
  formatCurrency: (amount: number) => string;
}

export default function CoverageDetails({ quoteData, formatCurrency }: CoverageDetailsProps) {
  return (
    <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl border border-blue-200 p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2.5 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl">
          <ShieldIcon className="w-6 h-6 text-white" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-900">Coverage Details</h2>
          <p className="text-sm text-blue-600">
            {quoteData.payment_status === 'paid' 
              ? 'Active protection coverage' 
              : 'Ready for activation upon payment'}
          </p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white/90 rounded-xl p-5 border border-blue-200">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2.5 bg-gradient-to-br from-blue-500/10 to-blue-600/10 rounded-lg">
              <PieChart className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Premium Analysis</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(quoteData.calculated_premium)}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-blue-600" />
            <span className="text-xs text-blue-600">
              {quoteData.payment_status === 'paid' ? 'Active' : 'Pending'}
            </span>
          </div>
        </div>
        
        <div className="bg-white/90 rounded-xl p-5 border border-blue-200">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2.5 bg-gradient-to-br from-amber-500/10 to-amber-600/10 rounded-lg">
              <CreditCard className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Deductible</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(quoteData.deductible)}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-600" />
            <span className="text-xs text-amber-600">Risk Buffer</span>
          </div>
        </div>
      </div>
    </div>
  );
}