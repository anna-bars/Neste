'use client'

import { useState, useRef, useEffect, useCallback } from 'react'

interface ExpirationData {
  totalQuotes: number;
  expiringQuotes: number;
  expiringRate: number;
}

interface QuotesExpirationCardProps {
  activeTab?: string;
  onTabChange?: (tab: string) => void;
  data?: Record<string, ExpirationData>;
  title?: string,
  info?:string,
  total?: string,
  sub?: string,
  percentageInfo?: string
  chartType?: 'default' | 'quotes'
}

const QuotesExpirationCard = ({ 
  activeTab = 'This Week', 
  onTabChange, 
  data,
  title = 'Document Compliance',
  info = 'Policies with missing docs',
  total = 'Total policies',
  sub = 'Policies with missing docs',
  percentageInfo = 'Missing Docs %',
  chartType = 'default'
}: QuotesExpirationCardProps) => {
  const tabs = ['This Week', 'Next Week', 'In 2–4 Weeks', 'Next Month'];
  
  const defaultExpirationData: Record<string, ExpirationData> = {
    'This Week': { totalQuotes: 22, expiringQuotes: 7, expiringRate: 32 },
    'Next Week': { totalQuotes: 18, expiringQuotes: 12, expiringRate: 67 },
    'In 2–4 Weeks': { totalQuotes: 35, expiringQuotes: 4, expiringRate: 11 },
    'Next Month': { totalQuotes: 42, expiringQuotes: 38, expiringRate: 90 }
  };
  
  const expirationData = data || defaultExpirationData;
  
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isCardHovered, setIsCardHovered] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const [barsCount, setBarsCount] = useState(60);
  
  // Վերահաշվել տվյալները՝ ցույց տալու համար missing docs
  const { totalQuotes, expiringQuotes, expiringRate } = expirationData[activeTab] || { 
    totalQuotes: 0, 
    expiringQuotes: 0, 
    expiringRate: 0 
  };
  
  // Missing docs-ի համար հաշվել հակառակ տոկոսը
  const missingDocsRate = 100 - expiringRate;
  const missingDocsCount = totalQuotes - expiringQuotes;
  
  const calculateBarsCount = useCallback((width: number) => {
    if (width <= 200) return 40;
    if (width <= 280) return 50;
    if (width <= 350) return 64;
    return 64;
  }, []);

  useEffect(() => {
    const updateBarsCount = () => {
      if (containerRef.current) {
        const width = containerRef.current.clientWidth;
        setBarsCount(calculateBarsCount(width));
      }
    };

    updateBarsCount();
    window.addEventListener('resize', updateBarsCount);
    
    return () => {
      window.removeEventListener('resize', updateBarsCount);
    };
  }, [calculateBarsCount]);

  const calculateBarDistribution = () => {
    // Missing docs-ի համար օգտագործենք missingDocsRate
    const missingPercentage = missingDocsRate / 100;
    const missingBars = Math.max(1, Math.round(missingPercentage * barsCount));
    const compliantBars = Math.max(1, barsCount - missingBars);
    
    return { missingBars, compliantBars };
  };

  const { missingBars, compliantBars } = calculateBarDistribution();

  // Գույների ֆունկցիան ըստ chartType-ի
  const getMissingBarColor = (progress: number) => {
    if (chartType === 'quotes') {
      // Quotes էջի համար՝ կանաչ գրադիենտ
      const startR = 191;    // #BFF8BE (բաց կանաչ)
      const startG = 248;
      const startB = 190;
      
      const endR = 102;       // #66EE68 (մուգ կանաչ)
      const endG = 238;
      const endB = 104;
      
      const r = Math.round(startR + (endR - startR) * progress);
      const g = Math.round(startG + (endG - startG) * progress);
      const b = Math.round(startB + (endB - startB) * progress);
      
      return `rgb(${r}, ${g}, ${b})`;
    } else {
      // Default (Document Compliance) համար՝ կարմիր գրադիենտ
      const startR = 255;    // #FF8888 (բաց կարմիր)
      const startG = 136;
      const startB = 136;
      
      const endR = 220;       // #DC3545 (մուգ կարմիր)
      const endG = 53;
      const endB = 69;
      
      const r = Math.round(startR + (endR - startR) * progress);
      const g = Math.round(startG + (endG - startG) * progress);
      const b = Math.round(startB + (endB - startB) * progress);
      
      return `rgb(${r}, ${g}, ${b})`;
    }
  };

  // Legend գույն ըստ chartType-ի
  const getLegendColor = () => {
    return chartType === 'quotes' ? '#66EE68' : '#DC3545';
  };

  // Հիմնական գույները ըստ chartType-ի
  const getColors = () => {
    if (chartType === 'quotes') {
      return {
        primary: '#66EE68',
        secondary: '#BFF8BE',
        light: 'rgba(102, 238, 104, 0.1)',
        lightBorder: 'rgba(102, 238, 104, 0.2)',
        shadow: 'rgba(102, 238, 104, 0.4)'
      };
    } else {
      return {
        primary: '#DC3545',
        secondary: '#FF8888',
        light: 'rgba(220, 53, 69, 0.1)',
        lightBorder: 'rgba(220, 53, 69, 0.2)',
        shadow: 'rgba(220, 53, 69, 0.4)'
      };
    }
  };

  const handleTabSelect = (tab: string) => {
    onTabChange?.(tab);
    setIsDropdownOpen(false);
  };

  // Կառուցել գծիկների array հովերի անիմացիայով
  const renderBars = () => {
    const bars = [];
    
    // Ստեղծել բոլոր բարերը միանգամից, բայց նրանց տվյալները փոխել անիմացիայով
    for (let i = 0; i < barsCount; i++) {
      const isMissing = i < missingBars;
      const progress = missingBars > 1 ? i / (missingBars - 1) : 0.5;
      
      const normalHeight = isMissing ? 18 : 24;
      const hoverHeight = isMissing ? 24 : 18;
      
      // Շատ կարճ delay բարերի համար - 1-2ms միայն
      const baseDelay = i * 1.5; // 1.5ms delay յուրաքանչյուր bar-ի համար
      const animationDelay = isCardHovered ? baseDelay : 0;
      const height = isCardHovered ? hoverHeight : normalHeight;
      
      // Bar անիմացիայի էֆեկտներ
      let transform = 'scaleX(2.7)';
      
      if (isCardHovered) {
        // Թեթև ալիքաձև էֆեկտ հովերի ժամանակ
        transform = `scaleX(2.7) scaleY(${1.05 + Math.sin(i * 0.3) * 0.05})`;
      }
      
      bars.push(
        <div
          key={`bar-${i}`}
          className={`chart-bar ${isMissing ? 'missing-bar' : 'compliant-bar'}`}
          style={{
            width: '1px',
            transform: transform,
            transformOrigin: 'left',
            height: `${height}px`,
            backgroundColor: isMissing ? getMissingBarColor(progress) : '#E2E3E4',
            borderRadius: '1px',
            cursor: 'pointer',
            transition: `all 0.25s ease ${animationDelay}ms, transform 0.2s ease ${animationDelay}ms`,
            willChange: 'height, background-color'
          }}
          title={isMissing ? 
            `${sub}: ${missingDocsCount} (${missingDocsRate}%)` : 
            `Compliant: ${expiringQuotes}`}
        />
      );
    }
    
    return bars;
  };

  const colors = getColors();

  return (
    <>
      <style jsx>{`
        @keyframes barAppear {
          0% {
            opacity: 0;
            transform: scaleX(2.7) scaleY(0.1);
          }
          50% {
            opacity: 0.7;
            transform: scaleX(2.7) scaleY(1.2);
          }
          100% {
            opacity: 1;
            transform: scaleX(2.7) scaleY(1);
          }
        }
        
        @keyframes slideUpFade {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes subtlePulse {
          0% {
            opacity: 1;
          }
          50% {
            opacity: 0.9;
          }
          100% {
            opacity: 1;
          }
        }
        
        @keyframes dotPulse {
          0% {
            transform: scale(1);
            box-shadow: 0 0 0 0 ${colors.shadow};
          }
          70% {
            transform: scale(1.2);
            box-shadow: 0 0 0 6px ${colors.light};
          }
          100% {
            transform: scale(1);
            box-shadow: 0 0 0 0 ${colors.light};
          }
        }
        
        .chaart {
          justify-content: start;
          align-items: center;
          gap: 4.5px;
          display: flex;
          overflow: hidden;
          min-height: 30px;
          margin-bottom: 8px;
        }
        
        .stats-card {
          transition: all 0.2s ease;
          height: 100%;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          max-height: 34%;
        }
        
        @media (max-width: 1280px) {
          .stats-card {
            max-height: 100%;
          }
        }
        
        .chart-container {
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: flex-end;
        }
        
        /* Հովեր էֆեկտներ ամբողջ կոմպոնենտի համար */
        .card-hovered .expiring-text {
          font-weight: 600;
        }
        
        .chart-bar {
          transition: all 0.25s ease;
        }
        
        .missing-bar:hover {
          transform: scaleX(2.7) scaleY(1.3) !important;
          transition: transform 0.15s ease;
        }
        
        .compliant-bar:hover {
          transform: scaleX(2.7) scaleY(0.7) !important;
          transition: transform 0.15s ease;
        }
        
        /* Expiring indicator հովեր էֆեկտ */
        .expiring-indicator-wrapper {
          transition: all 0.2s ease;
        }
        
        .expiring-indicator {
          transition: all 0.2s ease;
        }
        
        .card-hovered .expiring-indicator-wrapper {
          background-color: ${colors.light};
          border: 1px solid ${colors.lightBorder};
          transform: scale(1.02);
        }
        
        /* Active tab indicator */
        .active-tab-indicator {
          position: relative;
        }
        
        .active-tab-indicator::after {
          content: '';
          position: absolute;
          bottom: -2px;
          left: 50%;
          transform: translateX(-50%);
          width: 20px;
          height: 3px;
          background-color: ${colors.primary};
          border-radius: 2px;
          transition: all 0.2s ease;
        }
        
        .card-hovered .active-tab-indicator::after {
          width: 30px;
          height: 4px;
          background-color: ${colors.secondary};
        }
        
        /* Անիմացիաներ թաբ փոխելիս */
        .rate-number {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .expiration-total {
          transition: all 0.3s ease;
        }
        
        .chart-label {
          transition: all 0.3s ease;
        }
        
        .expiring-text {
          transition: all 0.3s ease;
        }
      `}</style>

      <div 
        className={`stats-card bg-[#fafbf6]/80 rounded-2xl p-4 border border-[#d1d1d154] hover:shadow-lg transition-all duration-200 ${isCardHovered ? 'card-hovered' : ''}`}
        onMouseEnter={() => setIsCardHovered(true)}
        onMouseLeave={() => setIsCardHovered(false)}
      >
        {/* Վերին բլոկ - Վերնագիր և Dropdown */}
        <div className="card-header mb-5 flex justify-between items-start">
          <h3 className="font-montserrat text-lg font-medium text-black mb-0">{title}</h3>
          
          {/* Dropdown աջ անկյունում */}
          <div className="relative">
            <button 
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="dropdown-button flex items-center gap-1 font-montserrat text-xs font-medium tracking-[0.24px] cursor-pointer whitespace-nowrap px-3 py-1 border rounded-lg hover:bg-gray-50 transition-all duration-200"
              style={{
                borderColor: isCardHovered ? colors.primary : '#e2e3e4',
                color: isCardHovered ? colors.primary : '#6f6f6f'
              }}
            >
              {activeTab}
              <svg 
                className={`w-3 h-3 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            
            {/* Dropdown Menu */}
            {isDropdownOpen && (
              <div 
                className="absolute right-0 top-full mt-1 bg-white min-w-[140px] shadow-[0_4px_12px_rgba(0,0,0,0.1)] rounded-lg z-10 py-1"
                style={{
                  animationName: 'slideUpFade',
                  animationDuration: '0.2s',
                  animationTimingFunction: 'ease'
                }}
              >
                {tabs.map((tab, index) => {
                  const isActive = activeTab === tab;
                  return (
                    <div 
                      key={tab}
                      onClick={() => handleTabSelect(tab)}
                      className="px-4 py-2 cursor-pointer font-montserrat text-xs font-medium tracking-[0.24px] hover:bg-gray-50 transition-all duration-150 relative"
                      style={{
                        animationName: 'slideUpFade',
                        animationDuration: '0.2s',
                        animationTimingFunction: 'ease',
                        animationDelay: `${index * 30}ms`,
                        animationFillMode: 'both',
                        color: isActive ? colors.primary : '#6f6f6f',
                        backgroundColor: isActive ? (chartType === 'quotes' ? '#f0fdf4' : '#fef2f2') : 'transparent',
                        fontWeight: isActive ? '600' : '500'
                      }}
                    >
                      {tab}
                      {isActive && (
                        <div 
                          className="absolute bottom-[-2px] left-1/2 transform -translate-x-1/2 w-5 h-[3px] rounded-[2px] transition-all duration-200"
                          style={{ 
                            backgroundColor: colors.primary,
                            width: isCardHovered ? '30px' : '20px',
                            height: isCardHovered ? '4px' : '3px'
                          }}
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
        
        {/* Միջին բլոկ - Տոկոս և տվյալներ */}
        <div className="expiration-stats h-[inherit] relative w-[149px] hidden xl:block">
          <div className="expiration-left absolute top-0 left-0.5 w-[143px] h-11 flex gap-3">
            <div className="expiration-rate w-20 h-10 flex gap-1 items-baseline">
              <span className="ml-4 rate-number font-montserrat text-[56px] text-black font-normal tracking-[1.12px] leading-10 w-16 transition-all duration-300">
                {missingDocsRate}
              </span>
              <span className="absolute top-[-2px] left-0 rate-symbol font-montserrat text-xs text-black font-normal tracking-[0.20px] w-2">
                %
              </span>
            </div>
          </div>
          <div className="expiration-right absolute top-14 left-0">
            <span className="expiration-total font-montserrat text-xs font-medium text-[#c7c7c7] tracking-[0.24px] whitespace-nowrap transition-all duration-300">
              {info}: {missingDocsCount}
            </span>
          </div>
        </div>
        
        {/* Ստորին բլոկ - Չարտ և լեգենդ */}
        <div 
          className="chart-container" 
          ref={containerRef}
        >
          <div className="chaart">
            {renderBars()}
          </div>
          
          <div className="expiration-chart flex justify-between items-center mt-2">
            <span className="chart-label font-montserrat text-xs font-medium text-[#c7c7c7] tracking-[0.24px] transition-all duration-300">
              {total}: {totalQuotes}
            </span>
            <div className="flex items-center gap-3">
              <div 
                className="expiring-indicator-wrapper flex items-center gap-1 px-2 py-1 rounded-md transition-all duration-200"
                style={{
                  backgroundColor: isCardHovered ? colors.light : 'transparent',
                  border: isCardHovered ? `1px solid ${colors.lightBorder}` : '1px solid transparent'
                }}
              >
                <div 
                  className="expiring-dot w-2 h-2 rounded-full transition-all duration-200"
                  style={{ 
                    backgroundColor: colors.primary,
                    animation: isCardHovered ? 'dotPulse 1.5s infinite' : 'none'
                  }}
                />
                <span 
                  className="expiring-text font-montserrat text-xs font-medium transition-all duration-300"
                  style={{ 
                    color: isCardHovered ? colors.primary : '#6f6f6f',
                    fontWeight: isCardHovered ? 600 : 500
                  }}
                >
                  {sub}: {missingDocsCount}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default QuotesExpirationCard;