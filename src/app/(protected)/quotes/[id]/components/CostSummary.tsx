import { formatCurrency } from '../utils/formatters';

interface CostSummaryProps {
  calculatedPremium: number;
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
}

export default function CostSummary({ calculatedPremium, paymentStatus }: CostSummaryProps) {
  const taxes = calculatedPremium * 0.08;
  const serviceFee = 99;
  const totalAmount = calculatedPremium + serviceFee + taxes;

  return (
    <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl border border-blue-200 p-6">
      <h3 className="text-lg font-bold text-gray-900 mb-4">Cost Summary</h3>
      
      <div className="space-y-3">
        <div className="flex justify-between items-center pb-3 border-b border-blue-200">
          <span className="text-gray-700">Premium</span>
          <span className="font-semibold text-gray-900">
            {formatCurrency(calculatedPremium)}
          </span>
        </div>
        
        <div className="flex justify-between items-center pb-3 border-b border-blue-200">
          <span className="text-gray-700">Service Fee</span>
          <span className="font-semibold text-gray-900">$99.00</span>
        </div>
        
        <div className="flex justify-between items-center pb-3 border-b border-blue-200">
          <span className="text-gray-700">Taxes</span>
          <span className="font-semibold text-gray-900">
            {formatCurrency(taxes)}
          </span>
        </div>
        
        <div className="pt-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-lg font-bold text-gray-900">Total Amount</span>
            <span className="text-2xl font-bold text-blue-700">
              {formatCurrency(totalAmount)}
            </span>
          </div>
          <div className={`text-sm font-medium ${
            paymentStatus === 'paid' ? 'text-emerald-600' : 
            paymentStatus === 'failed' ? 'text-red-600' : 
            'text-blue-600'
          } flex items-center gap-2`}>
            <div className={`w-2 h-2 rounded-full ${
              paymentStatus === 'paid' ? 'bg-emerald-500' : 
              paymentStatus === 'failed' ? 'bg-red-500' : 
              'bg-blue-500'
            } animate-pulse`}></div>
            {paymentStatus === 'paid' 
              ? '✅ Payment Completed' 
              : paymentStatus === 'failed'
              ? '❌ Payment Failed'
              : '⏳ Payment Required'}
          </div>
        </div>
      </div>
    </div>
  );
}