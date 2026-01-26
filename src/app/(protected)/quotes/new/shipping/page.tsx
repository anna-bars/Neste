'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft, 
  Ship, 
  Plane, 
  Truck, 
  ChevronRight, 
  Info, 
  Calendar, 
  MapPin, 
  DollarSign, 
  Check, 
  Sparkles,
  TrendingUp,
  Shield,
  Clock,
  Zap,
  Save,
  AlertCircle
} from 'lucide-react';
import DashboardHeader from '@/app/components/dashboard/DashboardHeader';
import CustomDatePicker from './components/CustomDatePicker';
import LocationIQAutocomplete from './components/LocationIQAutocomplete';
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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const today = new Date().toISOString().split('T')[0];
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowFormatted = tomorrow.toISOString().split('T')[0];

  const transportModes = [
    { 
      id: 'sea', 
      name: 'Sea', 
      icon: Ship, 
      time: '20-40 days', 
      color: '#0066FF',
      hoverColor: '#0052CC',
      bgColor: 'bg-gradient-to-br from-blue-500 to-blue-600',
      lightBg: 'bg-blue-50',
      borderColor: 'border-blue-200',
      textColor: 'text-blue-700'
    },
    { 
      id: 'air', 
      name: 'Air', 
      icon: Plane, 
      time: '2-7 days', 
      color: '#7C3AED',
      hoverColor: '#6D28D9',
      bgColor: 'bg-gradient-to-br from-purple-500 to-purple-600',
      lightBg: 'bg-purple-50',
      borderColor: 'border-purple-200',
      textColor: 'text-purple-700'
    },
    { 
      id: 'road', 
      name: 'Road', 
      icon: Truck, 
      time: '3-10 days', 
      color: '#059669',
      hoverColor: '#047857',
      bgColor: 'bg-gradient-to-br from-emerald-500 to-emerald-600',
      lightBg: 'bg-emerald-50',
      borderColor: 'border-emerald-200',
      textColor: 'text-emerald-700'
    },
  ];

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
    }, 500);

    setIsSaving(true);
    return () => clearTimeout(timeoutId);
  }, [cargoType, otherCargoType, shipmentValue, startDate, endDate, transportationMode, origin, destination]);

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
      const premiumInput = {
        cargoType: cargoType === 'other' ? otherCargoType : cargoType,
        shipmentValue: parseFloat(shipmentValue),
        transportationMode,
        coverageType: 'premium',
        startDate,
        endDate
      };

      const premiumResult = PremiumCalculator.calculate(premiumInput);

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
        quote_expires_at: new Date(Date.now() + 72 * 60 * 60 * 1000).toISOString(),
        status: 'submitted' as const,
        payment_status: 'pending' as const
      };

      const quote = await quotes.create(quoteData);
      router.push(`/quotes/new/insurance?quote_id=${quote.id}`);

    } catch (error) {
      console.error('Error creating quote:', error);
      alert('Failed to create quote. Please try again.');
    } finally {
      setIsSubmitting(false);
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

  const steps = [
    { 
      number: 1, 
      label: 'Shipment', 
      active: true, 
      icon: Sparkles, 
      color: '#0066FF',
      gradient: 'from-[#0066FF] to-[#00A8FF]'
    },
    { 
      number: 2, 
      label: 'Coverage', 
      active: false, 
      icon: Shield, 
      color: '#7C3AED',
      gradient: 'from-[#7C3AED] to-[#A78BFA]'
    },
    { 
      number: 3, 
      label: 'Review', 
      active: false, 
      icon: Check, 
      color: '#059669',
      gradient: 'from-[#059669] to-[#10B981]'
    },
  ];

  return (
    <div className="min-h-screen bg-[#F3F3F6]">
      <DashboardHeader userEmail={user?.email} />
      
      <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Modern Header */}
        <div className="mb-10">
          <div className="flex items-center justify-between mb-6">
            <button 
              onClick={() => router.push('/quotes')}
              className="group flex items-center gap-2 text-gray-700 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              <span className="text-sm font-medium">Back to Dashboard</span>
            </button>
            
            <div className="flex items-center gap-2">
              {isSaving ? (
                <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-50 rounded-lg border border-amber-200">
                  <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></div>
                  <span className="text-sm text-amber-700 flex items-center gap-1">
                    <Save className="w-3 h-3" />
                    Saving...
                  </span>
                </div>
              ) : (
                <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 rounded-lg border border-emerald-200">
                  <Check className="w-3 h-3 text-emerald-600" />
                  <span className="text-sm text-emerald-700">All changes saved</span>
                </div>
              )}
            </div>
          </div>
          
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2.5 rounded-xl bg-gradient-to-r from-[#0066FF] to-[#00A8FF] shadow-lg shadow-blue-500/30">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Create New Quote</h1>
                <p className="text-gray-600 mt-1">Get an instant insurance quote for your shipment</p>
              </div>
            </div>
          </div>

         
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Form Card */}
          <div className="lg:col-span-2">
            <div 
              className="border border-[#d1d1d154] bg-[#fdfdf8cf] rounded-2xl p-6 hover:shadow-sm transition-shadow duration-300"
              style={{ backdropFilter: 'blur(10px)' }}
            >
              <div className="p-2">
                <form onSubmit={handleSubmit} className="space-y-8">
                  {/* Cargo Type Section */}
                  <div className="space-y-6">
                    <div>
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-1.5 h-8 bg-gradient-to-b from-[#0066FF] to-[#00A8FF] rounded-full"></div>
                        <div>
                          <h2 className="text-xl font-bold text-gray-900">Cargo Information</h2>
                          <p className="text-gray-600 mt-1">Select the type of goods for accurate pricing</p>
                        </div>
                      </div>
                      
                      <CargoTypeSelector 
                        cargoType={cargoType}
                        otherCargoType={otherCargoType}
                        onCargoTypeSelect={setCargoType}
                        onOtherCargoTypeChange={setOtherCargoType}
                      />
                    </div>
                  </div>

                  {/* Shipment Value */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h2 className="text-xl font-bold text-gray-900">Shipment Value</h2>
                        <p className="text-gray-600 mt-1">Total insured value including freight</p>
                      </div>
                      <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 rounded-lg border border-blue-200">
                        <DollarSign className="w-4 h-4 text-blue-600" />
                        <span className="text-sm font-semibold text-blue-700">USD</span>
                      </div>
                    </div>
                    
                    <div className="relative group">
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                          <DollarSign className="h-5 w-5 text-gray-500" />
                        </div>
                        <input
                          type="number"
                          value={shipmentValue}
                          onChange={(e) => setShipmentValue(e.target.value)}
                          placeholder="Enter amount"
                          className="pl-11 w-full h-14 px-4 rounded-xl border border-gray-300 bg-white text-gray-900 placeholder:text-gray-400 focus:border-[#0066FF] focus:ring-2 focus:ring-blue-100 focus:outline-none transition-all text-lg font-medium shadow-sm"
                          required
                          min="0"
                          step="0.01"
                        />
                        <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                          <span className="text-gray-500">.00</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Route Information */}
                  <div className="space-y-6">
                    <div>
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-1.5 h-8 bg-gradient-to-b from-[#7C3AED] to-[#A78BFA] rounded-full"></div>
                        <div>
                          <h2 className="text-xl font-bold text-gray-900">Route Information</h2>
                          <p className="text-gray-600 mt-1">Origin and destination locations</p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-3">
                          <label className="block text-sm font-medium text-gray-700">
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

                        <div className="space-y-3">
                          <label className="block text-sm font-medium text-gray-700">
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
                  </div>

                  {/* Dates */}
                  <div className="space-y-6">
                    <div>
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-1.5 h-8 bg-gradient-to-b from-[#059669] to-[#10B981] rounded-full"></div>
                        <div>
                          <h2 className="text-xl font-bold text-gray-900">Coverage Period</h2>
                          <p className="text-gray-600 mt-1">Insurance coverage start and end dates</p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-3">
                          <label className="block text-sm font-medium text-gray-700">
                            Start Date
                          </label>
                          <CustomDatePicker
                            value={startDate || today}
                            onChange={setStartDate}
                            placeholder="Select start date"
                            minDate={today}
                          />
                        </div>

                        <div className="space-y-3">
                          <label className="block text-sm font-medium text-gray-700">
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
                  </div>

                  {/* Transport Mode */}
                  <div className="space-y-6">
                    <div>
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-1.5 h-8 bg-gradient-to-b from-[#F59E0B] to-[#FBBF24] rounded-full"></div>
                        <div>
                          <h2 className="text-xl font-bold text-gray-900">Transport Mode</h2>
                          <p className="text-gray-600 mt-1">Choose your shipping method</p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {transportModes.map((mode) => {
                          const Icon = mode.icon;
                          const isSelected = transportationMode === mode.id;
                          
                          return (
                            <button
                              key={mode.id}
                              type="button"
                              onClick={() => setTransportationMode(mode.id)}
                              className={`
                                relative group p-5 rounded-xl border transition-all duration-300
                                ${isSelected
                                  ? `${mode.lightBg} border-2 ${mode.borderColor} shadow-sm`
                                  : 'border-gray-300 hover:border-gray-400 bg-white hover:bg-gray-50'
                                }
                                hover:scale-[1.02]
                              `}
                              style={isSelected ? {
                                boxShadow: `0 2px 8px 0 ${mode.color}20`
                              } : {}}
                            >
                              <div className="flex items-start gap-4">
                                <div 
                                  className={`
                                    p-3 rounded-lg flex items-center justify-center
                                    ${isSelected
                                      ? `${mode.lightBg}`
                                      : 'bg-gray-100 text-gray-600 group-hover:text-gray-900'
                                    }
                                  `}
                                  style={isSelected ? { color: mode.color } : {}}
                                >
                                  <Icon className="w-6 h-6" />
                                </div>
                                <div className="text-left flex-1">
                                  <div className={`font-bold text-lg ${isSelected ? 'text-gray-900' : 'text-gray-800'}`}>
                                    {mode.name}
                                  </div>
                                  <div className={`text-sm mt-1 ${isSelected ? 'text-gray-700' : 'text-gray-600'}`}>
                                    {mode.time}
                                  </div>
                                </div>
                                {isSelected && (
                                  <div className="absolute top-3 right-3">
                                    <div 
                                      className="w-6 h-6 rounded-full flex items-center justify-center shadow-sm"
                                      style={{ background: mode.color }}
                                    >
                                      <Check className="w-3 h-3 text-white" />
                                    </div>
                                  </div>
                                )}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="pt-8 border-t border-gray-200">
                    <div className="flex items-center justify-between">
                      <button
                        type="button"
                        onClick={() => router.push('/quotes')}
                        className="px-6 py-3 text-gray-600 hover:text-gray-900 font-medium text-sm transition-colors"
                      >
                        Cancel
                      </button>
                      
                      <div className="flex items-center gap-6">
                        <div className="text-sm text-gray-600">
                          <span className="font-semibold text-gray-900">{completedFields}</span> of {totalFields} fields
                        </div>
                        <button
                          type="submit"
                          disabled={!isFormComplete || isSubmitting}
                          className={`
                            group relative px-8 py-4 rounded-xl font-bold text-white text-sm
                            flex items-center gap-2
                            ${isFormComplete
                              ? 'bg-gradient-to-r from-[#0066FF] to-[#00A8FF] hover:from-[#0052CC] hover:to-[#0066FF] shadow-lg shadow-blue-500/30'
                              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            }
                            transition-all duration-300
                          `}
                        >
                          {isSubmitting ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                              Processing...
                            </>
                          ) : (
                            <>
                              Continue to Coverage
                              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Stats Card */}
            <div className="border border-[#d1d1d154] bg-[#fdfdf8cf] rounded-2xl p-6 hover:shadow-sm transition-shadow duration-300">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 rounded-lg bg-gradient-to-r from-blue-100 to-cyan-100 border border-blue-200">
                  <TrendingUp className="w-5 h-5 text-blue-600" />
                </div>
                <h3 className="font-bold text-gray-900">Quote Progress</h3>
              </div>
              
              <div className="space-y-6">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600">Completion</span>
                    <span className="text-sm font-bold text-gray-900">{completionPercentage}%</span>
                  </div>
                  <div className="relative h-2.5 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className="absolute inset-y-0 left-0 bg-gradient-to-r from-[#0066FF] to-[#00A8FF] rounded-full transition-all duration-500 shadow-sm"
                      style={{ width: `${completionPercentage}%` }}
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer"></div>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Fields Completed</span>
                    <span className="text-sm font-bold text-gray-900">{completedFields}/{totalFields}</span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 rounded-lg bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200">
                      <div className="text-xs text-gray-600 mb-1">Premium Range</div>
                      <div className="text-sm font-bold text-gray-900">0.5-2.5%</div>
                    </div>
                    <div className="p-3 rounded-lg bg-gradient-to-br from-emerald-50 to-emerald-100 border border-emerald-200">
                      <div className="text-xs text-gray-600 mb-1">Processing Time</div>
                      <div className="text-sm font-bold text-gray-900 flex items-center">
                        <Clock className="w-3 h-3 mr-1 text-gray-600" />
                        2 min
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Tips Card */}
            <div className="border border-blue-200 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-lg bg-gradient-to-r from-blue-100 to-cyan-100 border border-blue-200">
                  <Zap className="w-5 h-5 text-blue-600" />
                </div>
                <h3 className="font-bold text-gray-900">Pro Tips</h3>
              </div>
              
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-lg bg-blue-100 border border-blue-200 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                  </div>
                  <span className="text-sm text-gray-800 font-medium">
                    Include all costs for complete coverage protection
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-lg bg-cyan-100 border border-cyan-200 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <div className="w-2 h-2 rounded-full bg-cyan-500"></div>
                  </div>
                  <span className="text-sm text-gray-800 font-medium">
                    Sea freight saves up to 40% on insurance costs
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-lg bg-purple-100 border border-purple-200 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                  </div>
                  <span className="text-sm text-gray-800 font-medium">
                    Accurate classification can reduce premiums by 30%
                  </span>
                </li>
              </ul>
            </div>

            {/* Support Card */}
            <div className="border border-[#d1d1d154] bg-[#fdfdf8cf] rounded-2xl p-6 hover:shadow-sm transition-shadow duration-300">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-lg bg-emerald-50 border border-emerald-200">
                  <Shield className="w-5 h-5 text-emerald-600" />
                </div>
                <h3 className="font-bold text-gray-900">Need Help?</h3>
              </div>
              <p className="text-sm text-gray-600 mb-4">
                Our AI assistant can guide you through the quote process
              </p>
              <button className="w-full py-3 rounded-xl border-2 border-blue-200 bg-white text-blue-600 font-semibold text-sm hover:bg-blue-50 transition-all hover:border-blue-300">
                Chat with Assistant
              </button>
            </div>

            {/* Warning Card */}
            {!isFormComplete && (
              <div className="border border-amber-200 bg-gradient-to-br from-amber-50 to-yellow-50 rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 rounded-lg bg-amber-100 border border-amber-300">
                    <AlertCircle className="w-5 h-5 text-amber-600" />
                  </div>
                  <h3 className="font-bold text-gray-900">Required Fields</h3>
                </div>
                <p className="text-sm text-gray-700 mb-2 font-medium">
                  Complete all {totalFields - completedFields} remaining fields to continue:
                </p>
                <ul className="space-y-1 text-sm text-gray-600">
                  {!cargoType && <li className="flex items-center gap-2">• Select cargo type</li>}
                  {!shipmentValue && <li className="flex items-center gap-2">• Enter shipment value</li>}
                  {!origin && <li className="flex items-center gap-2">• Select origin port</li>}
                  {!destination && <li className="flex items-center gap-2">• Select destination port</li>}
                  {!startDate && <li className="flex items-center gap-2">• Select start date</li>}
                  {!endDate && <li className="flex items-center gap-2">• Select end date</li>}
                  {!transportationMode && <li className="flex items-center gap-2">• Choose transport mode</li>}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>

      <style jsx global>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .animate-shimmer {
          animation: shimmer 2s infinite;
        }
        
        .step-gradient-1 {
          background: linear-gradient(135deg, #0066FF, #00A8FF);
        }
        .step-gradient-2 {
          background: linear-gradient(135deg, #7C3AED, #A78BFA);
        }
        .step-gradient-3 {
          background: linear-gradient(135deg, #059669, #10B981);
        }
        
        .shadow-blue-500\/30 {
          box-shadow: 0 4px 14px 0 rgba(0, 102, 255, 0.3);
        }
      `}</style>
    </div>
  );
}