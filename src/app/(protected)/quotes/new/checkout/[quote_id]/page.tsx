'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { 
  Shield, 
  Lock, 
  CreditCard, 
  Building,
  Check
} from 'lucide-react';
import DashboardHeader from '@/app/components/dashboard/DashboardHeader';
import { useUser } from '@/app/context/UserContext';

export default function CheckoutPage() {
  const router = useRouter();
  const params = useParams();
  const { user } = useUser();
  
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'bank'>('card');
  const [isProcessing, setIsProcessing] = useState(false);
  const [quoteData, setQuoteData] = useState<any>(null);

  const quoteId = params.quote_id as string;

  useEffect(() => {
    // Load draft data
    const draftData = localStorage.getItem('quote_draft');
    if (!draftData) {
      router.push('/quotes');
      return;
    }

    const draft = JSON.parse(draftData);
    setQuoteData(draft);
  }, []);

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!quoteData || !quoteId) return;

    setIsProcessing(true);

    try {
      // Process payment
      // await payments.create({
      //   quote_id: quoteId,
      //   amount: quoteData.finalPremium,
      //   currency: 'USD',
      //   payment_method: paymentMethod,
      //   status: 'completed'
      // });

      // Create policy
      // await policies.create({
      //   quote_id: quoteId,
      //   premium_amount: quoteData.finalPremium,
      //   coverage_amount: quoteData.shipmentValue,
      //   deductible: quoteData.deductible,
      //   status: 'active'
      // });

      // Clear draft
      localStorage.removeItem('quote_draft');

      // Redirect to success page
      setTimeout(() => {
        router.push(`/quotes/${quoteId}/success`);
      }, 1000);

    } catch (error) {
      console.error('Payment error:', error);
      alert('Payment failed. Please try again.');
      setIsProcessing(false);
    }
  };

  const calculateTotal = () => {
    if (!quoteData?.finalPremium) return 0;
    
    const premium = quoteData.finalPremium;
    const serviceFee = premium * 0.1; // 10% service fee
    const taxes = (premium + serviceFee) * 0.08; // 8% tax
    
    return premium + serviceFee + taxes;
  };

  if (!quoteData) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-[#F3F3F6]">
      <DashboardHeader userEmail={user?.email} />
      
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <button 
              onClick={() => router.push(`/quotes/new/summary?quote_id=${quoteId}`)}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 text-sm"
            >
              Back to Quote
            </button>
            
            <div className="text-sm text-gray-600">Step 5 of 5</div>
          </div>

          <div className="mb-8">
            <h1 className="text-xl font-bold text-gray-900 mb-2">Complete Payment</h1>
            
            {/* Progress Bar - Full */}
            <div className="w-full bg-gray-200 rounded-full h-1.5 mb-1">
              <div className="bg-gradient-to-r from-[#0066FF] to-[#00A8FF] h-1.5 rounded-full w-full"></div>
            </div>
            <div className="flex justify-between text-xs text-gray-600">
              <span className="text-[#0066FF]">Cargo</span>
              <span className="text-[#0066FF]">Details</span>
              <span className="text-[#0066FF]">Coverage</span>
              <span className="text-[#0066FF]">Review</span>
              <span className="font-medium text-[#0066FF]">Payment</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Payment Form */}
          <div className="lg:col-span-2">
            <div className="border border-[#d1d1d154] bg-[#fdfdf8cf] rounded-2xl p-6">
              <div className="mb-8">
                <div className="flex items-center gap-2 mb-4">
                  <Lock className="w-5 h-5 text-green-600" />
                  <h2 className="font-bold text-gray-900">Secure Payment</h2>
                </div>
                <p className="text-sm text-gray-600">
                  Choose your payment method and complete the transaction
                </p>
              </div>

              <form onSubmit={handlePayment}>
                {/* Payment Method Selection */}
                <div className="mb-8">
                  <h3 className="font-bold text-gray-900 mb-4">Payment Method</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('card')}
                      className={`
                        p-4 rounded-lg border-2 transition-all flex items-center gap-3
                        ${paymentMethod === 'card'
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-300 hover:border-gray-400 bg-white'
                        }
                      `}
                    >
                      <div className="p-2 rounded bg-gray-100">
                        <CreditCard className="w-5 h-5 text-gray-600" />
                      </div>
                      <div className="text-left">
                        <div className="font-medium text-gray-900">Credit/Debit Card</div>
                        <div className="text-sm text-gray-600">Pay with card</div>
                      </div>
                      {paymentMethod === 'card' && (
                        <Check className="w-5 h-5 text-blue-500 ml-auto" />
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => setPaymentMethod('bank')}
                      className={`
                        p-4 rounded-lg border-2 transition-all flex items-center gap-3
                        ${paymentMethod === 'bank'
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-300 hover:border-gray-400 bg-white'
                        }
                      `}
                    >
                      <div className="p-2 rounded bg-gray-100">
                        <Building className="w-5 h-5 text-gray-600" />
                      </div>
                      <div className="text-left">
                        <div className="font-medium text-gray-900">Bank Transfer</div>
                        <div className="text-sm text-gray-600">Transfer funds</div>
                      </div>
                      {paymentMethod === 'bank' && (
                        <Check className="w-5 h-5 text-blue-500 ml-auto" />
                      )}
                    </button>
                  </div>

                  {/* Card Form */}
                  {paymentMethod === 'card' && (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Card Number
                        </label>
                        <input
                          type="text"
                          placeholder="1234 5678 9012 3456"
                          className="w-full h-12 px-3 rounded-lg border border-gray-300 bg-white focus:border-[#0066FF] focus:ring-2 focus:ring-blue-100 focus:outline-none"
                          required
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Expiry Date
                          </label>
                          <input
                            type="text"
                            placeholder="MM/YY"
                            className="w-full h-12 px-3 rounded-lg border border-gray-300 bg-white focus:border-[#0066FF] focus:ring-2 focus:ring-blue-100 focus:outline-none"
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            CVV
                          </label>
                          <input
                            type="text"
                            placeholder="•••"
                            className="w-full h-12 px-3 rounded-lg border border-gray-300 bg-white focus:border-[#0066FF] focus:ring-2 focus:ring-blue-100 focus:outline-none"
                            required
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Name on Card
                        </label>
                        <input
                          type="text"
                          placeholder="John Doe"
                          className="w-full h-12 px-3 rounded-lg border border-gray-300 bg-white focus:border-[#0066FF] focus:ring-2 focus:ring-blue-100 focus:outline-none"
                          required
                        />
                      </div>
                    </div>
                  )}

                  {/* Bank Transfer Info */}
                  {paymentMethod === 'bank' && (
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <div className="text-sm text-gray-700 mb-3">
                        Transfer funds to our secure banking account. You'll receive payment instructions via email.
                      </div>
                      <div className="text-sm">
                        <div className="flex justify-between mb-1">
                          <span className="text-gray-600">Bank:</span>
                          <span className="font-medium">Global Cargo Bank</span>
                        </div>
                        <div className="flex justify-between mb-1">
                          <span className="text-gray-600">Account:</span>
                          <span className="font-medium">**** 3456</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Reference:</span>
                          <span className="font-medium">Quote-{quoteId.slice(0, 8)}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Security Notice */}
                <div className="mb-8 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-start gap-2">
                    <Shield className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-gray-700">
                      <span className="font-medium">Secure Payment:</span> 256-bit SSL encryption • PCI DSS compliant • Your data is protected
                    </div>
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isProcessing}
                  className="w-full py-3.5 rounded-lg font-bold text-white bg-gradient-to-r from-[#0066FF] to-[#00A8FF] hover:from-[#0052CC] hover:to-[#0066FF] disabled:opacity-50"
                >
                  {isProcessing ? 'Processing Payment...' : `Pay Securely $${calculateTotal().toFixed(2)}`}
                </button>

                <div className="mt-4 text-center text-xs text-gray-500">
                  By completing this payment, you agree to our Terms of Service and Privacy Policy.
                </div>
              </form>
            </div>
          </div>

          {/* Order Summary */}
          <div className="space-y-4">
            {/* Order Summary */}
            <div className="border border-[#d1d1d154] bg-[#fdfdf8cf] rounded-xl p-5">
              <h3 className="font-bold text-gray-900 mb-4">Order Summary</h3>
              
              <div className="space-y-3 mb-6">
                <div className="flex justify-between">
                  <span className="text-gray-600">Premium</span>
                  <span className="font-medium text-gray-900">
                    ${quoteData.finalPremium?.toFixed(2) || '0'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Service Fee</span>
                  <span className="font-medium text-gray-900">
                    ${(quoteData.finalPremium * 0.1).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Taxes (8%)</span>
                  <span className="font-medium text-gray-900">
                    ${((quoteData.finalPremium + (quoteData.finalPremium * 0.1)) * 0.08).toFixed(2)}
                  </span>
                </div>
                <div className="border-t border-gray-200 pt-3">
                  <div className="flex justify-between font-bold">
                    <span className="text-gray-900">Total Amount</span>
                    <span className="text-gray-900">${calculateTotal().toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Shipment Summary */}
              <div className="pt-4 border-t border-gray-200">
                <h4 className="font-medium text-gray-900 mb-2">Shipment Summary</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Coverage:</span>
                    <span className="font-medium">${parseFloat(quoteData.shipmentValue).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Deductible:</span>
                    <span className="font-medium">${quoteData.deductible}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Plan:</span>
                    <span className="font-medium">{quoteData.selectedPlan}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Important Notice */}
            <div className="border border-amber-200 bg-amber-50 rounded-xl p-4">
              <h3 className="font-bold text-gray-900 text-sm mb-2">Important Notice</h3>
              <p className="text-xs text-gray-700">
                Your insurance coverage will start only after payment is completed and verified.
                Policy documents will be available immediately upon successful payment.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}