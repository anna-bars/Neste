'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { 
  ChevronLeft, 
  ChevronRight,
  Check,
  FileText,
  Calendar,
  MapPin,
  Truck,
  Shield
} from 'lucide-react';
import DashboardHeader from '@/app/components/dashboard/DashboardHeader';
import { useUser } from '@/app/context/UserContext';

export default function SummaryStepPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useUser();
  
  const [quoteData, setQuoteData] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
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
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-[#F3F3F6]">
      <DashboardHeader userEmail={user?.email} />
      
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <button 
              onClick={() => router.push('/quotes/new/coverage')}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 text-sm"
            >
              <ChevronLeft className="w-4 h-4" />
              Back
            </button>
            
            <div className="text-sm text-gray-600">Step 4 of 5</div>
          </div>

          <div className="mb-8">
            <h1 className="text-xl font-bold text-gray-900 mb-2">Review Your Quote</h1>
            
            {/* Progress Bar */}
            <div className="w-full bg-gray-200 rounded-full h-1.5 mb-1">
              <div className="bg-gradient-to-r from-[#0066FF] to-[#00A8FF] h-1.5 rounded-full w-4/5"></div>
            </div>
            <div className="flex justify-between text-xs text-gray-600">
              <span className="text-[#0066FF]">Cargo</span>
              <span className="text-[#0066FF]">Details</span>
              <span className="text-[#0066FF]">Coverage</span>
              <span className="font-medium text-[#0066FF]">Review</span>
              <span>Payment</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <div className="border border-[#d1d1d154] bg-[#fdfdf8cf] rounded-2xl p-6">
              <div className="mb-8">
                <div className="flex items-center gap-2 mb-4">
                  <div className="p-2 rounded-lg bg-green-100">
                    <Check className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <h2 className="font-bold text-gray-900">Quote Ready for Payment</h2>
                    <p className="text-sm text-gray-600">
                      Review all details before proceeding to payment
                    </p>
                  </div>
                </div>
              </div>

              {/* Shipment Summary */}
              <div className="mb-8">
                <h3 className="font-bold text-gray-900 mb-4">Shipment Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <FileText className="w-4 h-4 text-gray-400" />
                      <span className="text-sm font-medium text-gray-900">Cargo Type</span>
                    </div>
                    <div className="text-gray-900 font-bold">
                      {quoteData.cargoType === 'other' ? quoteData.otherCargoType : quoteData.cargoType}
                    </div>
                  </div>

                  <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-sm font-medium text-gray-900">Shipment Value</span>
                    </div>
                    <div className="text-gray-900 font-bold">
                      ${parseFloat(quoteData.shipmentValue).toLocaleString()}
                    </div>
                  </div>

                  <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <span className="text-sm font-medium text-gray-900">Coverage Period</span>
                    </div>
                    <div className="text-gray-900 font-bold">
                      {new Date(quoteData.startDate).toLocaleDateString()} - {new Date(quoteData.endDate).toLocaleDateString()}
                    </div>
                  </div>

                  <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Truck className="w-4 h-4 text-gray-400" />
                      <span className="text-sm font-medium text-gray-900">Transport</span>
                    </div>
                    <div className="text-gray-900 font-bold">
                      {quoteData.transportationMode}
                    </div>
                  </div>
                </div>
              </div>

              {/* Coverage Summary */}
              <div className="mb-8">
                <h3 className="font-bold text-gray-900 mb-4">Selected Coverage</h3>
                <div className="bg-white border border-gray-200 rounded-lg p-5">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <Shield className="w-5 h-5 text-blue-600" />
                        <span className="font-bold text-gray-900 text-lg">{quoteData.selectedPlan} Coverage</span>
                      </div>
                      <div className="text-sm text-gray-600">
                        Comprehensive protection with priority service
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-gray-900">
                        ${quoteData.finalPremium?.toFixed(2) || '0'}
                      </div>
                      <div className="text-sm text-gray-600">
                        Premium
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <div className="text-gray-600 mb-1">Deductible</div>
                      <div className="font-medium text-gray-900">
                        ${quoteData.deductible}
                      </div>
                    </div>
                    <div>
                      <div className="text-gray-600 mb-1">Coverage Amount</div>
                      <div className="font-medium text-gray-900">
                        ${parseFloat(quoteData.shipmentValue).toLocaleString()}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Terms */}
              <div className="mb-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="text-sm text-gray-700">
                  By proceeding to payment, you agree to our Terms of Service and acknowledge that 
                  coverage will be activated only after successful payment. Your quote is valid for 72 hours.
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-between pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => router.push('/quotes/new/coverage')}
                  className="px-5 py-2.5 text-gray-600 hover:text-gray-900 font-medium"
                >
                  Back
                </button>
                
                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="px-6 py-2.5 rounded-lg font-semibold text-white bg-gradient-to-r from-[#0066FF] to-[#00A8FF] hover:from-[#0052CC] hover:to-[#0066FF] flex items-center gap-2"
                >
                  {isSubmitting ? 'Processing...' : 'Proceed to Payment'}
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Important Notes */}
            <div className="border border-blue-200 bg-blue-50 rounded-xl p-4">
              <h3 className="font-bold text-gray-900 text-sm mb-2">Important Notes</h3>
              <ul className="space-y-2 text-xs text-gray-700">
                <li className="flex items-start gap-2">
                  <Check className="w-3 h-3 text-green-600 flex-shrink-0 mt-0.5" />
                  <span>Coverage starts after payment completion</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-3 h-3 text-green-600 flex-shrink-0 mt-0.5" />
                  <span>72-hour quote validity</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-3 h-3 text-green-600 flex-shrink-0 mt-0.5" />
                  <span>24/7 claims support available</span>
                </li>
              </ul>
            </div>

            {/* Contact Support */}
            <div className="border border-[#d1d1d154] bg-[#fdfdf8cf] rounded-xl p-4">
              <h3 className="font-bold text-gray-900 text-sm mb-2">Questions?</h3>
              <p className="text-xs text-gray-600 mb-3">
                Our team is here to help with any questions about your quote.
              </p>
              <button className="w-full py-2 text-xs border border-gray-300 rounded-lg hover:bg-gray-50">
                Contact Support
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}