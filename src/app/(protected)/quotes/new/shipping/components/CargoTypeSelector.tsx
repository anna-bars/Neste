import { Cpu, Shirt, Cog, Apple, FlaskConical, Pill, Box, ChevronRight, Info, X } from 'lucide-react';
import { useState, useEffect } from 'react';

interface CargoTypeSelectorProps {
  cargoType: string;
  otherCargoType: string;
  onCargoTypeSelect: (type: string) => void;
  onOtherCargoTypeChange: (value: string) => void;
}

const CargoTypeSelector: React.FC<CargoTypeSelectorProps> = ({
  cargoType,
  otherCargoType,
  onCargoTypeSelect,
  onOtherCargoTypeChange
}) => {
  const [showRiskInfo, setShowRiskInfo] = useState<boolean>(false);
  const [hasShownRiskInfo, setHasShownRiskInfo] = useState<boolean>(false);
  const [hoveredOption, setHoveredOption] = useState<string | null>(null);

  useEffect(() => {
    // Reset risk info when component mounts (optional)
    setHasShownRiskInfo(false);
  }, []);

  const cargoOptions = [
    { 
      value: 'electronics', 
      label: 'Electronics', 
      icon: Cpu,
      riskLevel: 'Medium',
      description: 'Computers, phones, devices',
      premiumMultiplier: 1.2,
      riskDetails: 'Sensitive to temperature changes and impact damage'
    },
    { 
      value: 'clothing', 
      label: 'Apparel', 
      icon: Shirt,
      riskLevel: 'Low',
      description: 'Clothing, textiles, fabrics',
      premiumMultiplier: 1.0,
      riskDetails: 'Generally low risk, except for high-value fashion items'
    },
    { 
      value: 'machinery', 
      label: 'Machinery', 
      icon: Cog,
      riskLevel: 'High',
      description: 'Industrial equipment',
      premiumMultiplier: 1.5,
      riskDetails: 'Heavy items prone to damage during handling'
    },
    { 
      value: 'food', 
      label: 'Food Products', 
      icon: Apple,
      riskLevel: 'Medium',
      description: 'Perishable goods',
      premiumMultiplier: 1.3,
      riskDetails: 'Requires temperature control and fast transit'
    },
    { 
      value: 'chemicals', 
      label: 'Chemicals', 
      icon: FlaskConical,
      riskLevel: 'High',
      description: 'Hazardous materials',
      premiumMultiplier: 2.0,
      riskDetails: 'Special handling requirements and regulations'
    },
    { 
      value: 'pharma', 
      label: 'Pharmaceuticals', 
      icon: Pill,
      riskLevel: 'Low',
      description: 'Medicines, medical supplies',
      premiumMultiplier: 1.1,
      riskDetails: 'Stringent temperature and handling requirements'
    },
    { 
      value: 'other', 
      label: 'Other Cargo', 
      icon: Box,
      riskLevel: 'Varies',
      description: 'Custom cargo type',
      premiumMultiplier: 1.0,
      riskDetails: 'Risk assessment required for custom cargo'
    },
  ];

  const handleCargoTypeSelect = (type: string) => {
    onCargoTypeSelect(type);
    if (type !== 'other') {
      onOtherCargoTypeChange('');
    }
  };

  const handleMouseEnter = (optionValue: string) => {
    setHoveredOption(optionValue);
    
    // Show risk info panel on first hover only
    if (!hasShownRiskInfo) {
      setShowRiskInfo(true);
    }
  };

  const handleMouseLeave = () => {
    setHoveredOption(null);
    // Don't hide the panel on mouse leave if it's already shown
  };

  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel.toLowerCase()) {
      case 'low': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'high': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRiskIconColor = (riskLevel: string) => {
    switch (riskLevel.toLowerCase()) {
      case 'low': return 'text-green-500';
      case 'medium': return 'text-yellow-500';
      case 'high': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-xl font-bold text-gray-900">Cargo Type</h2>
            <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-md">
              Required
            </span>
          </div>
          <p className="text-sm text-gray-600">
            Select the type of cargo you're shipping. This affects your coverage and premium.
          </p>
        </div>
        
        <div className="hidden lg:block">
          <button
            type="button"
            onClick={() => setShowRiskInfo(!showRiskInfo)}
            className="flex items-center gap-2 px-4 py-2 bg-gray-50 hover:bg-gray-100 rounded-lg border border-gray-200 transition-colors"
          >
            <Info className="w-4 h-4 text-gray-600" />
            <span className="text-sm font-medium text-gray-700">
              {showRiskInfo ? 'Hide Info' : 'Show Info'}
            </span>
          </button>
        </div>
      </div>

      {/* Risk Info Panel - Shows on first hover and stays visible */}
      {showRiskInfo && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200 p-4 animate-slideDown">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-6 h-6 rounded-lg bg-blue-100 flex items-center justify-center">
                  <Info className="w-3 h-3 text-blue-600" />
                </div>
                <h3 className="font-semibold text-gray-900">How Cargo Type Affects Your Quote</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Risk Levels & Premium Multipliers</h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-green-500"></div>
                        <span className="text-sm text-gray-700">Low Risk</span>
                      </div>
                      <span className="text-sm font-medium text-gray-900">1.0x - 1.1x</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                        <span className="text-sm text-gray-700">Medium Risk</span>
                      </div>
                      <span className="text-sm font-medium text-gray-900">1.2x - 1.3x</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-red-500"></div>
                        <span className="text-sm text-gray-700">High Risk</span>
                      </div>
                      <span className="text-sm font-medium text-gray-900">1.5x - 2.0x</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Current Hover</h4>
                  {hoveredOption && (() => {
                    const option = cargoOptions.find(opt => opt.value === hoveredOption);
                    return option ? (
                      <div className="p-3 bg-white/50 rounded-lg">
                        <div className="flex items-center gap-2 mb-1">
                          <div className={`w-6 h-6 rounded-md ${getRiskColor(option.riskLevel)} flex items-center justify-center`}>
                            <span className={`text-xs font-medium ${getRiskIconColor(option.riskLevel)}`}>
                              {option.riskLevel.charAt(0)}
                            </span>
                          </div>
                          <span className="font-medium text-gray-900">{option.label}</span>
                          <span className="text-sm text-gray-600">({option.premiumMultiplier}x)</span>
                        </div>
                        <p className="text-xs text-gray-600 mt-1">{option.riskDetails}</p>
                      </div>
                    ) : (
                      <div className="p-3 bg-white/50 rounded-lg">
                        <p className="text-sm text-gray-600">Hover over a cargo type to see details</p>
                      </div>
                    );
                  })()}
                  {!hoveredOption && (
                    <div className="p-3 bg-white/50 rounded-lg">
                      <p className="text-sm text-gray-600">Hover over a cargo type to see details</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <button
              onClick={() => {
                setShowRiskInfo(false);
                setHasShownRiskInfo(true); // Mark as shown even when manually closed
              }}
              className="ml-4 flex-shrink-0 w-8 h-8 rounded-lg hover:bg-white flex items-center justify-center transition-colors"
              aria-label="Close info panel"
            >
              <X className="w-4 h-4 text-gray-500 hover:text-gray-700" />
            </button>
          </div>
          
          {/* Instruction note */}
          <div className="mt-3 pt-3 border-t border-blue-200">
            <p className="text-xs text-blue-700 flex items-center gap-1">
              <Info className="w-3 h-3" />
              This panel will remain visible. Close it manually when done.
            </p>
          </div>
        </div>
      )}

      {/* Cargo Selection Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
        {cargoOptions.map((option) => {
          const Icon = option.icon;
          const isSelected = cargoType === option.value;
          const isHovered = hoveredOption === option.value;
          
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => handleCargoTypeSelect(option.value)}
              onMouseEnter={() => handleMouseEnter(option.value)}
              onMouseLeave={handleMouseLeave}
              className={`
                relative p-4 rounded-xl border transition-all duration-300
                ${isSelected
                  ? 'border-blue-500 bg-gradient-to-br from-blue-50 to-white shadow-lg shadow-blue-100'
                  : isHovered
                  ? 'border-blue-300 bg-gradient-to-br from-blue-25 to-white shadow-md'
                  : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-md'
                }
                group
              `}
            >
              {/* Selection Indicator */}
              {isSelected && (
                <div className="absolute -top-2 -right-2 z-10">
                  <div className="bg-blue-500 text-white text-xs font-medium px-3 py-1 rounded-full flex items-center gap-1 shadow-lg">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                    Selected
                  </div>
                </div>
              )}

              {/* Hover Indicator */}
              {isHovered && !isSelected && (
                <div className="absolute -top-2 -right-2 z-10">
                  <div className="bg-gray-600 text-white text-xs font-medium px-2 py-1 rounded-full">
                    Hovering
                  </div>
                </div>
              )}

              {/* Risk Level Badge */}
              <div className="absolute top-3 right-3">
                <span className={`text-xs font-medium px-2 py-1 rounded-full ${getRiskColor(option.riskLevel)}`}>
                  {option.riskLevel}
                </span>
              </div>

              {/* Icon Container */}
              <div className={`
                w-14 h-14 rounded-xl flex items-center justify-center mb-3
                ${isSelected
                  ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg'
                  : isHovered
                  ? 'bg-gradient-to-br from-blue-400 to-blue-500 text-white'
                  : 'bg-gray-50 group-hover:bg-gray-100 text-gray-600'
                }
                transition-all duration-300
              `}>
                <Icon className="w-7 h-7" />
              </div>

              {/* Content */}
              <div className="text-left">
                <h3 className={`font-semibold mb-1 ${
                  isSelected ? 'text-gray-900' : 
                  isHovered ? 'text-blue-700' : 
                  'text-gray-800'
                }`}>
                  {option.label}
                </h3>
                <p className="text-xs text-gray-500 mb-2">{option.description}</p>
                
                {/* Premium Info */}
                <div className="flex items-center justify-between mt-4">
                  <div className={`text-xs ${
                    isSelected ? 'text-blue-600 font-medium' : 
                    isHovered ? 'text-blue-500' : 
                    'text-gray-500'
                  }`}>
                    Premium: {option.premiumMultiplier}x
                  </div>
                  <ChevronRight className={`w-4 h-4 ${
                    isSelected ? 'text-blue-500' : 
                    isHovered ? 'text-blue-400' : 
                    'text-gray-400'
                  }`} />
                </div>
              </div>

              {/* Hover Effect Border */}
              <div className={`
                absolute inset-0 rounded-xl border-2 pointer-events-none
                ${isSelected ? 'border-blue-400' : 
                 isHovered ? 'border-blue-200' : 
                 'border-transparent group-hover:border-gray-300'}
                transition-all duration-300
              `} />
            </button>
          );
        })}
      </div>

      {/* Other Cargo Type Input */}
      {cargoType === 'other' && (
        <div className="mt-6 animate-fadeIn">
          <div className="bg-gradient-to-r from-gray-50 to-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
                <Box className="w-5 h-5 text-gray-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Custom Cargo Type</h3>
                <p className="text-sm text-gray-600">Tell us about your specific cargo</p>
              </div>
            </div>
            
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cargo Description *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={otherCargoType}
                    onChange={(e) => onOtherCargoTypeChange(e.target.value)}
                    placeholder="e.g., Automotive parts, Artwork, Machinery components..."
                    className="w-full h-12 pl-4 pr-10 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 focus:outline-none transition-all placeholder-gray-400"
                    required
                    maxLength={100}
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                    <Box className="h-5 w-5 text-gray-400" />
                  </div>
                </div>
                <div className="flex items-center justify-between mt-2">
                  <p className="text-xs text-gray-500">
                    Please provide detailed description for accurate coverage
                  </p>
                  <span className="text-xs text-gray-400">
                    {otherCargoType.length}/100
                  </span>
                </div>
              </div>
              
              <div className="pt-4 border-t border-gray-200">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Info className="w-4 h-4" />
                  <span>Our team will review and provide a custom quote within 2 hours</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Selected Cargo Preview */}
      {cargoType && cargoType !== 'other' && (
        <div className="mt-6 animate-fadeIn">
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                  {(() => {
                    const Icon = cargoOptions.find(opt => opt.value === cargoType)?.icon;
                    return Icon ? <Icon className="w-5 h-5 text-green-600" /> : null;
                  })()}
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">
                    {cargoOptions.find(opt => opt.value === cargoType)?.label} Selected
                  </h4>
                  <p className="text-sm text-gray-600">
                    Premium adjusted based on risk level
                  </p>
                </div>
              </div>
              <span className={`text-sm font-medium px-3 py-1 rounded-full ${
                getRiskColor(cargoOptions.find(opt => opt.value === cargoType)?.riskLevel || '')
              }`}>
                {cargoOptions.find(opt => opt.value === cargoType)?.riskLevel} Risk
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Show risk info prompt if not yet shown */}
      {!showRiskInfo && !hasShownRiskInfo && (
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center gap-2">
            <Info className="w-4 h-4 text-blue-600" />
            <p className="text-sm text-blue-700">
              <span className="font-medium">Tip:</span> Hover over any cargo type to see how it affects your premium
            </p>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
            max-height: 0;
          }
          to {
            opacity: 1;
            transform: translateY(0);
            max-height: 500px;
          }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
        
        .animate-slideDown {
          animation: slideDown 0.3s ease-out;
          overflow: hidden;
        }
        
        .bg-blue-25 {
          background-color: rgba(59, 130, 246, 0.05);
        }
      `}</style>
    </div>
  );
};

export default CargoTypeSelector;