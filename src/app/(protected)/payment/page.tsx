"use client";

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import DashboardHeader from '@/app/components/dashboard/DashboardHeader';
import { CreditCard, Shield, Calendar, MapPin, Package, Truck, Check, Lock } from 'lucide-react';
import toast from 'react-hot-toast';

export default function PaymentPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [quoteData, setQuoteData] = useState<any>(null);
  const [policyData, setPolicyData] = useState<any>(null);
  const [cardDetails, setCardDetails] = useState({
    number: '',
    expiry: '',
    cvv: '',
    name: '',
  });
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'bank'>('card');
  const quoteId = searchParams.get('quoteId');
  const amount = parseFloat(searchParams.get('amount') || '0');

  useEffect(() => {
    loadData();
  }, [quoteId]);

  const loadData = async () => {
    if (!quoteId) {
      toast.error('No quote specified');
      router.push('/dashboard');
      return;
    }

    const supabase = createClient();
    
    try {
      const { data: quote, error: quoteError } = await supabase
        .from('quote_requests')
        .select('*')
        .eq('id', quoteId)
        .single();
      
      if (quoteError || !quote) {
        throw new Error('Quote not found');
      }
      
      setQuoteData(quote);
      
      const { data: policy, error: policyError } = await supabase
        .from('policies')
        .select('*')
        .eq('quote_request_id', quoteId)
        .maybeSingle();
      
      if (policyError) {
        console.error('Policy error:', policyError);
      }
      
      if (policy) {
        setPolicyData(policy);
      } else if (quote.status === 'approved') {
        const response = await fetch('/api/policies/create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ quoteId }),
        });
        
        const { policy: newPolicy } = await response.json();
        setPolicyData(newPolicy);
      }
      
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Failed to load payment details');
    } finally {
      setLoading(false);
    }
  };

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];
    
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    
    if (parts.length) {
      return parts.join(' ');
    } else {
      return value;
    }
  };

  const formatExpiry = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    if (v.length >= 2) {
      return `${v.substring(0, 2)}/${v.substring(2, 4)}`;
    }
    return v;
  };

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCardNumber(e.target.value);
    setCardDetails({ ...cardDetails, number: formatted });
  };

  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatExpiry(e.target.value);
    setCardDetails({ ...cardDetails, expiry: formatted });
  };

  const handlePayment = async () => {
      if (!quoteId || !policyData) return;
  
  // Check if already paid
  if (quoteData?.payment_status === 'paid') {
    toast.error('This quote is already paid');
    return;
  }
  
  // Check if policy already active
  if (policyData?.status === 'active') {
    toast.error('Policy is already active');
    router.push(`/shipments/${policyData.id}`);
    return;
  }
    
    if (paymentMethod === 'card') {
      // Validate card details
      if (!cardDetails.number || cardDetails.number.replace(/\s/g, '').length !== 16) {
        toast.error('Please enter a valid 16-digit card number');
        return;
      }
      if (!cardDetails.expiry || !cardDetails.expiry.includes('/')) {
        toast.error('Please enter a valid expiry date (MM/YY)');
        return;
      }
      if (!cardDetails.cvv || cardDetails.cvv.length !== 3) {
        toast.error('Please enter a valid CVV');
        return;
      }
      if (!cardDetails.name) {
        toast.error('Please enter the name on card');
        return;
      }
    }
    
    setProcessing(true);
    
    try {
      // For demo purposes, we'll use mock payment
      if (process.env.NEXT_PUBLIC_USE_STRIPE === 'true') {
        // Use Stripe for real payments
        const response = await fetch('/api/payment/create-checkout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            quoteId,
            policyId: policyData.id,
            amount,
            policyNumber: policyData.policy_number,
          }),
        });
        
        const { url, error } = await response.json();
        
        if (error) {
          throw new Error(error);
        }
        
        if (url) {
          window.location.href = url;
        }
      } else {
        // Mock payment processing
        toast.loading('Processing payment...');
        
        const supabase = createClient();
        const { error: paymentError } = await supabase
          .from('policies')
          .update({
            payment_status: 'paid',
            status: 'active',
            paid_at: new Date().toISOString(),
            activated_at: new Date().toISOString(),
            payment_method: paymentMethod === 'card' ? 'credit_card' : 'bank_transfer',
          })
          .eq('id', policyData.id);
        
        if (paymentError) throw paymentError;
        
        await supabase
          .from('quote_requests')
          .update({
            payment_status: 'paid',
          })
          .eq('id', quoteId);
        
        toast.dismiss();
        toast.success('Payment successful! Policy is now active.');
        
        // Redirect to success page
        router.push(`/payment/success?policyId=${policyData.id}&quoteId=${quoteId}`);
      }
      
    } catch (error) {
      console.error('Payment error:', error);
      toast.error('Payment failed. Please try again.');
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F3F3F6]">
        <DashboardHeader userEmail="client@example.com" />
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-[3px] border-blue-500 border-t-transparent mx-auto mb-4"></div>
              <p className="text-gray-600">Loading payment details...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const serviceFee = 99;
  const taxes = amount * 0.08;
  const totalAmount = amount + serviceFee + taxes;

  return (
    <div className="min-h-screen bg-[#F3F3F6]">
      <DashboardHeader userEmail="client@example.com" />
      
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Complete Payment</h1>
          <p className="text-gray-600 mt-2">
            Review your policy details and complete payment to activate coverage
          </p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Payment Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Payment Method Selection */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Payment Method</h2>
              
              <div className="grid grid-cols-2 gap-4 mb-6">
                <button
                  onClick={() => setPaymentMethod('card')}
                  className={`p-4 rounded-xl border transition-all duration-300 ${
                    paymentMethod === 'card'
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-300 hover:border-blue-500'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${
                      paymentMethod === 'card'
                        ? 'bg-gradient-to-br from-blue-500 to-blue-600'
                        : 'bg-gradient-to-br from-gray-500/10 to-gray-600/10'
                    }`}>
                      <CreditCard className={`w-5 h-5 ${
                        paymentMethod === 'card' ? 'text-white' : 'text-gray-600'
                      }`} />
                    </div>
                    <div className="text-left">
                      <p className={`font-semibold ${
                        paymentMethod === 'card' ? 'text-gray-900' : 'text-gray-700'
                      }`}>Credit/Debit Card</p>
                      <p className="text-sm text-gray-600">Pay with card</p>
                    </div>
                  </div>
                </button>
                
                <button
                  onClick={() => setPaymentMethod('bank')}
                  className={`p-4 rounded-xl border transition-all duration-300 ${
                    paymentMethod === 'bank'
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-300 hover:border-blue-500'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${
                      paymentMethod === 'bank'
                        ? 'bg-gradient-to-br from-blue-500 to-blue-600'
                        : 'bg-gradient-to-br from-gray-500/10 to-gray-600/10'
                    }`}>
                      <CreditCard className={`w-5 h-5 ${
                        paymentMethod === 'bank' ? 'text-white' : 'text-gray-600'
                      }`} />
                    </div>
                    <div className="text-left">
                      <p className={`font-semibold ${
                        paymentMethod === 'bank' ? 'text-gray-900' : 'text-gray-700'
                      }`}>Bank Transfer</p>
                      <p className="text-sm text-gray-600">Transfer funds</p>
                    </div>
                  </div>
                </button>
              </div>
              
              {/* Card Payment Form */}
              {paymentMethod === 'card' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Card Number
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={cardDetails.number}
                        onChange={handleCardNumberChange}
                        placeholder="1234 5678 9012 3456"
                        maxLength={19}
                        className="w-full px-4 py-3 bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-300 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all duration-300"
                      />
                      <div className="absolute right-4 top-3 flex items-center gap-2">
                        <div className="w-8 h-5 bg-gradient-to-r from-blue-500 to-blue-600 rounded"></div>
                        <div className="w-8 h-5 bg-gradient-to-r from-red-500 to-red-600 rounded"></div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Expiry Date
                      </label>
                      <input
                        type="text"
                        value={cardDetails.expiry}
                        onChange={handleExpiryChange}
                        placeholder="MM/YY"
                        maxLength={5}
                        className="w-full px-4 py-3 bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-300 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all duration-300"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        CVV
                      </label>
                      <div className="relative">
                        <input
                          type="password"
                          value={cardDetails.cvv}
                          onChange={(e) => setCardDetails({ ...cardDetails, cvv: e.target.value.replace(/\D/g, '') })}
                          placeholder="123"
                          maxLength={3}
                          className="w-full px-4 py-3 bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-300 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all duration-300"
                        />
                        <div className="absolute right-3 top-3">
                          <Lock className="w-4 h-4 text-gray-400" />
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Name on Card
                    </label>
                    <input
                      type="text"
                      value={cardDetails.name}
                      onChange={(e) => setCardDetails({ ...cardDetails, name: e.target.value })}
                      placeholder="John Doe"
                      className="w-full px-4 py-3 bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-300 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all duration-300"
                    />
                  </div>
                </div>
              )}
              
              {/* Bank Transfer Form */}
              {paymentMethod === 'bank' && (
                <div className="space-y-4">
                  <div className="p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl border border-gray-300">
                    <h3 className="font-semibold text-gray-900 mb-2">Bank Details</h3>
                    <div className="space-y-2 text-sm text-gray-600">
                      <div className="flex justify-between">
                        <span>Bank Name:</span>
                        <span className="font-medium text-gray-900">Global Cargo Bank</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Account Number:</span>
                        <span className="font-medium text-gray-900">1234 5678 9012 3456</span>
                      </div>
                      <div className="flex justify-between">
                        <span>SWIFT/BIC:</span>
                        <span className="font-medium text-gray-900">GCBKUS33XXX</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Reference:</span>
                        <span className="font-medium text-gray-900">{policyData?.policy_number}</span>
                      </div>
                    </div>
                  </div>
                  
                  <p className="text-sm text-amber-600">
                    Please include the policy number as reference when making the transfer. 
                    Policy will be activated once payment is confirmed (1-2 business days).
                  </p>
                </div>
              )}
            </div>
            
            {/* Policy Summary */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2.5 bg-gradient-to-br from-blue-500/10 to-blue-600/10 rounded-xl">
                  <Shield className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Policy Summary</h2>
                  <p className="text-sm text-blue-600">Coverage pending activation</p>
                </div>
                {policyData && (
                  <div className="ml-auto px-3 py-1.5 rounded-full bg-gradient-to-r from-amber-50 to-amber-100 text-amber-700 border border-amber-200">
                    <span className="font-semibold text-sm">{policyData.policy_number}</span>
                  </div>
                )}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Package className="w-4 h-4 text-gray-600" />
                    <span className="text-sm font-medium text-gray-700">Cargo Type</span>
                  </div>
                  <p className="font-semibold text-gray-900">{quoteData?.cargo_type}</p>
                </div>
                
                <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className="w-4 h-4 text-gray-600" />
                    <span className="text-sm font-medium text-gray-700">Coverage Period</span>
                  </div>
                  <p className="font-semibold text-gray-900">
                    {quoteData && new Date(quoteData.start_date).toLocaleDateString()} - {quoteData && new Date(quoteData.end_date).toLocaleDateString()}
                  </p>
                </div>
                
                <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <MapPin className="w-4 h-4 text-gray-600" />
                    <span className="text-sm font-medium text-gray-700">Route</span>
                  </div>
                  <p className="font-semibold text-gray-900">
                    {quoteData?.origin?.city} → {quoteData?.destination?.city}
                  </p>
                </div>
                
                <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Truck className="w-4 h-4 text-gray-600" />
                    <span className="text-sm font-medium text-gray-700">Transport</span>
                  </div>
                  <p className="font-semibold text-gray-900">{quoteData?.transportation_mode}</p>
                </div>
              </div>
              
              <div className="p-4 bg-gradient-to-r from-amber-50 to-amber-100 rounded-xl border border-amber-200">
                <div className="flex items-start gap-3">
                  <div className="p-1.5 bg-amber-500/20 rounded-lg">
                    <Shield className="w-5 h-5 text-amber-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Important Notice</h3>
                    <p className="text-sm text-amber-700">
                      Your insurance coverage will start only after payment is completed. 
                      {paymentMethod === 'bank' && ' Bank transfers may take 1-2 business days to process.'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Right Column - Order Summary */}
          <div className="space-y-6">
            <div className="sticky top-6">
              {/* Order Summary */}
              <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Order Summary</h3>
                
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between items-center pb-2 border-b border-gray-200">
                    <span className="text-gray-700">Premium</span>
                    <span className="font-semibold text-gray-900">
                      ${amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center pb-2 border-b border-gray-200">
                    <span className="text-gray-700">Service Fee</span>
                    <span className="font-semibold text-gray-900">${serviceFee.toFixed(2)}</span>
                  </div>
                  
                  <div className="flex justify-between items-center pb-2 border-b border-gray-200">
                    <span className="text-gray-700">Taxes (8%)</span>
                    <span className="font-semibold text-gray-900">
                      ${taxes.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  
                  <div className="pt-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-lg font-bold text-gray-900">Total Amount</span>
                      <span className="text-2xl font-bold text-blue-700">
                        ${totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Lock className="w-4 h-4" />
                      <span>Secure SSL encryption</span>
                    </div>
                  </div>
                </div>
                
                <button
                  onClick={handlePayment}
                  disabled={processing}
                  className={`w-full py-3.5 font-bold rounded-xl transition-all duration-300 transform hover:-translate-y-0.5 ${
                    processing
                      ? 'bg-gradient-to-r from-blue-400 to-blue-500 cursor-not-allowed'
                      : 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700'
                  } text-white flex items-center justify-center gap-2`}
                >
                  {processing ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                      Processing...
                    </>
                  ) : (
                    <>
                      <Lock className="w-5 h-5" />
                      {paymentMethod === 'card' ? 'Pay Securely' : 'Confirm Bank Transfer'}
                    </>
                  )}
                </button>
                
                <p className="text-xs text-gray-500 text-center mt-4">
                  By completing this payment, you agree to our{' '}
                  <a href="#" className="text-blue-600 hover:underline">Terms of Service</a> and{' '}
                  <a href="#" className="text-blue-600 hover:underline">Privacy Policy</a>.
                </p>
              </div>
              
              {/* Security Assurance */}
              <div className="bg-gradient-to-r from-emerald-50 to-emerald-100 rounded-2xl border border-emerald-200 p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-1.5 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg">
                    <Shield className="w-4 h-4 text-white" />
                  </div>
                  <h3 className="font-semibold text-gray-900">Secure Payment</h3>
                </div>
                <ul className="space-y-2 text-sm text-emerald-700">
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4" />
                    <span>256-bit SSL encryption</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4" />
                    <span>PCI DSS compliant</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4" />
                    <span>No card details stored</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}