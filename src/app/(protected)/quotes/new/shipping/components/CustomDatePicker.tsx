"use client";

import { useState, useEffect } from 'react';
import { Calendar, ChevronDown, ChevronLeft, ChevronRight, CheckCircle } from 'lucide-react';

interface CustomDatePickerProps {
  value: string;
  onChange: (date: string) => void;
  placeholder?: string;
  minDate?: string;
  maxDate?: string;
}

const CustomDatePicker: React.FC<CustomDatePickerProps> = ({ 
  value, 
  onChange, 
  placeholder = "Select date",
  minDate,
  maxDate 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(
    value ? new Date(value) : null
  );

  const today = new Date();
  const min = minDate ? new Date(minDate) : null;
  const max = maxDate ? new Date(maxDate) : null;

  const daysInMonth = new Date(
    currentMonth.getFullYear(),
    currentMonth.getMonth() + 1,
    0
  ).getDate();

  const firstDayOfMonth = new Date(
    currentMonth.getFullYear(),
    currentMonth.getMonth(),
    1
  ).getDay();

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const handleDateSelect = (day: number) => {
    const selected = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth(),
      day
    );
    
    if (min && selected < min) return;
    if (max && selected > max) return;
    
    setSelectedDate(selected);
    onChange(selected.toISOString().split('T')[0]);
    setIsOpen(false);
  };

  const prevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const isToday = (day: number) => {
    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    return date.toDateString() === today.toDateString();
  };

  const isSelected = (day: number) => {
    if (!selectedDate) return false;
    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    return date.toDateString() === selectedDate.toDateString();
  };

  const isDisabled = (day: number) => {
    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    if (min && date < min) return true;
    if (max && date > max) return true;
    return false;
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (isOpen && !(e.target as Element).closest('.date-picker-container')) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  return (
    <div className="relative date-picker-container">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full h-12 px-4 rounded-xl border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none transition-colors flex items-center justify-between bg-white"
      >
        <div className="flex items-center gap-3">
          <Calendar className="h-5 w-5 text-gray-400" />
          <span className={`${value ? "text-gray-900" : "text-gray-500"} text-sm md:text-base truncate max-w-[160px] md:max-w-none`}>
            {value ? formatDate(new Date(value)) : placeholder}
          </span>
        </div>
        <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute z-50 mt-1 bg-white rounded-xl shadow-lg border border-gray-200 p-4 w-full md:w-80">
          <div className="flex items-center justify-between mb-4">
            <button
              type="button"
              onClick={prevMonth}
              className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <div className="font-semibold text-gray-900 text-sm md:text-base">
              {months[currentMonth.getMonth()]} {currentMonth.getFullYear()}
            </div>
            <button
              type="button"
              onClick={nextMonth}
              className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1 mb-2">
            {days.map(day => (
              <div key={day} className="text-center text-xs md:text-sm font-medium text-gray-500 py-1">
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: firstDayOfMonth }).map((_, index) => (
              <div key={`empty-${index}`} />
            ))}
            
            {Array.from({ length: daysInMonth }).map((_, index) => {
              const day = index + 1;
              const disabled = isDisabled(day);
              const isTodayDate = isToday(day);
              const selected = isSelected(day);
              
              return (
                <button
                  key={day}
                  type="button"
                  onClick={() => handleDateSelect(day)}
                  disabled={disabled}
                  className={`
                    h-8 rounded-lg text-xs md:text-sm transition-all duration-200
                    ${selected
                      ? 'bg-blue-500 text-white hover:bg-blue-600'
                      : isTodayDate
                      ? 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                      : 'hover:bg-gray-100 text-gray-900'
                    }
                    ${disabled ? 'opacity-30 cursor-not-allowed hover:bg-transparent' : ''}
                  `}
                >
                  {day}
                </button>
              );
            })}
          </div>

          <div className="mt-4 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={() => {
                setSelectedDate(today);
                onChange(today.toISOString().split('T')[0]);
                setIsOpen(false);
              }}
              className="w-full py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            >
              Select Today
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomDatePicker;