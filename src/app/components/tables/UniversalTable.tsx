import React, { useState, useMemo } from 'react';
import { ActivityTableFilter } from './ActivityTableFilter';

interface TableColumn {
  key: string;
  label: string;
  sortable?: boolean;
  className?: string;
  hideOnMobile?: boolean;
  hideOnMedium?: boolean;
  showOnLarge?: boolean;
  renderDesktop?: (value: any, row: TableRow) => React.ReactNode;
}

interface TableRow {
  [key: string]: any;
  id: string | number;
  type?: string;
  cargo?: string;
  value?: string;
  shipmentValue?: string;
  premiumAmount?: string;
  expirationDate?: string;
  status?: {
    text: string;
    color: string;
    dot: string;
    textColor: string;
    borderColor?: string;
  };
  date?: string;
  lastUpdate?: string;
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
  mobileDesign?: {
    showType?: boolean;
    showCargoIcon?: boolean;
    showDateIcon?: boolean;
    showExpiringIcon?: boolean; // Ավելացրեք այս տողը
    dateLabel?: string;
    buttonWidth?: string;
  };
  desktopGridCols?: string;
  mobileDesignType?: 'dashboard' | 'quotes';
}

const getColumnVisibilityClass = (column: TableColumn): string => {
  const classes: string[] = [];
  
  if (column.className) {
    classes.push(column.className);
  }
  
  if (column.hideOnMedium) {
    classes.push('hidden md:block lg:hidden xl:block');
  }
  
  if (column.showOnLarge) {
    classes.push('hidden lg:block');
  }
  
  return classes.join(' ');
};

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
  emptyState,
  mobileDesign = {
    showType: true,
    showCargoIcon: true,
    showDateIcon: true,
    showExpiringIcon: true,
    dateLabel: 'Last Update',
    buttonWidth: '47%'
  },
  desktopGridCols,
  mobileDesignType = 'dashboard'
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
  
  // Ֆիլտրել ըստ ժամանակային միջակայքի (եթե կան օրինակներ)
  if (filterConfig.showTimeframeFilter) {
    if (selectedTimeframe === 'Last 7 days') {
      filtered = filtered.slice(0, 3);
    }
  }
  
  // Ֆիլտրել ըստ activity (status)
  if (filterConfig.showActivityFilter && selectedFilter !== 'All Activity') {
    filtered = filtered.filter(row => {
      const statusText = row.status?.text?.toLowerCase() || '';
      const rowStatus = row.quoteStatus || row.status?.text || '';
      
      // Status-ների քարտեզագրում ըստ selectedFilter-ի
      const filterMap: Record<string, string[]> = {
        'Draft': ['draft', 'continue quote'],
        'Submitted': ['submitted', 'waiting for review'],
        'Under Review': ['under review', 'documents under review'],
        'Approved': ['approved', 'approved & paid'],
        'Rejected': ['rejected'],
        'Expired': ['expired'],
        'Fix & Resubmit': ['fix and resubmit'],
        'Pay to Activate': ['pay to activate']
      };
      
      const targetStatuses = filterMap[selectedFilter] || [];
      
      // Ստուգել թե՛ status.text, թե՛ quoteStatus
      return targetStatuses.some(target => 
        statusText.includes(target.toLowerCase()) || 
        rowStatus.toLowerCase().includes(target.toLowerCase())
      );
    });
  }
  
  return filtered;
};

const filteredRows = useMemo(() => {
  const filtered = getFilteredRows();
  
  // Սորտավորումը կիրառենք արտաքին useMemo-ում
  let sorted = [...filtered];
  
  if (filterConfig.showSortFilter) {
    if (selectedSort === 'Date') {
      sorted.sort((a, b) => {
        const dateA = a.date ?? a.expirationDate ?? a.lastUpdate ?? '1970-01-01';
        const dateB = b.date ?? b.expirationDate ?? b.lastUpdate ?? '1970-01-01';
        return new Date(dateB).getTime() - new Date(dateA).getTime();
      });
    } else if (selectedSort === 'Value') {
      sorted.sort((a, b) => {
        const aValue = parseFloat((a.value || a.shipmentValue || '0').replace(/[^\d.-]/g, ''));
        const bValue = parseFloat((b.value || b.shipmentValue || '0').replace(/[^\d.-]/g, ''));
        return bValue - aValue;
      });
    } else if (selectedSort === 'Type') {
      sorted.sort((a, b) => (a.type || '').localeCompare(b.type || ''));
    } else if (selectedSort === 'Status') {
      // Status sort - դեֆոլտ
      const statusOrder: Record<string, number> = {
        'Pending': 1,
        'Active': 2,
        'Expiring': 3,
        'Missing': 4,
        'Declined': 5
      };
      
      sorted.sort((a, b) => {
        const statusA = a.status?.text || '';
        const statusB = b.status?.text || '';
        const orderA = statusOrder[statusA] || 999;
        const orderB = statusOrder[statusB] || 999;
        return orderA - orderB;
      });
    }
  }
  
  if (!searchQuery.trim()) {
    return sorted;
  }
  
  const query = searchQuery.toLowerCase().trim();
  return sorted.filter(row => {
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
}, [searchQuery, selectedFilter, selectedTimeframe, selectedSort, rows, columns, filterConfig.showSortFilter]);


  const handleReset = () => {
    setSelectedFilter(initialFilters.activity || 'All Activity');
    setSelectedTimeframe(initialFilters.timeframe || 'Last 30 days');
    setSelectedSort(initialFilters.sort || 'Status');
    setSearchQuery('');
  };

// UniversalTable.tsx - փոխարինեք defaultEmptyState-ը այս կոդով

// Գրադիենտով տարբերակ
// Ժամանակակից մոդեռն տարբերակ
// Սուպեր մոդեռն մինիմալիստիկ տարբերակ
// 3D էֆեկտով տարբերակ (պահանջում է CSS)
// Գեղեցիկ 3D տարբերակ բարելավված էֆեկտներով
// Պարզ Cube էֆեկտ
// Կոմպակտ 3D տարբերակ
// Premium տարբերակ - ավելի ժամանակակից և գրավիչ
const defaultEmptyState = (
  <div className="relative flex flex-col items-center justify-center py-10 px-4">
    {/* Glassmorphism 3D Card */}
    <div className="mb-7 relative group">
      <div className="relative w-20 h-20">
        {/* Glass Card */}
        <div className="
          absolute inset-0 
          bg-white/80 backdrop-blur-sm
          rounded-xl 
          border border-white/60
          shadow-[0_8px_32px_rgba(31,38,135,0.07)]
          flex items-center justify-center
          transform transition-all duration-500 
          group-hover:scale-110 group-hover:shadow-[0_12px_48px_rgba(37,99,235,0.15)]
          group-hover:border-blue-300/40
        ">
          {/* Animated Gradient Icon */}
          <div className="relative">
            <div className="
              w-12 h-12 
              bg-gradient-to-br from-blue-500 via-blue-600 to-cyan-500
              rounded-lg 
              flex items-center justify-center 
              shadow-lg shadow-blue-500/30
              animate-gradient-x
            ">
              <svg 
                className="w-5 h-5 text-white" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                {rows.length === 0 && !searchQuery ? (
                  // Նոր օգտատեր / առանց տվյալների
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2.2} 
                    d="M12 4v16m8-8H4" 
                  />
                ) : searchQuery ? (
                  // Որոնման արդյունք չկա
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2.2} 
                    d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" 
                  />
                ) : (
                  // Ֆիլտրի արդյունք չկա
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2.2} 
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" 
                  />
                )}
              </svg>
            </div>
            
            {/* 3D Depth Effect */}
            <div className="
              absolute -inset-2 border-2 border-blue-300/20 rounded-xl
              transform -rotate-3
              transition-transform duration-700 group-hover:rotate-3
            "></div>
          </div>
        </div>
        
        {/* Floating Particles */}
        <div className="absolute inset-0">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="
                absolute w-1 h-1 
                bg-gradient-to-r from-blue-400 to-cyan-400 
                rounded-full
                animate-float-fast
              "
              style={{
                top: `${Math.sin(i * 2 * Math.PI/3) * 32 + 50}%`,
                left: `${Math.cos(i * 2 * Math.PI/3) * 32 + 50}%`,
                animationDelay: `${i * 0.2}s`
              }}
            />
          ))}
        </div>
        
        {/* Glow Ring */}
        <div className="
          absolute -inset-3 
          bg-gradient-to-r from-blue-400/20 via-cyan-400/10 to-purple-400/20
          rounded-2xl 
          blur-md 
          opacity-0 
          group-hover:opacity-60
          transition-opacity duration-500
        "></div>
      </div>
      
      {/* Subtle Shadow */}
      <div className="
        absolute -bottom-1 inset-x-0 h-2 
        bg-gradient-to-t from-gray-200/30 to-transparent 
        blur-sm 
        rounded-full
        transform scale-x-90
      "></div>
    </div>
    
    {/* Content - տարբեր հաղորդագրություններ տարբեր դեպքերի համար */}
    <div className="text-center space-y-2.5 mb-7 max-w-xs">
      <h3 className="font-poppins font-semibold text-lg text-gray-900 tracking-tight">
        {rows.length === 0 && !searchQuery ? (
          // Նոր օգտատեր / առանց տվյալների
          <span className="bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
            Welcome aboard! 🚀
          </span>
        ) : searchQuery ? (
          // Որոնման արդյունք չկա
          <span className="bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
            No matches found
          </span>
        ) : (
          // Ֆիլտրի արդյունք չկա
          <span className="bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
            Nothing to show
          </span>
        )}
      </h3>
      
      <p className="font-poppins text-gray-500 text-xs leading-relaxed px-2">
        {rows.length === 0 && !searchQuery ? (
          // Նոր օգտատեր / առանց տվյալների
          "Start by creating your first quote or policy to see it appear here"
        ) : searchQuery ? (
          `"${searchQuery}" didn't match any policies in the database`
        ) : (
          "Try adjusting your filters or selecting different options"
        )}
      </p>
    </div>
    
    {/* Actions - տարբեր կոճակներ տարբեր դեպքերի համար */}
    <div className="flex gap-2.5">
      {rows.length === 0 && !searchQuery ? (
        // Նոր օգտատերի համար - "Get Started" կոճակ
        <button 
          onClick={() => window.location.href = '/create-quote'} // Կամ այլ նավարկություն
          className="
            relative
            px-5 py-2.5
            bg-gradient-to-r from-blue-600 to-cyan-500
            text-white 
            rounded-lg
            font-poppins font-medium text-xs
            hover:from-blue-700 hover:to-cyan-600
            transition-all duration-300
            shadow-lg hover:shadow-xl
            hover:-translate-y-0.5
            flex items-center gap-1.5
            overflow-hidden
            group/btn
          "
        >
          {/* Shine Effect */}
          <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover/btn:translate-x-[100%] transition-transform duration-700"></span>
          
          <svg className="w-3.5 h-3.5 relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
          </svg>
          <span className="relative z-10">Get Started</span>
        </button>
      ) : (
        // Ֆիլտրի կամ որոնման դեպքում
        <>
          <button 
            onClick={handleReset}
            className="
              relative
              px-4 py-2.5
              bg-gradient-to-r from-gray-900 to-gray-800
              text-white 
              rounded-lg
              font-poppins font-medium text-xs
              hover:from-gray-800 hover:to-gray-700
              transition-all duration-300
              shadow-md hover:shadow-lg
              hover:-translate-y-0.5
              flex items-center gap-1.5
              overflow-hidden
              group/btn
            "
          >
            {/* Shine Effect */}
            <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover/btn:translate-x-[100%] transition-transform duration-700"></span>
            
            <svg className="w-3.5 h-3.5 relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span className="relative z-10">Reset All</span>
          </button>
          
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery('')}
              className="
                px-4 py-2.5
                bg-white 
                text-gray-700 
                rounded-lg
                font-poppins font-medium text-xs
                border border-gray-200
                hover:border-gray-300 hover:bg-gray-50
                transition-all duration-300
                shadow-sm hover:shadow
                hover:-translate-y-0.5
                flex items-center gap-1.5
              "
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
              Clear Search
            </button>
          )}
        </>
      )}
    </div>
    
    {/* Quick Tips */}
    {rows.length === 0 && !searchQuery ? (
      // Նոր օգտատերի համար - օգտակար հուշումներ
      <div className="mt-6 pt-5 border-t border-gray-100/60 w-full max-w-xs">
        <div className="flex flex-col items-center gap-3 text-[11px] text-gray-400">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 transition-colors hover:text-gray-600 cursor-help">
              <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse"></div>
              Create your first quote
            </span>
            <div className="w-0.5 h-0.5 bg-gray-300 rounded-full"></div>
            <span className="flex items-center gap-1.5 transition-colors hover:text-gray-600 cursor-help">
              <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse delay-150"></div>
              Submit for approval
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 transition-colors hover:text-gray-600 cursor-help">
              <div className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-pulse delay-300"></div>
              Track status
            </span>
            <div className="w-0.5 h-0.5 bg-gray-300 rounded-full"></div>
            <span className="flex items-center gap-1.5 transition-colors hover:text-gray-600 cursor-help">
              <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-pulse delay-450"></div>
              Manage policies
            </span>
          </div>
        </div>
      </div>
    ) : (
      // Ֆիլտրի դեպքում - ֆիլտրի հուշումներ
      <div className="mt-6 pt-5 border-t border-gray-100/60 w-full max-w-xs">
        <div className="flex items-center justify-center gap-3 text-[11px] text-gray-400">
          <span className="flex items-center gap-1.5 transition-colors hover:text-gray-600 cursor-help">
            <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse"></div>
            All Activity
          </span>
          <div className="w-0.5 h-0.5 bg-gray-300 rounded-full"></div>
          <span className="flex items-center gap-1.5 transition-colors hover:text-gray-600 cursor-help">
            <div className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-pulse delay-150"></div>
            Last 7 days
          </span>
          <div className="w-0.5 h-0.5 bg-gray-300 rounded-full"></div>
          <span className="flex items-center gap-1.5 transition-colors hover:text-gray-600 cursor-help">
            <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-pulse delay-300"></div>
            Reset filters
          </span>
        </div>
      </div>
    )}
  </div>
);


  const visibleDesktopColumns = columns.filter(col => !col.hideOnMobile);
  const computedDesktopGridCols = desktopGridCols || `0.7fr repeat(${visibleDesktopColumns.length - 3}, minmax(0, 1fr)) 0.9fr 1fr`;

  const renderDesktopCell = (column: TableColumn, row: TableRow) => {
    if (column.renderDesktop) {
      return column.renderDesktop(row[column.key], row);
    }
    if (column.key === 'status' && row.status) {
      return renderStatus(row.status);
    }
    if (column.key === 'button' && row.button) {
      return renderButton(row.button, row);
    }
    return (
      <div className="font-poppins text-sm text-black truncate row-cell">
        {row[column.key]}
      </div>
    );
  };

  // Helper function to get status border color
  const getStatusBorderColor = (status: TableRow['status']) => {
    if (!status) return '#e5e7eb';
    
    // Map status colors to border colors
    const statusBorderMap: Record<string, string> = {
      'Active': '#10b981',
      'Pending': '#f59e0b',
      'Expiring': '#ef4444',
      'Missing': '#8b5cf6',
      'Declined': '#6b7280',
      'Pending Approval': '#f59e0b',
      'Document Missing': '#8b5cf6',
      'Expires': '#ef4444'
    };
    
    return statusBorderMap[status.text] || status.borderColor || '#e5e7eb';
  };

  const renderQuotesMobileDesign = (row: TableRow) => (
    <div className="md:hidden w-full mob-lay">
      {/* 1-ին բլոկ՝ ID և Status */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          <span className="font-poppins text-sm text-[#2563eb] underline xs:text-[#2563eb]">
            {row.id}
          </span>
        </div>
        
        {row.status && (
          <div className="row-cell flex-shrink-0">
            <span className={`
              inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[37px] font-poppins text-xs 
              ${row.status.color} ${row.status.textColor}
              w-fit min-w-fit whitespace-nowrap pl-3 pr-3 h-[26px] items-center transition-all duration-300
              xs:text-[10px] xs:px-2 xs:py-1.5 xs:h-[22px] xs3:text-[11px] xs3:px-2.5 xs3:py-1.5 xs3:h-[24px]
            `}>
              <span className={`w-2 h-2 rounded-full ${row.status.dot}`}></span>
              {row.status.text}
            </span>
          </div>
        )}
      </div>
      
      {/* 2-րդ բլոկ՝ Cargo */}
      {row.cargo && (
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2 w-full">
            <img 
              src="/table/package-stroke-rounded.svg" 
              alt="Cargo" 
              className="w-4 h-4 xs:w-[16px] xs:h-[16px] xs2:w-[14px] xs2:h-[14px] opacity-80 hover:opacity-100"
            />
            <div className="font-poppins text-sm flex-1">
              <span className="text-[#606068]">Cargo</span>
              <span className="text-[#CCCDD1] mx-1">/</span>
              <span className="text-black">{row.cargo}</span>
            </div>
          </div>
        </div>
      )}
      
      {/* 3-րդ բլոկ՝ Shipment Value և Premium Amount */}
      <div className="space-y-3 mb-4 flex items-center justify-between">
        {/* Shipment Value */}
        {(row.shipmentValue || row.value) && (
          <div className="mb-0">
            <div className="flex items-center gap-2 w-full">
              <div className="font-poppins text-sm flex-1">
                <span className="text-[#606068]">Shipment</span>
                <span className="text-[#CCCDD1] mx-1">/</span>
                <span className="text-black">{row.shipmentValue || row.value}</span>
              </div>
            </div>
          </div>
        )}
        
        {/* Premium Amount */}
        {row.premiumAmount && (
          <div className="mb-0">
            <div className="flex items-center gap-2 w-full">
              <div className="font-poppins text-sm flex-1">
                <span className="text-[#606068]">Premium</span>
                <span className="text-[#CCCDD1] mx-1">/</span>
                <span className="text-black">{row.premiumAmount}</span>
              </div>
            </div>
          </div>
        )}
      </div>
      
      <div className="border-t border-[#f2f2ed] my-3 xs:my-3"></div>
      
      {/* 4-րդ բլոկ՝ Expiration Date և Button */}
      <div className="flex items-center justify-between">
        {/* Expiration Date */}
        {row.expirationDate && (
          <div className="flex items-center gap-2">
            <img 
              src="/table/clock.svg" 
              alt="Expiration" 
              className="w-4 h-4 xs:w-[16px] xs:h-[16px] xs2:w-[14px] xs2:h-[14px]"
            />
            <div className="font-poppins">
              <span className="text-black text-[13px]">{row.expirationDate}</span>
            </div>
          </div>
        )}
        
        {/* Button */}
        {row.button && (
          <div className="flex-1 flex justify-end">
            <button 
              className={`
                h-[36px] px-4 rounded-lg font-inter text-sm justify-center items-center gap-2 
                transition-colors duration-300 min-w-[140px]
                ${row.button.variant === 'primary' 
                  ? 'bg-[#2563EB] text-white border border-[rgba(255,255,255,0.22)] hover:bg-[#1d4ed8]' 
                  : 'bg-transparent text-[#374151] border border-[#e3e6ea] hover:bg-[#f3f4f6]'
                }
                xs:text-[14px] xs:font-medium
                xs2:text-[13px] xs2:px-1.5 xs2:py-2.5 xs2:h-[40px]
              `}
              onClick={() => row.button?.onClick?.(row)}
            >
              {row.button.text}
            </button>
          </div>
        )}
      </div>
    </div>
  );
const renderDashboardMobileDesign = (row: TableRow) => (
  <div className="md:hidden w-full mob-lay">
    <div className="flex justify-between items-center mb-4">
      <div className="flex items-center gap-2">
        {mobileDesign.showType && row.type && (
          <span className="font-poppins text-sm font-normal text-black xs:text-[16px]">{row.type}</span>
        )}
        <span className="font-poppins text-sm text-[#2563eb] underline xs:text-[#2563eb]">{row.id}</span>
      </div>
      
      {row.status && (
        <div className="row-cell flex-shrink-0">
          <span className={`
            inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[37px] font-poppins text-xs 
            ${row.status.color} ${row.status.textColor}
            w-fit min-w-fit whitespace-nowrap pl-3 pr-3 h-[26px] items-center transition-all duration-300
            xs:text-[10px] xs:px-2 xs:py-1.5 xs:h-[22px] xs3:text-[11px] xs3:px-2.5 xs3:py-1.5 xs3:h-[24px]
          `}>
            <span className={`w-2 h-2 rounded-full ${row.status.dot}`}></span>
            {row.status.text}
          </span>
        </div>
      )}
    </div>
      
      {/* Cargo and Value Section */}
      {(row.cargo || row.value) && (
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2">
            {mobileDesign.showCargoIcon && (
              <img 
                src="/table/package-stroke-rounded.svg" 
                alt="Cargo" 
                className="w-4 h-4 xs:w-[16px] xs:h-[16px] xs2:w-[14px] xs2:h-[14px] opacity-80 hover:opacity-100"
              />
            )}
            <span className="font-poppins text-sm text-gray-700">
              {row.cargo ? 'Cargo' : 'Value'}
            </span>
          </div>
          <div className="font-poppins text-sm font-normal text-black">
            {row.cargo || `$${row.value?.toLocaleString?.() || row.value}`}
          </div>
        </div>
      )}
      
      {/* Expiring Date Section - Ավելացրել ենք */}
      {row.expiringDays !== undefined && row.expiringDays !== null && (
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2">
            <img 
              src="/table/calendar.svg" 
              alt="Expiring" 
              className="w-4 h-4 opacity-80 xs:w-[16px] xs:h-[16px] xs2:w-[14px] xs2:h-[14px]"
            />
            <span className="font-poppins text-sm text-gray-700">Expiring</span>
          </div>
          <div className={`font-poppins text-sm ${
            row.expiringDays === 0 ? 'text-amber-600 font-medium' :
            row.expiringDays > 0 ? 'text-gray-700' : 'text-rose-600'
          }`}>
            {row.expiringDays === 0 ? 'Today' :
             row.expiringDays > 0 ? `${row.expiringDays} day${row.expiringDays !== 1 ? 's' : ''} left` :
             `${Math.abs(row.expiringDays)} day${Math.abs(row.expiringDays) !== 1 ? 's' : ''} ago`}
          </div>
        </div>
      )}
      
      {/* Value Section (եթե առանձին կա) */}
      {row.value && !row.cargo && (
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2">
            <img 
              src="/table/dollar-sign.svg" 
              alt="Value" 
              className="w-4 h-4 opacity-80"
            />
            <span className="font-poppins text-sm text-gray-700">Value</span>
          </div>
          <div className="font-poppins text-sm font-normal text-black">
            ${row.value?.toLocaleString?.() || row.value}
          </div>
        </div>
      )}
      
      <div className="border-t border-[#f2f2ed] my-3 xs:my-3"></div>
      
      <div className="flex items-center justify-between xs:flex xs:items-center xs:gap-3 xs:w-full xs4:flex-col xs4:gap-2">
        {(row.date || row.lastUpdate) && (
          <div className="flex items-center gap-2 w-1/2 xs4:w-full xs4:justify-center xs4:mb-1">
            {mobileDesign.showDateIcon && (
              <img 
                src="/table/clock.svg" 
                alt="Time" 
                className="w-4 h-4 xs:w-[16px] xs:h-[16px] xs2:w-[14px] xs2:h-[14px]"
              />
            )}
            <div className="font-poppins text-sm text-gray-600 xs2:text-[12px]">
              {row.date || row.lastUpdate || mobileDesign.dateLabel}
            </div>
          </div>
        )}
        
        {row.button && (
          <div className={`${row.date || row.lastUpdate ? mobileDesign.buttonWidth : 'w-full'} xs4:w-full xs:pl-1.5`}>
           <button className={`
  h-[36px] px-4 w-full rounded-lg font-inter text-sm justify-center items-center gap-2 transition-colors duration-300
  ${row.button.variant === 'primary' 
    ? 'bg-[#2563EB] text-white border border-[rgba(255,255,255,0.22)] hover:bg-[#1d4ed8] hover:text-white hover:border-[#d1d5db]' 
    : (row.button.variant as string) === 'success'
    ? 'bg-[#10B981] text-white border border-[rgba(255,255,255,0.22)] hover:bg-[#059669]'
    : 'bg-transparent text-[#374151] border border-[#e3e6ea] hover:bg-[#f3f4f6] hover:text-white hover:border-[#d1d5db]'
  }
  xs:text-[14px] xs:font-medium xs:w-[95%] xs:min-w-0
  xs2:text-[13px] xs2:px-1.5 xs2:py-2.5 xs2:h-[40px] xs2:max-w-[95%]
`}
onClick={() => row.button?.onClick?.(row)}>
  {row.button.text}
</button>
          </div>
        )}
      </div>
    </div>
  );
  return (
    <>
      <section className="
        block-2 flex flex-col h-full relative py-4 xl:py-4
        border border-[#d1d1d12b] bg-[#f9f9f6ba] rounded-[16px] overflow-hidden
        md:border md:border-solid md:border-[#d1d1d154]
        md:bg-[#fafaf7]/80 md:rounded-[16px]
        md:pt-[16px]
        md:!pb-0
        max-[767px]:border-none 
        max-[767px]:bg-transparent 
        max-[767px]:p-0 
        max-[767px]:rounded-none
        max-[767px]:!w-[100%]
        max-[767px]:!overflow-hidden
      ">
        
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
          max-[767px]:bg-[#f3f3f6] max-[767px]:!w-[99.5%] pb-2
        ">
          
          {/* Desktop Table Header */}
          <div className="mt-4 px-4 sm:px-4 py-2 mb-0 hidden md:grid gap-2 pb-2 mb-0 table-header w-[97%] bg-[#ededed7a] mx-auto my-3.5 rounded-[4px]" 
               style={{ gridTemplateColumns: computedDesktopGridCols, gap: "16px" }}>
            {visibleDesktopColumns.map((column, idx) => (
              <div key={idx} className={`max-w-[80%] flex items-center gap-2 font-poppins text-sm font-normal text-[#606068] ${getColumnVisibilityClass(column)} ${column.label === 'Action' ? 'justify-end' : ''}`}>
                <span>{column.label}</span>
                {column.sortable && column.label !== 'Action'}
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
            xs:bg-[#eff1f1]
            xs:max-h-[80vh]
            max-[767px]:!w-[100%]
            max-[767px]:!rounded-[10px]
          ">
            {filteredRows.length > 0 ? (
              filteredRows.map((row, rowIndex) => (
                <div 
                  key={rowIndex} 
                  className="
                    mob-ly-item tab-item 
                    md:grid
                    p-4 md:p-3 
                    bg-[#fdfdf8f5] rounded-lg 
                    flex flex-wrap items-center 
                    transition-all duration-300 ease-in-out
                    xs:min-w-full xs:flex xs:bg-[rgba(250,252,255,0.8)] 
                    xs:rounded-[16px] xs:flex-wrap xs:gap-4 xs:justify-between 
                    xs:p-0 xs:mb-3 xs:border-b xs:border-solid xs:border-[#d1d1d140]
                    md:bg-transparent md:!m-0 md:!border-b md:!border-solid md:!border-[#ededf3] md:!rounded-none
                    
                    relative overflow-hidden
                    hover:shadow-[0_4px_20px_-2px_rgba(0,0,0,0.05)]
                    hover:translate-y-[-1px]
                    
                    before:absolute before:left-0 before:top-0 before:bottom-0 
                    before:w-1 before:transition-all before:duration-300
                    before:opacity-0 hover:before:opacity-100
                  "
                  style={{ 
                    gridTemplateColumns: computedDesktopGridCols,
                    // Apply status-specific border color on hover
                    '--status-border-color': getStatusBorderColor(row.status),
                    gap: "16px"
                  } as React.CSSProperties}
                >
                  {/* Status colored left border (desktop only) */}
                  <div className="
                    absolute left-0 top-0 bottom-0 w-1 
                    transition-all duration-300
                    opacity-0 hover:opacity-100
                    md:block
                  " style={{ backgroundColor: getStatusBorderColor(row.status) }} />
                  
                  {/* Desktop Columns */}
                  {visibleDesktopColumns.map((column, colIndex) => (
                    <div key={colIndex} className={`${getColumnVisibilityClass(column)} hidden md:flex`}>
                      {renderDesktopCell(column, row)}
                    </div>
                  ))}
                  
                  {/* Mobile Layout */}
                  {mobileDesignType === 'quotes' 
                    ? renderQuotesMobileDesign(row)
                    : renderDashboardMobileDesign(row)
                  }
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

// Helper functions
export const renderStatus = (status: { text: string; color: string; dot: string; textColor: string }) => (
  <span className={`!font-medium inline-flex items-center gap-1.5 px-2 py-0.5 rounded-[37px] font-poppins text-xs ${status.color} ${status.textColor}`}>
    <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`}></span>
    {status.text}
  </span>
);

// src/app/components/tables/UniversalTable.tsx

// Ստեղծեք interface button-ի համար
interface TableButton {
  text: string;
  variant: 'primary' | 'secondary' | 'success' | 'warning' | 'danger';
  onClick?: (row: any) => void;
}

// const buttonClasses-ը դարձրեք Record տեսակի
const buttonClasses: Record<string, string> = {
  primary: 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white',
  secondary: 'bg-transparent border border-[#2563eb] text-[#2563eb] hover:bg-[#2563eb] hover:text-white',
  success: 'bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white',
  warning: 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white',
  danger: 'bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 text-white'
};

export const renderButton = (button: TableButton | undefined, row: any) => {
  const variant = button?.variant || 'primary';
  const baseClasses = 'w-[100%] flex justify-center px-4 py-1.5 rounded-[8px] text-[13px] font-semibold transition-all duration-300 flex items-center gap-1 whitespace-nowrap';
  
  return (
    <button
      onClick={() => button?.onClick?.(row)}
      className={`${baseClasses} ${buttonClasses[variant] || buttonClasses.primary}`}
    >
      {button?.text || 'Action'}
    </button>
  );
};