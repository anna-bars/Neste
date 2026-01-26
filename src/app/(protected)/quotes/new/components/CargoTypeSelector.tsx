import { Cpu, Shirt, Cog, Apple, FlaskConical, Pill, Box, Zap, AlertCircle, Check } from 'lucide-react';
import { useState } from 'react';

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
  const [hoveredType, setHoveredType] = useState<string | null>(null);

  const cargoOptions = [
    { 
      value: 'electronics', 
      label: 'Electronics', 
      icon: Cpu,
      description: 'Devices, computers',
      risk: 'Medium',
      color: '#0066FF',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      textColor: 'text-blue-700',
      riskColor: 'bg-yellow-100 text-yellow-800 border-yellow-200'
    },
    { 
      value: 'clothing', 
      label: 'Apparel', 
      icon: Shirt,
      description: 'Clothing, textiles',
      risk: 'Low',
      color: '#10B981',
      bgColor: 'bg-emerald-50',
      borderColor: 'border-emerald-200',
      textColor: 'text-emerald-700',
      riskColor: 'bg-emerald-100 text-emerald-800 border-emerald-200'
    },
    { 
      value: 'machinery', 
      label: 'Machinery', 
      icon: Cog,
      description: 'Industrial equipment',
      risk: 'High',
      color: '#DC2626',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
      textColor: 'text-red-700',
      riskColor: 'bg-red-100 text-red-800 border-red-200'
    },
    { 
      value: 'food', 
      label: 'Food', 
      icon: Apple,
      description: 'Perishable goods',
      risk: 'Medium',
      color: '#D97706',
      bgColor: 'bg-amber-50',
      borderColor: 'border-amber-200',
      textColor: 'text-amber-700',
      riskColor: 'bg-amber-100 text-amber-800 border-amber-200'
    },
    { 
      value: 'chemicals', 
      label: 'Chemicals', 
      icon: FlaskConical,
      description: 'Hazardous materials',
      risk: 'High',
      color: '#7C3AED',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200',
      textColor: 'text-purple-700',
      riskColor: 'bg-purple-100 text-purple-800 border-purple-200'
    },
    { 
      value: 'pharma', 
      label: 'Pharma', 
      icon: Pill,
      description: 'Medical supplies',
      risk: 'Low',
      color: '#059669',
      bgColor: 'bg-teal-50',
      borderColor: 'border-teal-200',
      textColor: 'text-teal-700',
      riskColor: 'bg-teal-100 text-teal-800 border-teal-200'
    },
    { 
      value: 'other', 
      label: 'Custom', 
      icon: Box,
      description: 'Other cargo',
      risk: 'Variable',
      color: '#6B7280',
      bgColor: 'bg-gray-50',
      borderColor: 'border-gray-200',
      textColor: 'text-gray-700',
      riskColor: 'bg-gray-100 text-gray-800 border-gray-200'
    },
  ];

  const selectedOption = cargoOptions.find(opt => opt.value === cargoType);

  return (
    <div className="space-y-6">
      {/* Cargo Selection Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {cargoOptions.map((option) => {
          const Icon = option.icon;
          const isSelected = cargoType === option.value;
          const isHovered = hoveredType === option.value;
          
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => onCargoTypeSelect(option.value)}
              onMouseEnter={() => setHoveredType(option.value)}
              onMouseLeave={() => setHoveredType(null)}
              className={`
                relative group p-4 rounded-xl border-2 transition-all duration-300
                ${isSelected
                  ? `${option.bgColor} ${option.borderColor} shadow-sm`
                  : 'border-gray-200 hover:border-gray-300 bg-white hover:bg-gray-50'
                }
                ${isHovered && !isSelected ? 'scale-[1.02]' : ''}
              `}
              style={isSelected ? {
                boxShadow: `0 2px 8px 0 ${option.color}20`
              } : {}}
            >
              <div className="relative z-10">
                {/* Icon */}
                <div 
                  className={`
                    w-12 h-12 rounded-xl flex items-center justify-center mb-3 mx-auto
                    ${isSelected
                      ? `${option.bgColor}`
                      : 'bg-gray-100 text-gray-600 group-hover:text-gray-900'
                    }
                    transition-colors
                  `}
                  style={isSelected ? { color: option.color } : {}}
                >
                  <Icon className="w-6 h-6" />
                </div>

                {/* Content */}
                <div className="text-center">
                  <h3 className={`
                    font-bold mb-1 text-sm
                    ${isSelected ? 'text-gray-900' : 'text-gray-800'}
                  `}>
                    {option.label}
                  </h3>
                  <p className={`
                    text-xs mb-2
                    ${isSelected ? 'text-gray-700' : 'text-gray-600'}
                  `}>
                    {option.description}
                  </p>
                  
                  {/* Risk Badge */}
                  <span className={`
                    inline-block px-2 py-1 rounded-lg text-xs font-semibold border
                    ${option.riskColor}
                  `}>
                    {option.risk}
                  </span>
                </div>

                {/* Selection Indicator */}
                {isSelected && (
                  <div className="absolute -top-2 -right-2">
                    <div 
                      className="w-6 h-6 rounded-full flex items-center justify-center shadow-sm"
                      style={{ background: option.color }}
                    >
                      <Check className="w-3 h-3 text-white" />
                    </div>
                  </div>
                )}

                {/* Hover Effect */}
                {isHovered && !isSelected && (
                  <div className="absolute inset-0 rounded-xl bg-gray-50/50"></div>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Selection Details */}
      {selectedOption && cargoType !== 'other' && (
        <div className={`p-5 rounded-xl ${selectedOption.bgColor} border-2 ${selectedOption.borderColor}`}>
          <div className="flex items-center gap-3 mb-3">
            <div 
              className="p-2.5 rounded-lg border"
              style={{ 
                background: selectedOption.color,
                borderColor: selectedOption.color 
              }}
            >
              <selectedOption.icon className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="font-bold text-gray-900">{selectedOption.label} Selected</div>
              <div className="text-sm text-gray-700 font-medium">Optimal coverage selected for this cargo type</div>
            </div>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-gray-600" />
              <span className="text-gray-800 font-medium">Risk Level: {selectedOption.risk}</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-gray-600" />
              <span className="text-gray-800 font-medium">Fast processing</span>
            </div>
          </div>
        </div>
      )}

      {/* Other Cargo Type Input */}
      {cargoType === 'other' && (
        <div className="p-5 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 border-2 border-gray-300">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2.5 rounded-lg bg-gray-200 border border-gray-300">
              <Box className="w-5 h-5 text-gray-800" />
            </div>
            <div>
              <div className="font-bold text-gray-900">Custom Cargo Type</div>
              <div className="text-sm text-gray-700 font-medium">Specify your unique cargo</div>
            </div>
          </div>
          
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cargo Description
              </label>
              <input
                type="text"
                value={otherCargoType}
                onChange={(e) => onOtherCargoTypeChange(e.target.value)}
                placeholder="e.g., Automotive parts, Artwork, Specialized equipment..."
                className="w-full h-12 px-4 rounded-lg border-2 border-gray-300 bg-white text-gray-900 placeholder:text-gray-400 focus:border-[#0066FF] focus:ring-2 focus:ring-blue-100 focus:outline-none text-sm font-medium"
                required
                maxLength={100}
              />
            </div>
            
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <AlertCircle className="w-4 h-4" />
              <span>Custom quotes processed within 1 business day</span>
            </div>
          </div>
        </div>
      )}

      {/* Hover Preview */}
      {hoveredType && hoveredType !== cargoType && (
        <div className="fixed bottom-4 right-4 p-4 rounded-xl bg-white border-2 border-gray-300 shadow-xl z-50 max-w-xs animate-in slide-in-from-bottom-5">
          <div className="flex items-center gap-3 mb-2">
            <div 
              className="p-2 rounded-lg border"
              style={{ 
                background: cargoOptions.find(opt => opt.value === hoveredType)?.color || '#6B7280',
                borderColor: cargoOptions.find(opt => opt.value === hoveredType)?.color || '#6B7280'
              }}
            >
              {(() => {
                const Icon = cargoOptions.find(opt => opt.value === hoveredType)?.icon;
                return Icon ? <Icon className="w-4 h-4 text-white" /> : null;
              })()}
            </div>
            <div>
              <div className="font-bold text-gray-900">
                {cargoOptions.find(opt => opt.value === hoveredType)?.label}
              </div>
              <div className="text-xs text-gray-600">
                {cargoOptions.find(opt => opt.value === hoveredType)?.description}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CargoTypeSelector;