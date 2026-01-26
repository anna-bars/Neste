'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { 
  ArrowLeft,
  ChevronRight,
  Shield, 
  Lock, 
  CreditCard, 
  Building,
  Check,
  Sparkles,
  Lightbulb,
  AlertCircle,
  HelpCircle,
  CheckCircle2,
  DollarSign,
  FileText,
  Calendar
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
  const [stepComplete, setStepComplete] = useState(true);

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
    return (
      <div className="min-h-screen bg-[#F3F3F6] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <div className="text-gray-600">Loading payment details...</div>
        </div>
      </div>
    );
  }

  const premium = quoteData.finalPremium;
  const serviceFee = premium * 0.1;
  const taxes = (premium + serviceFee) * 0.08;
  const totalAmount = calculateTotal();

  return (
    <div className="min-h-screen bg-[#F3F3F6] text-gray-900">
      <DashboardHeader userEmail={user?.email}/>
      
      <div className="relative max-w-[88%] mx-auto pt-2 pb-4 py-8">
        {/* Modern Header */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-0">
            <button 
              onClick={() => router.push(`/quotes/new/summary?quote_id=${quoteId}`)}
              className="group flex items-center gap-3 text-gray-600 hover:text-gray-900 transition-all duration-300"
            >
              <div className="p-2 rounded-xl bg-white border border-gray-200 shadow-sm group-hover:border-gray-300 group-hover:shadow transition-all">
                <ArrowLeft className="w-4 h-4" />
              </div>
              <span className="text-sm font-medium">
                Back to Summary
              </span>
            </button>
            
            {/* Modern Progress Indicator */}
            <div className="flex items-center gap-4">
              <div className="text-sm font-mono text-gray-500">05/05</div>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <div className="w-10 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full transition-all duration-700 w-full"></div>
                  </div>
                  <div className="absolute -top-1.5 right-0 transform translate-x-1/2 w-3 h-3 rounded-full bg-blue-500 border-2 border-white"></div>
                </div>
                <Sparkles className="w-4 h-4 text-blue-500" />
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* Left Side - Payment Form (80%) */}
          <div className="lg:col-span-9 order-2 lg:order-1">
            <div className="relative group">
              <div className="relative border border-[#d1d1d154] bg-[#FDFEFF] rounded-2xl shadow-sm overflow-hidden">
                {/* Card Header */}
                <div className="p-8 border-b border-gray-100">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-4 mb-3">
                        <div className="p-3 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 shadow-lg">
                          <Lock className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h2 className="text-2xl font-bold text-gray-900">Secure Payment</h2>
                          <p className="text-gray-600 text-sm mt-1">
                            Complete your payment to activate insurance coverage
                          </p>
                        </div>
                      </div>
                      
                      {/* Security Badge */}
                      <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-green-50 to-emerald-50 border border-emerald-200">
                        <Shield className="w-3 h-3 text-emerald-600" />
                        <span className="text-xs font-medium text-emerald-700">256-bit SSL Secured</span>
                      </div>
                    </div>
                    
                    {/* Step Indicator */}
                    <div className="hidden lg:block">
                      <div className="text-xs font-mono text-gray-500 mb-1">STEP 05</div>
                      <div className="text-sm font-bold text-gray-900 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-200">
                        Payment
                      </div>
                    </div>
                  </div>
                </div>

                {/* Form Content */}
                <div className="p-8">
                  <form onSubmit={handlePayment}>
                    {/* Payment Method Selection */}
                    <div className="mb-8">
                      <div className="flex items-center gap-3 mb-5">
                        <div className="p-2 rounded-lg bg-gradient-to-br from-blue-50 to-cyan-50 border border-cyan-200">
                          <CreditCard className="w-4 h-4 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="font-bold text-gray-900">Payment Method</h3>
                          <p className="text-sm text-gray-600">Select how you'd like to pay</p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                        <button
                          type="button"
                          onClick={() => setPaymentMethod('card')}
                          className={`
                            relative group/payment p-5 rounded-xl border-2 transition-all duration-300
                            ${paymentMethod === 'card'
                              ? 'border-blue-500 bg-blue-50 shadow-md'
                              : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
                            }
                          `}
                        >
                          <div className="flex items-center gap-4">
                            <div className={`p-3 rounded-lg ${paymentMethod === 'card' ? 'bg-white border border-blue-200' : 'bg-gray-100'}`}>
                              <CreditCard className={`w-5 h-5 ${paymentMethod === 'card' ? 'text-blue-600' : 'text-gray-600'}`} />
                            </div>
                            <div className="text-left">
                              <div className={`font-bold text-lg ${paymentMethod === 'card' ? 'text-gray-900' : 'text-gray-800'}`}>
                                Credit/Debit Card
                              </div>
                              <div className={`text-sm ${paymentMethod === 'card' ? 'text-gray-700' : 'text-gray-600'}`}>
                                Pay instantly with card
                              </div>
                            </div>
                            {paymentMethod === 'card' && (
                              <Check className="w-5 h-5 text-blue-600 ml-auto" />
                            )}
                          </div>
                        </button>

                        <button
                          type="button"
                          onClick={() => setPaymentMethod('bank')}
                          className={`
                            relative group/payment p-5 rounded-xl border-2 transition-all duration-300
                            ${paymentMethod === 'bank'
                              ? 'border-blue-500 bg-blue-50 shadow-md'
                              : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
                            }
                          `}
                        >
                          <div className="flex items-center gap-4">
                            <div className={`p-3 rounded-lg ${paymentMethod === 'bank' ? 'bg-white border border-blue-200' : 'bg-gray-100'}`}>
                              <Building className={`w-5 h-5 ${paymentMethod === 'bank' ? 'text-blue-600' : 'text-gray-600'}`} />
                            </div>
                            <div className="text-left">
                              <div className={`font-bold text-lg ${paymentMethod === 'bank' ? 'text-gray-900' : 'text-gray-800'}`}>
                                Bank Transfer
                              </div>
                              <div className={`text-sm ${paymentMethod === 'bank' ? 'text-gray-700' : 'text-gray-600'}`}>
                                Transfer funds securely
                              </div>
                            </div>
                            {paymentMethod === 'bank' && (
                              <Check className="w-5 h-5 text-blue-600 ml-auto" />
                            )}
                          </div>
                        </button>
                      </div>

                      {/* Card Form */}
                      {paymentMethod === 'card' && (
                        <div className="space-y-5">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Card Number <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="text"
                              placeholder="1234 5678 9012 3456"
                              className="w-full h-14 px-4 rounded-xl border-2 border-gray-300 bg-white text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 focus:outline-none text-base font-medium shadow-sm"
                              required
                            />
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Expiry Date <span className="text-red-500">*</span>
                              </label>
                              <input
                                type="text"
                                placeholder="MM/YY"
                                className="w-full h-14 px-4 rounded-xl border-2 border-gray-300 bg-white text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 focus:outline-none text-base font-medium shadow-sm"
                                required
                              />
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                CVV <span className="text-red-500">*</span>
                              </label>
                              <input
                                type="text"
                                placeholder="•••"
                                className="w-full h-14 px-4 rounded-xl border-2 border-gray-300 bg-white text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 focus:outline-none text-base font-medium shadow-sm"
                                required
                              />
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Cardholder Name <span className="text-red-500">*</span>
                              </label>
                              <input
                                type="text"
                                placeholder="John Doe"
                                className="w-full h-14 px-4 rounded-xl border-2 border-gray-300 bg-white text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 focus:outline-none text-base font-medium shadow-sm"
                                required
                              />
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Bank Transfer Info */}
                      {paymentMethod === 'bank' && (
                        <div className="p-5 rounded-xl bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-200">
                          <div className="flex items-center gap-3 mb-4">
                            <Building className="w-5 h-5 text-blue-600" />
                            <h4 className="font-bold text-gray-900">Bank Transfer Instructions</h4>
                          </div>
                          
                          <div className="text-sm text-gray-700 mb-5">
                            Transfer funds to our secure banking account. You'll receive payment confirmation and policy documents via email within 1 business day.
                          </div>
                          
                          <div className="space-y-3">
                            <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200">
                              <span className="text-gray-600">Bank:</span>
                              <span className="font-medium text-gray-900">Global Cargo Bank</span>
                            </div>
                            <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200">
                              <span className="text-gray-600">Account:</span>
                              <span className="font-medium text-gray-900">**** 3456</span>
                            </div>
                            <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200">
                              <span className="text-gray-600">Reference:</span>
                              <span className="font-medium text-gray-900">Quote-{quoteId.slice(0, 8)}</span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Security Notice */}
                    <div className="mb-8 p-5 rounded-xl bg-gradient-to-r from-green-50 to-emerald-50 border border-emerald-200">
                      <div className="flex items-start gap-3">
                        <div className="p-2 rounded-lg bg-emerald-100">
                          <Shield className="w-5 h-5 text-emerald-600" />
                        </div>
                        <div>
                          <h4 className="font-bold text-gray-900 mb-2">Bank-Level Security</h4>
                          <div className="text-sm text-gray-700 space-y-1">
                            <div className="flex items-center gap-2">
                              <Check className="w-4 h-4 text-emerald-600" />
                              <span>256-bit SSL encryption</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Check className="w-4 h-4 text-emerald-600" />
                              <span>PCI DSS compliant processing</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Check className="w-4 h-4 text-emerald-600" />
                              <span>Your payment data is encrypted and protected</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Submit Button */}
                    <div className="mt-12 pt-8 border-t border-gray-100">
                      <button
                        type="submit"
                        disabled={isProcessing}
                        className={`
                          relative group/btn w-full px-10 py-4 rounded-2xl font-bold text-white 
                          overflow-hidden transition-all duration-500 shadow-lg hover:shadow-xl
                          ${isProcessing
                            ? 'opacity-50 cursor-not-allowed bg-gray-100 border border-gray-300 text-gray-400'
                            : 'bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500'
                          }
                        `}
                      >
                        {/* Animated Background */}
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 via-blue-500/20 to-cyan-500/0 translate-x-[-100%] group-hover/btn:translate-x-[100%] transition-transform duration-1000"></div>
                        
                        <div className="relative flex items-center justify-center gap-3">
                          {isProcessing ? (
                            <>
                              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                              <span className="text-lg">Processing Payment...</span>
                            </>
                          ) : (
                            <>
                              <Lock className="w-5 h-5" />
                              <span className="text-lg">Pay Securely ${totalAmount.toFixed(2)}</span>
                              <ChevronRight className="w-5 h-5 group-hover/btn:translate-x-2 transition-transform" />
                            </>
                          )}
                        </div>
                      </button>

                      <div className="mt-4 text-center text-sm text-gray-500">
                        By completing this payment, you agree to our{' '}
                        <a href="/terms" className="text-blue-600 hover:text-blue-700 font-medium">Terms of Service</a>{' '}
                        and{' '}
                        <a href="/privacy" className="text-blue-600 hover:text-blue-700 font-medium">Privacy Policy</a>.
                      </div>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Information Panel (20%) */}
          <div className="lg:col-span-3 space-y-2 order-1 lg:order-2">
            {/* Total Amount Card */}
            <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl border border-blue-200 shadow-lg p-6">
              <div className="flex items-center gap-3 mb-5">
                <div className="p-2.5 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500">
                  <DollarSign className="w-5 h-5 text-white" />
                </div>
                <h3 className="font-bold text-gray-900 text-base">Order Total</h3>
              </div>
              
              <div className="mb-4">
                <div className="text-3xl font-bold text-gray-900 mb-1">
                  ${totalAmount.toFixed(2)}
                </div>
                <div className="text-xs text-gray-600">
                  Including all fees and taxes
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Premium</span>
                  <span className="font-medium text-gray-900">${premium.toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Service Fee</span>
                  <span className="font-medium text-gray-900">${serviceFee.toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Taxes (8%)</span>
                  <span className="font-medium text-gray-900">${taxes.toFixed(2)}</span>
                </div>
              </div>
              
              <div className="mt-4 pt-4 border-t border-blue-200">
                <div className="flex items-center justify-between text-sm font-bold">
                  <span className="text-gray-900">Total Amount</span>
                  <span className="text-gray-900">${totalAmount.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Shipment Summary */}
            <div className="border border-[#d1d1d154] bg-[#FDFEFF] rounded-2xl shadow-sm p-6">
              <div className="flex items-center gap-3 mb-5">
                <div className="p-2.5 rounded-xl bg-gradient-to-br from-blue-50 to-cyan-50">
                  <FileText className="w-5 h-5 text-blue-600" />
                </div>
                <h3 className="font-bold text-gray-900 text-base">Shipment Summary</h3>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Coverage Amount</span>
                  <span className="font-medium text-gray-900">
                    ${parseFloat(quoteData.shipmentValue).toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Deductible</span>
                  <span className="font-medium text-gray-900">${quoteData.deductible}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Coverage Plan</span>
                  <span className="font-medium text-gray-900 capitalize">{quoteData.selectedPlan}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Policy Period</span>
                  <span className="font-medium text-gray-900">
                    {new Date(quoteData.startDate).toLocaleDateString('en-US', { 
                      month: 'short', 
                      day: 'numeric' 
                    })} - {new Date(quoteData.endDate).toLocaleDateString('en-US', { 
                      month: 'short', 
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </span>
                </div>
              </div>
            </div>

            {/* Why Secure Matters */}
            <div className="border border-[#d1d1d154] bg-[#FDFEFF] rounded-2xl shadow-sm p-6">
              <div className="flex items-center gap-3 mb-5">
                <div className="p-2.5 rounded-xl bg-gradient-to-br from-blue-50 to-cyan-50">
                  <Lightbulb className="w-5 h-5 text-blue-600" />
                </div>
                <h3 className="font-bold text-gray-900 text-base">Secure Payment Benefits</h3>
              </div>
              
              <div className="space-y-4">
                {[
                  {
                    icon: Shield,
                    title: 'Instant Activation',
                    desc: 'Coverage starts immediately',
                    color: 'text-emerald-600',
                    bg: 'bg-emerald-50'
                  },
                  {
                    icon: Lock,
                    title: 'Data Protection',
                    desc: 'Encrypted payment processing',
                    color: 'text-blue-600',
                    bg: 'bg-blue-50'
                  },
                  {
                    icon: FileText,
                    title: 'Instant Documents',
                    desc: 'Policy documents available',
                    color: 'text-purple-600',
                    bg: 'bg-purple-50'
                  }
                ].map((item, index) => (
                  <div key={index} className="group/item p-3 rounded-xl bg-gray-50 hover:bg-gray-100 border border-gray-200 hover:border-gray-300 transition-all">
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-lg ${item.bg}`}>
                        <item.icon className={`w-4 h-4 ${item.color}`} />
                      </div>
                      <div>
                        <div className="font-medium text-gray-900 text-sm mb-1">{item.title}</div>
                        <div className="text-xs text-gray-600">{item.desc}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Important Notice */}
            <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl border border-amber-200 shadow-lg p-6">
              <div className="flex items-center gap-3 mb-5">
                <AlertCircle className="w-5 h-5 text-amber-600" />
                <h3 className="font-bold text-gray-900 text-base">Important Notice</h3>
              </div>
              
              <div className="space-y-3 text-sm text-gray-700">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                  <span>Coverage activates after successful payment</span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                  <span>Policy documents available immediately</span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                  <span>24/7 support for claims processing</span>
                </div>
              </div>
            </div>

            {/* Need Help? */}
            <div className="border border-[#d1d1d154] bg-[#FDFEFF] rounded-2xl shadow-sm p-6">
              <div className="text-center">
                <div className="inline-flex p-3 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 mb-4 shadow-lg">
                  <HelpCircle className="w-5 h-5 text-white" />
                </div>
                <h3 className="font-bold text-gray-900 text-base mb-2">Payment Questions?</h3>
                <p className="text-sm text-gray-600 mb-5">
                  Our support team is available 24/7
                </p>
                <button className="w-full py-3 text-sm font-medium text-blue-600 hover:text-blue-700 bg-white hover:bg-gray-50 border border-blue-200 hover:border-blue-300 rounded-xl transition-all duration-300 shadow-sm hover:shadow">
                  Contact Support
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Microcopy */}
        <div className="mt-12 text-center">
          <div className="inline-flex items-center gap-3 text-sm text-gray-500">
            <div className="flex items-center gap-1">
              <div className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-pulse"></div>
              <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse delay-75"></div>
              <div className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-pulse delay-150"></div>
            </div>
            <span>All payments are processed through secure PCI DSS compliant systems</span>
          </div>
        </div>
      </div>
    </div>
  );
}