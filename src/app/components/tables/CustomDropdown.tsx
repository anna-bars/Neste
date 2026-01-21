import React, { useState, useRef, useEffect } from 'react';

interface CustomDropdownProps {
  options: string[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export const CustomDropdown: React.FC<CustomDropdownProps> = ({
  options,
  value,
  onChange,
  placeholder = 'Select...',
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedOption = options.find(opt => opt === value) || placeholder;

  return (
    <div ref={dropdownRef} className={`relative ${className}`}>
      <button
        type="button"
        className="w-full appearance-none bg-[#f3f2ee] border border-[#d1d1d154] rounded-lg px-3 py-2 pl-4  font-poppins text-sm text-gray-700 focus:outline-none focus:border-[#2563eb] focus:ring-1 focus:ring-[#2563eb] cursor-pointer min-w-[40px] text-left flex items-center justify-between"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="truncate">{selectedOption}</span>
        <svg 
          className={`w-4 h-4 ml-2 transform transition-transform ${isOpen ? 'rotate-180' : ''}`} 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      
      {isOpen && (
        <div className="absolute z-10 mt-1 w-full bg-white border border-[#d1d1d154] rounded-lg shadow-lg overflow-hidden animate-fade-in">
          <div className="py-1 max-h-60 overflow-y-auto">
            {options.map((option) => (
              <button
                key={option}
                className={`w-full px-4 py-2.5 text-left font-poppins text-sm transition-colors hover:bg-[#f3f2ee] ${
                  option === value 
                    ? 'bg-[#2563eb] text-white hover:bg-[#1d4ed8]' 
                    : 'text-gray-700'
                }`}
                onClick={() => {
                  onChange(option);
                  setIsOpen(false);
                }}
              >
                {option}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};