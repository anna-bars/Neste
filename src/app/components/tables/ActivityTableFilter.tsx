import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';

interface ActivityTableFilterProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedFilter: string;
  setSelectedFilter: (filter: string) => void;
  selectedTimeframe: string;
  setSelectedTimeframe: (timeframe: string) => void;
  selectedSort: string;
  setSelectedSort: (sort: string) => void;
  showMobileHeader?: boolean;
  title?: string;
  onReset?: () => void;
  showGetNewQuote?: boolean;
  pxValue?: string;
  filterConfig?: {
    showActivityFilter?: boolean;
    showTimeframeFilter?: boolean;
    showSortFilter?: boolean;
    activityOptions?: string[];
    timeframeOptions?: string[];
    sortOptions?: string[];
  };
}

export const ActivityTableFilter: React.FC<ActivityTableFilterProps> = ({
  searchQuery,
  setSearchQuery,
  selectedFilter,
  setSelectedFilter,
  selectedTimeframe,
  setSelectedTimeframe,
  selectedSort,
  setSelectedSort,
  showMobileHeader = true,
  title = 'Recent Insurance Activity',
  onReset,
  showGetNewQuote = true,
  pxValue = '4',
  filterConfig = {
    showActivityFilter: true,
    showTimeframeFilter: true,
    showSortFilter: true,
    activityOptions: ['All Activity', 'Pending', 'Active', 'Expiring', 'Missing', 'Declined'],
    timeframeOptions: ['Last 7 days', 'Last 30 days', 'Last 3 months', 'All time'],
    sortOptions: ['Status', 'Date', 'Value', 'Type']
  },
}) => {
  const router = useRouter();
  const [showFilter, setShowFilter] = useState(false);
  const [showDesktopFilters, setShowDesktopFilters] = useState(false);
  const [activeFiltersCount, setActiveFiltersCount] = useState(0);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const filterPanelRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let count = 0;
    if (selectedFilter !== 'All Activity') count++;
    if (selectedTimeframe !== 'Last 30 days') count++;
    if (selectedSort !== 'Status') count++;
    if (searchQuery) count++;
    setActiveFiltersCount(count);
  }, [selectedFilter, selectedTimeframe, selectedSort, searchQuery]);

  // Close filter panel when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        filterPanelRef.current && 
        !filterPanelRef.current.contains(event.target as Node) &&
        showDesktopFilters
      ) {
        setShowDesktopFilters(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showDesktopFilters]);

  const handleGetNewQuote = () => {
    router.push('/quotes/new/shipping');
  };

  const activityOptions = filterConfig.activityOptions || ['All Activity', 'Pending', 'Active', 'Expiring', 'Missing', 'Declined'];
  const timeframeOptions = filterConfig.timeframeOptions || ['Last 7 days', 'Last 30 days', 'Last 3 months', 'All time'];
  const sortOptions = filterConfig.sortOptions || ['Status', 'Date', 'Value', 'Type'];

  const handleReset = () => {
    setSelectedFilter('All Activity');
    setSelectedTimeframe('Last 30 days');
    setSelectedSort('Status');
    setSearchQuery('');
    if (onReset) onReset();
    setShowDesktopFilters(false);
    setShowFilter(false);
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  };

  const handleClearFilter = (type: 'search' | 'activity' | 'timeframe' | 'sort') => {
    switch (type) {
      case 'search':
        setSearchQuery('');
        if (searchInputRef.current) {
          searchInputRef.current.focus();
        }
        break;
      case 'activity':
        setSelectedFilter('All Activity');
        break;
      case 'timeframe':
        setSelectedTimeframe('Last 30 days');
        break;
      case 'sort':
        setSelectedSort('Status');
        break;
    }
  };

  const handleFilterClick = () => {
    if (window.innerWidth >= 768) {
      setShowDesktopFilters(!showDesktopFilters);
    } else {
      setShowFilter(!showFilter);
    }
  };

  const handleApplyFilters = () => {
    setShowDesktopFilters(false);
    setShowFilter(false);
  };

  // Ուղղված մաս - ավելի փոքր վահանակի չափսեր և լիստի բարձրություն
  return (
    <>
      <div className='block-1 relative'>
        <div className={`mt-3 mb-2 p-0 lg:mt-0 lg:mb-0 flex px-0 md:px-${pxValue} justify-between items-center relative`}>
          <div className="flex flex-col">
            <h2 className="font-poppins font-semibold text-xl text-gray-900 tracking-tight">{title}</h2>
          </div>
          
          <div className='flex items-center gap-3'>
            {/* Modern Search Input */}
            <div className={`hidden md:flex items-center w-[280px] bg-white rounded-xl px-4 py-2.5 transition-all duration-300 ${
              isSearchFocused || searchQuery
                ? 'shadow-lg ring-2 ring-blue-500/20 border border-blue-300/30'
                : 'border border-gray-200/70 hover:border-gray-300 hover:shadow-md'
            }`}>
              <svg className="w-4 h-4 text-gray-400 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search policies, ID, or cargo..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => setIsSearchFocused(false)}
                className="w-full bg-transparent outline-none border-none text-gray-800 placeholder:text-gray-500 font-poppins text-sm tracking-tight"
              />
              {searchQuery ? (
                <button 
                  onClick={() => handleClearFilter('search')}
                  className="ml-2 p-1.5 bg-gray-100 hover:bg-gray-200 text-gray-500 hover:text-gray-700 transition-all duration-200 rounded-lg"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              ) : (
                <div className="ml-2 px-2 py-1 bg-gray-50 text-gray-400 text-xs font-medium rounded-md border border-gray-100">
                  ⌘K
                </div>
              )}
            </div>

            {/* Modern Filter Button */}
            <button 
              className="group relative flex items-center gap-2 bg-white px-4 py-2.5 rounded-xl font-poppins text-sm font-medium transition-all duration-300 overflow-hidden"
              onClick={handleFilterClick}
            >
              {/* Background effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-white to-gray-50 border border-gray-200/70 group-hover:border-blue-300/50 group-hover:from-blue-50/30 group-hover:to-white rounded-xl transition-all duration-300" />
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 bg-gradient-to-r from-blue-500/5 to-purple-500/5 rounded-xl transition-all duration-500" />
              
              {/* Content */}
              <svg className="w-4 h-4 text-gray-600 group-hover:text-blue-600 relative z-10 transition-all duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
              <span className='hidden sm:block text-gray-700 group-hover:text-gray-900 relative z-10'>Filter</span>
              {activeFiltersCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-gradient-to-br from-blue-500 to-blue-600 text-white text-xs font-semibold rounded-full flex items-center justify-center shadow-md ring-2 ring-white z-20">
                  {activeFiltersCount}
                </span>
              )}
            </button>
            
            {/* Modern Get New Quote Button */}
            {showGetNewQuote && (
              <button
                onClick={handleGetNewQuote}
                className="group relative flex items-center gap-2 bg-gradient-to-br from-blue-600 to-blue-700 text-white px-5 py-2.5 rounded-xl font-poppins text-sm font-medium hover:shadow-xl hover:shadow-blue-500/25 transition-all duration-300 overflow-hidden"
              >
                {/* Shine effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                
                {/* Content */}
                <svg className="w-4 h-4 relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                </svg>
                <span className='hidden md:block relative z-10'>New Quote</span>
                
                {/* Glow effect */}
                <div className="absolute -inset-1 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-xl" />
              </button>
            )}
          </div>
        </div>
        
        {/* Desktop Filters Panel - Փոքրացված չափսերով */}
        {showDesktopFilters && (
          <div 
            ref={filterPanelRef}
            className="hidden md:block absolute z-50 top-full right-0 mt-2 animate-fade-in"
          >
            <div className="bg-white/95 backdrop-blur-xl rounded-xl border border-gray-200/50 shadow-xl p-5 min-w-[520px] max-w-[540px]">
              {/* Header - կոմպակտ */}
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center">
                    <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-poppins font-semibold text-base text-gray-900">Filters</h3>
                    <p className="font-poppins text-xs text-gray-500 mt-0.5">
                      {activeFiltersCount > 0 
                        ? `${activeFiltersCount} active filter${activeFiltersCount > 1 ? 's' : ''}`
                        : 'No filters applied'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {activeFiltersCount > 0 && (
                    <button
                      onClick={handleReset}
                      className="group flex items-center gap-1.5 px-3 py-2 text-xs font-poppins text-gray-600 hover:text-gray-900 hover:bg-gray-100/80 rounded-lg transition-all duration-200"
                    >
                      <svg className="w-3.5 h-3.5 group-hover:rotate-180 transition-transform duration-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      Reset
                    </button>
                  )}
                  <button
                    onClick={() => setShowDesktopFilters(false)}
                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100/80 rounded-lg transition-all duration-200"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
              
              {/* Filters Grid - ավելի կոմպակտ */}
              <div className="grid grid-cols-2 gap-6 mb-6">
                {/* Activity Filter */}
                {filterConfig.showActivityFilter && (
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                      <label className="font-poppins text-xs font-semibold text-gray-700 uppercase tracking-wide">
                        Activity
                      </label>
                    </div>
                    <div className="space-y-1.5 max-h-[180px] overflow-y-auto pr-2">
                      {activityOptions.map((option) => (
                        <div key={option} className="group flex items-center">
                          <div className={`
                            relative flex items-center justify-center w-4 h-4 rounded border transition-all duration-150 cursor-pointer
                            ${selectedFilter === option 
                              ? 'bg-gradient-to-br from-blue-500 to-blue-600 border-blue-600' 
                              : 'border-gray-300 group-hover:border-blue-400 group-hover:bg-blue-50/50'
                            }
                          `}
                          onClick={() => setSelectedFilter(option)}
                          >
                            <input
                              type="radio"
                              id={`activity-${option}`}
                              name="activity"
                              checked={selectedFilter === option}
                              onChange={() => setSelectedFilter(option)}
                              className="sr-only"
                            />
                            {selectedFilter === option && (
                              <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                              </svg>
                            )}
                          </div>
                          <label
                            htmlFor={`activity-${option}`}
                            className="ml-2.5 font-poppins text-xs text-gray-700 cursor-pointer group-hover:text-gray-900 transition-colors truncate"
                          >
                            {option}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Timeframe Filter */}
                {filterConfig.showTimeframeFilter && (
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                      <label className="font-poppins text-xs font-semibold text-gray-700 uppercase tracking-wide">
                        Timeframe
                      </label>
                    </div>
                    <div className="space-y-1.5">
                      {timeframeOptions.map((option) => (
                        <div key={option} className="group flex items-center">
                          <div className={`
                            relative flex items-center justify-center w-4 h-4 rounded border transition-all duration-150 cursor-pointer
                            ${selectedTimeframe === option 
                              ? 'bg-gradient-to-br from-emerald-500 to-emerald-600 border-emerald-600' 
                              : 'border-gray-300 group-hover:border-emerald-400 group-hover:bg-emerald-50/50'
                            }
                          `}
                          onClick={() => setSelectedTimeframe(option)}
                          >
                            <input
                              type="radio"
                              id={`timeframe-${option}`}
                              name="timeframe"
                              checked={selectedTimeframe === option}
                              onChange={() => setSelectedTimeframe(option)}
                              className="sr-only"
                            />
                            {selectedTimeframe === option && (
                              <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                              </svg>
                            )}
                          </div>
                          <label
                            htmlFor={`timeframe-${option}`}
                            className="ml-2.5 font-poppins text-xs text-gray-700 cursor-pointer group-hover:text-gray-900 transition-colors truncate"
                          >
                            {option}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Sort Filter */}
                {filterConfig.showSortFilter && (
                  <div className="col-span-2">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-purple-500"></div>
                      <label className="font-poppins text-xs font-semibold text-gray-700 uppercase tracking-wide">
                        Sort By
                      </label>
                    </div>
                    <div className="grid grid-cols-4 gap-2">
                      {sortOptions.map((option) => (
                        <button
                          key={option}
                          className={`px-3 py-2 rounded-lg font-poppins text-xs font-medium transition-all duration-150 ${
                            selectedSort === option
                              ? 'bg-gradient-to-br from-purple-500 to-purple-600 text-white shadow-sm'
                              : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200'
                          }`}
                          onClick={() => setSelectedSort(option)}
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Apply Button - փոքրացված */}
              <div className="flex justify-end pt-4 border-t border-gray-100">
                <button
                  onClick={handleApplyFilters}
                  className="group relative px-6 py-2.5 bg-gradient-to-br from-blue-600 to-blue-700 text-white rounded-lg font-poppins text-sm font-medium hover:shadow-lg hover:shadow-blue-500/20 transition-all duration-300 overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                  Apply Filters
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modern Active filters pills - Floating design */}
      {activeFiltersCount > 0 && (
        <div className={`px-${pxValue} mb-3 mt-3`}>
          <div className="flex items-center gap-2">
            <span className="font-poppins text-xs font-medium text-gray-500 bg-gray-50 px-2.5 py-1 rounded-lg">Active</span>
            <div className="flex flex-wrap gap-1.5">
              {searchQuery && (
                <div className="group inline-flex items-center gap-1.5 bg-white border border-gray-200 text-gray-800 px-3 py-1.5 rounded-lg text-xs font-poppins font-medium hover:border-blue-300 hover:bg-blue-50/50 transition-all duration-200">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                  <div className="flex items-center gap-1.5">
                    <svg className="w-3 h-3 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <span className="max-w-[100px] truncate">"{searchQuery}"</span>
                  </div>
                  <button 
                    onClick={() => handleClearFilter('search')}
                    className="ml-0.5 p-0.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded transition-colors"
                  >
                    <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              )}
              {selectedFilter !== 'All Activity' && (
                <div className="group inline-flex items-center gap-1.5 bg-white border border-gray-200 text-gray-800 px-3 py-1.5 rounded-lg text-xs font-poppins font-medium hover:border-purple-300 hover:bg-purple-50/50 transition-all duration-200">
                  <div className="w-1.5 h-1.5 rounded-full bg-purple-500"></div>
                  <div className="flex items-center gap-1.5">
                    <svg className="w-3 h-3 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="max-w-[120px] truncate">{selectedFilter}</span>
                  </div>
                  <button 
                    onClick={() => handleClearFilter('activity')}
                    className="ml-0.5 p-0.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded transition-colors"
                  >
                    <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              )}
              {selectedTimeframe !== 'Last 30 days' && (
                <div className="group inline-flex items-center gap-1.5 bg-white border border-gray-200 text-gray-800 px-3 py-1.5 rounded-lg text-xs font-poppins font-medium hover:border-emerald-300 hover:bg-emerald-50/50 transition-all duration-200">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                  <div className="flex items-center gap-1.5">
                    <svg className="w-3 h-3 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="max-w-[120px] truncate">{selectedTimeframe}</span>
                  </div>
                  <button 
                    onClick={() => handleClearFilter('timeframe')}
                    className="ml-0.5 p-0.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded transition-colors"
                  >
                    <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              )}
              {selectedSort !== 'Status' && (
                <div className="group inline-flex items-center gap-1.5 bg-white border border-gray-200 text-gray-800 px-3 py-1.5 rounded-lg text-xs font-poppins font-medium hover:border-amber-300 hover:bg-amber-50/50 transition-all duration-200">
                  <div className="w-1.5 h-1.5 rounded-full bg-amber-500"></div>
                  <div className="flex items-center gap-1.5">
                    <svg className="w-3 h-3 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h9m5-4v12m0 0l-4-4m4 4l4-4" />
                    </svg>
                    <span className="max-w-[120px] truncate">{selectedSort}</span>
                  </div>
                  <button 
                    onClick={() => handleClearFilter('sort')}
                    className="ml-0.5 p-0.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded transition-colors"
                  >
                    <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              )}
              <button
                onClick={handleReset}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-br from-gray-50 to-gray-100 text-gray-700 hover:text-gray-900 hover:from-gray-100 hover:to-gray-200 text-xs font-poppins font-medium rounded-lg border border-gray-200 hover:border-gray-300 transition-all duration-200"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Clear All
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modern Mobile Filter Modal - iOS-like design */}
      {showFilter && (
        <div className="md:hidden fixed inset-0 z-50">
          {/* Overlay with blur */}
          <div 
            className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-all duration-300"
            onClick={() => setShowFilter(false)}
          />
          
          {/* Filter Modal */}
          <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl shadow-2xl max-h-[75vh] overflow-y-auto animate-slide-up">
            {/* Header with gradient */}
            <div className="sticky top-0 bg-gradient-to-b from-white to-white/95 backdrop-blur-sm border-b border-gray-100/50 px-5 py-4 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-poppins font-semibold text-lg text-gray-900">Filters</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="w-5 h-1 rounded-full bg-gradient-to-r from-blue-500 to-purple-500"></div>
                    <p className="font-poppins text-xs text-gray-500">
                      {activeFiltersCount > 0 
                        ? `${activeFiltersCount} filter${activeFiltersCount > 1 ? 's' : ''} applied` 
                        : 'Customize your view'}
                    </p>
                  </div>
                </div>
                <button 
                  className="p-2 bg-gray-100 hover:bg-gray-200 text-gray-600 hover:text-gray-800 rounded-lg transition-all duration-200"
                  onClick={() => setShowFilter(false)}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            
            {/* Filter Content */}
            <div className="p-5 space-y-6">
              {/* Search Input for Mobile */}
              <div>
                <label className="block font-poppins font-medium text-gray-900 mb-2 flex items-center gap-2">
                  <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  Search
                </label>
                <div className="flex items-center bg-gray-50/80 border border-gray-200/50 px-4 py-3 rounded-xl focus-within:border-blue-400 focus-within:bg-white focus-within:ring-2 focus-within:ring-blue-100 transition-all duration-200">
                  <input
                    type="text"
                    placeholder="Type to search..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-transparent outline-none border-none text-gray-800 placeholder:text-gray-500 font-poppins text-sm"
                  />
                  {searchQuery && (
                    <button 
                      onClick={() => setSearchQuery('')}
                      className="p-1.5 bg-gray-200 hover:bg-gray-300 text-gray-600 rounded-lg transition-colors"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                </div>
              </div>

              {/* Activity Type */}
              {filterConfig.showActivityFilter && (
                <div>
                  <label className="block font-poppins font-medium text-gray-900 mb-2 flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                    Activity Type
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {activityOptions.map((filter) => (
                      <button
                        key={filter}
                        className={`px-3 py-2.5 rounded-lg font-poppins text-xs font-medium transition-all duration-200 ${
                          selectedFilter === filter
                            ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-md'
                            : 'bg-gray-50/80 text-gray-700 hover:bg-gray-100 border border-gray-200/50 hover:border-blue-300'
                        }`}
                        onClick={() => setSelectedFilter(filter)}
                      >
                        {filter}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Timeframe */}
              {filterConfig.showTimeframeFilter && (
                <div>
                  <label className="block font-poppins font-medium text-gray-900 mb-2 flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                    Timeframe
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {timeframeOptions.map((timeframe) => (
                      <button
                        key={timeframe}
                        className={`px-3 py-2.5 rounded-lg font-poppins text-xs font-medium transition-all duration-200 ${
                          selectedTimeframe === timeframe
                            ? 'bg-gradient-to-br from-emerald-500 to-emerald-600 text-white shadow-md'
                            : 'bg-gray-50/80 text-gray-700 hover:bg-gray-100 border border-gray-200/50 hover:border-emerald-300'
                        }`}
                        onClick={() => setSelectedTimeframe(timeframe)}
                      >
                        {timeframe}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Sort By */}
              {filterConfig.showSortFilter && (
                <div>
                  <label className="block font-poppins font-medium text-gray-900 mb-2 flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-purple-500"></div>
                    Sort by
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {sortOptions.map((sort) => (
                      <button
                        key={sort}
                        className={`px-3 py-2.5 rounded-lg font-poppins text-xs font-medium transition-all duration-200 ${
                          selectedSort === sort
                            ? 'bg-gradient-to-br from-purple-500 to-purple-600 text-white shadow-md'
                            : 'bg-gray-50/80 text-gray-700 hover:bg-gray-100 border border-gray-200/50 hover:border-purple-300'
                        }`}
                        onClick={() => setSelectedSort(sort)}
                      >
                        {sort}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            {/* Action Buttons */}
            <div className="sticky bottom-0 bg-white/95 backdrop-blur-sm border-t border-gray-100/50 p-5 pt-4">
              <div className="flex gap-2">
                <button 
                  className="flex-1 py-3 bg-gray-100/80 text-gray-700 rounded-lg font-poppins text-sm font-medium hover:bg-gray-200 active:scale-[0.98] transition-all duration-200 border border-gray-200/50"
                  onClick={handleReset}
                >
                  Reset All
                </button>
                <button 
                  className="flex-1 py-3 bg-gradient-to-br from-blue-600 to-blue-700 text-white rounded-lg font-poppins text-sm font-medium hover:shadow-lg hover:shadow-blue-500/25 active:scale-[0.98] transition-all duration-200 shadow-sm"
                  onClick={() => setShowFilter(false)}
                >
                  Apply Filters
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx global>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(-10px) scale(0.98);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        @keyframes slide-up {
          from {
            transform: translateY(100%);
          }
          to {
            transform: translateY(0);
          }
        }

        .animate-fade-in {
          animation: fade-in 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .animate-slide-up {
          animation: slide-up 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        /* Custom scrollbar for activity list */
        .max-h-[180px]::-webkit-scrollbar {
          width: 4px;
        }

        .max-h-[180px]::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 2px;
        }

        .max-h-[180px]::-webkit-scrollbar-thumb {
          background: #c1c1c1;
          border-radius: 2px;
        }

        .max-h-[180px]::-webkit-scrollbar-thumb:hover {
          background: #a1a1a1;
        }
      `}</style>
    </>
  );
};