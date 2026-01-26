'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft, 
  ChevronRight,
  ChevronLeft,
  DollarSign,
  MapPin,
  Calendar,
  Truck,
  Sparkles,
  Lightbulb,
  AlertCircle,
  HelpCircle,
  CheckCircle2,
  Zap
} from 'lucide-react';
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
  const [stepComplete, setStepComplete] = useState(false);

  const today = new Date().toISOString().split('T')[0];
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowFormatted = tomorrow.toISOString().split('T')[0];

  const transportModes = [
    { 
      id: 'sea', 
      name: 'Sea Freight', 
      time: '20-40 days', 
      color: '#0066FF',
      icon: '🛳️',
      description: 'Most economical',
      risk: 'Medium',
      riskColor: 'bg-amber-100 text-amber-800 border-amber-200'
    },
    { 
      id: 'air', 
      name: 'Air Freight', 
      time: '2-7 days', 
      color: '#7C3AED',
      icon: '✈️',
      description: 'Fast & secure',
      risk: 'Low',
      riskColor: 'bg-emerald-100 text-emerald-800 border-emerald-200'
    },
    { 
      id: 'road', 
      name: 'Road Freight', 
      time: '3-10 days', 
      color: '#059669',
      icon: '🚚',
      description: 'Regional transport',
      risk: 'Medium',
      riskColor: 'bg-amber-100 text-amber-800 border-amber-200'
    },
  ];

  // Check if step is complete
  useEffect(() => {
    const isComplete = shipmentValue && origin && destination && startDate && endDate && transportationMode;
    setStepComplete(!!isComplete);
  }, [shipmentValue, origin, destination, startDate, endDate, transportationMode]);

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
            coverageType: 'standard',
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
    <div className="min-h-screen bg-[#F3F3F6] text-gray-900">
      <DashboardHeader userEmail={user?.email}/>
      
      <div className="relative max-w-[88%] mx-auto pt-2 pb-4 py-8">
        {/* Modern Header */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-0">
            <button 
              onClick={() => router.push('/quotes/new/shipment')}
              className="group flex items-center gap-3 text-gray-600 hover:text-gray-900 transition-all duration-300"
            >
              <div className="p-2 rounded-xl bg-white border border-gray-200 shadow-sm group-hover:border-gray-300 group-hover:shadow transition-all">
                <ArrowLeft className="w-4 h-4" />
              </div>
              <span className="text-sm font-medium">
                Back to Cargo Selection
              </span>
            </button>
            
            {/* Modern Progress Indicator */}
            <div className="flex items-center gap-4">
              <div className="text-sm font-mono text-gray-500">02/05</div>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <div className="w-10 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className={`h-full bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full transition-all duration-700 ${
                        stepComplete ? 'w-full' : 'w-1/2'
                      }`}
                    ></div>
                  </div>
                  <div className="absolute -top-1.5 left-1/2 transform -translate-x-1/2 w-3 h-3 rounded-full bg-blue-500 border-2 border-white"></div>
                </div>
                <Sparkles className="w-4 h-4 text-blue-500" />
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* Left Side - Main Form (80%) */}
          <div className="lg:col-span-9 order-2 lg:order-1">
            <div className="relative group">
              <div className="relative border border-[#d1d1d154] bg-[#FDFEFF] rounded-2xl shadow-sm overflow-hidden">
                {/* Card Header */}
                <div className="p-8 border-b border-gray-100">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-4 mb-3">
                        <div className="p-3 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 shadow-lg">
                          <MapPin className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h2 className="text-2xl font-bold text-gray-900">Shipment Details</h2>
                          <p className="text-gray-600 text-sm mt-1">
                            Provide your shipment specifications
                          </p>
                        </div>
                      </div>
                      
                      {/* AI Badge */}
                      <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-blue-50 to-cyan-50 border border-cyan-200">
                        <Sparkles className="w-3 h-3 text-cyan-600" />
                        <span className="text-xs font-medium text-cyan-700">Real-time Premium Calculation</span>
                      </div>
                    </div>
                    
                    {/* Step Indicator */}
                    <div className="hidden lg:block">
                      <div className="text-xs font-mono text-gray-500 mb-1">STEP 02</div>
                      <div className="text-sm font-bold text-gray-900 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-200">
                        Shipment Details
                      </div>
                    </div>
                  </div>
                </div>

                {/* Form Content */}
                <div className="p-8">
                  <form onSubmit={handleSubmit} className="space-y-8">
                    {/* Shipment Value */}
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-gradient-to-br from-green-50 to-emerald-50 border border-emerald-200">
                            <DollarSign className="w-4 h-4 text-emerald-600" />
                          </div>
                          <div>
                            <h3 className="font-bold text-gray-900">Shipment Value (USD)</h3>
                            <p className="text-sm text-gray-600">Total declared value of goods</p>
                          </div>
                        </div>
                        <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2.5 py-1 rounded-full">Required</span>
                      </div>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                          <span className="text-gray-500 text-lg font-medium">$</span>
                        </div>
                        <input
                          type="number"
                          value={shipmentValue}
                          onChange={(e) => setShipmentValue(e.target.value)}
                          placeholder="Enter amount"
                          className="pl-12 w-full h-14 px-4 rounded-xl border-2 border-gray-300 bg-white text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 focus:outline-none text-base font-medium shadow-sm"
                          required
                          min="150"
                          step="10"  
                        />
                      </div>
                    </div>

                    {/* Route Information */}
                    <div>
                      <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 rounded-lg bg-gradient-to-br from-blue-50 to-cyan-50 border border-cyan-200">
                          <MapPin className="w-4 h-4 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="font-bold text-gray-900">Route Information</h3>
                          <p className="text-sm text-gray-600">Origin and destination ports</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Origin Port <span className="text-red-500">*</span>
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
                            Destination Port <span className="text-red-500">*</span>
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

                    {/* Coverage Period */}
                    <div>
                      <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 rounded-lg bg-gradient-to-br from-purple-50 to-violet-50 border border-violet-200">
                          <Calendar className="w-4 h-4 text-purple-600" />
                        </div>
                        <div>
                          <h3 className="font-bold text-gray-900">Coverage Period</h3>
                          <p className="text-sm text-gray-600">Insurance start and end dates</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Start Date <span className="text-red-500">*</span>
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
                            End Date <span className="text-red-500">*</span>
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
                      <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 rounded-lg bg-gradient-to-br from-amber-50 to-orange-50 border border-orange-200">
                          <Truck className="w-4 h-4 text-amber-600" />
                        </div>
                        <div>
                          <h3 className="font-bold text-gray-900">Transport Mode</h3>
                          <p className="text-sm text-gray-600">Select shipping method</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {transportModes.map((mode) => {
                          const isSelected = transportationMode === mode.id;
                          return (
                            <button
                              key={mode.id}
                              type="button"
                              onClick={() => setTransportationMode(mode.id)}
                              className={`
                                relative group/transport p-5 rounded-xl border-2 transition-all duration-300
                                ${isSelected
                                  ? 'border-blue-500 bg-blue-50 shadow-md'
                                  : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
                                }
                                ${isSelected ? 'scale-[1.02]' : ''}
                              `}
                            >
                              <div className="text-left">
                                <div className="flex items-center justify-between mb-3">
                                  <span className="text-2xl">{mode.icon}</span>
                                  {isSelected && (
                                    <CheckCircle2 className="w-5 h-5 text-blue-600" />
                                  )}
                                </div>
                                <div className="mb-2">
                                  <div className={`font-bold text-lg ${isSelected ? 'text-gray-900' : 'text-gray-800'}`}>
                                    {mode.name}
                                  </div>
                                  <div className={`text-sm ${isSelected ? 'text-gray-700' : 'text-gray-600'}`}>
                                    {mode.description}
                                  </div>
                                </div>
                                <div className="flex items-center justify-between">
                                  <div className="text-sm font-medium text-gray-700">
                                    {mode.time}
                                  </div>
                                  <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold border ${mode.riskColor}`}>
                                    {mode.risk}
                                  </span>
                                </div>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="mt-12 pt-8 border-t border-gray-100 flex justify-between items-center">
                      <button
                        type="button"
                        onClick={() => router.push('/quotes/new/shipment')}
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
                              <span className="text-lg">Continue to Coverage</span>
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
            {/* Premium Estimate Card */}
            {estimatedPremium && (
              <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl border border-blue-200 shadow-lg p-6">
                <div className="flex items-center gap-3 mb-5">
                  <div className="p-2.5 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500">
                    <DollarSign className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="font-bold text-gray-900 text-base">Premium Estimate</h3>
                </div>
                
                <div className="mb-4">
                  <div className="text-2xl font-bold text-gray-900 mb-1">
                    ${estimatedPremium.toFixed(2)}
                  </div>
                  <div className="text-xs text-gray-600">
                    Based on current selections
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Coverage Type</span>
                    <span className="font-medium text-gray-900">Standard</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Real-time</span>
                    <span className="font-medium text-green-600">✓</span>
                  </div>
                </div>
                
                <div className="mt-4 pt-4 border-t border-blue-200">
                  <div className="text-xs text-gray-600">
                    Final premium adjusts with coverage plan selection
                  </div>
                </div>
              </div>
            )}

            {/* Why It Matters */}
            <div className="border border-[#d1d1d154] bg-[#FDFEFF] rounded-2xl shadow-sm p-6">
              <div className="flex items-center gap-3 mb-5">
                <div className="p-2.5 rounded-xl bg-gradient-to-br from-blue-50 to-cyan-50">
                  <Lightbulb className="w-5 h-5 text-blue-600" />
                </div>
                <h3 className="font-bold text-gray-900 text-base">Why Details Matter</h3>
              </div>
              
              <div className="space-y-4">
                {[
                  {
                    icon: DollarSign,
                    title: 'Accurate Valuation',
                    desc: 'Prevents under/over insurance',
                    color: 'text-emerald-600',
                    bg: 'bg-emerald-50'
                  },
                  {
                    icon: MapPin,
                    title: 'Route Precision',
                    desc: 'Affects risk assessment',
                    color: 'text-blue-600',
                    bg: 'bg-blue-50'
                  },
                  {
                    icon: Calendar,
                    title: 'Date Accuracy',
                    desc: 'Ensures full coverage period',
                    color: 'text-purple-600',
                    bg: 'bg-purple-50'
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
                  'Include all costs for complete coverage',
                  'Accurate dates ensure proper protection',
                  'Sea freight often has lower premiums'
                ].map((tip, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-gray-700">{tip}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Progress */}
            <div className="border border-[#d1d1d154] bg-[#FDFEFF] rounded-2xl shadow-sm p-6">
              <div className="flex items-center gap-3 mb-5">
                <Zap className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-gray-900 text-base">Progress</h3>
              </div>
              
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600">Fields Completed</span>
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
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-blue-500 to-cyan-500 h-2 rounded-full transition-all duration-500"
                      style={{ 
                        width: `${([shipmentValue, origin, destination, startDate, endDate, transportationMode].filter(Boolean).length / 6) * 100}%` 
                      }}
                    ></div>
                  </div>
                </div>
                
                <div className="text-xs text-gray-600">
                  Complete all fields for accurate premium calculation
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
                  Our team is here to assist with shipment details
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
            <span>Press <kbd className="px-2 py-1 mx-1 rounded bg-gray-100 border border-gray-300">Tab</kbd> to navigate between fields</span>
          </div>
        </div>
      </div>
    </div>
  );
}