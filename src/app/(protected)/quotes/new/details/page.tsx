'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ChevronRight, ChevronLeft } from 'lucide-react';
import DashboardHeader from '@/app/components/dashboard/DashboardHeader';
import CustomDatePicker from '../components/CustomDatePicker';
import LocationIQAutocomplete from '../components/LocationIQAutocomplete';
import { useUser } from '@/app/context/UserContext';
import { PremiumCalculator } from '@/lib/services/premiumCalculator';

export default function DetailsStepPage() {
  const router = useRouter();
  const { user } = useUser();
  
  const [shipmentValue, setShipmentValue] = useState('');
  const [origin, setOrigin] = useState<any>(null);
  const [destination, setDestination] = useState<any>(null);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [transportationMode, setTransportationMode] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [estimatedPremium, setEstimatedPremium] = useState<number | null>(null);

  const today = new Date().toISOString().split('T')[0];
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowFormatted = tomorrow.toISOString().split('T')[0];

  const transportModes = [
    { id: 'sea', name: 'Sea Freight', time: '20-40 days', color: '#0066FF' },
    { id: 'air', name: 'Air Freight', time: '2-7 days', color: '#7C3AED' },
    { id: 'road', name: 'Road Freight', time: '3-10 days', color: '#059669' },
  ];

  // Calculate estimated premium whenever values change
  useEffect(() => {
    const calculateEstimate = () => {
      const draftData = localStorage.getItem('quote_draft');
      if (!draftData) return;

      const draft = JSON.parse(draftData);
      const cargoType = draft.cargoType === 'other' ? draft.otherCargoType : draft.cargoType;

      if (cargoType && shipmentValue && transportationMode && startDate && endDate) {
        try {
          const start = new Date(startDate);
          const end = new Date(endDate);
          const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));

          const premiumInput = {
            cargoType,
            shipmentValue: parseFloat(shipmentValue),
            transportationMode,
            coverageType: 'standard', // Base calculation
            startDate,
            endDate,
            duration: days
          };

          const result = PremiumCalculator.calculate(premiumInput);
          setEstimatedPremium(result.basePremium);
        } catch (error) {
          console.error('Premium calculation error:', error);
        }
      }
    };

    calculateEstimate();
  }, [shipmentValue, transportationMode, startDate, endDate]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate all required fields
    const requiredFields = [
      shipmentValue,
      origin,
      destination,
      startDate,
      endDate,
      transportationMode
    ];

    if (requiredFields.some(field => !field)) {
      alert('Please complete all required fields');
      return;
    }

    setIsSubmitting(true);

    // Save to localStorage/draft
    const existingDraft = localStorage.getItem('quote_draft');
    const draft = existingDraft ? JSON.parse(existingDraft) : {};
    
    const updatedDraft = {
      ...draft,
      shipmentValue,
      origin,
      destination,
      startDate,
      endDate,
      transportationMode,
      estimatedPremium,
      step: 2
    };

    localStorage.setItem('quote_draft', JSON.stringify(updatedDraft));

    // Navigate to next step
    setTimeout(() => {
      router.push('/quotes/new/coverage');
      setIsSubmitting(false);
    }, 500);
  };

  // Load draft
  useEffect(() => {
    const draftData = localStorage.getItem('quote_draft');
    if (draftData) {
      const draft = JSON.parse(draftData);
      setShipmentValue(draft.shipmentValue || '');
      setOrigin(draft.origin || null);
      setDestination(draft.destination || null);
      setStartDate(draft.startDate || today);
      setEndDate(draft.endDate || tomorrowFormatted);
      setTransportationMode(draft.transportationMode || '');
      setEstimatedPremium(draft.estimatedPremium || null);
    } else {
      setStartDate(today);
      setEndDate(tomorrowFormatted);
    }
  }, []);

  return (
    <div className="min-h-screen bg-[#F3F3F6]">
      <DashboardHeader userEmail={user?.email} />
      
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <button 
              onClick={() => router.push('/quotes/new/shipment')}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 text-sm"
            >
              <ChevronLeft className="w-4 h-4" />
              Back
            </button>
            
            <div className="text-sm text-gray-600">Step 2 of 5</div>
          </div>

          <div className="mb-8">
            <h1 className="text-xl font-bold text-gray-900 mb-2">Shipment Details</h1>
            
            {/* Progress Bar */}
            <div className="w-full bg-gray-200 rounded-full h-1.5 mb-1">
              <div className="bg-gradient-to-r from-[#0066FF] to-[#00A8FF] h-1.5 rounded-full w-2/5"></div>
            </div>
            <div className="flex justify-between text-xs text-gray-600">
              <span className="text-[#0066FF] font-medium">Cargo</span>
              <span className="font-medium text-[#0066FF]">Details</span>
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
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Shipment Value */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h2 className="font-bold text-gray-900">Shipment Value (USD)</h2>
                    <span className="text-sm text-gray-500">Required</span>
                  </div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-gray-500">$</span>
                    </div>
                    <input
                      type="number"
                      value={shipmentValue}
                      onChange={(e) => setShipmentValue(e.target.value)}
                      placeholder="Enter amount"
                      className="pl-8 w-full h-12 px-3 rounded-lg border border-gray-300 bg-white text-gray-900 focus:border-[#0066FF] focus:ring-2 focus:ring-blue-100 focus:outline-none"
                      required
                      min="0"
                      step="0.01"
                    />
                  </div>
                </div>

                {/* Route Information */}
                <div>
                  <h2 className="font-bold text-gray-900 mb-3">Route Information</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Origin Port
                      </label>
                      <LocationIQAutocomplete
                        value={origin}
                        onChange={setOrigin}
                        placeholder="Search origin port..."
                        label=""
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Destination Port
                      </label>
                      <LocationIQAutocomplete
                        value={destination}
                        onChange={setDestination}
                        placeholder="Search destination port..."
                        label=""
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Dates */}
                <div>
                  <h2 className="font-bold text-gray-900 mb-3">Coverage Period</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Start Date
                      </label>
                      <CustomDatePicker
                        value={startDate || today}
                        onChange={setStartDate}
                        placeholder="Select start date"
                        minDate={today}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        End Date
                      </label>
                      <CustomDatePicker
                        value={endDate || tomorrowFormatted}
                        onChange={setEndDate}
                        placeholder="Select end date"
                        minDate={startDate || today}
                      />
                    </div>
                  </div>
                </div>

                {/* Transport Mode */}
                <div>
                  <h2 className="font-bold text-gray-900 mb-3">Transport Mode</h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {transportModes.map((mode) => {
                      const isSelected = transportationMode === mode.id;
                      return (
                        <button
                          key={mode.id}
                          type="button"
                          onClick={() => setTransportationMode(mode.id)}
                          className={`
                            p-4 rounded-lg border transition-all
                            ${isSelected
                              ? 'border-2 border-blue-500 bg-blue-50'
                              : 'border-gray-300 hover:border-gray-400 bg-white'
                            }
                          `}
                        >
                          <div className="text-left">
                            <div className={`font-bold ${isSelected ? 'text-gray-900' : 'text-gray-800'}`}>
                              {mode.name}
                            </div>
                            <div className={`text-sm ${isSelected ? 'text-gray-700' : 'text-gray-600'}`}>
                              {mode.time}
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-between pt-6 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => router.push('/quotes/new/shipment')}
                    className="px-5 py-2.5 text-gray-600 hover:text-gray-900 font-medium"
                  >
                    Back
                  </button>
                  
                  <div className="flex items-center gap-4">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="px-6 py-2.5 rounded-lg font-semibold text-white bg-gradient-to-r from-[#0066FF] to-[#00A8FF] hover:from-[#0052CC] hover:to-[#0066FF] flex items-center gap-2"
                    >
                      {isSubmitting ? 'Processing...' : 'Continue to Coverage'}
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Premium Estimate Card */}
            {estimatedPremium && (
              <div className="border border-blue-200 bg-blue-50 rounded-xl p-4">
                <h3 className="font-bold text-gray-900 text-sm mb-2">Estimated Premium Range</h3>
                <div className="mb-2">
                  <div className="text-lg font-bold text-gray-900">
                    ${estimatedPremium.toFixed(2)}
                  </div>
                  <div className="text-xs text-gray-600">
                    Based on standard coverage
                  </div>
                </div>
                <div className="text-xs text-gray-600">
                  Final premium depends on selected coverage plan
                </div>
              </div>
            )}

            {/* Progress Card */}
            <div className="border border-[#d1d1d154] bg-[#fdfdf8cf] rounded-xl p-4">
              <h3 className="font-bold text-gray-900 text-sm mb-3">Progress</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-600">Fields Completed</span>
                  <span className="font-bold text-gray-900">
                    {[
                      shipmentValue,
                      origin,
                      destination,
                      startDate,
                      endDate,
                      transportationMode
                    ].filter(Boolean).length}/6
                  </span>
                </div>
              </div>
            </div>

            {/* Tips Card */}
            <div className="border border-[#d1d1d154] bg-[#fdfdf8cf] rounded-xl p-4">
              <h3 className="font-bold text-gray-900 text-sm mb-2">Tips</h3>
              <ul className="space-y-2 text-xs text-gray-600">
                <li>• Include all costs for complete coverage</li>
                <li>• Accurate dates ensure proper protection</li>
                <li>• Sea freight often has lower premiums</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}