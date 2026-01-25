import React, { useState, useEffect, useRef } from 'react';
import { CustomDropdown } from './CustomDropdown';
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
  const filterPanelRef = useRef<HTMLDivElement>(null);

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
  };

  const handleClearFilter = (type: 'search' | 'activity' | 'timeframe' | 'sort') => {
    switch (type) {
      case 'search':
        setSearchQuery('');
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

  return (
    <>
      <div className='block-1 relative'>
        <div className={`mt-3 mb-2 p-0 lg:mt-0 lg:mb-0 flex px-0 md:px-${pxValue} justify-between items-center relative`}>
          <div className="flex flex-col">
            <h2 className="font-poppins font-semibold text-xl text-gray-900">{title}</h2>
          </div>
          
          <div className='flex items-center gap-3'>
            {/* Desktop Search Input - Always visible */}
            <div className="hidden md:flex items-center w-[280px] bg-white border border-gray-200 rounded-lg px-3 py-2.5 shadow-sm hover:shadow-md transition-all duration-300">
              <svg className="w-4 h-4 text-gray-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search policies, ID, or cargo..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-transparent outline-none border-none text-gray-700 placeholder:text-gray-400 font-poppins text-sm"
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')}
                  className="ml-2 p-1 text-gray-400 hover:text-gray-600 transition-colors rounded-full hover:bg-gray-100"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>

            {/* Filter Button */}
            <button 
              className="flex items-center gap-2 bg-white border border-gray-200 px-4 py-2.5 rounded-lg font-poppins text-sm font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-300 hover:shadow-sm transition-all duration-300 group relative"
              onClick={handleFilterClick}
            >
              <svg className="w-4 h-4 text-gray-600 group-hover:text-blue-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
              <span className='hidden sm:block'>Filters</span>
              {activeFiltersCount > 0 && (
                <span className="absolute -top-2 -right-2 w-5 h-5 bg-blue-600 text-white text-xs font-semibold rounded-full flex items-center justify-center shadow-sm">
                  {activeFiltersCount}
                </span>
              )}
            </button>
            
            {/* Get New Quote Button */}
            {showGetNewQuote && (
              <button
                onClick={handleGetNewQuote}
                className="flex items-center gap-2 bg-gradient-to-r from-[#2563eb] to-[#3b82f6] text-white px-5 py-2.5 rounded-lg font-poppins text-sm font-medium hover:from-[#1d4ed8] hover:to-[#2563eb] hover:shadow-lg transition-all duration-300 shadow-sm"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                <span className='hidden md:block'>New Quote</span>
              </button>
            )}
          </div>
        </div>
        
        {/* Desktop Filters Panel - Absolute positioned */}
        {showDesktopFilters && (
          <div 
            ref={filterPanelRef}
            className="hidden md:block absolute z-50 top-full right-0 mt-2 animate-fade-in"
          >
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-lg min-w-[600px] w-max">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                  </svg>
                  <h3 className="font-poppins font-semibold text-lg text-gray-900">Filter Options</h3>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-gray-500">{activeFiltersCount} active filters</span>
                  <button
                    onClick={handleReset}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-poppins text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all duration-200"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Reset All
                  </button>
                </div>
              </div>
              
              {/* Filters Grid */}
              <div className="grid grid-cols-3 gap-6 mb-6">
                {/* Activity Filter */}
                {filterConfig.showActivityFilter && (
                  <div>
                    <label className="block font-poppins text-sm font-medium text-gray-700 mb-2">
                      Activity Type
                    </label>
                    <div className="space-y-2">
                      {activityOptions.map((option) => (
                        <div key={option} className="flex items-center">
                          <input
                            type="radio"
                            id={`activity-${option}`}
                            name="activity"
                            checked={selectedFilter === option}
                            onChange={() => setSelectedFilter(option)}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                          />
                          <label
                            htmlFor={`activity-${option}`}
                            className="ml-2 font-poppins text-sm text-gray-700 cursor-pointer"
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
                    <label className="block font-poppins text-sm font-medium text-gray-700 mb-2">
                      Timeframe
                    </label>
                    <div className="space-y-2">
                      {timeframeOptions.map((option) => (
                        <div key={option} className="flex items-center">
                          <input
                            type="radio"
                            id={`timeframe-${option}`}
                            name="timeframe"
                            checked={selectedTimeframe === option}
                            onChange={() => setSelectedTimeframe(option)}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                          />
                          <label
                            htmlFor={`timeframe-${option}`}
                            className="ml-2 font-poppins text-sm text-gray-700 cursor-pointer"
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
                  <div>
                    <label className="block font-poppins text-sm font-medium text-gray-700 mb-2">
                      Sort By
                    </label>
                    <div className="space-y-2">
                      {sortOptions.map((option) => (
                        <div key={option} className="flex items-center">
                          <input
                            type="radio"
                            id={`sort-${option}`}
                            name="sort"
                            checked={selectedSort === option}
                            onChange={() => setSelectedSort(option)}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                          />
                          <label
                            htmlFor={`sort-${option}`}
                            className="ml-2 font-poppins text-sm text-gray-700 cursor-pointer"
                          >
                            {option}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Apply Button */}
              <div className="flex justify-end">
                <button
                  onClick={handleApplyFilters}
                  className="px-6 py-3 bg-gradient-to-r from-[#2563eb] to-[#3b82f6] text-white rounded-lg font-poppins text-sm font-medium hover:from-[#1d4ed8] hover:to-[#2563eb] hover:shadow-lg transition-all duration-300 shadow-sm"
                >
                  Apply Filters
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Active filters pills - Modern design */}
      {activeFiltersCount > 0 && (
        <div className={`px-${pxValue} mb-4 mt-2`}>
          <div className="flex items-center gap-2">
            <span className="font-poppins text-sm text-gray-500">Active filters:</span>
            <div className="flex flex-wrap gap-2">
              {searchQuery && (
                <div className="inline-flex items-center gap-1.5 bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 text-blue-700 px-3 py-1.5 rounded-full text-xs font-poppins font-medium group hover:from-blue-100 hover:to-blue-200 transition-all duration-200">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  "{searchQuery}"
                  <button 
                    onClick={() => handleClearFilter('search')}
                    className="ml-1 p-0.5 text-blue-400 hover:text-blue-700 hover:bg-blue-200 rounded-full transition-colors"
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18-6M6-6l12 12" />
                    </svg>
                  </button>
                </div>
              )}
              {selectedFilter !== 'All Activity' && (
                <div className="inline-flex items-center gap-1.5 bg-gradient-to-r from-purple-50 to-purple-100 border border-purple-200 text-purple-700 px-3 py-1.5 rounded-full text-xs font-poppins font-medium group hover:from-purple-100 hover:to-purple-200 transition-all duration-200">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {selectedFilter}
                  <button 
                    onClick={() => handleClearFilter('activity')}
                    className="ml-1 p-0.5 text-purple-400 hover:text-purple-700 hover:bg-purple-200 rounded-full transition-colors"
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18-6M6-6l12 12" />
                    </svg>
                  </button>
                </div>
              )}
              {selectedTimeframe !== 'Last 30 days' && (
                <div className="inline-flex items-center gap-1.5 bg-gradient-to-r from-green-50 to-green-100 border border-green-200 text-green-700 px-3 py-1.5 rounded-full text-xs font-poppins font-medium group hover:from-green-100 hover:to-green-200 transition-all duration-200">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {selectedTimeframe}
                  <button 
                    onClick={() => handleClearFilter('timeframe')}
                    className="ml-1 p-0.5 text-green-400 hover:text-green-700 hover:bg-green-200 rounded-full transition-colors"
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18-6M6-6l12 12" />
                    </svg>
                  </button>
                </div>
              )}
              {selectedSort !== 'Status' && (
                <div className="inline-flex items-center gap-1.5 bg-gradient-to-r from-amber-50 to-amber-100 border border-amber-200 text-amber-700 px-3 py-1.5 rounded-full text-xs font-poppins font-medium group hover:from-amber-100 hover:to-amber-200 transition-all duration-200">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h9m5-4v12m0 0l-4-4m4 4l4-4" />
                  </svg>
                  {selectedSort}
                  <button 
                    onClick={() => handleClearFilter('sort')}
                    className="ml-1 p-0.5 text-amber-400 hover:text-amber-700 hover:bg-amber-200 rounded-full transition-colors"
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18-6M6-6l12 12" />
                    </svg>
                  </button>
                </div>
              )}
              <button
                onClick={handleReset}
                className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-poppins text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-all duration-200"
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

      {/* Mobile Filter Modal */}
      {showFilter && (
        <div className="md:hidden fixed inset-0 z-50">
          {/* Overlay */}
          <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300"
            onClick={() => setShowFilter(false)}
          />
          
          {/* Filter Modal */}
          <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl shadow-2xl max-h-[90vh] overflow-y-auto animate-slide-up">
            {/* Header */}
            <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-5 rounded-t-3xl">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-poppins font-semibold text-xl text-gray-900">Filters</h3>
                  <p className="font-poppins text-sm text-gray-500 mt-1">
                    {activeFiltersCount > 0 
                      ? `${activeFiltersCount} filter${activeFiltersCount > 1 ? 's' : ''} applied` 
                      : 'Customize your view'}
                  </p>
                </div>
                <button 
                  className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
                  onClick={() => setShowFilter(false)}
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            
            {/* Filter Content */}
            <div className="p-6 space-y-8">
              {/* Search Input for Mobile */}
              <div>
                <label className="block font-poppins font-medium text-gray-900 mb-3">
                  Search
                </label>
                <div className="flex items-center bg-gray-50 border border-gray-200 px-4 py-3.5 rounded-xl">
                  <svg className="w-4 h-4 text-gray-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <input
                    type="text"
                    placeholder="Search..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-transparent outline-none border-none text-gray-700 placeholder:text-gray-400 font-poppins text-sm"
                  />
                </div>
              </div>

              {/* Activity Type */}
              {filterConfig.showActivityFilter && (
                <div>
                  <label className="block font-poppins font-medium text-gray-900 mb-3">
                    Activity Type
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {activityOptions.map((filter) => (
                      <button
                        key={filter}
                        className={`px-4 py-3 rounded-xl font-poppins text-sm transition-all duration-200 ${
                          selectedFilter === filter
                            ? 'bg-blue-600 text-white shadow-sm'
                            : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-100'
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
                  <label className="block font-poppins font-medium text-gray-900 mb-3">
                    Timeframe
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {timeframeOptions.map((timeframe) => (
                      <button
                        key={timeframe}
                        className={`px-4 py-3 rounded-xl font-poppins text-sm transition-all duration-200 ${
                          selectedTimeframe === timeframe
                            ? 'bg-blue-600 text-white shadow-sm'
                            : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-100'
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
                  <label className="block font-poppins font-medium text-gray-900 mb-3">
                    Sort by
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {sortOptions.map((sort) => (
                      <button
                        key={sort}
                        className={`px-4 py-3 rounded-xl font-poppins text-sm transition-all duration-200 ${
                          selectedSort === sort
                            ? 'bg-blue-600 text-white shadow-sm'
                            : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-100'
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
            <div className="sticky bottom-0 bg-white border-t border-gray-100 p-6 pt-5">
              <div className="flex gap-3">
                <button 
                  className="flex-1 py-4 bg-gray-100 text-gray-700 rounded-xl font-poppins text-sm font-medium hover:bg-gray-200 active:scale-[0.98] transition-all duration-200"
                  onClick={handleReset}
                >
                  Reset All
                </button>
                <button 
                  className="flex-1 py-4 bg-gradient-to-r from-[#2563eb] to-[#3b82f6] text-white rounded-xl font-poppins text-sm font-medium hover:from-[#1d4ed8] hover:to-[#2563eb] active:scale-[0.98] transition-all duration-200 shadow-sm"
                  onClick={() => setShowFilter(false)}
                >
                  Apply Filters
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};