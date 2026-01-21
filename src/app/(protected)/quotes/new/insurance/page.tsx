'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { 
  ArrowLeft, 
  CheckCircle, 
  ChevronRight, 
  Shield,
  CreditCard,
  AlertCircle,
  Zap,
  MapPin,
  Package,
  DollarSign,
  Truck,
  BadgeCheck,
  Users,
  Phone,
  Lock,
  Clock
} from 'lucide-react';
import DashboardHeader from '@/app/components/dashboard/DashboardHeader';
import { useUser } from '@/app/context/UserContext';
import { quotes } from '@/lib/supabase/quotes';
import { PremiumCalculator } from '@/lib/services/premiumCalculator';
import { QuoteProcessor } from '@/lib/services/quoteProcessor';

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
  approved_at?: string;
}

interface CoverageOption {
  id: 'standard' | 'premium' | 'enterprise';
  name: string;
  description: string;
  premium: number;
  coverage: string[];
  deductible: number;
  features: string[];
  color: string;
  badge: string;
}

export default function InsuranceQuotePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useUser();
  
  const quoteId = searchParams.get('quote_id');
  
  const [quoteData, setQuoteData] = useState<QuoteData | null>(null);
  const [selectedCoverage, setSelectedCoverage] = useState<'standard' | 'premium' | 'enterprise'>('premium');
  const [loading, setLoading] = useState(true);
  const [coverageOptions, setCoverageOptions] = useState<CoverageOption[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');
  const [isApproving, setIsApproving] = useState(false);

  useEffect(() => {
    const loadQuoteData = async () => {
      if (!quoteId || !user) return;

      try {
        setLoading(true);
        
        // Load quote from database
        const quote = await quotes.getById(quoteId);
        setQuoteData(quote);

        // ✅ ՊԱՐԶԱՊԱՇՏՈՒՄ: ԹՈՒՅԼ ՏԱԼ ԲՈԼՈՐ QUOTE-ներին ՄՈՒՏՔ
        // Մենք status-ը կստուգենք միայն "Proceed to Payment" կոճակ սեղմելուց հետո
        
        // Calculate premiums for all coverage options
        const premiumInput = {
          cargoType: quote.cargo_type,
          shipmentValue: quote.shipment_value,
          transportationMode: quote.transportation_mode,
          coverageType: 'standard',
          startDate: quote.start_date,
          endDate: quote.end_date
        };

        const options: CoverageOption[] = [
          {
            id: 'standard',
            name: 'Standard Coverage',
            description: 'Essential protection for common risks during transit.',
            premium: PremiumCalculator.calculate({...premiumInput, coverageType: 'standard'}).basePremium,
            coverage: ['All Risks', 'Theft Protection', 'Accidental Damage', 'Basic Liability'],
            deductible: 1000,
            features: ['Standard claims processing', 'Email support', 'Basic tracking'],
            color: 'from-gray-100 to-gray-50',
            badge: 'Popular'
          },
          {
            id: 'premium',
            name: 'Premium Coverage',
            description: 'Comprehensive protection including special risks and priority service.',
            premium: PremiumCalculator.calculate({...premiumInput, coverageType: 'premium'}).basePremium,
            coverage: ['All Risks +', 'War & Political Risks', 'Strike Coverage', 'Cyber Protection', 'Delay Compensation'],
            deductible: 500,
            features: [
              '24/7 Priority Support',
              'Dedicated Risk Manager',
              'Expedited Claims (<24h)',
              'Real-time Tracking',
              'Monthly Risk Reports'
            ],
            color: 'from-blue-50 to-indigo-50',
            badge: 'Recommended'
          },
          {
            id: 'enterprise',
            name: 'Enterprise Plan',
            description: 'Maximum protection with white-glove service for high-value shipments.',
            premium: PremiumCalculator.calculate({...premiumInput, coverageType: 'enterprise'}).basePremium,
            coverage: ['All Inclusive', 'War & Terrorism', 'Customs Delay', 'Inventory Protection', 'Revenue Loss'],
            deductible: 250,
            features: [
              '24/7 Dedicated Team',
              'Same-day Claims',
              'Custom Coverage',
              'API Integration',
              'Quarterly Reviews'
            ],
            color: 'from-purple-50 to-pink-50',
            badge: 'Enterprise'
          }
        ];

        setCoverageOptions(options);

      } catch (error) {
        console.error('Error loading quote data:', error);
        setError('Failed to load quote data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    loadQuoteData();
  }, [quoteId, user]);

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

  const getTransportationModeDisplay = (mode: string) => {
    const modeMap: Record<string, string> = {
      'air': 'Air Freight',
      'sea': 'Sea Freight',
      'road': 'Road Freight'
    };
    return modeMap[mode] || mode;
  };

const handleProceedToPayment = async () => {
  if (!quoteData || !selectedCoverage) return;
  
  setIsProcessing(true);
  setIsApproving(true);
  setError('');

  try {
    console.log('Step 1: Starting quote approval process for quote:', quoteData.id);
    
    // Step 1: Update quote with selected coverage
    const selectedCoverageData = coverageOptions.find(coverage => coverage.id === selectedCoverage);
    
    console.log('Step 2: Updating quote with coverage:', selectedCoverage, 'Premium:', selectedCoverageData?.premium);
    
    // Ստուգենք, թե արդյոք quote-ը գոյություն ունի
    try {
      const quoteCheck = await quotes.getById(quoteData.id);
      console.log('Quote exists:', !!quoteCheck);
    } catch (checkError) {
      console.error('Quote check failed:', checkError);
      setError('Quote not found. Please create a new quote.');
      setIsProcessing(false);
      setIsApproving(false);
      return;
    }
    
    // Փորձենք update անել quote-ը
    const updateResult = await quotes.continueDraft(quoteData.id, {
      selected_coverage: selectedCoverage,
      calculated_premium: selectedCoverageData?.premium || 0,
      deductible: selectedCoverageData?.deductible || 0,
    });
    
    console.log('Step 3: Quote updated successfully:', updateResult);
    
    // Step 2: Now process the quote for approval
    console.log('Step 4: Processing quote for approval');
    const result = await QuoteProcessor.processQuote(quoteData.id);
    console.log('Quote processing result:', result);
    
    // Step 3: Check if approved
    if (result.quote.status === 'rejected') {
      setError(`Your quote was rejected: ${result.quote.rejection_reason || 'Please contact support for more information.'}`);
      setIsProcessing(false);
      setIsApproving(false);
      return;
    }
    
    if (result.quote.status === 'under_review' || result.quote.status === 'needs_info') {
      setError('Your quote requires manual review. Our team will contact you within 24 hours.');
      setIsProcessing(false);
      setIsApproving(false);
      return;
    }

    // Step 4: If approved, navigate to payment
    if (result.quote.status === 'approved') {
      console.log('Step 5: Quote approved, navigating to payment');
      router.push(`/quotes/${quoteData.id}/payment`);
    } else {
      setError('Quote is still being processed. Please try again in a moment.');
      setIsProcessing(false);
      setIsApproving(false);
    }

  } catch (error) {
    // ✅ TypeScript-ի համար ավելացնենք type checking
    console.error('Error updating quote:', error);
    
    // ✅ Ստուգենք, թե արդյոք error-ը ունի message property
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    const errorCode = error && typeof error === 'object' && 'code' in error ? (error as any).code : undefined;
    const errorDetails = error && typeof error === 'object' && 'details' in error ? (error as any).details : undefined;
    
    console.error('Error details:', {
      message: errorMessage,
      code: errorCode,
      details: errorDetails
    });
    
    // Ավելի մանրամասն error message
    if (errorCode === 'PGRST116') {
      setError('Database error: Could not update quote. Please try again or contact support.');
    } else if (errorMessage.includes('Cannot coerce')) {
      setError('Quote update failed. The quote may have been deleted or is corrupted.');
    } else {
      setError(`Failed to update quote: ${errorMessage || 'Please try again.'}`);
    }
    
    setIsProcessing(false);
    setIsApproving(false);
  }
};

  const handleModifyInputs = () => {
    router.push(`/quotes/${quoteData?.id}/edit`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <DashboardHeader userEmail={user?.email} />
        <div className="max-w-[100%] mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-2 border-blue-600 border-t-transparent mx-auto mb-4"></div>
              <p className="text-gray-600">Loading quote details...</p>
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
        <div className="max-w-[100%] mx-auto px-4 sm:px-6 lg:px-8 pb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
            <AlertCircle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">No Quote Data Found</h2>
            <p className="text-gray-600 mb-6">Please go back and fill out the shipment details form.</p>
            <button
              onClick={() => router.push('/quotes/new/shipping')}
              className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              Go to Shipment Details
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ✅ ✅ ✅ ✅ ✅ ✅ ✅ ✅ ✅ ✅ ✅ ✅ 
  // ❌ ՀԵՌԱՑՆԵՆՔ ԱՅՍ ՍՏՈՒԳՈՒՄԸ։ Մենք չենք ցուցադրում "Quote Pending Approval" էջը
  // ✅ ✅ ✅ ✅ ✅ ✅ ✅ ✅ ✅ ✅ ✅ ✅ 
  
  // if (quoteData.status !== 'approved') {
  //   return (
  //     <div className="min-h-screen bg-gray-50">
  //       <DashboardHeader userEmail={user?.email} />
  //       <div className="max-w-[100%] mx-auto px-4 sm:px-6 lg:px-8 pb-8">
  //         <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
  //           <div className="text-center mb-8">
  //             <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
  //               <AlertCircle className="w-10 h-10 text-yellow-600" />
  //             </div>
  //             <h2 className="text-2xl font-bold text-gray-900 mb-2">
  //               {quoteData.status === 'under_review' ? 'Quote Under Review' : 
  //                quoteData.status === 'rejected' ? 'Quote Rejected' : 
  //                'Quote Pending Approval'}
  //             </h2>
  //             <p className="text-gray-600 mb-6">
  //               Quote #{quoteData.quote_number} is not yet approved.
  //               {quoteData.status === 'under_review' && ' Our team is reviewing your quote.'}
  //               {quoteData.status === 'rejected' && ' Your quote has been rejected.'}
  //             </p>
  //           </div>
            
  //           <div className="flex justify-center gap-4">
  //             <button
  //               onClick={() => router.push(`/quotes/${quoteData.id}`)}
  //               className="px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
  //             >
  //               View Quote Details
  //             </button>
  //             <button
  //               onClick={() => router.push('/quotes/new/shipping')}
  //               className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-medium rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all"
  //             >
  //               Create New Quote
  //             </button>
  //           </div>
  //         </div>
  //       </div>
  //     </div>
  //   );
  // }

  const selectedCoverageData = coverageOptions.find(coverage => coverage.id === selectedCoverage);
  const basePremium = selectedCoverageData?.premium || 0;
  const deductible = selectedCoverageData?.deductible || 0;
  const serviceFee = 99;
  const taxes = Math.round(basePremium * 0.08);
  const totalAmount = basePremium + serviceFee + taxes;

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader userEmail={user?.email} />
      
      <div className="max-w-[100%] mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                <button 
                  onClick={() => router.push('/dashboard')}
                  className="flex items-center gap-2 hover:text-gray-700 transition-colors"
                >
                  Dashboard
                </button>
                <ChevronRight className="w-3 h-3" />
                <button 
                  onClick={() => router.push('/quotes')}
                  className="hover:text-gray-700 transition-colors"
                >
                  Quotes
                </button>
                <ChevronRight className="w-3 h-3" />
                <span className="text-gray-900 font-medium">Quote #{quoteData.quote_number}</span>
              </div>
              <h1 className="text-3xl font-bold text-gray-900">Complete Your Insurance</h1>
              <p className="text-gray-600 mt-2">
                {quoteData.status === 'approved' 
                  ? 'Your quote has been approved! Select coverage and proceed to payment.'
                  : 'Select your coverage plan to get your final premium and approval.'
                }
              </p>
            </div>
            
            {/* ✅ ՓՈՒՇՏԱՆՈՒՄ ԵՆՔ BADGE-Ը՝ ՓՈԽԱՐԵՆԵՆՔ "Pending Approval" */}
            <div className="hidden lg:flex items-center gap-4">
              <div className="text-right">
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${
                    quoteData.status === 'approved' ? 'bg-green-500' : 
                    quoteData.status === 'rejected' ? 'bg-red-500' : 
                    quoteData.status === 'under_review' ? 'bg-yellow-500' : 'bg-blue-500'
                  }`}></div>
                  <p className={`text-sm font-medium ${
                    quoteData.status === 'approved' ? 'text-green-700' : 
                    quoteData.status === 'rejected' ? 'text-red-700' : 
                    quoteData.status === 'under_review' ? 'text-yellow-700' : 'text-blue-700'
                  }`}>
                    {quoteData.status === 'approved' ? 'Approved' : 
                     quoteData.status === 'rejected' ? 'Rejected' : 
                     quoteData.status === 'under_review' ? 'Under Review' : 'Pending Approval'}
                  </p>
                </div>
                <p className="text-xs text-gray-500">Quote #{quoteData.quote_number}</p>
              </div>
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                quoteData.status === 'approved' ? 'bg-green-100' : 
                quoteData.status === 'rejected' ? 'bg-red-100' : 
                quoteData.status === 'under_review' ? 'bg-yellow-100' : 'bg-blue-100'
              }`}>
                {quoteData.status === 'approved' ? (
                  <CheckCircle className="w-5 h-5 text-green-600" />
                ) : quoteData.status === 'rejected' ? (
                  <AlertCircle className="w-5 h-5 text-red-600" />
                ) : (
                  <Clock className="w-5 h-5 text-blue-600" />
                )}
              </div>
            </div>
          </div>

          {/* ✅ ՓՈՖԱՆՈՒՄ ԵՆՔ APPROVAL BANNER-ը */}
          {quoteData.status === 'approved' ? (
            <div className="mb-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Quote Approved!</h3>
                  <p className="text-sm text-gray-600">
                    Your quote has been approved. Select your coverage plan and proceed to payment to activate your insurance policy.
                  </p>
                </div>
              </div>
            </div>
          ) : quoteData.status === 'rejected' ? (
            <div className="mb-6 p-4 bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                  <AlertCircle className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Quote Rejected</h3>
                  <p className="text-sm text-gray-600">
                    Your quote has been rejected. Please modify your shipment details or contact support.
                  </p>
                </div>
              </div>
            </div>
          ) : quoteData.status === 'under_review' ? (
            <div className="mb-6 p-4 bg-gradient-to-r from-yellow-50 to-amber-50 border border-yellow-200 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center">
                  <Clock className="w-5 h-5 text-yellow-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Quote Under Review</h3>
                  <p className="text-sm text-gray-600">
                    Your quote is being reviewed by our team. This usually takes 1-2 business days.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                  <Clock className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Complete Coverage Selection</h3>
                  <p className="text-sm text-gray-600">
                    Select your coverage plan to get your final premium and approval decision.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Progress bar */}
          <div className="mb-8">
            <div className="flex items-center justify-between max-w-[75%]">
              <div className="flex items-center">
                <div className="flex items-center">
                  <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
                    quoteData.status === 'approved' ? 'bg-green-600' : 'bg-blue-600'
                  } text-white`}>
                    {quoteData.status === 'approved' ? (
                      <CheckCircle className="w-5 h-5" />
                    ) : (
                      1
                    )}
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-900">
                      {quoteData.status === 'approved' ? 'Quote Approved' : 'Shipment Details'}
                    </p>
                    <p className="text-xs text-gray-500">
                      {quoteData.status === 'approved' ? 'Completed' : 'Completed'}
                    </p>
                  </div>
                </div>
                
                <div className="h-0.5 w-20 mx-4 bg-green-600" />
                
                <div className="flex items-center">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-600 text-white">
                    2
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-900">Coverage Selection</p>
                    <p className="text-xs text-gray-500">Current Step</p>
                  </div>
                </div>
                
                <div className="h-0.5 w-20 mx-4 bg-gray-300" />
                
                <div className="flex items-center">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full border-2 border-gray-300 bg-white text-gray-400">
                    <CreditCard className="w-5 h-5" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-500">Payment</p>
                    <p className="text-xs text-gray-500">Up next</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center gap-2 text-red-700">
              <AlertCircle className="w-5 h-5" />
              <p className="font-medium">{error}</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6 w-[102%]">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-900">Shipment Summary</h2>
                <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                  quoteData.status === 'approved' ? 'bg-green-100 text-green-800' :
                  quoteData.status === 'rejected' ? 'bg-red-100 text-red-800' :
                  quoteData.status === 'under_review' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-blue-100 text-blue-800'
                }`}>
                  {quoteData.status === 'approved' ? 'Approved' :
                   quoteData.status === 'rejected' ? 'Rejected' :
                   quoteData.status === 'under_review' ? 'Under Review' : 'Pending Approval'}
                </span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-gray-500">
                    <Package className="w-4 h-4" />
                    <span className="text-sm">Cargo Type</span>
                  </div>
                  <p className="font-medium">{quoteData.cargo_type}</p>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-gray-500">
                    <DollarSign className="w-4 h-4" />
                    <span className="text-sm">Shipment Value</span>
                  </div>
                  <p className="font-medium">{formatCurrency(quoteData.shipment_value)}</p>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-gray-500">
                    <MapPin className="w-4 h-4" />
                    <span className="text-sm">Route</span>
                  </div>
                  <p className="font-medium">
                    {quoteData.origin?.city || quoteData.origin?.name || 'Unknown'} → 
                    {quoteData.destination?.city || quoteData.destination?.name || 'Unknown'}
                  </p>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-gray-500">
                    <Truck className="w-4 h-4" />
                    <span className="text-sm">Transport Mode</span>
                  </div>
                  <p className="font-medium">{getTransportationModeDisplay(quoteData.transportation_mode)}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 mb-2">Select Coverage Plan</h2>
                  <p className="text-gray-600 text-sm">Choose the protection level for your shipment</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500">Premium</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {formatCurrency(basePremium)}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {coverageOptions.map((coverage) => (
                  <div
                    key={coverage.id}
                    className={`
                      relative p-5 rounded-xl border-2 cursor-pointer transition-all duration-200
                      ${selectedCoverage === coverage.id 
                        ? 'border-blue-500 bg-gradient-to-br ' + coverage.color + ' shadow-lg' 
                        : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
                      }
                    `}
                    onClick={() => setSelectedCoverage(coverage.id)}
                  >
                    {selectedCoverage === coverage.id && (
                      <div className="absolute -top-2 -right-2">
                        <div className="bg-blue-500 text-white text-xs font-medium px-3 py-1 rounded-full">
                          Selected
                        </div>
                      </div>
                    )}
                    
                    {coverage.badge && (
                      <div className="absolute -top-2 left-4">
                        <div className={`px-3 py-1 rounded-full text-xs font-medium
                          ${coverage.id === 'standard' ? 'bg-gray-100 text-gray-800' : ''}
                          ${coverage.id === 'premium' ? 'bg-blue-100 text-blue-800' : ''}
                          ${coverage.id === 'enterprise' ? 'bg-purple-100 text-purple-800' : ''}
                        `}>
                          {coverage.badge}
                        </div>
                      </div>
                    )}

                    <div className="mb-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${
                            coverage.id === 'standard' ? 'bg-gray-100' :
                            coverage.id === 'premium' ? 'bg-blue-100' : 'bg-purple-100'
                          }`}>
                            {coverage.id === 'standard' ? <Shield className="w-5 h-5 text-gray-600" /> :
                             coverage.id === 'premium' ? <Zap className="w-5 h-5 text-blue-600" /> :
                             <BadgeCheck className="w-5 h-5 text-purple-600" />}
                          </div>
                          <h3 className="font-semibold text-gray-900">{coverage.name}</h3>
                        </div>
                      </div>
                      
                      <p className="text-sm text-gray-600 mb-4">{coverage.description}</p>
                      
                      <div className="space-y-3">
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Premium</p>
                          <p className="text-xl font-bold text-gray-900">
                            {formatCurrency(coverage.premium)}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Deductible</p>
                          <p className="font-medium text-gray-900">
                            {formatCurrency(coverage.deductible)}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="border-t border-gray-200 pt-4">
                      <p className="text-xs font-medium text-gray-900 mb-2">Key Features:</p>
                      <ul className="space-y-1">
                        {coverage.features.slice(0, 3).map((feature, index) => (
                          <li key={index} className="flex items-center gap-2">
                            <CheckCircle className="w-3 h-3 text-green-500 flex-shrink-0" />
                            <span className="text-xs text-gray-600">{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Coverage Details */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Coverage Details</h3>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">What's Covered:</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {selectedCoverageData?.coverage.map((item, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-green-500"></div>
                        <span className="text-sm text-gray-700">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="pt-4 border-t border-gray-200">
                  <h4 className="font-medium text-gray-900 mb-2">Claims Process:</h4>
                  <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-600">
                        {selectedCoverage === 'standard' ? '3-5 business days' : 
                         selectedCoverage === 'premium' ? '<24 hours' : 'Same day'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-600">
                        {selectedCoverage === 'standard' ? 'Email Support' : 
                         selectedCoverage === 'premium' ? '24/7 Priority Support' : 'Dedicated Team'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Summary</h3>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center pb-3 border-b border-gray-200">
                  <span className="text-gray-600">Base Premium</span>
                  <span className="font-medium text-gray-900">
                    {formatCurrency(basePremium)}
                  </span>
                </div>
                
                <div className="flex justify-between items-center pb-3 border-b border-gray-200">
                  <span className="text-gray-600">Deductible</span>
                  <span className="font-medium text-gray-900">
                    {formatCurrency(deductible)}
                  </span>
                </div>
                
                <div className="flex justify-between items-center pb-3 border-b border-gray-200">
                  <span className="text-gray-600">Service Fee</span>
                  <span className="font-medium text-gray-900">{formatCurrency(serviceFee)}</span>
                </div>
                
                <div className="flex justify-between items-center pb-3 border-b border-gray-200">
                  <span className="text-gray-600">Taxes</span>
                  <span className="font-medium text-gray-900">
                    {formatCurrency(taxes)}
                  </span>
                </div>
                
                <div className="pt-3">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold text-gray-900">Total Amount</span>
                    <span className="text-xl font-bold text-blue-600">
                      {formatCurrency(totalAmount)}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 text-right mt-1">Due now to activate policy</p>
                </div>
              </div>
              
              <div className="mt-6 space-y-3">
                <button
                  onClick={handleProceedToPayment}
                  disabled={isProcessing || quoteData.status === 'rejected'}
                  className={`w-full py-3 px-4 font-medium rounded-lg transition-all duration-200 shadow-md hover:shadow-lg flex items-center justify-center gap-2 ${
                    quoteData.status === 'rejected' 
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700'
                  }`}
                >
                  {isProcessing ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                      {isApproving ? 'Getting Approval...' : 'Processing...'}
                    </>
                  ) : quoteData.status === 'approved' ? (
                    <>
                      <CreditCard className="w-4 h-4" />
                      Proceed to Payment
                    </>
                  ) : quoteData.status === 'rejected' ? (
                    'Quote Rejected'
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4" />
                      Get Quote Approved
                    </>
                  )}
                </button>
                
                <button
                  onClick={handleModifyInputs}
                  className="w-full py-3 px-4 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Modify Shipment Details
                </button>
              </div>
              
              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Lock className="w-4 h-4" />
                  <span>Secure payment processing powered by Stripe</span>
                </div>
              </div>
            </div>

            {/* Next Steps */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h4 className="font-semibold text-gray-900 mb-4">Next Steps</h4>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center ${
                    quoteData.status === 'approved' ? 'bg-green-100' : 'bg-blue-100'
                  }`}>
                    <div className={`w-2 h-2 rounded-full ${
                      quoteData.status === 'approved' ? 'bg-green-600' : 'bg-blue-600'
                    }`}></div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {quoteData.status === 'approved' ? 'Proceed to Payment' : 'Get Quote Approved'}
                    </p>
                    <p className="text-xs text-gray-500">
                      {quoteData.status === 'approved' 
                        ? 'Secure payment to activate your policy'
                        : 'We\'ll review your quote based on selected coverage'
                      }
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-gray-400"></div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Policy Activation</p>
                    <p className="text-xs text-gray-500">Instant activation upon successful payment</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-gray-400"></div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Document Upload</p>
                    <p className="text-xs text-gray-500">Upload shipping documents after payment</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Help Card */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-100 p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm">
                  <Users className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">Need Assistance?</h4>
                  <p className="text-sm text-gray-600">Our team is here to help</p>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-white/50 rounded-lg">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                    <Phone className="w-3 h-3 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Call Us</p>
                    <p className="text-xs text-gray-600">1-800-INS-CARGO</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-3 bg-white/50 rounded-lg">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                    <AlertCircle className="w-3 h-3 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Live Chat</p>
                    <p className="text-xs text-gray-600">Available 24/7</p>
                  </div>
                </div>
              </div>
              
              <button className="w-full mt-4 py-2 px-4 bg-white text-blue-600 font-medium rounded-lg border border-blue-200 hover:bg-blue-50 transition-colors">
                Schedule a Call
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}