import React, { useState, useMemo } from 'react';
import { ActivityTableFilter } from './ActivityTableFilter';

interface TableColumn {
  key: string;
  label: string;
  sortable?: boolean;
  className?: string;
  mobileVisible?: boolean;
  desktopVisible?: boolean;
  render?: (value: any, row: TableRow) => React.ReactNode;
  mobileRender?: (value: any, row: TableRow) => React.ReactNode;
}

interface TableRow {
  [key: string]: any;
  id: string | number;
  type?: string;
  status?: {
    text: string;
    color: string;
    dot: string;
    textColor: string;
  };
  button?: {
    text: string;
    variant: 'primary' | 'secondary';
    onClick?: (row: TableRow) => void;
  };
}

interface UniversalTableProps {
  title?: string;
  showMobileHeader?: boolean;
  rows: TableRow[];
  columns: TableColumn[];
  initialFilters?: {
    activity?: string;
    timeframe?: string;
    sort?: string;
  };
  filterConfig?: {
    showActivityFilter?: boolean;
    showTimeframeFilter?: boolean;
    showSortFilter?: boolean;
    activityOptions?: string[];
    timeframeOptions?: string[];
    sortOptions?: string[];
  };
  onSearch?: (query: string) => void;
  onFilterChange?: (filters: {
    activity: string;
    timeframe: string;
    sort: string;
  }) => void;
  emptyState?: React.ReactNode;
}

export const UniversalTable: React.FC<UniversalTableProps> = ({
  title = 'Recent Activity',
  showMobileHeader = true,
  rows = [],
  columns = [],
  initialFilters = {
    activity: 'All Activity',
    timeframe: 'Last 30 days',
    sort: 'Status'
  },
  filterConfig = {
    showActivityFilter: true,
    showTimeframeFilter: true,
    showSortFilter: true,
    activityOptions: ['All Activity', 'Pending', 'Active', 'Expiring', 'Missing', 'Declined'],
    timeframeOptions: ['Last 7 days', 'Last 30 days', 'Last 3 months', 'All time'],
    sortOptions: ['Status', 'Date', 'Value', 'Type']
  },
  onSearch,
  onFilterChange,
  emptyState
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState(initialFilters.activity || 'All Activity');
  const [selectedTimeframe, setSelectedTimeframe] = useState(initialFilters.timeframe || 'Last 30 days');
  const [selectedSort, setSelectedSort] = useState(initialFilters.sort || 'Status');

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    if (onSearch) onSearch(query);
  };

  const handleFilterChange = (type: string, value: string) => {
    switch (type) {
      case 'activity':
        setSelectedFilter(value);
        break;
      case 'timeframe':
        setSelectedTimeframe(value);
        break;
      case 'sort':
        setSelectedSort(value);
        break;
    }

    if (onFilterChange) {
      onFilterChange({
        activity: type === 'activity' ? value : selectedFilter,
        timeframe: type === 'timeframe' ? value : selectedTimeframe,
        sort: type === 'sort' ? value : selectedSort
      });
    }
  };

  const getFilteredRows = () => {
    let filtered = [...rows];
    
    // Apply timeframe filter
    if (filterConfig.showTimeframeFilter) {
      if (selectedTimeframe === 'Last 7 days') {
        filtered = filtered.slice(0, 3);
      } else if (selectedTimeframe === 'Last 3 months') {
        // Keep all rows
      }
    }
    
    // Apply activity filter
    if (filterConfig.showActivityFilter && selectedFilter !== 'All Activity') {
      filtered = filtered.filter(row => {
        if (row.status?.text) {
          const statusMap: Record<string, string> = {
            'Pending': 'Pending Approval',
            'Active': 'Active',
            'Expiring': 'Expires',
            'Missing': 'Document Missing',
            'Declined': 'Declined'
          };
          
          const targetStatus = statusMap[selectedFilter];
          return targetStatus ? row.status.text.includes(targetStatus) : false;
        }
        return false;
      });
    }
    
    // Apply sorting
    if (filterConfig.showSortFilter) {
      if (selectedSort === 'Date') {
        filtered.sort((a, b) => {
          const dateA = a.date || a.expirationDate || a.lastUpdate;
          const dateB = b.date || b.expirationDate || b.lastUpdate;
          return new Date(dateB).getTime() - new Date(dateA).getTime();
        });
      } else if (selectedSort === 'Value') {
        filtered.sort((a, b) => {
          const aValue = parseFloat((a.value || a.shipmentValue || '0').replace(/[^\d.-]/g, ''));
          const bValue = parseFloat((b.value || b.shipmentValue || '0').replace(/[^\d.-]/g, ''));
          return bValue - aValue;
        });
      } else if (selectedSort === 'Type') {
        filtered.sort((a, b) => (a.type || '').localeCompare(b.type || ''));
      }
    }
    
    return filtered;
  };

  const filteredRows = useMemo(() => {
    const filtered = getFilteredRows();
    
    if (!searchQuery.trim()) {
      return filtered;
    }
    
    const query = searchQuery.toLowerCase().trim();
    return filtered.filter(row => {
      return columns.some(column => {
        const value = row[column.key];
        if (typeof value === 'string') {
          return value.toLowerCase().includes(query);
        }
        return false;
      }) || 
      row.type?.toLowerCase().includes(query) ||
      row.id?.toString().toLowerCase().includes(query) ||
      row.status?.text.toLowerCase().includes(query);
    });
  }, [searchQuery, selectedFilter, selectedTimeframe, selectedSort, rows, columns]);

  const handleReset = () => {
    setSelectedFilter(initialFilters.activity || 'All Activity');
    setSelectedTimeframe(initialFilters.timeframe || 'Last 30 days');
    setSelectedSort(initialFilters.sort || 'Status');
    setSearchQuery('');
  };

  // Default empty state
  const defaultEmptyState = (
    <div className="flex flex-col items-center justify-center py-12 px-4">
      <div className="text-gray-400 mb-4">
        <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
      <h3 className="font-poppins font-medium text-lg text-gray-700 mb-2">No results found</h3>
      <p className="font-poppins text-sm text-gray-500 text-center max-w-md">
        {searchQuery 
          ? `No results match your search "${searchQuery}". Try adjusting your filters or search terms.`
          : "No data available. Try adjusting your filters."}
      </p>
      <button 
        className="mt-6 px-6 py-2.5 bg-[#2563eb] text-white rounded-lg font-poppins text-sm font-normal hover:bg-[#1d4ed8] transition-colors duration-300"
        onClick={handleReset}
      >
        Clear all filters
      </button>
    </div>
  );

  // Calculate grid columns for desktop
  const desktopGridCols = `repeat(${columns.length}, minmax(0, 1fr))`;

  return (
    <>
      <section className="
        block-2 flex flex-col h-full relative py-4 xl:py-4
        border border-[#d1d1d12b] bg-[#f9f9f6ba] rounded-[16px] overflow-hidden

        /* Desktop/MD - 768px and up */
        md:border md:border-solid md:border-[#d1d1d154]
        md:bg-[#fafaf7]/80 md:rounded-[16px]
        md:pt-[16px]
        md:!pb-0
        
        /* Mobile - below 768px */
        max-[767px]:border-none 
        max-[767px]:bg-transparent 
        max-[767px]:p-0 
        max-[767px]:rounded-none
        max-[767px]:!w-[100%]
        max-[767px]:!overflow-hidden
      ">
        
        {/* Filter Component */}
        <ActivityTableFilter
          searchQuery={searchQuery}
          setSearchQuery={handleSearchChange}
          selectedFilter={selectedFilter}
          setSelectedFilter={(value) => handleFilterChange('activity', value)}
          selectedTimeframe={selectedTimeframe}
          setSelectedTimeframe={(value) => handleFilterChange('timeframe', value)}
          selectedSort={selectedSort}
          setSelectedSort={(value) => handleFilterChange('sort', value)}
          showMobileHeader={showMobileHeader}
          title={title}
          onReset={handleReset}
          filterConfig={filterConfig}
        />

        <div className="
          block-2 bg-[#fdfdf8cf] rounded-t-[12px] mt-2
          border border-[#8989893b]
          flex flex-col flex-1 overflow-hidden

          max-[767px]:border-none
          max-[767px]:bg-[#f3f3f6] max-[767px]:!w-[99.5%]
        ">
          
          {/* Desktop Table Header */}
          <div className="mt-4 px-4 sm:px-4 py-2 mb-0 hidden md:grid gap-2 pb-2 mb-0 table-header w-[97%] bg-[#ededed7a] mx-auto my-3.5 rounded-[4px]" 
               style={{ gridTemplateColumns: desktopGridCols }}>
            {columns.map((column, idx) => (
              <div key={idx} className={`flex items-center gap-2 font-poppins text-sm font-normal text-[#606068] ${column.className || ''} ${column.label === 'Action' ? 'justify-end' : ''}`}>
                <span>{column.label}1</span>
                {column.sortable && column.label !== 'Action' && (
                  <img
                    src="https://c.animaapp.com/mjiggi0jSqvoj5/img/filter--1--7.png"
                    alt="Sort"
                    className="w-3 h-3"
                  />
                )}
              </div>
            ))}
          </div>
          
          {/* Table Rows Container with Scroll */}
          <div className="
            table-rows-cont
            px-0
            md:px-4
            xl:px-4
            block-2
            space-y-2
            activity-table
            overflow-y-auto
            flex-1
            max-h-[calc(100vh-300px)]
            min-h-[400px]
            xs:p-0 xs:m-0 xs:w-full

            /* Mobile background */
            xs:bg-[#eff1f1]

            /* Mobile max-height */
            xs:max-h-[80vh]

            max-[767px]:!w-[100%]
            max-[767px]:!rounded-[10px]
          ">
            {filteredRows.length > 0 ? (
              filteredRows.map((row, rowIndex) => (
                <div key={rowIndex} className="
                  mob-ly-item tab-item 
                  p-4 md:p-3 
                  bg-[#fdfdf8f5] rounded-lg 
                  flex flex-wrap items-center 
                  hover:bg-[#ffffff] transition-colors duration-300
                     
                  /* Mobile styles */
                  xs:min-w-full xs:flex xs:bg-[rgba(250,252,255,0.8)] 
                  xs:rounded-[16px] xs:flex-wrap xs:gap-4 xs:justify-between 
                  xs:p-0 xs:mb-3 xs:border-b xs:border-solid xs:border-[#d1d1d140]
                  xs:hover:bg-[#f6f6ec]
                  
                  /* Desktop styles */
                  md:bg-transparent md:!m-0 md:!border-b md:!border-solid md:!border-[#ededf3] md:!rounded-none
                  md:hover:!bg-[#f0f0f5e8] md:grid"
                     style={{ 
                       gridTemplateColumns: desktopGridCols
                     }}>
                  
                  {/* Desktop Columns */}
                  {columns.map((column, colIndex) => (
                    <div key={colIndex} className={`${column.className || ''} ${column.desktopVisible === false ? 'hidden lg:block' : 'hidden md:block'}`}>
                      {column.render ? (
                        column.render(row[column.key], row)
                      ) : (
                        <div className="font-poppins text-sm text-black truncate row-cell">
                          {row[column.key]}
                        </div>
                      )}
                    </div>
                  ))}
                  
                  {/* Mobile Layout - Դիզայնը օրիգինալի նման */}
                  <div className="md:hidden w-full mob-lay">
                    {/* Top row: Type/ID on left, Status on right */}
                    <div className="flex justify-between items-center mb-4">
                      <div className="flex items-center gap-2">
                        {row.type && (
                          <span className="font-poppins text-sm font-normal text-black xs:text-[16px]">{row.type}</span>
                        )}
                        <span className="font-poppins text-sm text-[#2563eb] underline xs:text-[#2563eb]">{row.id}</span>
                      </div>
                      
                      {/* Status badge */}
                      {row.status && (
                        <div className="row-cell flex-shrink-0">
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[37px] font-poppins text-xs ${row.status.color} ${row.status.textColor} 
                            w-fit min-w-fit whitespace-nowrap pl-3 pr-3 h-[26px] items-center transition-all duration-300
                            xs:text-[10px] xs:px-2 xs:py-1.5 xs:h-[22px] xs3:text-[11px] xs3:px-2.5 xs3:py-1.5 xs3:h-[24px]`}>
                            <span className={`w-2 h-2 rounded-full ${row.status.dot}`}></span>
                            {row.status.text}
                          </span>
                        </div>
                      )}
                    </div>
                    
                    {/* Middle rows: Other columns */}
                    {columns
                      .filter(col => 
                        col.key !== 'type' && 
                        col.key !== 'id' && 
                        col.key !== 'status' && 
                        col.key !== 'button' &&
                        (col.mobileVisible !== false)
                      )
                      .map((column, idx) => (
                        <div key={idx} className="flex justify-between items-center mb-4">
                          <div className="flex items-center gap-2">
                            {/* Կարող եք ավելացնել իկոններ ըստ key-ի */}
                            {column.key === 'cargo' && (
                              <img 
                                src="/table/package-stroke-rounded.svg" 
                                alt="Cargo" 
                                className="w-4 h-4 xs:w-[16px] xs:h-[16px] xs2:w-[14px] xs2:h-[14px] opacity-80 hover:opacity-100"
                              />
                            )}
                            <span className="font-poppins text-sm text-gray-700">{column.label}</span>
                          </div>
                          <span className="font-poppins text-sm font-normal text-black">
                            {column.mobileRender ? column.mobileRender(row[column.key], row) : row[column.key]}
                          </span>
                        </div>
                      ))
                    }
                    
                    {/* Date row if exists */}
                    {row.date && (
                      <div className="flex justify-between items-center mb-4">
                        <div className="flex items-center gap-2">
                          <img 
                            src="/table/clock.svg" 
                            alt="Time" 
                            className="w-4 h-4 xs:w-[16px] xs:h-[16px] xs2:w-[14px] xs2:h-[14px]"
                          />
                          <span className="font-poppins text-sm text-gray-700">Date</span>
                        </div>
                        <div className="font-poppins text-sm text-gray-600 xs2:text-[12px]">{row.date}</div>
                      </div>
                    )}
                    
                    {/* Divider line */}
                    <div className="border-t border-[#f2f2ed] my-3 xs:my-3"></div>
                    
                    {/* Bottom row: Button */}
                    {row.button && (
                      <div className="flex items-center justify-between xs:flex xs:items-center xs:gap-3 xs:w-full xs4:flex-col xs4:gap-2">
                        {/* Date with clock icon - only if not already shown */}
                        {!row.date && (
                          <div className="flex items-center gap-2 w-1/2 xs4:w-full xs4:justify-center xs4:mb-1">
                            <img 
                              src="/table/clock.svg" 
                              alt="Time" 
                              className="w-4 h-4 xs:w-[16px] xs:h-[16px] xs2:w-[14px] xs2:h-[14px]"
                            />
                            <div className="font-poppins text-sm text-gray-600 xs2:text-[12px]">
                              {row.date || row.expirationDate || 'N/A'}
                            </div>
                          </div>
                        )}
                        
                        {/* Button */}
                        <div className={`${!row.date ? 'w-[47%]' : 'w-full'} xs4:w-full xs:pl-1.5`}>
                          <button className={`
                            h-[44px] w-full rounded-lg font-inter text-sm justify-center items-center gap-2 transition-colors duration-300
                            ${row.button.variant === 'primary' 
                              ? 'bg-[#2563EB] text-white border border-[rgba(255,255,255,0.22)] hover:bg-[#1d4ed8] hover:text-white hover:border-[#d1d5db]' 
                              : 'bg-transparent text-[#374151] border border-[#e3e6ea] hover:bg-[#f3f4f6] hover:text-white hover:border-[#d1d5db]'
                            }
                            xs:text-[14px] xs:font-medium xs:w-[95%] xs:min-w-0
                            xs2:text-[13px] xs2:px-1.5 xs2:py-2.5 xs2:h-[40px] xs2:max-w-[95%]
                          `}
                          onClick={() => row.button?.onClick?.(row)}>
                            {row.button.text}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))
            ) : (
              emptyState || defaultEmptyState
            )}
          </div>
        </div>
      </section>
    </>
  );
};

// Helper function for status rendering
export const renderStatus = (status: { text: string; color: string; dot: string; textColor: string }) => (
  <span className={`!font-medium inline-flex items-center gap-1.5 px-2 py-0.5 rounded-[37px] font-poppins text-xs ${status.color} ${status.textColor}`}>
    <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`}></span>
    {status.text}
  </span>
);

// Helper function for button rendering
export const renderButton = (button: { text: string; variant: 'primary' | 'secondary'; onClick?: (row: any) => void }, row: any) => (
  <button
    className={`h-9 px-4 rounded-lg font-poppins text-sm font-normal transition-colors duration-300 w-full xl:w-[140px] ${
      button.variant === 'primary'
        ? 'bg-[#2563eb] text-white hover:bg-[#1d4ed8]'
        : 'bg-transparent text-[#374151] border border-[#e3e6ea] hover:bg-[#f3f4f6] hover:border-[#d1d5db]'
    }`}
    onClick={() => button.onClick?.(row)}
  >
    {button.text}
  </button>
);

// Helper function for mobile value rendering with icons
export const renderMobileValue = (key: string, value: string) => {
  const icons: Record<string, string> = {
    'cargo': '/table/package-stroke-rounded.svg',
    'value': '/table/dollar.svg',
    'shipmentValue': '/table/dollar.svg',
    'premiumAmount': '/table/money-bag.svg',
    'expirationDate': '/table/calendar.svg',
    'date': '/table/clock.svg'
  };
  
  const icon = icons[key];
  
  return (
    <div className="flex items-center gap-2">
      {icon && (
        <img 
          src={icon} 
          alt={key} 
          className="w-4 h-4 xs:w-[16px] xs:h-[16px] xs2:w-[14px] xs2:h-[14px] opacity-80 hover:opacity-100"
        />
      )}
      <span>{value}</span>
    </div>
  );
};