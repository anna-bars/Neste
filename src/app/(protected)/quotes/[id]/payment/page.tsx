'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import DashboardHeader from '@/app/components/dashboard/DashboardHeader';
import { useUser } from '@/app/context/UserContext';
import { 
  CreditCard, 
  Shield, 
  Calendar, 
  MapPin, 
  Package, 
  Check, 
  Lock,
  ArrowLeft,
  AlertCircle,
  DollarSign,
  FileText,
  CheckCircle
} from 'lucide-react';
import toast from 'react-hot-toast';

interface QuoteData {
  id: string;
  quote_number: string;
  cargo_type: string;
  shipment_value: number;
  origin: any;
  destination: any;
  start_date: string;
  end_date: string;
  transportation_mode: string;
  status: string;
  payment_status: string;
  selected_coverage?: 'standard' | 'premium' | 'enterprise';
  calculated_premium?: number;
  deductible?: number;
}

export default function QuotePaymentPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useUser();
  const quoteId = params.id as string;
  
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [quoteData, setQuoteData] = useState<QuoteData | null>(null);
  const [cardDetails, setCardDetails] = useState({
    number: '',
    expiry: '',
    cvv: '',
    name: '',
  });
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'bank'>('card');

  useEffect(() => {
    loadQuoteData();
  }, [quoteId]);

  const loadQuoteData = async () => {
    if (!quoteId || !user) {
      toast.error('No quote specified');
      router.push('/dashboard');
      return;
    }

    const supabase = createClient();
    
    try {
      const { data: quote, error: quoteError } = await supabase
        .from('quotes')
        .select('*')
        .eq('id', quoteId)
        .single();
      
      if (quoteError || !quote) {
        console.error('Quote error:', quoteError);
        throw new Error('Quote not found');
      }
      
      if (quote.status !== 'approved') {
        toast.error('This quote is not approved yet');
        router.push(`/quotes/new/insurance?quote_id=${quoteId}`);
        return;
      }
      
      if (quote.payment_status === 'paid') {
        toast('This quote is already paid', { icon: '✅' });
      }
      
      setQuoteData(quote);
      
    } catch (error: any) {
      console.error('Error loading quote:', error);
      toast.error('Failed to load quote details');
      router.push('/quotes');
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

  const getCardBrand = (cardNumber: string): string => {
    const number = cardNumber.replace(/\s/g, '');
    if (number.startsWith('4')) return 'visa';
    if (number.match(/^5[1-5]/)) return 'mastercard';
    if (number.startsWith('34') || number.startsWith('37')) return 'amex';
    if (number.startsWith('6')) return 'discover';
    return 'unknown';
  };

const handlePayment = async () => {
  if (!quoteId || !quoteData || !user) return;
  
  if (paymentMethod === 'card') {
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
    toast.loading('Processing payment...');
    
    const supabase = createClient();
    
    // 1. Update quote status FIRST
    const { error: quoteUpdateError } = await supabase
      .from('quotes')
      .update({
        payment_status: 'paid',
        updated_at: new Date().toISOString()
      })
      .eq('id', quoteId);
    
    if (quoteUpdateError) {
      console.error('Quote update error:', quoteUpdateError);
      throw quoteUpdateError;
    }
    
    console.log('Quote status updated to paid');
    
    // Generate unique IDs
    const policyNumber = `POL-${Math.floor(100000 + Math.random() * 900000)}`;
    const transactionId = `TXN-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    // 2. Create payment record
    let payment = null;
    
    try {
      const paymentData = {
        quote_id: quoteId,
        user_id: user.id,
        amount: totalAmount,
        currency: 'USD',
        payment_method: paymentMethod === 'card' ? 'credit_card' : 'bank_transfer',
        payment_status: 'completed',
        ...(paymentMethod === 'card' && {
          card_last_four: cardDetails.number.replace(/\s/g, '').slice(-4),
          card_brand: getCardBrand(cardDetails.number),
        }),
        ...(paymentMethod === 'bank' && {
          bank_name: 'Global Cargo Bank',
          bank_account_last_four: '3456',
        }),
        transaction_id: transactionId,
        gateway: 'demo',
        created_at: new Date().toISOString(),
        completed_at: new Date().toISOString()
      };
      
      console.log('Creating payment record:', paymentData);
      
      const { data: newPayment, error: paymentInsertError } = await supabase
        .from('payments')
        .insert([paymentData])
        .select()
        .single();
      
      if (paymentInsertError) {
        console.error('Payment insert error:', paymentInsertError);
      } else {
        payment = newPayment;
        console.log('Payment record created:', payment);
      }
    } catch (paymentError) {
      console.error('Payment creation error:', paymentError);
    }
    
    // 3. First create policy with placeholder URLs
    let policy = null;
    let createdPolicyId = null;
    
    try {
      const startDate = new Date(quoteData.start_date);
      const endDate = new Date(quoteData.end_date);
      
      // Create placeholder URLs (will be updated after certificate generation)
      const placeholderCertificateUrl = `/api/documents/generate-certificate`;
      const termsUrl = `https://storage.cargoguard.com/legal/terms-and-conditions-v1.0.pdf`;
      const receiptUrl = `/api/generate-receipt`;
      
      const policyData = {
        quote_id: quoteId,
        user_id: user.id,
        policy_number: policyNumber,
        status: 'active',
        payment_status: 'paid',
        premium_amount: quoteData.calculated_premium || 0,
        coverage_amount: quoteData.shipment_value || 0,
        deductible: quoteData.deductible || 0,
        cargo_type: quoteData.cargo_type || 'general',
        transportation_mode: quoteData.transportation_mode || 'road',
        origin: quoteData.origin || {},
        destination: quoteData.destination || {},
        coverage_start: startDate.toISOString().split('T')[0],
        coverage_end: endDate.toISOString().split('T')[0],
        insurance_certificate_url: placeholderCertificateUrl,
        terms_url: termsUrl,
        receipt_url: receiptUrl,
        activated_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      console.log('Creating policy:', policyData);
      
      const { data: newPolicy, error: policyError } = await supabase
        .from('policies')
        .insert([policyData])
        .select()
        .single();
      
      if (policyError) {
        console.error('Policy creation error:', policyError);
        throw new Error('Failed to create policy');
      } else {
        policy = newPolicy;
        createdPolicyId = newPolicy.id;
        console.log('Policy created successfully:', policy);
      }
    } catch (policyError) {
      console.error('Policy creation catch error:', policyError);
      throw policyError;
    }
    
    // 4. Generate insurance certificate (async - don't wait for completion)
    if (createdPolicyId) {
  // Start certificate generation in background
  generateCertificateAsync(policyNumber, quoteData, user, createdPolicyId, transactionId)
    .catch(error => console.error('Certificate generation background error:', error));
  
  // Start receipt generation in background
  if (payment) {
    generateReceiptAsync(transactionId, payment, policyNumber, createdPolicyId)
      .catch(error => console.error('Receipt generation background error:', error));
  }
}

toast.dismiss();
toast.success('Payment successful! Your insurance is now active.');

setQuoteData(prev => prev ? { ...prev, payment_status: 'paid' } : null);

setTimeout(() => {
  if (createdPolicyId) {
    router.push(`/shipments/${createdPolicyId}`);
  } else {
    router.push(`/quotes/${quoteId}`);
  }
}, 1500);
    
  } catch (error: any) {
    console.error('Payment error:', error);
    
    toast.error('Payment failed. Please try again.');
    setProcessing(false);
  }
};
const generateCertificateAsync = async (
  policyNumber: string, 
  quoteData: QuoteData, 
  user: any, 
  policyId: string,
  transactionId: string
) => {
  try {
    console.log('Generating certificate for policy:', policyNumber);
    
    // Call PDF.co API endpoint
    const response = await fetch('/api/generate-pdf-certificate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        policyNumber,
        quoteData,
        user
      })
    });
    
    const result = await response.json();
    
    if (!response.ok) {
      console.error('Certificate generation failed:', result.error);
      throw new Error(result.error || 'Failed to generate certificate');
    }
    
    if (result.success && result.certificateUrl) {
      console.log('Certificate generated:', result.certificateUrl);
      
      // Update policy with the actual URL
      const supabase = createClient();
      await supabase
        .from('policies')
        .update({ 
          insurance_certificate_url: result.certificateUrl,
          updated_at: new Date().toISOString()
        })
        .eq('id', policyId);
      
      console.log('Policy updated with certificate URL');
      
    } else {
      console.warn('Certificate generation warning:', result.error || 'Unknown error');
      
      // Fallback: Create a simple URL anyway
      const fallbackUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/documents/certificate-${policyNumber}.pdf`;
      
      const supabase = createClient();
      await supabase
        .from('policies')
        .update({ 
          insurance_certificate_url: fallbackUrl,
          updated_at: new Date().toISOString()
        })
        .eq('id', policyId);
      
      console.log('Used fallback URL:', fallbackUrl);
    }
    
  } catch (error) {
    console.error('Certificate generation failed:', error);
    
    // Ultimate fallback
    try {
      const supabase = createClient();
      const fallbackUrl = `https://storage.cargoguard.com/certificates/generic.pdf`;
      
      await supabase
        .from('policies')
        .update({ 
          insurance_certificate_url: fallbackUrl,
          updated_at: new Date().toISOString()
        })
        .eq('id', policyId);
      
      console.log('Used generic certificate URL as ultimate fallback');
    } catch (fallbackError) {
      console.error('Even fallback failed:', fallbackError);
    }
  }
};
// Add this function right after generateCertificateAsync
const generateReceiptAsync = async (
  transactionId: string,
  paymentData: any,
  policyNumber: string,
  policyId: string
) => {
  try {
    console.log('Generating receipt for transaction:', transactionId);
    
    const response = await fetch('/api/generate-receipt', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        transactionId,
        payment: paymentData,
        policyNumber
      })
    });
    
    const result = await response.json();
    
    if (!response.ok) {
      console.error('Receipt generation failed:', result.error);
      throw new Error(result.error || 'Failed to generate receipt');
    }
    
    if (result.success && result.receiptUrl) {
      console.log('Receipt generated:', result.receiptUrl);
      
      // Update payment with receipt URL
      const supabase = createClient();
      await supabase
        .from('payments')
        .update({ 
          receipt_url: result.receiptUrl,
          updated_at: new Date().toISOString()
        })
        .eq('transaction_id', transactionId);
      
      // Also update policy
      await supabase
        .from('policies')
        .update({ 
          receipt_url: result.receiptUrl,
          updated_at: new Date().toISOString()
        })
        .eq('id', policyId);
      
      console.log('Receipt URLs updated');
    }
    
  } catch (error) {
    console.error('Receipt generation failed:', error);
    // Don't fail the whole process
  }
};
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const isAlreadyPaid = quoteData?.payment_status === 'paid';

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <DashboardHeader userEmail={user?.email} />
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-2 border-blue-600 border-t-transparent mx-auto mb-4"></div>
              <p className="text-gray-600">Loading payment details...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!quoteData) {
    return (
      <div className="min-h-screen bg-gray-50">
        <DashboardHeader userEmail={user?.email} />
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Quote Not Found</h2>
            <p className="text-gray-600 mb-6">The quote you're looking for doesn't exist or has been deleted.</p>
            <button
              onClick={() => router.push('/quotes')}
              className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              Back to Quotes
            </button>
          </div>
        </div>
      </div>
    );
  }

  const serviceFee = 99;
  const basePremium = quoteData.calculated_premium || 0;
  const taxes = Math.round(basePremium * 0.08);
  const totalAmount = basePremium + serviceFee + taxes;

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader userEmail={user?.email} />
      
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.push(`/quotes/${quoteId}`)}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Quote</span>
          </button>
          
          <h1 className="text-3xl font-bold text-gray-900">Complete Payment</h1>
          <p className="text-gray-600 mt-2">
            Review your policy details and complete payment to activate coverage
          </p>
        </div>
        
        {/* Payment Status Banner */}
        {isAlreadyPaid && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">Payment Already Completed!</h3>
                <p className="text-sm text-gray-600">
                  Your payment has been processed successfully. Your insurance coverage is now active.
                </p>
              </div>
              <button
                onClick={() => router.push(`/quotes/${quoteId}`)}
                className="px-4 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors"
              >
                View Quote
              </button>
            </div>
          </div>
        )}
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Payment Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Payment Method Selection - Only show if not already paid */}
            {!isAlreadyPaid && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Payment Method</h2>
                
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <button
                    onClick={() => setPaymentMethod('card')}
                    className={`p-4 rounded-lg border transition-all duration-300 ${
                      paymentMethod === 'card'
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-300 hover:border-blue-500'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${
                        paymentMethod === 'card'
                          ? 'bg-blue-100'
                          : 'bg-gray-100'
                      }`}>
                        <CreditCard className={`w-5 h-5 ${
                          paymentMethod === 'card' ? 'text-blue-600' : 'text-gray-600'
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
                    className={`p-4 rounded-lg border transition-all duration-300 ${
                      paymentMethod === 'bank'
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-300 hover:border-blue-500'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${
                        paymentMethod === 'bank'
                          ? 'bg-blue-100'
                          : 'bg-gray-100'
                      }`}>
                        <FileText className={`w-5 h-5 ${
                          paymentMethod === 'bank' ? 'text-blue-600' : 'text-gray-600'
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
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                        />
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
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
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
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
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
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                      />
                    </div>
                  </div>
                )}
                
                {/* Bank Transfer Form */}
                {paymentMethod === 'bank' && (
                  <div className="space-y-4">
                    <div className="p-4 bg-gray-50 rounded-lg border border-gray-300">
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
                          <span className="font-medium text-gray-900">QUOTE-{quoteData.quote_number}</span>
                        </div>
                      </div>
                    </div>
                    
                    <p className="text-sm text-amber-600">
                      Please include the quote number as reference when making the transfer. 
                      Policy will be activated once payment is confirmed (1-2 business days).
                    </p>
                  </div>
                )}
              </div>
            )}
            
            {/* Policy Summary */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className={`p-2 rounded-lg ${
                  isAlreadyPaid ? 'bg-green-100' : 'bg-blue-100'
                }`}>
                  <Shield className={`w-6 h-6 ${
                    isAlreadyPaid ? 'text-green-600' : 'text-blue-600'
                  }`} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Shipment Summary</h2>
                  <p className={`text-sm ${
                    isAlreadyPaid ? 'text-green-600' : 'text-blue-600'
                  }`}>
                    {isAlreadyPaid ? 'Coverage Active' : 'Coverage pending activation'}
                  </p>
                </div>
                <div className="ml-auto px-3 py-1 rounded-full bg-yellow-100 text-yellow-800 border border-yellow-200">
                  <span className="font-semibold text-sm">Quote #{quoteData.quote_number}</span>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Package className="w-4 h-4 text-gray-600" />
                    <span className="text-sm font-medium text-gray-700">Cargo Type</span>
                  </div>
                  <p className="font-semibold text-gray-900">{quoteData.cargo_type}</p>
                </div>
                
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <DollarSign className="w-4 h-4 text-gray-600" />
                    <span className="text-sm font-medium text-gray-700">Shipment Value</span>
                  </div>
                  <p className="font-semibold text-gray-900">{formatCurrency(quoteData.shipment_value)}</p>
                </div>
                
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className="w-4 h-4 text-gray-600" />
                    <span className="text-sm font-medium text-gray-700">Coverage Period</span>
                  </div>
                  <p className="font-semibold text-gray-900">
                    {formatDate(quoteData.start_date)} - {formatDate(quoteData.end_date)}
                  </p>
                </div>
                
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <MapPin className="w-4 h-4 text-gray-600" />
                    <span className="text-sm font-medium text-gray-700">Route</span>
                  </div>
                  <p className="font-semibold text-gray-900">
                    {quoteData.origin?.city || 'Unknown'} → {quoteData.destination?.city || 'Unknown'}
                  </p>
                </div>
              </div>
              
              {!isAlreadyPaid && (
                <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                  <div className="flex items-start gap-3">
                    <div className="p-1.5 bg-yellow-100 rounded-lg">
                      <Shield className="w-5 h-5 text-yellow-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">Important Notice</h3>
                      <p className="text-sm text-yellow-700">
                        Your insurance coverage will start only after payment is completed. 
                        {paymentMethod === 'bank' && ' Bank transfers may take 1-2 business days to process.'}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {/* Right Column - Order Summary */}
          <div className="space-y-6">
            <div className="sticky top-6">
              {/* Order Summary */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Order Summary</h3>
                
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between items-center pb-2 border-b border-gray-200">
                    <span className="text-gray-700">Premium</span>
                    <span className="font-semibold text-gray-900">
                      {formatCurrency(basePremium)}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center pb-2 border-b border-gray-200">
                    <span className="text-gray-700">Service Fee</span>
                    <span className="font-semibold text-gray-900">{formatCurrency(serviceFee)}</span>
                  </div>
                  
                  <div className="flex justify-between items-center pb-2 border-b border-gray-200">
                    <span className="text-gray-700">Taxes (8%)</span>
                    <span className="font-semibold text-gray-900">
                      {formatCurrency(taxes)}
                    </span>
                  </div>
                  
                  <div className="pt-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-lg font-bold text-gray-900">Total Amount</span>
                      <span className="text-2xl font-bold text-blue-600">
                        {formatCurrency(totalAmount)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Lock className="w-4 h-4" />
                      <span>Secure SSL encryption</span>
                    </div>
                  </div>
                </div>
                
                {isAlreadyPaid ? (
                  <div className="space-y-3">
                    <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                      <div className="flex items-center gap-2 mb-2">
                        <CheckCircle className="w-5 h-5 text-green-600" />
                        <span className="font-semibold text-green-700">Payment Completed</span>
                      </div>
                      <p className="text-sm text-green-600">
                        Your payment has been processed successfully. Your insurance is now active.
                      </p>
                    </div>
                    <button
                      onClick={() => router.push(`/quotes/${quoteId}`)}
                      className="w-full py-3.5 font-medium rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-all flex items-center justify-center gap-2"
                    >
                      <Shield className="w-5 h-5" />
                      View Quote Details
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={handlePayment}
                    disabled={processing}
                    className={`w-full py-3.5 font-medium rounded-lg transition-all ${
                      processing
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-blue-600 hover:bg-blue-700 text-white'
                    } flex items-center justify-center gap-2`}
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
                )}
                
                <p className="text-xs text-gray-500 text-center mt-4">
                  By completing this payment, you agree to our{' '}
                  <a href="#" className="text-blue-600 hover:underline">Terms of Service</a> and{' '}
                  <a href="#" className="text-blue-600 hover:underline">Privacy Policy</a>.
                </p>
              </div>
              
              {/* Security Assurance */}
              <div className="bg-green-50 rounded-xl border border-green-200 p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-1.5 bg-green-100 rounded-lg">
                    <Shield className="w-4 h-4 text-green-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900">Secure Payment</h3>
                </div>
                <ul className="space-y-2 text-sm text-green-700">
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