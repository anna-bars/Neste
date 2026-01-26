'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ChevronLeft, 
  ChevronRight, 
  Check, 
  Shield, 
  Zap, 
  Clock, 
  Star,
  AlertCircle
} from 'lucide-react';
import DashboardHeader from '@/app/components/dashboard/DashboardHeader';
import { useUser } from '@/app/context/UserContext';
import { PremiumCalculator } from '@/lib/services/premiumCalculator';
import { quotes } from '@/lib/supabase/quotes';

export default function CoverageStepPage() {
  const router = useRouter();
  const { user } = useUser();
  
  const [selectedPlan, setSelectedPlan] = useState<string>('premium');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [quoteData, setQuoteData] = useState<any>(null);
  const [planDetails, setPlanDetails] = useState<any>(null);

  const coveragePlans = [
    {
      id: 'standard',
      name: 'Standard',
      description: 'Essential protection for common risks',
      icon: Shield,
      multiplier: 1.00,
      deductible: 1000,
      features: [
        'Standard claims processing',
        'Email support',
        'Basic tracking',
        '7-day claim processing'
      ],
      color: '#6B7280'
    },
    {
      id: 'premium',
      name: 'Premium',
      description: 'Comprehensive protection with priority service',
      icon: Zap,
      multiplier: 1.15,
      deductible: 500,
      features: [
        '24/7 Priority Support',
        'Dedicated Risk Manager',
        'Expedited Claims (<24h)',
        'Extended coverage'
      ],
      color: '#0066FF',
      popular: true
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      description: 'Maximum protection with white-glove service',
      icon: Star,
      multiplier: 1.35,
      deductible: 250,
      features: [
        '24/7 Dedicated Team',
        'Same-day Claims',
        'Custom Coverage',
        'Premium Risk Assessment'
      ],
      color: '#7C3AED'
    }
  ];

  useEffect(() => {
    // Load draft data and calculate premiums
    const draftData = localStorage.getItem('quote_draft');
    if (!draftData) {
      router.push('/quotes/new/shipment');
      return;
    }

    const draft = JSON.parse(draftData);
    
    // Calculate base premium
    try {
      const start = new Date(draft.startDate);
      const end = new Date(draft.endDate);
      const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));

      const premiumInput = {
        cargoType: draft.cargoType === 'other' ? draft.otherCargoType : draft.cargoType,
        shipmentValue: parseFloat(draft.shipmentValue),
        transportationMode: draft.transportationMode,
        coverageType: 'standard',
        startDate: draft.startDate,
        endDate: draft.endDate,
        duration: days
      };

      const basePremium = PremiumCalculator.calculate(premiumInput).basePremium;
      
      // Calculate premiums for all plans
      const plansWithPrices = coveragePlans.map(plan => ({
        ...plan,
        finalPremium: Math.round(basePremium * plan.multiplier),
        basePremium: basePremium
      }));

      setPlanDetails(plansWithPrices);
      
      setQuoteData({
        ...draft,
        basePremium,
        selectedPlan: 'premium'
      });
    } catch (error) {
      console.error('Error calculating premiums:', error);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedPlan || !user || !quoteData || !planDetails) {
      alert('Please select a coverage plan');
      return;
    }

    setIsSubmitting(true);

    try {
      const selectedPlanData = planDetails.find((p: any) => p.id === selectedPlan);
      
      // Calculate expiration (72 hours from now)
      const expiration = new Date();
      expiration.setHours(expiration.getHours() + 72);

      // Create quote in database
      const quote = await quotes.create({
        user_id: user.id,
        cargo_type: quoteData.cargoType === 'other' ? quoteData.otherCargoType : quoteData.cargoType,
        shipment_value: parseFloat(quoteData.shipmentValue),
        origin: quoteData.origin || {},
        destination: quoteData.destination || {},
        start_date: quoteData.startDate,
        end_date: quoteData.endDate,
        transportation_mode: quoteData.transportationMode,
        selected_coverage: selectedPlan as any,
        calculated_premium: selectedPlanData.finalPremium,
        deductible: selectedPlanData.deductible,
        quote_expires_at: expiration.toISOString(),
        status: 'submitted',
        payment_status: 'pending'
      });

      // Update draft with quote ID
      const updatedDraft = {
        ...quoteData,
        quoteId: quote.id,
        selectedPlan,
        finalPremium: selectedPlanData.finalPremium,
        deductible: selectedPlanData.deductible,
        step: 3
      };
      localStorage.setItem('quote_draft', JSON.stringify(updatedDraft));

      // Navigate to summary
      router.push(`/quotes/new/summary?quote_id=${quote.id}`);

    } catch (error) {
      console.error('Error creating quote:', error);
      alert('Failed to create quote. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F3F3F6]">
      <DashboardHeader userEmail={user?.email} />
      
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <button 
              onClick={() => router.push('/quotes/new/details')}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 text-sm"
            >
              <ChevronLeft className="w-4 h-4" />
              Back
            </button>
            
            <div className="text-sm text-gray-600">Step 3 of 5</div>
          </div>

          <div className="mb-8">
            <h1 className="text-xl font-bold text-gray-900 mb-2">Select Coverage Plan</h1>
            
            {/* Progress Bar */}
            <div className="w-full bg-gray-200 rounded-full h-1.5 mb-1">
              <div className="bg-gradient-to-r from-[#0066FF] to-[#00A8FF] h-1.5 rounded-full w-3/5"></div>
            </div>
            <div className="flex justify-between text-xs text-gray-600">
              <span className="text-[#0066FF]">Cargo</span>
              <span className="text-[#0066FF]">Details</span>
              <span className="font-medium text-[#0066FF]">Coverage</span>
              <span>Review</span>
              <span>Payment</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <div className="border border-[#d1d1d154] bg-[#fdfdf8cf] rounded-2xl p-6">
              <div className="mb-6">
                <h2 className="font-bold text-gray-900 mb-2">Choose Your Protection Level</h2>
                <p className="text-sm text-gray-600">
                  Select the coverage plan that best fits your shipment needs
                </p>
              </div>

              <form onSubmit={handleSubmit}>
                {/* Coverage Plans */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                  {planDetails?.map((plan: any) => {
                    const Icon = plan.icon;
                    const isSelected = selectedPlan === plan.id;
                    
                    return (
                      <div
                        key={plan.id}
                        onClick={() => setSelectedPlan(plan.id)}
                        className={`
                          relative cursor-pointer border rounded-xl p-5 transition-all
                          ${isSelected
                            ? 'border-2 border-blue-500 bg-blue-50'
                            : 'border-gray-300 hover:border-gray-400 bg-white'
                          }
                        `}
                      >
                        {plan.popular && (
                          <div className="absolute -top-2 left-1/2 transform -translate-x-1/2">
                            <div className="px-3 py-1 bg-gradient-to-r from-[#0066FF] to-[#00A8FF] text-white text-xs font-bold rounded-full">
                              Popular
                            </div>
                          </div>
                        )}

                        <div className="mb-4">
                          <div className="flex items-center gap-3 mb-2">
                            <div 
                              className="p-2 rounded-lg"
                              style={{ backgroundColor: `${plan.color}20`, color: plan.color }}
                            >
                              <Icon className="w-5 h-5" />
                            </div>
                            <div>
                              <h3 className="font-bold text-gray-900">{plan.name}</h3>
                              <p className="text-xs text-gray-600">{plan.description}</p>
                            </div>
                          </div>
                        </div>

                        <div className="mb-4">
                          <div className="text-2xl font-bold text-gray-900 mb-1">
                            ${plan.finalPremium?.toFixed(2) || '0'}
                          </div>
                          <div className="text-sm text-gray-600">
                            Deductible: ${plan.deductible}
                          </div>
                        </div>

                        <ul className="space-y-2 mb-4">
                          {plan.features.map((feature: string, index: number) => (
                            <li key={index} className="flex items-start gap-2 text-sm">
                              <Check className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                              <span className="text-gray-700">{feature}</span>
                            </li>
                          ))}
                        </ul>

                        {isSelected && (
                          <div className="flex items-center justify-center gap-2 text-blue-600 font-medium">
                            <Check className="w-4 h-4" />
                            Selected
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Action Buttons */}
                <div className="flex justify-between pt-6 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => router.push('/quotes/new/details')}
                    className="px-5 py-2.5 text-gray-600 hover:text-gray-900 font-medium"
                  >
                    Back
                  </button>
                  
                  <button
                    type="submit"
                    disabled={isSubmitting || !selectedPlan}
                    className="px-6 py-2.5 rounded-lg font-semibold text-white bg-gradient-to-r from-[#0066FF] to-[#00A8FF] hover:from-[#0052CC] hover:to-[#0066FF] disabled:opacity-50 flex items-center gap-2"
                  >
                    {isSubmitting ? 'Processing...' : 'Review Quote'}
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Shipment Summary */}
            {quoteData && (
              <div className="border border-[#d1d1d154] bg-[#fdfdf8cf] rounded-xl p-4">
                <h3 className="font-bold text-gray-900 text-sm mb-3">Shipment Summary</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Cargo Type:</span>
                    <span className="font-medium text-gray-900">
                      {quoteData.cargoType === 'other' ? quoteData.otherCargoType : quoteData.cargoType}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Value:</span>
                    <span className="font-medium text-gray-900">
                      ${parseFloat(quoteData.shipmentValue).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Transport:</span>
                    <span className="font-medium text-gray-900">
                      {quoteData.transportationMode}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Coverage Details */}
            <div className="border border-[#d1d1d154] bg-[#fdfdf8cf] rounded-xl p-4">
              <h3 className="font-bold text-gray-900 text-sm mb-3">Coverage Details</h3>
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
                  <span>What's Covered: All Risks + Extended Protection</span>
                </div>
                <div className="flex items-start gap-2">
                  <Clock className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
                  <span>Claims Process: &lt;24 hours for Premium plans</span>
                </div>
                <div className="flex items-start gap-2">
                  <Shield className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
                  <span>24/7 Priority Support available</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}