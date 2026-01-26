'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ChevronRight, Sparkles, Info } from 'lucide-react';
import DashboardHeader from '@/app/components/dashboard/DashboardHeader';
import { useUser } from '@/app/context/UserContext';
import CargoTypeSelector from '../../components/CargoTypeSelector';

export default function ShipmentStepPage() {
  const router = useRouter();
  const { user } = useUser();
  
  const [cargoType, setCargoType] = useState('');
  const [otherCargoType, setOtherCargoType] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

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

    const draftData = {
      cargoType,
      otherCargoType,
      step: 1
    };
    localStorage.setItem('quote_draft', JSON.stringify(draftData));

    router.push('/quotes/new/details');
  };

  useEffect(() => {
    const draftData = localStorage.getItem('quote_draft');
    if (draftData) {
      const draft = JSON.parse(draftData);
      setCargoType(draft.cargoType || '');
      setOtherCargoType(draft.otherCargoType || '');
    }
  }, []);

  return (
    <div className="min-h-screen bg-[#F3F3F6]">
      <DashboardHeader userEmail={user?.email} />
      
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Modern Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <button 
              onClick={() => router.push('/quotes')}
              className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors group"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
              <span>Back to Quotes</span>
            </button>
            
            <div className="flex items-center gap-2 px-3 py-1.5 bg-white/80 backdrop-blur-sm rounded-full border border-gray-200 shadow-sm">
              <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse"></div>
              <span className="text-xs font-medium text-gray-700">Step 1 of 5</span>
            </div>
          </div>

          {/* Modern Progress Indicator */}
          <div className="mb-10">
            <div className="flex flex-col md:flex-row md:items-center gap-4 mb-6">
              <div className="inline-flex items-center gap-3">
                <div className="relative">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-blue-500/20">
                    <Sparkles className="w-5 h-5 text-white" />
                  </div>
                  <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-green-500 border-2 border-white"></div>
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Create New Quote</h1>
                  <p className="text-sm text-gray-600 mt-0.5">Start by telling us about your cargo</p>
                </div>
              </div>
            </div>

            {/* Progress Steps */}
            <div className="relative">
              <div className="absolute top-3 left-0 right-0 h-0.5 bg-gray-200/80 -z-10"></div>
              <div className="grid grid-cols-5 gap-4 relative">
                {['Cargo', 'Details', 'Coverage', 'Review', 'Payment'].map((step, index) => (
                  <div key={step} className="flex flex-col items-center">
                    <div className={`
                      w-6 h-6 rounded-full flex items-center justify-center mb-2 transition-all duration-300
                      ${index === 0 
                        ? 'bg-gradient-to-br from-blue-500 to-cyan-500 text-white shadow-lg shadow-blue-500/30' 
                        : 'bg-gray-100 text-gray-400'
                      }
                    `}>
                      {index === 0 ? (
                        <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                      ) : (
                        <span className="text-xs font-medium">{index + 1}</span>
                      )}
                    </div>
                    <span className={`
                      text-xs font-medium transition-colors
                      ${index === 0 ? 'text-blue-600' : 'text-gray-500'}
                    `}>
                      {step}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Form Card */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
              <div className="p-8">
                <div className="mb-8">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-1 h-8 bg-gradient-to-b from-blue-500 to-cyan-500 rounded-full"></div>
                    <div>
                      <h2 className="text-xl font-bold text-gray-900">Cargo Information</h2>
                      <p className="text-sm text-gray-600 mt-1">
                        Select the type of goods you're shipping. This affects your coverage and premium calculation.
                      </p>
                    </div>
                  </div>
                </div>

                <form onSubmit={handleNext}>
                  <CargoTypeSelector 
                    cargoType={cargoType}
                    otherCargoType={otherCargoType}
                    onCargoTypeSelect={setCargoType}
                    onOtherCargoTypeChange={setOtherCargoType}
                  />

                  {/* Action Button */}
                  <div className="mt-10 pt-8 border-t border-gray-100">
                    <button
                      type="submit"
                      disabled={!cargoType || (cargoType === 'other' && !otherCargoType)}
                      className="group relative w-full lg:w-auto px-8 py-3.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-semibold text-sm transition-all duration-300 shadow-lg shadow-blue-600/20 hover:shadow-xl hover:shadow-blue-600/30 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-lg disabled:hover:shadow-blue-600/20"
                    >
                      <span className="flex items-center justify-center gap-2">
                        Continue to Details
                        <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                      </span>
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>

          {/* Sidebar - Modern Cards */}
          <div className="space-y-6">
            {/* Info Card */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-100 flex items-center justify-center">
                  <Info className="w-5 h-5 text-blue-600" />
                </div>
                <h3 className="font-bold text-gray-900">How Cargo Type Affects Your Quote</h3>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-1">Premium Calculation</h4>
                    <p className="text-xs text-gray-600">Different cargo types have varying risk factors that directly impact your premium.</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-1">Risk Level</h4>
                    <p className="text-xs text-gray-600">Higher risk cargo may require additional coverage options.</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-1">Coverage Options</h4>
                    <p className="text-xs text-gray-600">Certain cargo types unlock specialized coverage plans.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Stats Card */}
            <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl border border-blue-100 p-6">
              <h3 className="font-bold text-gray-900 mb-4">Quick Stats</h3>
              
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-gray-600">Average Processing Time</span>
                    <span className="text-xs font-bold text-gray-900">2 minutes</span>
                  </div>
                  <div className="w-full h-1.5 bg-blue-100 rounded-full overflow-hidden">
                    <div className="w-3/4 h-full bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full"></div>
                  </div>
                </div>
                
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-gray-600">Quote Accuracy</span>
                    <span className="text-xs font-bold text-gray-900">99%</span>
                  </div>
                  <div className="w-full h-1.5 bg-green-100 rounded-full overflow-hidden">
                    <div className="w-full h-full bg-gradient-to-r from-green-400 to-emerald-400 rounded-full"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Modern Background Elements */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-100/30 to-cyan-100/30 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-purple-100/20 to-pink-100/20 rounded-full blur-3xl"></div>
      </div>
    </div>
  );
}