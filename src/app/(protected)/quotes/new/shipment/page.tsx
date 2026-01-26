'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft, 
  ChevronRight,
  Calculator,
  Shield,
  TrendingUp,
  Lightbulb,
  HelpCircle,
  CheckCircle2,
  AlertCircle,
  Zap,
  Sparkles
} from 'lucide-react';
import DashboardHeader from '@/app/components/dashboard/DashboardHeader';
import { useUser } from '@/app/context/UserContext';
import CargoTypeSelector from '../components/CargoTypeSelector';

export default function ShipmentStepPage() {
  const router = useRouter();
  const { user } = useUser();
  
  const [cargoType, setCargoType] = useState('');
  const [otherCargoType, setOtherCargoType] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [stepComplete, setStepComplete] = useState(false);

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!cargoType) {
      alert('Please select a cargo type');
      return;
    }

    if (cargoType === 'other' && !otherCargoType) {
      alert('Please specify your cargo type');
      return;
    }

    setStepComplete(true);
    setTimeout(() => {
      const draftData = {
        cargoType,
        otherCargoType,
        step: 1
      };
      localStorage.setItem('quote_draft', JSON.stringify(draftData));
      router.push('/quotes/new/details');
    }, 300);
  };

  // Load draft
  useEffect(() => {
    const draftData = localStorage.getItem('quote_draft');
    if (draftData) {
      const draft = JSON.parse(draftData);
      setCargoType(draft.cargoType || '');
      setOtherCargoType(draft.otherCargoType || '');
    }
  }, []);

  useEffect(() => {
    if (cargoType) {
      setStepComplete(true);
    }
  }, [cargoType]);

  return (
    <div className="min-h-screen bg-[#F3F3F6] text-gray-900">

      <DashboardHeader userEmail={user?.email}/>
      
      <div className="relative max-w-[88%] mx-auto pt-2 pb-4 py-8">
        {/* Modern Header */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-0">
            <button 
              onClick={() => router.push('/quotes')}
              className="group flex items-center gap-3 text-gray-600 hover:text-gray-900 transition-all duration-300"
            >
              <div className="p-2 rounded-xl bg-white border border-gray-200 shadow-sm group-hover:border-gray-300 group-hover:shadow transition-all">
                <ArrowLeft className="w-4 h-4" />
              </div>
              <span className="text-sm font-medium">
                Back to Quotes
              </span>
            </button>
            
            {/* Modern Progress Indicator */}
            <div className="flex items-center gap-4">
              <div className="text-sm font-mono text-gray-500">01/05</div>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <div className="w-10 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className={`h-full bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full transition-all duration-700 ${
                        stepComplete ? 'w-full' : 'w-1/4'
                      }`}
                    ></div>
                  </div>
                  <div className="absolute -top-1.5 left-1/4 transform -translate-x-1/2 w-3 h-3 rounded-full bg-blue-500 border-2 border-white"></div>
                </div>
                <Sparkles className="w-4 h-4 text-blue-500" />
              </div>
            </div>
          </div>

         
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* Left Side - Main Cargo Selection (80%) */}
          <div className="lg:col-span-9 order-2 lg:order-1">
            <div className="relative group">

              <div className="relative border border-[#d1d1d154] bg-[#FDFEFF] rounded-2xl shadow-sm overflow-hidden">
                {/* Card Header */}
                <div className="p-8 border-b border-gray-100">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-4 mb-3">
                        <div className="p-3 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 shadow-lg">
                          <Zap className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h2 className="text-2xl font-bold text-gray-900">Cargo Type Selection</h2>
                          <p className="text-gray-600 text-sm mt-1">
                            What type of goods are you shipping?
                          </p>
                        </div>
                      </div>
                      
                      {/* AI Badge */}
                      <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-blue-50 to-cyan-50 border border-cyan-200">
                        <Sparkles className="w-3 h-3 text-cyan-600" />
                        <span className="text-xs font-medium text-cyan-700">AI-Powered Matching</span>
                      </div>
                    </div>
                    
                    {/* Step Indicator */}
                    <div className="hidden lg:block">
                      <div className="text-xs font-mono text-gray-500 mb-1">STEP 01</div>
                      <div className="text-sm font-bold text-gray-900 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-200">
                        Cargo Selection
                      </div>
                    </div>
                  </div>
                </div>

                {/* Form Content */}
                <div className="p-8">
                  <CargoTypeSelector 
                    cargoType={cargoType}
                    otherCargoType={otherCargoType}
                    onCargoTypeSelect={setCargoType}
                    onOtherCargoTypeChange={setOtherCargoType}
                  />

                  {/* Continue Button */}
                  <div className="mt-12 pt-8 border-t border-gray-100 flex flex-end justify-end">
                    <button
                      onClick={handleNext}
                      disabled={!cargoType || (cargoType === 'other' && !otherCargoType)}
                      className={`
                        relative group/btn w-full lg:w-auto px-10 py-4 rounded-2xl font-bold text-white 
                        overflow-hidden transition-all duration-500 shadow-lg hover:shadow-xl
                        ${(!cargoType || (cargoType === 'other' && !otherCargoType))
                          ? 'opacity-50 cursor-not-allowed bg-gray-100 border border-gray-300 text-gray-400'
                          : 'bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500'
                        }
                      `}
                    >
                      {/* Animated Background */}
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 via-blue-500/20 to-cyan-500/0 translate-x-[-100%] group-hover/btn:translate-x-[100%] transition-transform duration-1000"></div>
                      
                      <div className="relative flex items-end justify-end gap-3">
                        <span className="text-lg">Continue to Details</span>
                        <ChevronRight className="w-5 h-5 group-hover/btn:translate-x-2 transition-transform" />
                      </div>
                      
                    
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Information Panel (20%) */}
          <div className="lg:col-span-3 space-y-2 order-1 lg:order-2">
            {/* Why It Matters */}
            <div className="border border-[#d1d1d154] bg-[#FDFEFF] rounded-2xl shadow-sm  p-6">
              <div className="flex items-center gap-3 mb-5">
                <div className="p-2.5 rounded-xl bg-gradient-to-br from-blue-50 to-cyan-50">
                  <Lightbulb className="w-5 h-5 text-blue-600" />
                </div>
                <h3 className="font-bold text-gray-900 text-base">Why Cargo Type Matters</h3>
              </div>
              
              <div className="space-y-4">
                {[
                  {
                    icon: Calculator,
                    title: 'Premium Calculation',
                    desc: 'Directly affects insurance costs',
                    color: 'text-blue-600',
                    bg: 'bg-blue-50'
                  },
                  {
                    icon: Shield,
                    title: 'Risk Assessment',
                    desc: 'Determines coverage eligibility',
                    color: 'text-purple-600',
                    bg: 'bg-purple-50'
                  },
                  {
                    icon: TrendingUp,
                    title: 'Coverage Options',
                    desc: 'Influences available protection plans',
                    color: 'text-green-600',
                    bg: 'bg-green-50'
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
            <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl border border-blue-200 shadow-lg p-6">
              <div className="flex items-center gap-3 mb-5">
                <AlertCircle className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-gray-900 text-base">Quick Tips</h3>
              </div>
              
              <div className="space-y-3">
                {[
                  'Select the most accurate cargo type',
                  'Custom option available for unique shipments',
                  'Changes can be made in later steps'
                ].map((tip, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-gray-700">{tip}</span>
                  </div>
                ))}
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
                  Our team is here to assist with cargo classification
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
            <span>Press <kbd className="px-2 py-1 mx-1 rounded bg-gray-100 border border-gray-300">Tab</kbd> to navigate between options</span>
          </div>
        </div>
      </div>
    </div>
  );
}