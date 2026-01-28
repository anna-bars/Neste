import React, { useRef, useEffect, useState, useCallback, JSX } from 'react';

export interface ConversionChartData {
  approved: number;
  declined: number;
  expired: number;
}

export interface ConversionChartProps {
  title?: string;
  data?: Record<string, ConversionChartData>;
  defaultActiveTime?: string;
  showTimeDropdown?: boolean;
  typeLabels?: {
    approved: string;
    declined: string;
    expired: string;
  };
  colors?: {
    approved: { start: string; end: string };
    declined: { start: string; end: string };
    expired: { start: string; end: string };
  };
  onHoverType?: (type: string | null) => void;
  onTimeChange?: (time: string) => void;
}

export const ConversionChart: React.FC<ConversionChartProps> = ({
  title = 'Quote Conversion Rate',
  data: externalData,
  defaultActiveTime = 'This Month',
  showTimeDropdown = true,
  typeLabels = {
    approved: 'approved',
    declined: 'declined',
    expired: 'expired'
  },
  colors = {
    approved: { start: '#BED5F8', end: '#669CEE' },
    declined: { start: '#F8E2BE', end: '#EEDE66' },
    expired: { start: '#FFA4A4', end: '#EB6025' }
  },
  onHoverType,
  onTimeChange
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [hoveredType, setHoveredType] = useState<string | null>(null);
  const [activeTime, setActiveTime] = useState(defaultActiveTime);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [animationStage, setAnimationStage] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [animatingData, setAnimatingData] = useState<ConversionChartData | null>(null);
  const [animatingTime, setAnimatingTime] = useState<string | null>(null);
  const [barWidth, setBarWidth] = useState<number>(3); // Հիմնական լայնություն
  
  // Լռելյայն տվյալներ
  const defaultData: Record<string, ConversionChartData> = {
    'This Week': { approved: 12, declined: 5, expired: 8 },
    'This Month': { approved: 17, declined: 9, expired: 18 },
    'Last Month': { approved: 22, declined: 7, expired: 15 },
    'Last Quarter': { approved: 65, declined: 28, expired: 42 }
  };
  
  const data = externalData || defaultData;
  
  // Ստանալ առկա ժամանակահատվածները
  const timeOptions = Object.keys(data);
  
  const calculateBarsCount = useCallback((width: number) => {
    if (width <= 320) return 40;
    if (width <= 400) return 45;
    return 60;
  }, []);

  const [barsCount, setBarsCount] = useState(60);

  // Հաշվարկել գծիկների լայնությունը էկրանի չափից ելնելով
  useEffect(() => {
    const updateBarWidth = () => {
      if (containerRef.current) {
        const width = containerRef.current.clientWidth;
        
        // Հիմնական լայնության հաշվարկ
        let newBarWidth = 2.7; // լռելյայն
        
        if (width <= 320) {
          newBarWidth = 2.3;
        } else if (width <= 400) {
          newBarWidth = 2.5;
        } else if (width <= 768) {
          newBarWidth = 2.6;
        } else if (width >= 1920) {
          newBarWidth = 3.0;
        }
        
        setBarWidth(newBarWidth);
      }
    };

    updateBarWidth();
    window.addEventListener('resize', updateBarWidth);
    
    return () => {
      window.removeEventListener('resize', updateBarWidth);
    };
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

  useEffect(() => {
    if (onHoverType) {
      onHoverType(hoveredType);
    }
  }, [hoveredType, onHoverType]);

  const handleTimeSelect = (time: string) => {
    if (time !== activeTime) {
      setIsDropdownOpen(false);
      setIsAnimating(true);
      setAnimatingTime(time);
      setAnimatingData(data[time]);
      setAnimationStage(1);
      
      setTimeout(() => {
        setAnimationStage(2);
        setTimeout(() => {
          setAnimationStage(3);
          setTimeout(() => {
            setActiveTime(time);
            setAnimationStage(0);
            setIsAnimating(false);
            setAnimatingData(null);
            setAnimatingTime(null);
            
            if (onTimeChange) {
              onTimeChange(time);
            }
          }, 300);
        }, 300);
      }, 300);
    } else {
      setIsDropdownOpen(false);
    }
  };

  const getCurrentDataForBars = useCallback(() => {
    if (isAnimating && animatingData) {
      return animatingData;
    }
    return data[activeTime];
  }, [isAnimating, animatingData, activeTime, data]);

  const shouldShowNumber = (type: string) => {
    if (!isAnimating) return true;
    
    if (type === 'approved') return animationStage >= 1;
    if (type === 'declined') return animationStage >= 2;
    if (type === 'expired') return animationStage >= 3;
    
    return false;
  };

  const getDisplayNumber = (type: string) => {
    const currentData = getCurrentDataForBars();
    
    if (!isAnimating || !animatingData) return currentData[type as keyof ConversionChartData];
    
    if (type === 'approved' && animationStage < 1) return 0;
    if (type === 'declined' && animationStage < 2) return 0;
    if (type === 'expired' && animationStage < 3) return 0;
    
    return animatingData[type as keyof ConversionChartData];
  };

  const getGradientColor = (type: string, progress: number): string => {
    const gradient = colors[type as keyof typeof colors];
    if (!gradient) return '#000000';
    
    const startR = parseInt(gradient.start.slice(1, 3), 16);
    const startG = parseInt(gradient.start.slice(3, 5), 16);
    const startB = parseInt(gradient.start.slice(5, 7), 16);
    
    const endR = parseInt(gradient.end.slice(1, 3), 16);
    const endG = parseInt(gradient.end.slice(3, 5), 16);
    const endB = parseInt(gradient.end.slice(5, 7), 16);
    
    const r = Math.round(startR + (endR - startR) * progress);
    const g = Math.round(startG + (endG - startG) * progress);
    const b = Math.round(startB + (endB - startB) * progress);
    
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
  };

  const adjustColorBrightness = (color: string, percent: number): string => {
    if (color.startsWith('#')) {
      let r = parseInt(color.slice(1, 3), 16);
      let g = parseInt(color.slice(3, 5), 16);
      let b = parseInt(color.slice(5, 7), 16);
      
      r = Math.min(255, r + (255 - r) * percent / 100);
      g = Math.min(255, g + (255 - g) * percent / 100);
      b = Math.min(255, b + (255 - b) * percent / 100);
      
      return `#${Math.round(r).toString(16).padStart(2, '0')}${Math.round(g).toString(16).padStart(2, '0')}${Math.round(b).toString(16).padStart(2, '0')}`;
    }
    return color;
  };

  const renderBars = () => {
    const currentDataForBars = getCurrentDataForBars();
    
    const chartData = [
      { 
        type: 'approved', 
        count: currentDataForBars.approved, 
        hegHeight: 24,
        normalHeight: 16,
        hoverHeight: 20
      },
      { 
        type: 'declined', 
        count: currentDataForBars.declined, 
        hegHeight: 24, 
        normalHeight: 16,
        hoverHeight: 20
      },
      { 
        type: 'expired', 
        count: currentDataForBars.expired, 
        hegHeight: 24, 
        normalHeight: 16,
        hoverHeight: 20
      }
    ];
    
    const total = chartData.reduce((sum, item) => sum + item.count, 0);
    const isAllZero = total === 0;
    
    if (isAllZero) {
      const equalCount = Math.floor(barsCount / 3);
      const bars: JSX.Element[] = [];
      
      chartData.forEach((item, typeIndex) => {
        const barCount = typeIndex === 2 ? barsCount - (equalCount * 2) : equalCount;
        
        for (let i = 0; i < barCount; i++) {
          const isFirst = i === 0;
          const isLast = i === barCount - 1;
          const barKey = `${item.type}-zero-${i}-${typeIndex}`;
          
          let height = isFirst || isLast ? item.hegHeight : item.normalHeight;
          
          const gradientProgress = barCount > 1 ? i / (barCount - 1) : 0.5;
          let backgroundColor = getGradientColor(item.type, gradientProgress);
          
          backgroundColor = backgroundColor + '80';
          
          bars.push(
            <div 
              key={barKey}
              className={`${item.type}-chart-bar`}
              style={{
                width: `${barWidth}px`, // Օգտագործում ենք դինամիկ լայնություն
                minWidth: '1px',
                maxWidth: '4px',
                height: `${height}px`,
                backgroundColor: backgroundColor,
                opacity: 0.5,
                cursor: 'pointer',
                borderRadius: '1px',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={() => setHoveredType(item.type)}
              onMouseLeave={() => setHoveredType(null)}
              title={`${typeLabels[item.type as keyof typeof typeLabels]}: No data`}
            />
          );
        }
      });
      
      return bars;
    }
    
    // Նորմալ դեպք՝ երբ կան տվյալներ
    const barsPerType = chartData.map(item => ({
      ...item,
      barCount: Math.round((item.count / total) * barsCount)
    }));
    
    let totalBars = barsPerType.reduce((sum, item) => sum + item.barCount, 0);
    
    let diff = barsCount - totalBars;
    
    if (diff !== 0) {
      const sortedIndices = [...barsPerType.keys()].sort(
        (a, b) => barsPerType[b].barCount - barsPerType[a].barCount
      );
      
      let index = 0;
      while (diff !== 0) {
        const currentIndex = sortedIndices[index % sortedIndices.length];
        
        if (diff > 0) {
          barsPerType[currentIndex].barCount++;
          diff--;
        } else if (diff < 0 && barsPerType[currentIndex].barCount > 1) {
          barsPerType[currentIndex].barCount--;
          diff++;
        }
        
        index++;
      }
    }
    
    let barIndex = 0;
    const bars: JSX.Element[] = [];
    
    barsPerType.forEach((item) => {
      const itemBarCount = item.barCount;
      const barType = item.type;
      
      let showBars = false;
      let animationDelay = 0;
      
      if (isAnimating) {
        if (barType === 'approved' && animationStage >= 1) {
          showBars = true;
          animationDelay = 0;
        } else if (barType === 'declined' && animationStage >= 2) {
          showBars = true;
          animationDelay = 300;
        } else if (barType === 'expired' && animationStage >= 3) {
          showBars = true;
          animationDelay = 600;
        }
      } else {
        showBars = true;
      }
      
      for (let i = 0; i < itemBarCount; i++) {
        const isFirst = i === 0;
        const isLast = i === itemBarCount - 1;
        const barKey = `${barType}-${i}-${barIndex}-${activeTime}`;
        
        let height = item.normalHeight;
        
        if (isFirst || isLast) {
          height = item.hegHeight;
        }
        
        const isHovered = hoveredType === barType;
        if (isHovered) {
          height = item.hoverHeight;
        }
        
        const gradientProgress = itemBarCount > 1 ? i / (itemBarCount - 1) : 0.5;
        let backgroundColor = getGradientColor(barType, gradientProgress);
        
        let opacity = 1;
        
        if (hoveredType && hoveredType !== barType) {
          opacity = 0.4;
        } else if (isHovered) {
          backgroundColor = adjustColorBrightness(backgroundColor, 15);
        }
        
        const individualDelay = animationDelay + (i * 10);
        
        bars.push(
          <div 
            key={barKey}
            className={`${barType}-chart-bar ${isFirst || isLast ? 'heg' : ''}`}
            style={{
              width: `${barWidth}px`, // Օգտագործում ենք դինամիկ լայնություն
              minWidth: '1px',
              maxWidth: '4px',
              height: showBars ? `${height}px` : '0px',
              backgroundColor: backgroundColor,
              opacity: showBars ? opacity : 0,
              transition: showBars ? 
                `height 0.2s ease ${individualDelay}ms, opacity 0.3s ease ${individualDelay}ms, background-color 0.3s ease, width 0.3s ease` : 
                'all 0.3s ease',
              cursor: 'pointer',
              borderRadius: '1px',
              willChange: 'transform, opacity, height, background-color'
            }}
            onMouseEnter={() => setHoveredType(barType)}
            onMouseLeave={() => setHoveredType(null)}
            title={`${typeLabels[barType as keyof typeof typeLabels]}: ${item.count}`}
          />
        );
        barIndex++;
      }
    });
    
    return bars;
  };

  const getCurrentDataForDisplay = getCurrentDataForBars();
  const total = getCurrentDataForDisplay.approved + getCurrentDataForDisplay.declined + getCurrentDataForDisplay.expired;
  const isAllZero = total === 0;

  return (
    <div className="flex flex-col justify-between border border-[#d1d1d154] bg-[#fdfdfdd6] rounded-2xl p-4 h-full w-full quote-conversion performance-section hover:shadow-sm transition-shadow duration-300">
      <div className="mb-[4px] gap-2 md:flex-col flex justify-between flex-row">
        <h3 className="font-montserrat text-[18px] font-normal text-black action-title max-[1024px]:text-[14px]">
          {title}
        </h3>
        
        {showTimeDropdown && timeOptions.length > 1 && (
          <div className="relative">
            <button 
              onClick={(e) => {
                e.stopPropagation();
                setIsDropdownOpen(!isDropdownOpen);
              }}
              className="flex items-center gap-1 font-montserrat text-xs font-medium text-[#6f6f6f] tracking-[0.24px] cursor-pointer whitespace-nowrap px-3 py-1 border border-[#e2e3e4] rounded-lg hover:bg-gray-50 hover:border-[#669CEE] hover:text-[#669CEE] transition-all duration-300"
            >
              {isAnimating && animatingTime ? animatingTime : activeTime}
              <svg 
                className={`w-3 h-3 transition-transform duration-300 ${isDropdownOpen ? 'rotate-180' : ''}`} 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            
            {isDropdownOpen && (
              <div 
                className="absolute left-0 top-full mt-1 bg-white min-w-[140px] shadow-[0_4px_12px_rgba(0,0,0,0.1)] rounded-lg z-20 py-1"
                style={{
                  animationName: 'slideUpFade',
                  animationDuration: '0.3s',
                  animationTimingFunction: 'ease'
                }}
              >
                {timeOptions.map((time, index) => (
                  <div 
                    key={time}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleTimeSelect(time);
                    }}
                    className={`
                      px-4 py-2 cursor-pointer font-montserrat text-xs font-medium tracking-[0.24px]
                      hover:bg-gray-50 transition-all duration-200
                      ${activeTime === time 
                        ? 'text-[#669CEE] underline font-semibold bg-blue-50' 
                        : 'text-[#6f6f6f] hover:text-[#669CEE]'
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
                    {time}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
      
      {isDropdownOpen && (
        <div 
          className="fixed inset-0 z-10"
          onClick={() => setIsDropdownOpen(false)}
        />
      )}
      
      <div className="block justify-between items-end">
        <div className="w-full">
          <div className="flex w-[96%] justify-between mb-3.5">
            {(() => {
              const currentDataForDisplay = getCurrentDataForBars();
              const displayData = [
                { type: 'approved', count: currentDataForDisplay.approved },
                { type: 'declined', count: currentDataForDisplay.declined },
                { type: 'expired', count: currentDataForDisplay.expired }
              ];
              
              return displayData.map((item) => {
                const showNumber = shouldShowNumber(item.type);
                const displayNumber = getDisplayNumber(item.type);
                
                return (
                  <div 
                    key={item.type}
                    className={`transition-all duration-300 ${hoveredType === item.type ? 'scale-105' : ''}`}
                    onMouseEnter={() => setHoveredType(item.type)}
                    onMouseLeave={() => setHoveredType(null)}
                    style={{ cursor: 'pointer' }}
                  >
                    <div className={`text-[13px] ${isAllZero ? 'text-[#A0A0A0]' : 'text-[#C8C8C8]'} capitalize`}>
                      {typeLabels[item.type as keyof typeof typeLabels]}
                    </div>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <div 
                        className="w-1.5 h-1.5 rounded-full transition-all duration-300"
                        style={{ 
                          backgroundColor: getGradientColor(item.type, 0.5),
                          transform: hoveredType === item.type ? 'scale(1.2)' : 'scale(1)',
                          boxShadow: hoveredType === item.type ? `0 0 8px ${getGradientColor(item.type, 0.5)}80` : 'none',
                          opacity: showNumber ? (isAllZero ? 0.5 : 1) : 0.3
                        }}
                      ></div>
                      <div 
                        className={`text-[15px] font-medium transition-all duration-300 ${isAllZero ? 'text-[#A0A0A0]' : ''}`}
                        style={{ 
                          color: hoveredType === item.type ? '#000' : (isAllZero ? '#A0A0A0' : 'inherit')
                        }}
                      >
                        <span 
                          style={{
                            opacity: showNumber ? 1 : 0,
                            transition: 'opacity 0.3s ease'
                          }}
                        >
                          {displayNumber}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              });
            })()}
          </div>

          <div className='chart-cont' ref={containerRef}>
            <div 
              className="chaart"
              style={{
                display: 'flex',
                gap: '4px',
                justifyContent: 'flex-start',
                alignItems: 'flex-end',
                overflow: 'hidden',
                marginBottom: '4px',
                minHeight: '24px',
                position: 'relative'
              }}
            >
              {renderBars()}
              
              {isAllZero && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="text-center">
                    <span className="text-xs text-gray-400 font-medium bg-white/80 backdrop-blur-sm px-2 py-1 rounded">
                      No data
                    </span>
                  </div>
                </div>
              )}
            </div>
            
            <div 
              className="chaart chaart2"
              style={{
                display: 'flex',
                gap: '4px',
                justifyContent: 'flex-start',
                alignItems: 'flex-end',
                overflow: 'hidden'
              }}
            >
              {Array.from({ length: barsCount }).map((_, i) => (
                <div 
                  key={`line2-${i}`}
                  style={{
                    width: `${barWidth}px`, // Նույն լայնությունը, ինչ հիմնական գծիկներինը
                    minWidth: '1px',
                    maxWidth: '4px',
                    height: '10px',
                    background: 'linear-gradient(180deg, #E2E3E4, transparent)',
                    borderRadius: '1px'
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      <style jsx global>{`
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
        
        .empty-chart-bar {
          background: linear-gradient(180deg, #E2E3E4, transparent) !important;
        }
        
        .chart-cont {
          gap: 0px;
          display: grid;
        }
        
        .approved-chart-bar,
        .declined-chart-bar,
        .expired-chart-bar,
        .empty-chart-bar {
          transition: all 0.3s ease !important;
        }
        
        .quote-conversion.performance-section {
          height: 100%;
          display: flex;
          flex-direction: column;
        }
        
        .quote-conversion .chart-cont {
          flex: 1;
          min-height: 0;
          display: flex;
          flex-direction: column;
          justify-content: flex-end;
        }
        
        .approved-chart-bar:hover,
        .declined-chart-bar:hover,
        .expired-chart-bar:hover {
          transition: height 0.2s ease, background-color 0.3s ease, opacity 0.3s ease !important;
        }
        
        /* Համապատասխանեցնել գծիկների լայնությունը տարբեր էկրանների համար */
        @media screen and (max-width: 320px) {
          .chaart,
          .chaart2 {
            gap: 3px !important;
          }
          
          .approved-chart-bar,
          .declined-chart-bar,
          .expired-chart-bar,
          .chaart2 div {
            width: 2.3px !important;
          }
        }
        
        @media screen and (min-width: 321px) and (max-width: 400px) {
          .chaart,
          .chaart2 {
            gap: 3.5px !important;
          }
          
          .approved-chart-bar,
          .declined-chart-bar,
          .expired-chart-bar,
          .chaart2 div {
            width: 2.5px !important;
          }
        }
        
        @media screen and (min-width: 401px) and (max-width: 768px) {
          .chaart,
          .chaart2 {
            gap: 4px !important;
          }
          
          .approved-chart-bar,
          .declined-chart-bar,
          .expired-chart-bar,
          .chaart2 div {
            width: 2.6px !important;
          }
        }
        
        @media screen and (min-width: 1920px) {
          .chaart,
          .chaart2 {
            gap: 5px !important;
          }
          
          .approved-chart-bar,
          .declined-chart-bar,
          .expired-chart-bar,
          .chaart2 div {
            width: 3px !important;
          }
        }
        
        @media screen and (max-width: 1024px) {
          .quote-conversion.performance-section {
            min-height: 180px;
          }
        }
        
        @media screen and (max-width: 768px) {
          .quote-conversion.performance-section {
            min-height: 200px;
          }
        }
      `}</style>
    </div>
  );
};