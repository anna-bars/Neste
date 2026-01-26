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
  Zap
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

  // Load draft
  useEffect(() => {
    const draftData = localStorage.getItem('quote_draft');
    if (draftData) {
      const draft = JSON.parse(draftData);
      setCargoType(draft.cargoType || '');
      setOtherCargoType(draft.otherCargoType || '');
    }
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 text-gray-900">
      <DashboardHeader userEmail={user?.email} />
      
      <div className="relative max-w-7xl mx-auto px-4 py-6">
        {/* Minimal Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <button 
              onClick={() => router.push('/quotes')}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors text-sm group"
            >
              <div className="p-1.5 rounded-lg bg-white border border-gray-200 group-hover:border-gray-300 shadow-sm group-hover:shadow transition-all">
                <ArrowLeft className="w-3 h-3" />
              </div>
              <span className="hidden sm:inline font-medium">Back to Quotes</span>
            </button>
            
            {/* Minimal Progress Indicator */}
            <div className="flex items-center gap-3">
              <div className="text-xs text-gray-500 font-medium">Step 1 of 5</div>
              <div className="flex items-center gap-1">
                {[1,2,3,4,5].map((num) => (
                  <div 
                    key={num}
                    className={`w-1.5 h-1.5 rounded-full transition-all ${
                      num === 1 
                        ? 'bg-gradient-to-r from-blue-500 to-cyan-500' 
                        : 'bg-gray-300'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Side - Useful Information Cards (20%) */}
          <div className="lg:col-span-3 space-y-6">
            {/* Why Cargo Type Matters */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
              <div className="flex items-center gap-2 mb-4">
                <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500/10 to-cyan-500/10">
                  <Lightbulb className="w-4 h-4 text-blue-600" />
                </div>
                <h3 className="font-bold text-gray-900 text-sm">Why Cargo Type Matters</h3>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="p-1.5 rounded-lg bg-blue-50 flex-shrink-0 mt-0.5">
                    <Calculator className="w-3 h-3 text-blue-600" />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-900 mb-0.5">Premium Calculation</div>
                    <div className="text-xs text-gray-600">Directly affects insurance costs</div>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="p-1.5 rounded-lg bg-purple-50 flex-shrink-0 mt-0.5">
                    <Shield className="w-3 h-3 text-purple-600" />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-900 mb-0.5">Risk Assessment</div>
                    <div className="text-xs text-gray-600">Determines coverage eligibility</div>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="p-1.5 rounded-lg bg-green-50 flex-shrink-0 mt-0.5">
                    <TrendingUp className="w-3 h-3 text-green-600" />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-900 mb-0.5">Coverage Options</div>
                    <div className="text-xs text-gray-600">Influences available protection plans</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Tips */}
            <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl border border-blue-200 shadow-sm p-5">
              <div className="flex items-center gap-2 mb-4">
                <AlertCircle className="w-4 h-4 text-blue-600" />
                <h3 className="font-bold text-gray-900 text-sm">Quick Tips</h3>
              </div>
              
              <ul className="space-y-2">
                {[
                  'Select the most accurate cargo type',
                  'Custom option available for unique shipments',
                  'Changes can be made in later steps'
                ].map((tip, index) => (
                  <li key={index} className="flex items-start gap-2 text-xs text-gray-700">
                    <CheckCircle2 className="w-3 h-3 text-green-500 flex-shrink-0 mt-0.5" />
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Need Help? */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
              <div className="text-center">
                <div className="inline-flex p-2 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 mb-3">
                  <HelpCircle className="w-4 h-4 text-white" />
                </div>
                <h3 className="font-bold text-gray-900 text-sm mb-2">Need Help?</h3>
                <p className="text-xs text-gray-600 mb-4">
                  Our team is here to assist with cargo classification
                </p>
                <button className="w-full py-2 text-xs font-medium text-blue-600 hover:text-blue-700 border border-blue-200 hover:border-blue-300 rounded-lg transition-colors">
                  Contact Support
                </button>
              </div>
            </div>
          </div>

          {/* Right Side - Main Cargo Selection (80%) */}
          <div className="lg:col-span-9">
            <div className="bg-white rounded-2xl border border-gray-200 shadow-lg p-8">
              {/* Main Header */}
              <div className="mb-8">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2.5 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 shadow-lg">
                    <Zap className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900">Select Cargo Type</h1>
                    <p className="text-gray-600 text-sm mt-1">
                      Choose what you're shipping for accurate coverage calculation
                    </p>
                  </div>
                </div>
                
                {/* Required Indicator */}
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-xs text-blue-700">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                  Required for premium calculation
                </div>
              </div>

              {/* Cargo Selection Grid via Component */}
              <CargoTypeSelector 
                cargoType={cargoType}
                otherCargoType={otherCargoType}
                onCargoTypeSelect={setCargoType}
                onOtherCargoTypeChange={setOtherCargoType}
              />

              {/* Continue Button */}
              <div className="flex justify-end mt-10">
                <button
                  onClick={handleNext}
                  disabled={!cargoType || (cargoType === 'other' && !otherCargoType)}
                  className={`
                    group px-10 py-3.5 rounded-xl font-semibold text-white 
                    bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 
                    disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300
                    flex items-center gap-2 shadow-lg hover:shadow-xl
                  `}
                >
                  <span className="text-lg">Continue to Details</span>
                  <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}