import { Check, AlertCircle, CreditCardIcon } from 'lucide-react';
import { QuoteData } from '../types';

interface StatusBannerProps {
  quoteData: QuoteData;
  onMakePayment: () => void;
}

export default function StatusBanner({ quoteData, onMakePayment }: StatusBannerProps) {
  if (quoteData.status !== 'approved') return null;

  return (
    <div className={`rounded-2xl border p-6 ${
      quoteData.payment_status === 'paid'
        ? 'bg-gradient-to-br from-emerald-50 to-emerald-100 border-emerald-200'
        : quoteData.payment_status === 'failed'
        ? 'bg-gradient-to-br from-red-50 to-red-100 border-red-200'
        : 'bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200'
    }`}>
      <div className="flex items-center gap-3 mb-4">
        <div className={`p-2.5 rounded-xl ${
          quoteData.payment_status === 'paid'
            ? 'bg-gradient-to-br from-emerald-500 to-emerald-600'
            : quoteData.payment_status === 'failed'
            ? 'bg-gradient-to-br from-red-500 to-red-600'
            : 'bg-gradient-to-br from-amber-500 to-amber-600'
        }`}>
          {quoteData.payment_status === 'paid' ? (
            <Check className="w-6 h-6 text-white" />
          ) : quoteData.payment_status === 'failed' ? (
            <AlertCircle className="w-6 h-6 text-white" />
          ) : (
            <CreditCardIcon className="w-6 h-6 text-white" />
          )}
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-900">
            {quoteData.payment_status === 'paid' ? 'Payment Completed' : 
              quoteData.payment_status === 'failed' ? 'Payment Failed' : 
              'Payment Required'}
          </h2>
          <p className={`${
            quoteData.payment_status === 'paid' ? 'text-emerald-600' : 
            quoteData.payment_status === 'failed' ? 'text-red-600' : 
            'text-amber-600'
          }`}>
            {quoteData.payment_status === 'paid'
              ? 'Your policy is now active and coverage has begun.'
              : quoteData.payment_status === 'failed'
              ? 'Your payment was unsuccessful. Please try again.'
              : 'Complete payment to activate your coverage and policy.'}
          </p>
        </div>
      </div>
      {(quoteData.payment_status === 'pending' || quoteData.payment_status === 'failed') && (
        <button
          onClick={onMakePayment}
          className={`px-6 py-3 ${
            quoteData.payment_status === 'failed'
              ? 'bg-gradient-to-r from-red-500 to-red-600'
              : 'bg-gradient-to-r from-amber-500 to-amber-600'
          } text-white font-medium rounded-xl hover:opacity-90 transition-all duration-300 transform hover:-translate-y-0.5`}
        >
          {quoteData.payment_status === 'failed' ? 'Retry Payment' : 'Make Payment'}
        </button>
      )}
    </div>
  );
}