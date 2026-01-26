'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Sparkles, ChevronRight } from 'lucide-react';
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

    // Save to localStorage/draft
    const draftData = {
      cargoType,
      otherCargoType,
      step: 1
    };
    localStorage.setItem('quote_draft', JSON.stringify(draftData));

    // Navigate to next step
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
    <div className="min-h-screen bg-[#F3F3F6]">
      <DashboardHeader userEmail={user?.email} />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-6">
          <button 
            onClick={() => router.push('/quotes')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Quotes
          </button>
          
          <div className="flex items-center gap-2 mb-4">
            <div className="p-2 rounded-lg bg-gradient-to-r from-[#0066FF] to-[#00A8FF]">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <h1 className="text-xl font-bold text-gray-900">Create New Quote</h1>
          </div>

          {/* Progress Bar */}
          <div className="mb-8">
            <div className="w-full bg-gray-200 rounded-full h-1.5 mb-1">
              <div className="bg-gradient-to-r from-[#0066FF] to-[#00A8FF] h-1.5 rounded-full w-20"></div>
            </div>
            <div className="flex justify-between text-xs text-gray-600">
              <span className="font-medium text-[#0066FF]">Cargo</span>
              <span>Details</span>
              <span>Coverage</span>
              <span>Review</span>
              <span>Payment</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Form */}
          <div className="lg:col-span-2">
            <div className="border border-[#d1d1d154] bg-[#fdfdf8cf] rounded-2xl p-6">
              <form onSubmit={handleNext}>
                <div className="mb-8">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-1 h-6 bg-gradient-to-b from-[#0066FF] to-[#00A8FF] rounded-full"></div>
                    <h2 className="text-lg font-bold text-gray-900">Cargo Information</h2>
                  </div>
                  <p className="text-sm text-gray-600 mb-6">
                    What type of goods are you shipping? This helps us calculate the right coverage.
                  </p>
                  
                  <CargoTypeSelector 
                    cargoType={cargoType}
                    otherCargoType={otherCargoType}
                    onCargoTypeSelect={setCargoType}
                    onOtherCargoTypeChange={setOtherCargoType}
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end pt-6 border-t border-gray-200">
                  <button
                    type="submit"
                    disabled={!cargoType || (cargoType === 'other' && !otherCargoType)}
                    className="px-6 py-3 rounded-lg font-semibold text-white bg-gradient-to-r from-[#0066FF] to-[#00A8FF] hover:from-[#0052CC] hover:to-[#0066FF] disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    Continue to Details
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            <div className="border border-[#d1d1d154] bg-[#fdfdf8cf] rounded-xl p-4">
              <h3 className="font-bold text-gray-900 text-sm mb-3">Why Cargo Type Matters</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-start gap-2">
                  <div className="w-4 h-4 rounded bg-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                  </div>
                  <span>Affects premium calculation</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-4 h-4 rounded bg-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                  </div>
                  <span>Determines risk level</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-4 h-4 rounded bg-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                  </div>
                  <span>Influences coverage options</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}