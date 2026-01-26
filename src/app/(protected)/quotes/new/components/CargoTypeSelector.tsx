'use client';

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
      iconColor: 'text-blue-600',
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      hoverBg: 'hover:bg-blue-100',
      riskColor: 'bg-amber-100 text-amber-800 border-amber-200'
    },
    { 
      value: 'clothing', 
      label: 'Apparel', 
      icon: Shirt,
      description: 'Clothing, textiles',
      risk: 'Low',
      iconColor: 'text-emerald-600',
      bg: 'bg-emerald-50',
      border: 'border-emerald-200',
      hoverBg: 'hover:bg-emerald-100',
      riskColor: 'bg-emerald-100 text-emerald-800 border-emerald-200'
    },
    { 
      value: 'machinery', 
      label: 'Machinery', 
      icon: Cog,
      description: 'Industrial equipment',
      risk: 'High',
      iconColor: 'text-rose-600',
      bg: 'bg-rose-50',
      border: 'border-rose-200',
      hoverBg: 'hover:bg-rose-100',
      riskColor: 'bg-rose-100 text-rose-800 border-rose-200'
    },
    { 
      value: 'food', 
      label: 'Food', 
      icon: Apple,
      description: 'Perishable goods',
      risk: 'Medium',
      iconColor: 'text-amber-600',
      bg: 'bg-amber-50',
      border: 'border-amber-200',
      hoverBg: 'hover:bg-amber-100',
      riskColor: 'bg-amber-100 text-amber-800 border-amber-200'
    },
    { 
      value: 'chemicals', 
      label: 'Chemicals', 
      icon: FlaskConical,
      description: 'Hazardous materials',
      risk: 'High',
      iconColor: 'text-purple-600',
      bg: 'bg-purple-50',
      border: 'border-purple-200',
      hoverBg: 'hover:bg-purple-100',
      riskColor: 'bg-purple-100 text-purple-800 border-purple-200'
    },
    { 
      value: 'pharma', 
      label: 'Pharma', 
      icon: Pill,
      description: 'Medical supplies',
      risk: 'Low',
      iconColor: 'text-teal-600',
      bg: 'bg-teal-50',
      border: 'border-teal-200',
      hoverBg: 'hover:bg-teal-100',
      riskColor: 'bg-teal-100 text-teal-800 border-teal-200'
    },
    { 
      value: 'other', 
      label: 'Custom', 
      icon: Box,
      description: 'Other cargo',
      risk: 'Variable',
      iconColor: 'text-gray-600',
      bg: 'bg-gray-50',
      border: 'border-gray-200',
      hoverBg: 'hover:bg-gray-100',
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
                relative group p-4 rounded-xl border transition-all duration-300
                ${isSelected
                  ? `${option.bg} ${option.border} shadow-md`
                  : `bg-white border-gray-200 ${option.hoverBg} hover:border-gray-300 shadow-sm`
                }
                ${isHovered && !isSelected ? 'scale-[1.02] shadow-sm' : ''}
              `}
            >
              <div className="relative z-10">
                {/* Icon Container */}
                <div 
                  className={`
                    w-14 h-14 rounded-xl flex items-center justify-center mb-3 mx-auto
                    ${isSelected
                      ? `${option.bg} ${option.border}`
                      : 'bg-white border border-gray-200 group-hover:border-gray-300'
                    }
                    transition-all
                  `}
                >
                  <Icon className={`w-6 h-6 ${option.iconColor}`} />
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
                  <div className="absolute -top-2 -right-2 z-20">
                    <div className="w-6 h-6 rounded-full flex items-center justify-center shadow-md bg-blue-600">
                      <Check className="w-3 h-3 text-white" />
                    </div>
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Selection Details */}
      {selectedOption && cargoType !== 'other' && (
        <div className={`p-4 rounded-xl ${selectedOption.bg} border ${selectedOption.border} shadow-sm`}>
          <div className="flex items-center gap-3 mb-3">
            <div className={`p-2 rounded-lg ${selectedOption.bg}`}>
              <selectedOption.icon className={`w-5 h-5 ${selectedOption.iconColor}`} />
            </div>
            <div>
              <div className="font-bold text-gray-900">{selectedOption.label} Selected</div>
              <div className="text-sm text-gray-700">Optimal coverage selected for this cargo type</div>
            </div>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-gray-600" />
              <span className="text-gray-800 font-medium">Risk: {selectedOption.risk}</span>
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
        <div className="p-4 rounded-xl bg-gray-50 border border-gray-300 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-gray-200">
              <Box className="w-5 h-5 text-gray-800" />
            </div>
            <div>
              <div className="font-bold text-gray-900">Custom Cargo Type</div>
              <div className="text-sm text-gray-700">Specify your unique cargo</div>
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
                className="w-full h-12 px-4 rounded-lg border-2 border-gray-300 bg-white text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 focus:outline-none text-sm font-medium"
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
    </div>
  );
};

export default CargoTypeSelector;