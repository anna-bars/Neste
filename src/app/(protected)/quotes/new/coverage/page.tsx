'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft, 
  ChevronRight,
  ChevronLeft,
  Shield,
  Zap,
  Star,
  Sparkles,
  Lightbulb,
  AlertCircle,
  HelpCircle,
  CheckCircle2,
  Clock,
  Check
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
  const [stepComplete, setStepComplete] = useState(false);

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
      color: '#6B7280',
      iconColor: 'text-gray-600',
      bg: 'bg-gray-50',
      border: 'border-gray-200',
      risk: 'Basic',
      riskColor: 'bg-gray-100 text-gray-800 border-gray-200'
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
      iconColor: 'text-blue-600',
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      risk: 'Recommended',
      riskColor: 'bg-blue-100 text-blue-800 border-blue-200',
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
      color: '#7C3AED',
      iconColor: 'text-purple-600',
      bg: 'bg-purple-50',
      border: 'border-purple-200',
      risk: 'Premium',
      riskColor: 'bg-purple-100 text-purple-800 border-purple-200'
    }
  ];

  useEffect(() => {
    // Check if step is complete
    setStepComplete(!!selectedPlan);
  }, [selectedPlan]);

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
    <div className="min-h-screen bg-[#F3F3F6] text-gray-900">
      <DashboardHeader userEmail={user?.email}/>
      
      <div className="relative max-w-[88%] mx-auto pt-2 pb-4 py-8">
        {/* Modern Header */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-0">
            <button 
              onClick={() => router.push('/quotes/new/details')}
              className="group flex items-center gap-3 text-gray-600 hover:text-gray-900 transition-all duration-300"
            >
              <div className="p-2 rounded-xl bg-white border border-gray-200 shadow-sm group-hover:border-gray-300 group-hover:shadow transition-all">
                <ArrowLeft className="w-4 h-4" />
              </div>
              <span className="text-sm font-medium">
                Back to Details
              </span>
            </button>
            
            {/* Modern Progress Indicator */}
            <div className="flex items-center gap-4">
              <div className="text-sm font-mono text-gray-500">03/05</div>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <div className="w-10 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className={`h-full bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full transition-all duration-700 ${
                        stepComplete ? 'w-full' : 'w-3/5'
                      }`}
                    ></div>
                  </div>
                  <div className="absolute -top-1.5 left-3/5 transform -translate-x-1/2 w-3 h-3 rounded-full bg-blue-500 border-2 border-white"></div>
                </div>
                <Sparkles className="w-4 h-4 text-blue-500" />
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* Left Side - Main Coverage Selection (80%) */}
          <div className="lg:col-span-9 order-2 lg:order-1">
            <div className="relative group">
              <div className="relative border border-[#d1d1d154] bg-[#FDFEFF] rounded-2xl shadow-sm overflow-hidden">
                {/* Card Header */}
                <div className="p-8 border-b border-gray-100">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-4 mb-3">
                        <div className="p-3 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 shadow-lg">
                          <Shield className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h2 className="text-2xl font-bold text-gray-900">Coverage Plan Selection</h2>
                          <p className="text-gray-600 text-sm mt-1">
                            Choose the protection level that fits your needs
                          </p>
                        </div>
                      </div>
                      
                      {/* AI Badge */}
                      <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-blue-50 to-cyan-50 border border-cyan-200">
                        <Sparkles className="w-3 h-3 text-cyan-600" />
                        <span className="text-xs font-medium text-cyan-700">Risk-Optimized Plans</span>
                      </div>
                    </div>
                    
                    {/* Step Indicator */}
                    <div className="hidden lg:block">
                      <div className="text-xs font-mono text-gray-500 mb-1">STEP 03</div>
                      <div className="text-sm font-bold text-gray-900 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-200">
                        Coverage Selection
                      </div>
                    </div>
                  </div>
                </div>

                {/* Form Content */}
                <div className="p-8">
                  <form onSubmit={handleSubmit}>
                    {/* Coverage Plans */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                      {planDetails?.map((plan: any) => {
                        const Icon = plan.icon;
                        const isSelected = selectedPlan === plan.id;
                        
                        return (
                          <button
                            key={plan.id}
                            type="button"
                            onClick={() => setSelectedPlan(plan.id)}
                            className={`
                              relative group/plan p-6 rounded-xl border-2 transition-all duration-300 text-left
                              ${isSelected
                                ? `border-blue-500 ${plan.bg} shadow-md`
                                : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
                              }
                              ${isSelected ? 'scale-[1.02]' : ''}
                            `}
                          >
                            {plan.popular && (
                              <div className="absolute -top-2.5 left-1/2 transform -translate-x-1/2 z-10">
                                <div className="px-3 py-1 bg-gradient-to-r from-blue-500 to-cyan-500 text-white text-xs font-bold rounded-full shadow-md">
                                  POPULAR
                                </div>
                              </div>
                            )}

                            <div className="relative z-10">
                              {/* Plan Header */}
                              <div className="flex items-start justify-between mb-4">
                                <div className={`p-2.5 rounded-lg ${plan.bg} ${plan.border}`}>
                                  <Icon className={`w-5 h-5 ${plan.iconColor}`} />
                                </div>
                                {isSelected && (
                                  <CheckCircle2 className="w-5 h-5 text-blue-600" />
                                )}
                              </div>

                              {/* Plan Name & Description */}
                              <div className="mb-4">
                                <div className="flex items-center gap-2 mb-2">
                                  <h3 className={`font-bold text-lg ${isSelected ? 'text-gray-900' : 'text-gray-800'}`}>
                                    {plan.name}
                                  </h3>
                                  <span className={`px-2 py-1 rounded-lg text-xs font-semibold border ${plan.riskColor}`}>
                                    {plan.risk}
                                  </span>
                                </div>
                                <p className={`text-sm ${isSelected ? 'text-gray-700' : 'text-gray-600'}`}>
                                  {plan.description}
                                </p>
                              </div>

                              {/* Price */}
                              <div className="mb-5">
                                <div className="text-2xl font-bold text-gray-900 mb-1">
                                  ${plan.finalPremium?.toFixed(2) || '0'}
                                </div>
                                <div className="text-sm text-gray-600">
                                  Deductible: <span className="font-medium text-gray-900">${plan.deductible}</span>
                                </div>
                              </div>

                              {/* Features */}
                              <ul className="space-y-3 mb-4">
                                {plan.features.map((feature: string, index: number) => (
                                  <li key={index} className="flex items-start gap-2 text-sm">
                                    <Check className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                                    <span className={`${isSelected ? 'text-gray-700' : 'text-gray-600'}`}>
                                      {feature}
                                    </span>
                                  </li>
                                ))}
                              </ul>

                              {/* Selection Indicator */}
                              {isSelected && (
                                <div className="mt-4 pt-4 border-t border-gray-200 flex items-center justify-center gap-2 text-blue-600 font-medium text-sm">
                                  <CheckCircle2 className="w-4 h-4" />
                                  Plan Selected
                                </div>
                              )}
                            </div>
                          </button>
                        );
                      })}
                    </div>

                    {/* Action Buttons */}
                    <div className="mt-12 pt-8 border-t border-gray-100 flex justify-between items-center">
                      <button
                        type="button"
                        onClick={() => router.push('/quotes/new/details')}
                        className="group flex items-center gap-3 text-gray-600 hover:text-gray-900 transition-all duration-300"
                      >
                        <div className="p-2 rounded-xl bg-white border border-gray-200 shadow-sm group-hover:border-gray-300 group-hover:shadow transition-all">
                          <ChevronLeft className="w-4 h-4" />
                        </div>
                        <span className="text-sm font-medium">
                          Back
                        </span>
                      </button>
                      
                      <button
                        type="submit"
                        disabled={!stepComplete || isSubmitting}
                        className={`
                          relative group/btn w-full lg:w-auto px-10 py-4 rounded-2xl font-bold text-white 
                          overflow-hidden transition-all duration-500 shadow-lg hover:shadow-xl
                          ${(!stepComplete)
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
                              <span className="text-lg">Review Quote</span>
                              <ChevronRight className="w-5 h-5 group-hover/btn:translate-x-2 transition-transform" />
                            </>
                          )}
                        </div>
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Information Panel (20%) */}
          <div className="lg:col-span-3 space-y-2 order-1 lg:order-2">
            {/* Shipment Summary */}
            {quoteData && (
              <div className="border border-[#d1d1d154] bg-[#FDFEFF] rounded-2xl shadow-sm p-6">
                <div className="flex items-center gap-3 mb-5">
                  <div className="p-2.5 rounded-xl bg-gradient-to-br from-blue-50 to-cyan-50">
                    <Shield className="w-5 h-5 text-blue-600" />
                  </div>
                  <h3 className="font-bold text-gray-900 text-base">Shipment Summary</h3>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Cargo Type</span>
                    <span className="font-medium text-gray-900">
                      {quoteData.cargoType === 'other' ? quoteData.otherCargoType : quoteData.cargoType}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Value</span>
                    <span className="font-medium text-gray-900">
                      ${parseFloat(quoteData.shipmentValue).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Transport</span>
                    <span className="font-medium text-gray-900 capitalize">
                      {quoteData.transportationMode}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Duration</span>
                    <span className="font-medium text-gray-900">
                      {(() => {
                        const start = new Date(quoteData.startDate);
                        const end = new Date(quoteData.endDate);
                        const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
                        return `${days} days`;
                      })()}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Why Coverage Matters */}
            <div className="border border-[#d1d1d154] bg-[#FDFEFF] rounded-2xl shadow-sm p-6">
              <div className="flex items-center gap-3 mb-5">
                <div className="p-2.5 rounded-xl bg-gradient-to-br from-blue-50 to-cyan-50">
                  <Lightbulb className="w-5 h-5 text-blue-600" />
                </div>
                <h3 className="font-bold text-gray-900 text-base">Why Coverage Matters</h3>
              </div>
              
              <div className="space-y-4">
                {[
                  {
                    icon: Shield,
                    title: 'Risk Mitigation',
                    desc: 'Protects against cargo damage/loss',
                    color: 'text-blue-600',
                    bg: 'bg-blue-50'
                  },
                  {
                    icon: Clock,
                    title: 'Fast Claims',
                    desc: 'Priority processing available',
                    color: 'text-emerald-600',
                    bg: 'bg-emerald-50'
                  },
                  {
                    icon: Zap,
                    title: 'Value Protection',
                    desc: 'Ensures financial security',
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

            {/* Quick Tips */}
            <div className="border border-[#d1d1d154] bg-[#FDFEFF] rounded-2xl shadow-sm p-6">
              <div className="flex items-center gap-3 mb-5">
                <AlertCircle className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-gray-900 text-base">Quick Tips</h3>
              </div>
              
              <div className="space-y-3">
                {[
                  'Consider shipment value when selecting plan',
                  'High-value shipments need comprehensive coverage',
                  'Premium plans offer faster claims processing',
                  'Deductible affects final payout'
                ].map((tip, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-gray-700">{tip}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Coverage Details */}
            <div className="border border-[#d1d1d154] bg-[#FDFEFF] rounded-2xl shadow-sm p-6">
              <div className="flex items-center gap-3 mb-5">
                <Shield className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-gray-900 text-base">What's Covered</h3>
              </div>
              
              <div className="space-y-3 text-sm text-gray-600">
                <div className="flex items-start gap-3">
                  <Check className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                  <span>All Risks + Extended Protection</span>
                </div>
                <div className="flex items-start gap-3">
                  <Clock className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
                  <span>&lt;24h claims for Premium plans</span>
                </div>
                <div className="flex items-start gap-3">
                  <Zap className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
                  <span>24/7 Priority Support</span>
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
                  Our experts can help you choose the right plan
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
            <span>Premium plans include priority claims processing</span>
          </div>
        </div>
      </div>
    </div>
  );
}