'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { 
  ArrowLeft, 
  ChevronRight,
  ChevronLeft,
  Check,
  FileText,
  Calendar,
  MapPin,
  Truck,
  Shield,
  DollarSign,
  Sparkles,
  Lightbulb,
  AlertCircle,
  HelpCircle,
  CheckCircle2,
  Clock
} from 'lucide-react';
import DashboardHeader from '@/app/components/dashboard/DashboardHeader';
import { useUser } from '@/app/context/UserContext';

export default function SummaryStepPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useUser();
  
  const [quoteData, setQuoteData] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [stepComplete, setStepComplete] = useState(true);
  const quoteId = searchParams.get('quote_id');

  useEffect(() => {
    // Load draft data
    const draftData = localStorage.getItem('quote_draft');
    if (!draftData || !quoteId) {
      router.push('/quotes/new/shipment');
      return;
    }

    const draft = JSON.parse(draftData);
    setQuoteData(draft);
  }, [quoteId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!quoteId || !quoteData) return;

    setIsSubmitting(true);

    try {
      // Update quote status to approved
      // await quotes.update(quoteId, { status: 'approved' });
      
      // Navigate to payment
      router.push(`/quotes/new/checkout/${quoteId}`);

    } catch (error) {
      console.error('Error approving quote:', error);
      alert('Failed to approve quote. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!quoteData) {
    return (
      <div className="min-h-screen bg-[#F3F3F6] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <div className="text-gray-600">Loading quote summary...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F3F3F6] text-gray-900">
      <DashboardHeader userEmail={user?.email}/>
      
      <div className="relative max-w-[88%] mx-auto pt-2 pb-4 py-8">
        {/* Modern Header */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-0">
            <button 
              onClick={() => router.push('/quotes/new/coverage')}
              className="group flex items-center gap-3 text-gray-600 hover:text-gray-900 transition-all duration-300"
            >
              <div className="p-2 rounded-xl bg-white border border-gray-200 shadow-sm group-hover:border-gray-300 group-hover:shadow transition-all">
                <ArrowLeft className="w-4 h-4" />
              </div>
              <span className="text-sm font-medium">
                Back to Coverage
              </span>
            </button>
            
            {/* Modern Progress Indicator */}
            <div className="flex items-center gap-4">
              <div className="text-sm font-mono text-gray-500">04/05</div>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <div className="w-10 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className={`h-full bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full transition-all duration-700 ${
                        stepComplete ? 'w-full' : 'w-4/5'
                      }`}
                    ></div>
                  </div>
                  <div className="absolute -top-1.5 left-4/5 transform -translate-x-1/2 w-3 h-3 rounded-full bg-blue-500 border-2 border-white"></div>
                </div>
                <Sparkles className="w-4 h-4 text-blue-500" />
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* Left Side - Main Summary (80%) */}
          <div className="lg:col-span-9 order-2 lg:order-1">
            <div className="relative group">
              <div className="relative border border-[#d1d1d154] bg-[#FDFEFF] rounded-2xl shadow-sm overflow-hidden">
                {/* Card Header */}
                <div className="p-8 border-b border-gray-100">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-4 mb-3">
                        <div className="p-3 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 shadow-lg">
                          <Check className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h2 className="text-2xl font-bold text-gray-900">Quote Summary</h2>
                          <p className="text-gray-600 text-sm mt-1">
                            Review all details before proceeding to payment
                          </p>
                        </div>
                      </div>
                      
                      {/* Status Badge */}
                      <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-green-50 to-emerald-50 border border-emerald-200">
                        <Check className="w-3 h-3 text-emerald-600" />
                        <span className="text-xs font-medium text-emerald-700">Ready for Payment</span>
                      </div>
                    </div>
                    
                    {/* Step Indicator */}
                    <div className="hidden lg:block">
                      <div className="text-xs font-mono text-gray-500 mb-1">STEP 04</div>
                      <div className="text-sm font-bold text-gray-900 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-200">
                        Review & Confirm
                      </div>
                    </div>
                  </div>
                </div>

                {/* Form Content */}
                <div className="p-8">
                  {/* Success Message */}
                  <div className="mb-8 p-5 rounded-xl bg-gradient-to-r from-green-50 to-emerald-50 border border-emerald-200">
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-lg bg-emerald-100">
                        <Check className="w-5 h-5 text-emerald-600" />
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900 mb-1">Quote Successfully Generated!</h3>
                        <p className="text-sm text-gray-700">
                          Your cargo insurance quote is ready. Review the details below and proceed to secure your coverage.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Shipment Details Section */}
                  <div className="mb-8">
                    <div className="flex items-center gap-3 mb-5">
                      <div className="p-2 rounded-lg bg-gradient-to-br from-blue-50 to-cyan-50 border border-cyan-200">
                        <FileText className="w-4 h-4 text-blue-600" />
                      </div>
                      <h3 className="font-bold text-gray-900 text-lg">Shipment Details</h3>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Cargo Type */}
                      <div className="group/item p-4 rounded-xl bg-gray-50 hover:bg-gray-100 border border-gray-200 hover:border-gray-300 transition-all">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="p-2 rounded-lg bg-blue-50">
                            <FileText className="w-4 h-4 text-blue-600" />
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-600">Cargo Type</div>
                            <div className="font-bold text-gray-900">
                              {quoteData.cargoType === 'other' ? quoteData.otherCargoType : quoteData.cargoType}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Shipment Value */}
                      <div className="group/item p-4 rounded-xl bg-gray-50 hover:bg-gray-100 border border-gray-200 hover:border-gray-300 transition-all">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="p-2 rounded-lg bg-emerald-50">
                            <DollarSign className="w-4 h-4 text-emerald-600" />
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-600">Shipment Value</div>
                            <div className="font-bold text-gray-900">
                              ${parseFloat(quoteData.shipmentValue).toLocaleString()}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Coverage Period */}
                      <div className="group/item p-4 rounded-xl bg-gray-50 hover:bg-gray-100 border border-gray-200 hover:border-gray-300 transition-all">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="p-2 rounded-lg bg-purple-50">
                            <Calendar className="w-4 h-4 text-purple-600" />
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-600">Coverage Period</div>
                            <div className="font-bold text-gray-900">
                              {new Date(quoteData.startDate).toLocaleDateString('en-US', { 
                                month: 'short', 
                                day: 'numeric', 
                                year: 'numeric' 
                              })} - {new Date(quoteData.endDate).toLocaleDateString('en-US', { 
                                month: 'short', 
                                day: 'numeric', 
                                year: 'numeric' 
                              })}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Transport Mode */}
                      <div className="group/item p-4 rounded-xl bg-gray-50 hover:bg-gray-100 border border-gray-200 hover:border-gray-300 transition-all">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="p-2 rounded-lg bg-amber-50">
                            <Truck className="w-4 h-4 text-amber-600" />
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-600">Transport Mode</div>
                            <div className="font-bold text-gray-900 capitalize">
                              {quoteData.transportationMode}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Origin */}
                      {quoteData.origin && (
                        <div className="group/item p-4 rounded-xl bg-gray-50 hover:bg-gray-100 border border-gray-200 hover:border-gray-300 transition-all">
                          <div className="flex items-center gap-3 mb-3">
                            <div className="p-2 rounded-lg bg-cyan-50">
                              <MapPin className="w-4 h-4 text-cyan-600" />
                            </div>
                            <div>
                              <div className="text-sm font-medium text-gray-600">Origin Port</div>
                              <div className="font-bold text-gray-900">
                                {quoteData.origin.display_name || quoteData.origin.name || 'Not specified'}
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Destination */}
                      {quoteData.destination && (
                        <div className="group/item p-4 rounded-xl bg-gray-50 hover:bg-gray-100 border border-gray-200 hover:border-gray-300 transition-all">
                          <div className="flex items-center gap-3 mb-3">
                            <div className="p-2 rounded-lg bg-rose-50">
                              <MapPin className="w-4 h-4 text-rose-600" />
                            </div>
                            <div>
                              <div className="text-sm font-medium text-gray-600">Destination Port</div>
                              <div className="font-bold text-gray-900">
                                {quoteData.destination.display_name || quoteData.destination.name || 'Not specified'}
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Coverage Summary Section */}
                  <div className="mb-8">
                    <div className="flex items-center gap-3 mb-5">
                      <div className="p-2 rounded-lg bg-gradient-to-br from-blue-50 to-cyan-50 border border-cyan-200">
                        <Shield className="w-4 h-4 text-blue-600" />
                      </div>
                      <h3 className="font-bold text-gray-900 text-lg">Selected Coverage</h3>
                    </div>
                    
                    <div className="p-5 rounded-xl bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-200">
                      <div className="flex items-start justify-between mb-5">
                        <div>
                          <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 rounded-lg bg-white border border-blue-200">
                              <Shield className="w-5 h-5 text-blue-600" />
                            </div>
                            <div>
                              <div className="font-bold text-gray-900 text-xl capitalize">
                                {quoteData.selectedPlan} Coverage
                              </div>
                              <div className="text-sm text-gray-700">
                                Comprehensive protection with priority service
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="text-right">
                          <div className="text-3xl font-bold text-gray-900 mb-1">
                            ${quoteData.finalPremium?.toFixed(2) || '0'}
                          </div>
                          <div className="text-sm text-gray-600">
                            Total Premium
                          </div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div className="p-4 rounded-lg bg-white border border-gray-200">
                          <div className="text-sm text-gray-600 mb-1">Deductible</div>
                          <div className="font-bold text-gray-900 text-xl">
                            ${quoteData.deductible}
                          </div>
                        </div>
                        
                        <div className="p-4 rounded-lg bg-white border border-gray-200">
                          <div className="text-sm text-gray-600 mb-1">Coverage Amount</div>
                          <div className="font-bold text-gray-900 text-xl">
                            ${parseFloat(quoteData.shipmentValue).toLocaleString()}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Terms Section */}
                  <div className="mb-8 p-5 rounded-xl bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-200">
                    <div className="flex items-start gap-3 mb-3">
                      <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0" />
                      <div>
                        <h4 className="font-bold text-gray-900 mb-2">Important Terms</h4>
                        <div className="text-sm text-gray-700 space-y-2">
                          <p>By proceeding to payment, you agree to our Terms of Service and acknowledge that 
                          coverage will be activated only after successful payment.</p>
                          <p>Your quote is valid for 72 hours from generation time.</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="mt-12 pt-8 border-t border-gray-100 flex justify-between items-center">
                    <button
                      type="button"
                      onClick={() => router.push('/quotes/new/coverage')}
                      className="group flex items-center gap-3 text-gray-600 hover:text-gray-900 transition-all duration-300"
                    >
                      <div className="p-2 rounded-xl bg-white border border-gray-200 shadow-sm group-hover:border-gray-300 group-hover:shadow transition-all">
                        <ChevronLeft className="w-4 h-4" />
                      </div>
                      <span className="text-sm font-medium">
                        Back to Coverage
                      </span>
                    </button>
                    
                    <button
                      onClick={handleSubmit}
                      disabled={isSubmitting}
                      className={`
                        relative group/btn w-full lg:w-auto px-10 py-4 rounded-2xl font-bold text-white 
                        overflow-hidden transition-all duration-500 shadow-lg hover:shadow-xl
                        ${isSubmitting
                          ? 'opacity-50 cursor-not-allowed bg-gray-100 border border-gray-300 text-gray-400'
                          : 'bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500'
                        }
                      `}
                    >
                      {/* Animated Background */}
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 via-blue-500/20 to-cyan-500/0 translate-x-[-100%] group-hover/btn:translate-x-[100%] transition-transform duration-1000"></div>
                      
                      <div className="relative flex items-center justify-center gap-3">
                        {isSubmitting ? (
                          <span>Processing...</span>
                        ) : (
                          <>
                            <span className="text-lg">Proceed to Payment</span>
                            <ChevronRight className="w-5 h-5 group-hover/btn:translate-x-2 transition-transform" />
                          </>
                        )}
                      </div>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Information Panel (20%) */}
          <div className="lg:col-span-3 space-y-2 order-1 lg:order-2">
            {/* Quote ID Card */}
            <div className="border border-[#d1d1d154] bg-[#FDFEFF] rounded-2xl shadow-sm p-6">
              <div className="text-center">
                <div className="inline-flex p-3 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 mb-4 shadow-lg">
                  <FileText className="w-5 h-5 text-white" />
                </div>
                <h3 className="font-bold text-gray-900 text-base mb-2">Quote Reference</h3>
                <div className="mb-4">
                  <div className="text-xs text-gray-500 mb-1">Quote ID</div>
                  <div className="text-sm font-mono text-gray-900 bg-gray-100 px-3 py-2 rounded-lg border border-gray-200">
                    {quoteId?.substring(0, 8)}...
                  </div>
                </div>
                <div className="text-xs text-gray-600">
                  Keep this ID for future reference
                </div>
              </div>
            </div>

            {/* Key Benefits */}
            <div className="border border-[#d1d1d154] bg-[#FDFEFF] rounded-2xl shadow-sm p-6">
              <div className="flex items-center gap-3 mb-5">
                <div className="p-2.5 rounded-xl bg-gradient-to-br from-blue-50 to-cyan-50">
                  <Lightbulb className="w-5 h-5 text-blue-600" />
                </div>
                <h3 className="font-bold text-gray-900 text-base">Key Benefits</h3>
              </div>
              
              <div className="space-y-4">
                {[
                  {
                    icon: Check,
                    title: 'Complete Protection',
                    desc: 'Full coverage for your shipment',
                    color: 'text-emerald-600',
                    bg: 'bg-emerald-50'
                  },
                  {
                    icon: Shield,
                    title: 'Risk Management',
                    desc: 'Professional risk assessment',
                    color: 'text-blue-600',
                    bg: 'bg-blue-50'
                  },
                  {
                    icon: Clock,
                    title: 'Fast Processing',
                    desc: 'Quick claims settlement',
                    color: 'text-amber-600',
                    bg: 'bg-amber-50'
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

            {/* Important Notes */}
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl border border-emerald-200 shadow-lg p-6">
              <div className="flex items-center gap-3 mb-5">
                <AlertCircle className="w-5 h-5 text-emerald-600" />
                <h3 className="font-bold text-gray-900 text-base">Important Notes</h3>
              </div>
              
              <div className="space-y-3">
                {[
                  'Coverage starts after payment completion',
                  '72-hour quote validity period',
                  '24/7 claims support available',
                  'Documents accessible in your dashboard'
                ].map((tip, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-gray-700">{tip}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Next Steps */}
            <div className="border border-[#d1d1d154] bg-[#FDFEFF] rounded-2xl shadow-sm p-6">
              <div className="flex items-center gap-3 mb-5">
                <div className="p-2.5 rounded-xl bg-gradient-to-br from-blue-50 to-cyan-50">
                  <ChevronRight className="w-5 h-5 text-blue-600" />
                </div>
                <h3 className="font-bold text-gray-900 text-base">Next Steps</h3>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center font-bold">1</div>
                  <div>
                    <div className="font-medium text-gray-900 text-sm mb-1">Secure Payment</div>
                    <div className="text-xs text-gray-600">Complete payment to activate coverage</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-blue-500 text-white text-xs flex items-center justify-center font-bold">2</div>
                  <div>
                    <div className="font-medium text-gray-900 text-sm mb-1">Receive Documents</div>
                    <div className="text-xs text-gray-600">Get policy documents via email</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-blue-400 text-white text-xs flex items-center justify-center font-bold">3</div>
                  <div>
                    <div className="font-medium text-gray-900 text-sm mb-1">Track Shipment</div>
                    <div className="text-xs text-gray-600">Monitor in your dashboard</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Need Help? */}
            <div className="border border-[#d1d1d154] bg-[#FDFEFF] rounded-2xl shadow-sm p-6">
              <div className="text-center">
                <div className="inline-flex p-3 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 mb-4 shadow-lg">
                  <HelpCircle className="w-5 h-5 text-white" />
                </div>
                <h3 className="font-bold text-gray-900 text-base mb-2">Need Help?</h3>
                <p className="text-sm text-gray-600 mb-5">
                  Our team is here to assist with your quote
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
            <span>Your coverage will be active immediately after successful payment</span>
          </div>
        </div>
      </div>
    </div>
  );
}