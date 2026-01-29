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
  chartType?: 'default' | 'quotes' | 'shipments'
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
  // Տարբեր tabs ըստ chartType-ի
  const getTabs = () => {
    if (chartType === 'quotes') {
      return ['This Week', 'Next Week'];
    } else {
      return ['This Week', 'Next Week', 'In 2–4 Weeks', 'Next Month'];
    }
  };

  const tabs = getTabs();
  
  // Default տվյալները ըստ chartType-ի
  const defaultExpirationData: Record<string, ExpirationData> = chartType === 'quotes' 
    ? {
        'This Week': { totalQuotes: 0, expiringQuotes: 0, expiringRate: 0 },
        'Next Week': { totalQuotes: 0, expiringQuotes: 0, expiringRate: 0 }
      }
    : {
        'This Week': { totalQuotes: 0, expiringQuotes: 0, expiringRate: 0 },
        'Next Week': { totalQuotes: 0, expiringQuotes: 0, expiringRate: 0 },
        'In 2–4 Weeks': { totalQuotes: 0, expiringQuotes: 0, expiringRate: 0 },
        'Next Month': { totalQuotes: 0, expiringQuotes: 0, expiringRate: 0 }
      };
  
  const expirationData = data || defaultExpirationData;
  
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isCardHovered, setIsCardHovered] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const [barsCount, setBarsCount] = useState(60);
  const [waveAnimation, setWaveAnimation] = useState(false);
  
  // Վերահաշվել տվյալները՝ ցույց տալու համար converting quotes
  const { totalQuotes, expiringQuotes, expiringRate } = expirationData[activeTab] || { 
    totalQuotes: 0, 
    expiringQuotes: 0, 
    expiringRate: 0 
  };
  
  // Quotes էջի համար ցույց տալ conversion rate
  const conversionRate = expiringRate; // Սա արդեն conversion rate-ն է
  const convertingCount = expiringQuotes;
  
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

  const handleTabSelect = (tab: string) => {
    setWaveAnimation(true);
    onTabChange?.(tab);
    setIsDropdownOpen(false);
    
    setTimeout(() => {
      setWaveAnimation(false);
    }, 1200);
  };

  const calculateBarDistribution = () => {
    // Converting quotes-ի համար օգտագործենք conversionRate
    const convertingPercentage = totalQuotes > 0 ? conversionRate / 100 : 0;
    const convertingBars = Math.max(1, Math.round(convertingPercentage * barsCount));
    const pendingBars = Math.max(1, barsCount - convertingBars);
    
    return { convertingBars, pendingBars };
  };

  const { convertingBars, pendingBars } = calculateBarDistribution();

  const getConvertingBarColor = (progress: number) => {
    if (chartType === 'quotes') {
      // Quotes էջի համար՝ կանաչ գրադիենտ
      const startR = 191;    // #BFF8BE (բաց կանաչ)
      const startG = 248;
      const startB = 190;
      
      const endR = 37;       // #66EE68 (մուգ կանաչ)
      const endG = 99;
      const endB = 235;
      
      const r = Math.round(startR + (endR - startR) * progress);
      const g = Math.round(startG + (endG - startG) * progress);
      const b = Math.round(startB + (endB - startB) * progress);
      
      return `rgb(${r}, ${g}, ${b})`;
    } else {
      const startR = 255;
      const startG = 239;
      const startB = 166;
      
      const endR = 235;
      const endG = 54;
      const endB = 37;
      
      const r = Math.round(startR + (endR - startR) * progress);
      const g = Math.round(startG + (endG - startG) * progress);
      const b = Math.round(startB + (endB - startB) * progress);
      
      return `rgb(${r}, ${g}, ${b})`;
    }
  };

  const getColors = () => {
    if (chartType === 'quotes') {
      return {
        primary: '#66EE68',
        secondary: '#BFF8BE',
        light: 'rgba(102, 238, 104, 0.1)',
        lightBorder: 'rgba(102, 238, 104, 0.2)',
        shadow: 'rgba(102, 238, 104, 0.4)',
        pendingStart: '#E2E3E4',
        pendingEnd: '#C8C9CA'
      };
    } else {
      return {
        primary: '#DC3545',
        secondary: '#FF8888',
        light: 'rgba(220, 53, 69, 0.1)',
        lightBorder: 'rgba(220, 53, 69, 0.2)',
        shadow: 'rgba(220, 53, 69, 0.4)',
        pendingStart: '#E2E3E4',
        pendingEnd: '#C8C9CA'
      };
    }
  };

  const renderBars = () => {
    const bars = [];
    
    // 1. Converting բարերը (կանաչ)
    for (let i = 0; i < convertingBars; i++) {
      const progress = convertingBars > 1 ? i / (convertingBars - 1) : 0.5;
      const normalHeight = 18;
      const hoverHeight = 24;
      
      const waveDelay = i * 20;
      const height = isCardHovered ? hoverHeight : normalHeight;
      
      let transform = 'scaleX(2.7)';
      let opacity = 1;
      let animation = '';
      
      if (waveAnimation) {
        const waveProgress = Math.min(1, i / (convertingBars * 0.5));
        const waveHeight = Math.sin(waveProgress * Math.PI * 2) * 0.5 + 1;
        transform = `scaleX(2.7) scaleY(${waveHeight})`;
        opacity = 0.5 + waveProgress * 0.5;
        animation = 'missingWave 1.2s ease-out';
      } else if (isCardHovered) {
        transform = `scaleX(2.7) scaleY(${1.05 + Math.sin(i * 0.3) * 0.05})`;
      }
      
      bars.push(
        <div
          key={`converting-bar-${i}`}
          className="chart-bar converting-bar"
          style={{
            width: '1px',
            transform: transform,
            transformOrigin: 'left',
            height: `${height}px`,
            backgroundColor: getConvertingBarColor(progress),
            borderRadius: '1px',
            cursor: 'pointer',
            opacity: opacity,
            transition: waveAnimation ? 
              `all 0.5s ease ${waveDelay}ms, opacity 0.3s ease ${waveDelay}ms` :
              `all 0.25s ease, transform 0.2s ease`,
            animation: animation,
            animationDelay: waveAnimation ? `${waveDelay}ms` : '0s',
            willChange: 'height, background-color, transform, opacity'
          }}
          title={`${sub}: ${convertingCount} (${conversionRate}%)`}
        />
      );
    }
    
    // 2. Pending բարերը (մոխրագույն)
    for (let i = 0; i < pendingBars; i++) {
      const progress = pendingBars > 1 ? i / (pendingBars - 1) : 0.5;
      const normalHeight = 24;
      const hoverHeight = 18;
      
      const waveDelay = convertingBars * 20 + i * 20;
      const height = isCardHovered ? hoverHeight : normalHeight;
      
      const startR = 226;
      const startG = 227;
      const startB = 228;
      
      const endR = 200;
      const endG = 201;
      const endB = 202;
      
      const r = Math.round(startR + (endR - startR) * progress);
      const g = Math.round(startG + (endG - startG) * progress);
      const b = Math.round(startB + (endB - startB) * progress);
      
      let transform = 'scaleX(2.7)';
      let opacity = 1;
      let animation = '';
      
      if (waveAnimation) {
        const waveProgress = Math.min(1, i / (pendingBars * 0.5));
        const waveHeight = Math.sin(waveProgress * Math.PI * 2) * 0.5 + 1;
        transform = `scaleX(2.7) scaleY(${waveHeight})`;
        opacity = 0.5 + waveProgress * 0.5;
        animation = 'compliantWave 1.2s ease-out';
      } else if (isCardHovered) {
        transform = `scaleX(2.7) scaleY(${1.05 + Math.sin(i * 0.3) * 0.05})`;
      }
      
      bars.push(
        <div
          key={`pending-bar-${i}`}
          className="chart-bar pending-bar"
          style={{
            width: '1px',
            transform: transform,
            transformOrigin: 'left',
            height: `${height}px`,
            backgroundColor: `rgb(${r}, ${g}, ${b})`,
            borderRadius: '1px',
            cursor: 'pointer',
            opacity: opacity,
            transition: waveAnimation ? 
              `all 0.5s ease ${waveDelay}ms, opacity 0.3s ease ${waveDelay}ms` :
              `all 0.25s ease, transform 0.2s ease`,
            animation: animation,
            animationDelay: waveAnimation ? `${waveDelay}ms` : '0s',
            willChange: 'height, background-color, transform, opacity'
          }}
          title={`Pending: ${totalQuotes - convertingCount}`}
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
        
        @keyframes missingWave {
          0% {
            transform: scaleX(2.7) scaleY(0.1);
            opacity: 0;
          }
          15% {
            transform: scaleX(2.7) scaleY(1.6);
            opacity: 0.9;
          }
          30% {
            transform: scaleX(2.7) scaleY(0.7);
            opacity: 0.8;
          }
          45% {
            transform: scaleX(2.7) scaleY(1.3);
            opacity: 1;
          }
          60% {
            transform: scaleX(2.7) scaleY(0.9);
            opacity: 1;
          }
          75% {
            transform: scaleX(2.7) scaleY(1.1);
            opacity: 1;
          }
          100% {
            transform: scaleX(2.7) scaleY(1);
            opacity: 1;
          }
        }
        
        @keyframes compliantWave {
          0% {
            transform: scaleX(2.7) scaleY(0.1);
            opacity: 0;
          }
          20% {
            transform: scaleX(2.7) scaleY(1.6);
            opacity: 0.9;
          }
          40% {
            transform: scaleX(2.7) scaleY(0.7);
            opacity: 0.8;
          }
          60% {
            transform: scaleX(2.7) scaleY(1.3);
            opacity: 1;
          }
          80% {
            transform: scaleX(2.7) scaleY(0.9);
            opacity: 1;
          }
          95% {
            transform: scaleX(2.7) scaleY(1.1);
            opacity: 1;
          }
          100% {
            transform: scaleX(2.7) scaleY(1);
            opacity: 1;
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
        
        @keyframes numberWave {
          0% {
            transform: scale(0.8);
            opacity: 0.5;
          }
          25% {
            transform: scale(1.1);
            opacity: 0.8;
          }
          50% {
            transform: scale(0.95);
            opacity: 0.9;
          }
          75% {
            transform: scale(1.05);
            opacity: 1;
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }
        
        .chaart {
          justify-content: start;
          align-items: center;
          gap: 4.5px;
          display: flex;
          overflow: hidden;
          min-height: 30px;
          margin-bottom:0px;
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
          display: flex;
          flex-direction: column;
          justify-content: flex-end;
        }
        
        .card-hovered .expiring-text {
          font-weight: 600;
        }
        
        .chart-bar {
          transition: all 0.25s ease;
        }
        
        .converting-bar:hover {
          transform: scaleX(2.7) scaleY(1.3) !important;
          transition: transform 0.15s ease;
        }
        
        .pending-bar:hover {
          transform: scaleX(2.7) scaleY(0.7) !important;
          transition: transform 0.15s ease;
        }
        
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
        className={`stats-card bg-[#fdfdfdd6] rounded-2xl p-4 border border-[#d1d1d154] hover:shadow-lg transition-all duration-200 ${isCardHovered ? 'card-hovered' : ''}`}
        onMouseEnter={() => setIsCardHovered(true)}
        onMouseLeave={() => setIsCardHovered(false)}
      >
        {/* Վերին բլոկ - Վերնագիր և Dropdown */}
        <div className="card-header mb-5 flex justify-between items-start">
          <h3 className="font-montserrat text-lg font-medium text-black mb-0">{title}</h3>
          
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
        <div className="expiration-stats h-[fit] relative w-[149px] hidden xl:block">
          <div className="expiration-left  top-0 left-0.5 w-[143px] h-11 flex gap-3">
            <div className="expiration-rate w-20 h-10 flex gap-1 items-baseline">
              <span className="ml-4 rate-number font-montserrat text-[56px] text-black font-normal tracking-[1.12px] leading-10 w-16 transition-all duration-300"
                style={{
                  animation: waveAnimation ? 'numberWave 1.2s ease-out' : 'none'
                }}
              >
                {conversionRate}
              </span>
              <span className="absolute top-[-2px] left-0 rate-symbol font-montserrat text-xs text-black font-normal tracking-[0.20px] w-2">
                %
              </span>
            </div>
          </div>
          <div className="expiration-right  top-14 left-0">
            <span className="expiration-total font-montserrat text-xs font-medium text-[#c7c7c7] tracking-[0.24px] whitespace-nowrap transition-all duration-300">
              {info}: {convertingCount}
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
                    fontWeight: isCardHovered ? 600 : 500,
                    animation: waveAnimation ? 'slideUpFade 0.8s ease' : 'none'
                  }}
                >
                  {sub}: {convertingCount}
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