'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, AlertCircle, CheckCircle, Ship, Plane, Truck } from 'lucide-react';
import DashboardHeader from '@/app/components/dashboard/DashboardHeader';
import CustomDatePicker from './components/CustomDatePicker';
import LocationIQAutocomplete from './components/LocationIQAutocomplete';
import MobileTipsCard from './components/MobileTipsCard';
import CargoTypeSelector from './components/CargoTypeSelector';
import { useUser } from '@/app/context/UserContext';
import { PremiumCalculator } from '@/lib/services/premiumCalculator';
import { quotes } from '@/lib/supabase/quotes';

export default function ShippingValuePage() {
  const router = useRouter();
  const { user } = useUser();
  
  const [cargoType, setCargoType] = useState('');
  const [shipmentValue, setShipmentValue] = useState('');
  const [origin, setOrigin] = useState<any>(null);
  const [destination, setDestination] = useState<any>(null);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [transportationMode, setTransportationMode] = useState('');
  const [otherCargoType, setOtherCargoType] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const today = new Date().toISOString().split('T')[0];
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowFormatted = tomorrow.toISOString().split('T')[0];

  // Calculate quote expiration (72 hours from now)
  const calculateExpirationDate = () => {
    const expiration = new Date();
    expiration.setHours(expiration.getHours() + 72);
    return expiration.toISOString();
  };

  const transportModes = [
    { id: 'sea', name: 'Sea Freight', icon: Ship, description: '20-40 days' },
    { id: 'air', name: 'Air Freight', icon: Plane, description: '2-7 days' },
    { id: 'road', name: 'Road Freight', icon: Truck, description: '3-10 days' },
  ];

  // Load draft from localStorage
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const loadDraftFromLocalStorage = () => {
      try {
        const draftData = localStorage.getItem('quote_draft');
        if (draftData) {
          const draft = JSON.parse(draftData);
          setCargoType(draft.cargoType || '');
          setOtherCargoType(draft.otherCargoType || '');
          setShipmentValue(draft.shipmentValue || '');
          setStartDate(draft.startDate || today);
          setEndDate(draft.endDate || tomorrowFormatted);
          setTransportationMode(draft.transportationMode || '');
          setOrigin(draft.origin || null);
          setDestination(draft.destination || null);
        } else {
          setStartDate(today);
          setEndDate(tomorrowFormatted);
        }
      } catch (error) {
        console.error('Error loading draft:', error);
        setStartDate(today);
        setEndDate(tomorrowFormatted);
      }
    };

    loadDraftFromLocalStorage();
  }, []);

  // Auto-save to localStorage
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const timeoutId = setTimeout(() => {
      const draftData = {
        cargoType,
        otherCargoType,
        shipmentValue,
        startDate,
        endDate,
        transportationMode,
        origin,
        destination,
        lastSaved: new Date().toISOString()
      };
      
      localStorage.setItem('quote_draft', JSON.stringify(draftData));
      setIsSaving(false);
    }, 1000);

    setIsSaving(true);

    return () => clearTimeout(timeoutId);
  }, [cargoType, otherCargoType, shipmentValue, startDate, endDate, transportationMode, origin, destination]);

// Shipping page-ում handleSubmit ֆունկցիայում
// Shipping page-ում handleSubmit ֆունկցիայի մեջ
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  
  if (!isFormComplete) {
    alert('Please complete all required fields');
    return;
  }

  if (!user) {
    alert('Please login to create a quote');
    router.push('/login');
    return;
  }

  setIsSubmitting(true);

  try {
    // Prepare data for premium calculation
    const premiumInput = {
      cargoType: cargoType === 'other' ? otherCargoType : cargoType,
      shipmentValue: parseFloat(shipmentValue),
      transportationMode,
      coverageType: 'premium', // Default to premium for calculation
      startDate,
      endDate
    };

    // Calculate premium
    const premiumResult = PremiumCalculator.calculate(premiumInput);

    // Create quote in database with correct type
    const quoteData = {
      user_id: user.id,
      cargo_type: premiumInput.cargoType,
      shipment_value: premiumInput.shipmentValue,
      origin: origin || {},
      destination: destination || {},
      start_date: startDate,
      end_date: endDate,
      transportation_mode: transportationMode as 'sea' | 'air' | 'road',
      selected_coverage: 'premium' as 'premium',
      calculated_premium: premiumResult.basePremium,
      deductible: premiumResult.deductible,
      quote_expires_at: calculateExpirationDate(),
      // ✅ Օգտագործել correct status type
      status: 'submitted' as const, // Use 'as const' for literal type
      payment_status: 'pending' as const
    };

    const quote = await quotes.create(quoteData);

    // Navigate to insurance page with quote ID
    router.push(`/quotes/new/insurance?quote_id=${quote.id}`);

  } catch (error) {
    console.error('Error creating quote:', error);
    alert('Failed to create quote. Please try again.');
  } finally {
    setIsSubmitting(false);
  }
};
  const handleCancel = () => {
    if (window.confirm('Are you sure you want to cancel? All entered data will be lost.')) {
      localStorage.removeItem('quote_draft');
      router.push('/quotes');
    }
  };

  const completedFields = [
    cargoType === 'other' ? !!otherCargoType : !!cargoType,
    !!shipmentValue,
    !!origin,
    !!destination,
    !!startDate,
    !!endDate,
    !!transportationMode
  ].filter(Boolean).length;

  const totalFields = 7;
  const completionPercentage = Math.round((completedFields / totalFields) * 100);
  const isFormComplete = completedFields === totalFields;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <DashboardHeader userEmail={user?.email} />
      
      <div className="max-w-[100%] mx-auto px-4 sm:px-6 lg:px-8 pb-6 md:pb-8">
        {/* Header */}
        <div className="hidden md:block mb-8">
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
            <button 
              onClick={() => router.push('/quotes')}
              className="flex items-center gap-2 hover:text-gray-700 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Quotes</span>
            </button>
            <span>/</span>
            <span className="text-gray-900 font-medium">New Quote</span>
          </div>
        </div>
        
        <div className="flex items-center gap-3 mt-0 mb-2 sm:mt-0">
          <img
            src="/quotes/header-ic.svg"
            alt=""
            className="w-[22px] h-[22px] sm:w-6 sm:h-6"
          />
          <h2 className="font-normal text-[18px] sm:text-[26px]">Shipment Insurance Quote</h2>
          {isSaving && (
            <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
              Saving...
            </span>
          )}
        </div> 

        <MobileTipsCard completionPercentage={completionPercentage} />
        
        <div className="grid grid-cols-1 lg:grid-cols-[2fr_0.02fr_0.7fr]">
          <div className="lg:col-span-2 w-full lg:w-[99%]">
            <div className="bg-[#FFFFFE] rounded-2xl shadow-lg border border-gray-200 p-4 md:p-8">
              <form onSubmit={handleSubmit} className="space-y-6 md:space-y-8">
                <CargoTypeSelector 
                  cargoType={cargoType}
                  otherCargoType={otherCargoType}
                  onCargoTypeSelect={setCargoType}
                  onOtherCargoTypeChange={setOtherCargoType}
                />

                {/* Shipment Value */}
                <div>
                  <label className="block text-sm font-medium text-[#868686] mb-2">
                    Shipment Value (USD) *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-gray-400">$</span>
                    </div>
                    <input
                      type="number"
                      value={shipmentValue}
                      onChange={(e) => setShipmentValue(e.target.value)}
                      placeholder="Enter total value"
                      className="pl-10 w-full h-12 px-4 rounded-xl border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none transition-colors text-sm md:text-base"
                      required
                      min="0"
                      step="0.01"
                    />
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                      <span className="text-gray-500 text-sm">USD</span>
                    </div>
                  </div>
                </div>

                {/* Route Information */}
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <h2 className="text-lg font-semibold text-gray-900">Route Information</h2>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                    <LocationIQAutocomplete
                      value={origin}
                      onChange={setOrigin}
                      placeholder="Search location..."
                      label="Origin *"
                      required
                    />

                    <LocationIQAutocomplete
                      value={destination}
                      onChange={setDestination}
                      placeholder="Search location..."
                      label="Destination *"
                      required
                    />
                  </div>
                </div>

                {/* Dates & Transport */}
                <div className="space-y-6 md:space-y-8">
                  <div>
                    <div className="flex items-center gap-2 mb-4">
                      <h2 className="text-lg font-semibold text-gray-900">Coverage Period</h2>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row sm:justify-between gap-4">
                      <div className='w-full sm:w-[49%]'>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Start Date *
                        </label>
                        <CustomDatePicker
                          value={startDate || today}
                          onChange={setStartDate}
                          placeholder="Start date"
                          minDate={today}
                        />
                      </div>

                      <div className='w-full sm:w-[49%]'>
                        <label className="block text-sm font-medium text-[#868686] mb-2">
                          End Date *
                        </label>
                        <CustomDatePicker
                          value={endDate || tomorrowFormatted}
                          onChange={setEndDate}
                          placeholder="End date"
                          minDate={startDate || today}
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center gap-2 mb-4">
                      <h2 className="text-lg font-semibold text-gray-900">Transport Mode *</h2>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row sm:justify-between gap-3">
                      {transportModes.map((mode) => {
                        const Icon = mode.icon;
                        
                        return (
                          <button
                            key={mode.id}
                            type="button"
                            onClick={() => setTransportationMode(mode.id)}
                            className={`
                              w-full sm:w-[32.7%] relative p-4 rounded-xl border-2 transition-all duration-200
                              flex flex-col items-center gap-3 md:gap-4
                              ${transportationMode === mode.id
                                ? 'border-blue-500 bg-blue-50'
                                : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                              }
                            `}
                          >
                            <div className={`
                              p-3 rounded-lg flex items-center justify-center
                              ${transportationMode === mode.id
                                ? `bg-blue-100 text-blue-600`
                                : 'bg-gray-100 text-gray-500'
                              }
                            `}>
                              <Icon className="w-5 h-5" />
                            </div>
                            <div className="flex-1 text-center">
                              <div className="font-medium text-gray-900 text-sm md:text-base">{mode.name}</div>
                              <div className="text-xs md:text-sm text-gray-500">
                                {mode.description}
                              </div>
                            </div>
                            {transportationMode === mode.id && (
                              <div className="w-5 h-5 absolute top-2 right-2 rounded-full bg-blue-500 flex items-center justify-center">
                                <CheckCircle className="w-3 h-3 text-white" />
                              </div>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col-reverse sm:flex-row items-center justify-between pt-6 border-t border-gray-200 gap-4">
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="w-full sm:w-auto px-6 py-3 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors font-medium text-sm md:text-base"
                  >
                    Cancel
                  </button>
                  
                  <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
                    <button
                      type="button"
                      onClick={() => router.push('/quotes')}
                      className="w-full sm:w-auto px-6 py-3 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors font-medium text-sm md:text-base order-2 sm:order-1"
                    >
                      Previous
                    </button>
                    <button
                      type="submit"
                      disabled={!isFormComplete || isSubmitting}
                      className="w-full sm:w-auto px-8 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 text-white font-medium hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl text-sm md:text-base order-1 sm:order-2"
                    >
                      {isSubmitting ? (
                        <>
                          <span className="animate-spin inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"></span>
                          Creating Quote...
                        </>
                      ) : (
                        'Continue to Coverage Options'
                      )}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>

          {/* Right Column - Tips & Help */}
          <div className="hidden lg:block space-y-6">
            <div className="bg-[url('/quotes/new/shipping-wd-back.png')] bg-cover flex flex-col gap-8 rounded-2xl shadow-lg p-6 text-white">
              <div className="flex items-center gap-2 mb-4">
                <h3 className="text-lg font-semibold">Smart Quote Tips</h3>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="w-3 h-3" />
                  </div>
                  <p className="text-sm leading-relaxed">
                    <span className="font-semibold">Full Coverage:</span> Include all freight charges and duties in shipment value for complete protection.
                  </p>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="w-3 h-3" />
                  </div>
                  <p className="text-sm leading-relaxed">
                    <span className="font-semibold">Lower Premiums:</span> Accurate cargo classification can reduce premiums by up to 30%.
                  </p>
                </div>

                <div>
                  <div className="pt-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-600 text-white">Progress</span>
                      <span className="text-sm font-semibold text-white">
                        {completedFields} of {totalFields}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div 
                        className="bg-white h-3 rounded-full transition-all duration-300"
                        style={{ width: `${completionPercentage}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
              <div className="flex items-center gap-2 mb-3">
                <AlertCircle className="w-5 h-5 text-amber-500" />
                <h3 className="text-lg font-semibold text-gray-900">Need Help?</h3>
              </div>
              <p className="text-sm text-gray-600 mb-4">
                Our team is here to assist you with any questions about your shipment insurance.
              </p>
              <button className="w-full py-3 rounded-xl border-2 border-blue-600 text-blue-600 font-medium hover:bg-blue-50 transition-colors">
                Contact Support
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}