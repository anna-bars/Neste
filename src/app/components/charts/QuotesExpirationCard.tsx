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
}

const QuotesExpirationCard = ({ 
  activeTab = 'This Week', 
  onTabChange, 
  data ,
  title = 'Quotes Expiration',
  info = 'Total expiring quotes',
  total = 'Total quotes',
  sub = 'Expiring',
  percentageInfo = 'Quotes'
}: QuotesExpirationCardProps) => {
  const tabs = ['This Week', 'Next Week', 'In 2–4 Weeks', 'Next Month'];
  console.log(data)
  // Ստանդարտ տվյալներ, եթե data prop-ը չի տրամադրվել
  const defaultExpirationData: Record<string, ExpirationData> = {
    'This Week': { totalQuotes: 22, expiringQuotes: 7, expiringRate: 32 },
    'Next Week': { totalQuotes: 18, expiringQuotes: 12, expiringRate: 67 },
    'In 2–4 Weeks': { totalQuotes: 35, expiringQuotes: 4, expiringRate: 11 },
    'Next Month': { totalQuotes: 42, expiringQuotes: 38, expiringRate: 90 }
  };
  
  // Օգտագործել տրամադրված տվյալները կամ ստանդարտները
  const expirationData = data || defaultExpirationData;
  
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isChartHovered, setIsChartHovered] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const [barsCount, setBarsCount] = useState(60);
  const [isAnimating, setIsAnimating] = useState(false);
  
  const { totalQuotes, expiringQuotes, expiringRate } = expirationData[activeTab] || { 
    totalQuotes: 0, 
    expiringQuotes: 0, 
    expiringRate: 0 
  };
  
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

  // Smooth tab փոփոխություն
  useEffect(() => {
    setIsAnimating(true);
    const timer = setTimeout(() => {
      setIsAnimating(false);
    }, 600);
    
    return () => clearTimeout(timer);
  }, [activeTab]);

  const calculateBarDistribution = () => {
    const activePercentage = expiringRate / 100;
    const activeBars = Math.max(1, Math.round(activePercentage * barsCount));
    const inactiveBars = Math.max(1, barsCount - activeBars);
    
    return { activeBars, inactiveBars };
  };

  const { activeBars, inactiveBars } = calculateBarDistribution();

  // Գույների ֆունկցիան հովեր համար - միայն ակտիվ գծիկների համար
  const getActiveBarColor = (progress: number, isHovered: boolean) => {
    if (isHovered) {
      // Հովեր ժամանակ՝ #FFD186 դեպի #FF7C1E
      const startR = 255;  // #FFD186
      const startG = 209;
      const startB = 134;
      
      const endR = 255;    // #FF7C1E
      const endG = 124;
      const endB = 30;
      
      const r = Math.round(startR + (endR - startR) * progress);
      const g = Math.round(startG + (endG - startG) * progress);
      const b = Math.round(startB + (endB - startB) * progress);
      
      return `rgb(${r}, ${g}, ${b})`;
    } else {
      // Նորմալ՝ բաց նարնջագույնից մուգ նարնջագույն
      const startR = 255;
      const startG = 180;
      const startB = 120;
      
      const endR = 238;     // #EE9F66
      const endG = 159;
      const endB = 102;
      
      const r = Math.round(startR + (endR - startR) * progress);
      const g = Math.round(startG + (endG - startG) * progress);
      const b = Math.round(startB + (endB - startB) * progress);
      
      return `rgb(${r}, ${g}, ${b})`;
    }
  };

  const handleTabSelect = (tab: string) => {
    onTabChange?.(tab);
    setIsDropdownOpen(false);
  };

  // Կառուցել գծիկների array
  const renderBars = () => {
    const bars = [];
    
    // Ակտիվ գծիկներ - հովեր ժամանակ 24px, նորմալ 18px
    for (let i = 0; i < activeBars; i++) {
      const progress = activeBars > 1 ? i / (activeBars - 1) : 0.5;
      const normalHeight = 18;
      const hoverHeight = 24;
      
      bars.push(
        <div
          key={`${activeTab}-active-${i}`}
          className="chart-bar active-bar"
          style={{
            width: '1px',
            transform: 'scaleX(2.7)',
            transformOrigin: 'left',
            height: `${isChartHovered ? hoverHeight : normalHeight}px`,
            backgroundColor: getActiveBarColor(progress, isChartHovered),
            borderRadius: '1px',
            cursor: 'pointer',
            animationName: isAnimating ? 'barAppear' : 'none',
            animationDuration: '0.5s',
            animationTimingFunction: 'ease',
            animationFillMode: 'forwards',
            animationDelay: `${(i * 15) % 600}ms`,
            opacity: isAnimating ? 0 : 1,
            transition: 'height 0.3s ease, background-color 0.3s ease'
          }}
          title={`${sub}: ${expiringQuotes} (${expiringRate}%)`}
        />
      );
    }
    
    // Ոչ ակտիվ գծիկներ - հովեր ժամանակ 18px, նորմալ 24px
    for (let i = 0; i < inactiveBars; i++) {
      const normalHeight = 24; // Նորմալ վիճակում բարձր
      const hoverHeight = 18;  // Հովեր ժամանակ ցածր
      
      bars.push(
        <div
          key={`${activeTab}-inactive-${i}`}
          className="chart-bar inactive-bar"
          style={{
            width: '1px',
            transform: 'scaleX(2.7)',
            transformOrigin: 'left',
            height: `${isChartHovered ? hoverHeight : normalHeight}px`,
            backgroundColor: '#E2E3E4',
            borderRadius: '1px',
            cursor: 'pointer',
            animationName: isAnimating ? 'barAppear' : 'none',
            animationDuration: '0.5s',
            animationTimingFunction: 'ease',
            animationFillMode: 'forwards',
            animationDelay: `${((activeBars + i) * 15) % 600}ms`,
            opacity: isAnimating ? 0 : 1,
            transition: 'height 0.3s ease, opacity 0.3s ease'
          }}
          title={`Non-expiring quotes: ${totalQuotes - expiringQuotes}`}
        />
      );
    }
    
    return bars;
  };

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
        
        @keyframes pulse {
          0% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.02);
          }
          100% {
            transform: scale(1);
          }
        }
        
        @keyframes glowPulse {
          0% {
            box-shadow: 0 0 0 0 rgba(238, 159, 102, 0.4);
          }
          70% {
            box-shadow: 0 0 0 4px rgba(238, 159, 102, 0);
          }
          100% {
            box-shadow: 0 0 0 0 rgba(238, 159, 102, 0);
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
          transition: all 0.3s ease;
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
        
        /* Հովեր էֆեկտներ */
        .chart-bar {
          transition: height 0.3s ease, background-color 0.3s ease, opacity 0.3s ease;
        }
        
        .active-bar:hover {
          transform: scaleX(2.7) scaleY(1.1) !important;
          transition: transform 0.2s ease;
        }
        
        .inactive-bar:hover {
          transform: scaleX(2.7) scaleY(0.9) !important;
          transition: transform 0.2s ease;
        }
        
        /* Expiring indicator հովեր էֆեկտ */
        .expiring-indicator-wrapper {
          transition: all 0.3s ease;
        }
        
        .expiring-indicator {
          transition: all 0.3s ease;
          animation: glowPulse 2s infinite;
        }
        
        .chart-hovered .expiring-indicator {
          transform: scale(1.1);
          background-color: rgba(238, 159, 102, 0.15);
          border-color: #EE9F66;
          animation: glowPulse 1.5s infinite;
        }
        
        .chart-hovered .expiring-dot {
          transform: scale(1.3);
          box-shadow: 0 0 10px rgba(238, 159, 102, 0.8);
        }
        
        .chart-hovered .expiring-text {
          color: #000;
          font-weight: 500;
        }
      `}</style>

      <div 
        className={`stats-card bg-[#fafbf6]/80 rounded-2xl p-4 border border-[#d1d1d154] hover:shadow-sm transition-all duration-300 ${isChartHovered ? 'chart-hovered' : ''}`}
      >
        {/* Վերին բլոկ - Վերնագիր և Dropdown */}
        <div className="card-header mb-5 flex justify-between items-start">
          <h3 className="font-montserrat text-lg font-medium text-black mb-0">{title}</h3>
          
          {/* Dropdown աջ անկյունում */}
          <div className="relative">
            <button 
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center gap-1 font-montserrat text-xs font-medium text-[#6f6f6f] tracking-[0.24px] cursor-pointer whitespace-nowrap px-3 py-1 border border-[#e2e3e4] rounded-lg hover:bg-gray-50 hover:border-[#ee9f66] hover:text-[#ee9f66] transition-all duration-300"
            >
              {activeTab}
              <svg 
                className={`w-3 h-3 transition-transform duration-300 ${isDropdownOpen ? 'rotate-180' : ''}`} 
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
                  animationDuration: '0.3s',
                  animationTimingFunction: 'ease'
                }}
              >
                {tabs.map((tab, index) => (
                  <div 
                    key={tab}
                    onClick={() => handleTabSelect(tab)}
                    className={`
                      px-4 py-2 cursor-pointer font-montserrat text-xs font-medium tracking-[0.24px]
                      hover:bg-gray-50 transition-all duration-200
                      ${activeTab === tab 
                        ? 'text-[#ee9f66] underline font-semibold bg-orange-50' 
                        : 'text-[#6f6f6f] hover:text-[#ee9f66]'
                      }
                    `}
                    style={{
                      animationName: 'slideUpFade',
                      animationDuration: '0.3s',
                      animationTimingFunction: 'ease',
                      animationDelay: `${index * 50}ms`,
                      animationFillMode: 'both'
                    }}
                  >
                    {tab}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        
        {/* Միջին բլոկ - Տոկոս և տվյալներ */}
        <div className="expiration-stats h-[inherit] relative w-[149px] hidden xl:block">
          <div className="expiration-left absolute top-0 left-0.5 w-[143px] h-11 flex gap-3">
            <div className="expiration-rate w-20 h-10 flex gap-1 items-baseline">
              <span className="ml-4 rate-number font-montserrat text-[56px] text-black font-normal tracking-[1.12px] leading-10 w-16 transition-all duration-500"
                style={{
                  animationName: isAnimating ? 'pulse' : 'none',
                  animationDuration: '0.6s',
                  animationTimingFunction: 'ease'
                }}
              >
                {expiringRate}
              </span>
              <span className="absolute top-[-2px] left-0 rate-symbol font-montserrat text-xs text-black font-normal tracking-[0.20px] w-2">
                %
              </span>
              <span className="text-[#C8C8C8] text-[12px] ml-[16px]">{percentageInfo}</span>
            </div>
          </div>
          <div className="expiration-right absolute top-14 left-0">
            <span className="expiration-total font-montserrat text-xs font-medium text-[#c7c7c7] tracking-[0.24px] whitespace-nowrap">
              {info} : {expiringQuotes}
            </span>
          </div>
        </div>
        
        {/* Ստորին բլոկ - Չարտ և լեգենդ */}
        <div 
          className="chart-container" 
          ref={containerRef}
          onMouseEnter={() => setIsChartHovered(true)}
          onMouseLeave={() => setIsChartHovered(false)}
        >
          <div className="chaart">
            {renderBars()}
          </div>
          
          <div className="expiration-chart flex justify-between items-center mt-2">
            <span className="chart-label font-montserrat text-xs font-medium text-[#c7c7c7] tracking-[0.24px]">
              {total}: {totalQuotes}
            </span>
            <div className="flex items-center gap-3">
              <div 
                className="expiring-indicator-wrapper flex items-center gap-1 px-2 py-1 rounded-md transition-all duration-300"
                style={{
                  backgroundColor: isChartHovered ? 'rgba(238, 159, 102, 0.1)' : 'transparent',
                  border: isChartHovered ? '1px solid rgba(238, 159, 102, 0.3)' : '1px solid transparent'
                }}
              >
                <div 
                  className="expiring-dot w-2 h-2 rounded-full transition-all duration-300"
                  style={{ 
                    backgroundColor: '#EE9F66',
                    transform: isChartHovered ? 'scale(1.3)' : 'scale(1)',
                    boxShadow: isChartHovered ? '0 0 8px rgba(238, 159, 102, 0.8)' : 'none'
                  }}
                />
                <span 
                  className="expiring-text font-montserrat text-xs font-medium transition-all duration-300"
                  style={{ 
                    color: isChartHovered ? '#000' : '#6f6f6f'
                  }}
                >
                  Expiring: {expiringQuotes}
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