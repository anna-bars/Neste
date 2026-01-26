'use client';

import { Cpu, Shirt, Cog, Apple, FlaskConical, Pill, Box, Zap, AlertCircle, Check, Sparkles } from 'lucide-react';
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
      bg: 'bg-gradient-to-br from-blue-50 to-blue-100',
      border: 'border-blue-200',
      riskColor: 'bg-gradient-to-r from-yellow-100 to-amber-100 text-yellow-800 border-yellow-200'
    },
    { 
      value: 'clothing', 
      label: 'Apparel', 
      icon: Shirt,
      description: 'Clothing, textiles',
      risk: 'Low',
      iconColor: 'text-emerald-600',
      bg: 'bg-gradient-to-br from-emerald-50 to-emerald-100',
      border: 'border-emerald-200',
      riskColor: 'bg-gradient-to-r from-emerald-100 to-green-100 text-emerald-800 border-emerald-200'
    },
    { 
      value: 'machinery', 
      label: 'Machinery', 
      icon: Cog,
      description: 'Industrial equipment',
      risk: 'High',
      iconColor: 'text-rose-600',
      bg: 'bg-gradient-to-br from-rose-50 to-rose-100',
      border: 'border-rose-200',
      riskColor: 'bg-gradient-to-r from-rose-100 to-red-100 text-rose-800 border-rose-200'
    },
    { 
      value: 'food', 
      label: 'Food', 
      icon: Apple,
      description: 'Perishable goods',
      risk: 'Medium',
      iconColor: 'text-amber-600',
      bg: 'bg-gradient-to-br from-amber-50 to-amber-100',
      border: 'border-amber-200',
      riskColor: 'bg-gradient-to-r from-amber-100 to-orange-100 text-amber-800 border-amber-200'
    },
    { 
      value: 'chemicals', 
      label: 'Chemicals', 
      icon: FlaskConical,
      description: 'Hazardous materials',
      risk: 'High',
      iconColor: 'text-purple-600',
      bg: 'bg-gradient-to-br from-purple-50 to-purple-100',
      border: 'border-purple-200',
      riskColor: 'bg-gradient-to-r from-purple-100 to-violet-100 text-purple-800 border-purple-200'
    },
    { 
      value: 'pharma', 
      label: 'Pharma', 
      icon: Pill,
      description: 'Medical supplies',
      risk: 'Low',
      iconColor: 'text-teal-600',
      bg: 'bg-gradient-to-br from-teal-50 to-teal-100',
      border: 'border-teal-200',
      riskColor: 'bg-gradient-to-r from-teal-100 to-cyan-100 text-teal-800 border-teal-200'
    },
    { 
      value: 'other', 
      label: 'Custom', 
      icon: Box,
      description: 'Other cargo',
      risk: 'Variable',
      iconColor: 'text-gray-600',
      bg: 'bg-gradient-to-br from-gray-50 to-gray-100',
      border: 'border-gray-200',
      riskColor: 'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-800 border-gray-300'
    },
  ];

  const selectedOption = cargoOptions.find(opt => opt.value === cargoType);

  return (
    <div className="space-y-8">
      {/* Cargo Selection Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
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
                relative group p-5 rounded-2xl border-2 transition-all duration-300
                ${isSelected
                  ? `${option.bg} ${option.border} shadow-lg scale-[1.02]`
                  : 'border-gray-200 hover:border-gray-300 bg-white hover:bg-gray-50'
                }
                ${isHovered && !isSelected ? 'scale-[1.02] border-gray-300' : ''}
              `}
            >
              <div className="relative z-10">
                {/* Icon Container */}
                <div 
                  className={`
                    w-16 h-16 rounded-2xl flex items-center justify-center mb-4 mx-auto
                    ${isSelected
                      ? `${option.bg} ${option.border}`
                      : 'bg-gray-50 border border-gray-200 group-hover:border-gray-300'
                    }
                    transition-all
                  `}
                >
                  <Icon className={`w-7 h-7 ${option.iconColor}`} />
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
                    text-xs mb-3
                    ${isSelected ? 'text-gray-700' : 'text-gray-600'}
                  `}>
                    {option.description}
                  </p>
                  
                  {/* Risk Badge */}
                  <span className={`
                    inline-block px-3 py-1.5 rounded-xl text-xs font-semibold border
                    ${option.riskColor}
                  `}>
                    {option.risk}
                  </span>
                </div>

                {/* Selection Indicator */}
                {isSelected && (
                  <div className="absolute -top-3 -right-3 z-20">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shadow-lg ${option.bg} ${option.border}`}>
                      <Check className="w-4 h-4 text-white" />
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
        <div className={`p-6 rounded-2xl ${selectedOption.bg} ${selectedOption.border} border-2`}>
          <div className="flex items-center gap-4 mb-4">
            <div className={`p-3 rounded-xl ${selectedOption.bg}`}>
              <selectedOption.icon className={`w-6 h-6 ${selectedOption.iconColor}`} />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-bold text-gray-900 text-lg">{selectedOption.label} Selected</h3>
                <Sparkles className="w-4 h-4 text-blue-500" />
              </div>
              <p className="text-sm text-gray-700">Optimal coverage selected for this cargo type</p>
            </div>
          </div>
          <div className="flex items-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <div className={`p-1.5 rounded-lg ${selectedOption.riskColor.split(' ')[0]}`}>
                <AlertCircle className={`w-4 h-4 ${selectedOption.iconColor}`} />
              </div>
              <span className="text-gray-800 font-medium">Risk: {selectedOption.risk}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-gradient-to-br from-green-100 to-emerald-100">
                <Zap className="w-4 h-4 text-green-600" />
              </div>
              <span className="text-green-700 font-medium">Fast Processing</span>
            </div>
          </div>
        </div>
      )}

      {/* Other Cargo Type Input */}
      {cargoType === 'other' && (
        <div className="p-6 rounded-2xl bg-gradient-to-br from-gray-50 to-gray-100 border-2 border-gray-300">
          <div className="flex items-center gap-4 mb-5">
            <div className="p-3 rounded-xl bg-gradient-to-br from-gray-600 to-gray-700">
              <Box className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 text-lg">Custom Cargo Type</h3>
              <p className="text-sm text-gray-700">Specify your unique cargo for accurate coverage</p>
            </div>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cargo Description *
              </label>
              <input
                type="text"
                value={otherCargoType}
                onChange={(e) => onOtherCargoTypeChange(e.target.value)}
                placeholder="e.g., Automotive parts, Artwork, Specialized equipment..."
                className="w-full h-12 px-4 rounded-xl border-2 border-gray-300 bg-white text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 focus:outline-none text-sm font-medium transition-all"
                required
                autoFocus
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