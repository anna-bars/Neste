// components/widgets/PerformanceOverview.tsx
import React, { useState } from 'react';

interface MetricItem {
  id: string;
  value: string;
  decimal: string;
  prefix?: string;
  suffix?: string;
  label: string;
  hasArrow?: boolean;
  arrowDirection?: 'up' | 'down';
  arrowColor?: 'blue' | 'red';
  // Նոր prop՝ սահմանելու համար, արդյոք metric-ը դատարկ է
  isEmpty?: boolean;
}

interface PerformanceOverviewProps {
  title?: string;
  timePeriod?: string;
  metrics?: MetricItem[];
  // Նոր prop՝ ամբողջ վիդջեթի համար դատարկ state
  isEmpty?: boolean;
}

export const PerformanceOverview: React.FC<PerformanceOverviewProps> = ({
  title = "Performance Overview",
  timePeriod = "This Month",
  metrics = [],
  isEmpty = false
}) => {
  const [hoveredMetricId, setHoveredMetricId] = useState<string | null>(null);

  // Ֆունկցիա՝ սլաքի նկարը ընտրելու համար
  const getArrowImage = (metric: MetricItem) => {
    if (metric.hasArrow && !metric.isEmpty) {
      if (metric.arrowDirection === 'up' && metric.arrowColor === 'blue') {
        return '/dashboard/top-arrow.svg';
      }
      if (metric.arrowDirection === 'up' && metric.arrowColor === 'red') {
        return '/dashboard/top-arrow-red.svg';
      }
      if (metric.arrowDirection === 'down' && metric.arrowColor === 'blue') {
        return '/dashboard/bottom-arrow-blue.svg';
      }
      if (metric.arrowDirection === 'down' && metric.arrowColor === 'red') {
        return '/dashboard/bottom-arrow-red.svg';
      }
    }
    return '/dashboard/arrow.svg';
  };

  const getMetricColor = (metric: MetricItem, isDecimal: boolean = false) => {
    if (metric.isEmpty) {
      return isDecimal ? 'rgba(199, 199, 199, 0.5)' : 'rgba(0, 0, 0, 0.3)';
    }
    
    if (hoveredMetricId === metric.id) {
      return metric.arrowColor === 'blue' ? '#669CEE' : '#EE6666';
    }
    
    if (hoveredMetricId !== metric.id) {
      return isDecimal ? '#c7c7c7' : 'black';
    }
    
    if (metric.arrowColor === 'blue') {
      return isDecimal ? '#BDD4F9' : '#669CEE';
    } else if (metric.arrowColor === 'red') {
      return '#EE6666';
    }
    
    return isDecimal ? '#c7c7c7' : 'black';
  };

  const getArrowFilter = (metric: MetricItem) => {
    if (metric.isEmpty) {
      return 'invert(0%) sepia(0%) saturate(0%) hue-rotate(0deg) brightness(100%) contrast(100%) opacity(0.3)';
    }
    
    if (hoveredMetricId === metric.id) {
      if (metric.arrowColor === 'blue') {
        return 'invert(49%) sepia(57%) saturate(4783%) hue-rotate(192deg) brightness(95%) contrast(95%)';
      } else if (metric.arrowColor === 'red') {
        return 'invert(39%) sepia(89%) saturate(1720%) hue-rotate(331deg) brightness(95%) contrast(99%)';
      }
    }
    
    return 'invert(0%) sepia(0%) saturate(0%) hue-rotate(0deg) brightness(0%) contrast(100%)';
  };

  const getArrowAltText = (metric: MetricItem) => {
    if (!metric.hasArrow || metric.isEmpty) return '';
    const direction = metric.arrowDirection === 'up' ? 'Up' : 'Down';
    const color = metric.arrowColor === 'blue' ? 'blue' : 'red';
    return `${direction} arrow (${color})`;
  };

  // Ֆունկցիա՝ ստուգելու համար, արդյոք բոլոր metric-ները դատարկ են
  const allMetricsEmpty = isEmpty || metrics.every(metric => metric.isEmpty || metric.value === '0' || metric.value === '0.');

  return (
    <section className="
      border border-[#d1d1d1]/33 bg-[#fdfdf8cf] rounded-2xl p-4 h-auto
      max-[768px]:p-4
      max-[768px]:pl-4.5
      relative
      ${allMetricsEmpty ? 'opacity-70' : ''}
    ">
      {allMetricsEmpty && (
        <div className="absolute inset-0 flex items-center justify-center bg-[#fdfdf8cf] bg-opacity-90 z-10 rounded-2xl">
          <div className="text-center">
            <div className="text-[14px] text-[#7b7b7b] font-medium mb-1">
              No Data Available
            </div>
            <div className="text-[12px] text-[#a0a0a0]">
              Data will appear here once available
            </div>
          </div>
        </div>
      )}
      
      <div className="flex justify-between items-start mb-2 
        max-[1336px]:items-center
        max-[1280px]:items-center
        max-[1024px]:items-center
      ">
        <div>
          <h2 className="
            font-montserrat text-[16px] font-normal text-black
            max-[1336px]:text-[16px]
            max-[1280px]:text-[16px]
            max-[1024px]:text-[14px]
            ${allMetricsEmpty ? 'opacity-50' : ''}
          ">
            {title}
          </h2>
        </div>
        <div className="
          flex items-center gap-3 px-3 py-1 rounded-lg border border-[#c7c7c7]/51 
          hover:border-[#a0a0a0]/51 transition-colors duration-300 cursor-pointer
          ${allMetricsEmpty ? 'opacity-50 pointer-events-none' : ''}
        ">
          <span className="font-montserrat text-[12px] font-normal text-[#7b7b7b]">
            {timePeriod}
          </span>
        </div>
      </div>
      
      {/* Metrics Grid */}
      <div className="
        flex justify-around xl:flex-nowrap gap-8 xl:gap-2 
        max-[1336px]:justify-around max-[1336px]:gap-2
        max-[1280px]:justify-around max-[1280px]:gap-2
        max-[1024px]:flex max-[1024px]:gap-8 max-[1024px]:px-5
        max-[768px]:flex-wrap max-[768px]:gap-4 max-[768px]:gap-y-4 max-[768px]:justify-between
        ${allMetricsEmpty ? 'filter blur-[1px] opacity-60' : ''}
      ">
        {metrics.map((metric) => {
          const isMetricEmpty = metric.isEmpty || metric.value === '0' || metric.value === '0.';
          
          return (
            <div 
              key={metric.id}
              className="
                w-[43%] xl:w-[12%]
                max-[1336px]:w-[12%]
                max-[1280px]:w-[12%]
                max-[1024px]:w-[43%]
                ${!isMetricEmpty ? 'cursor-pointer group' : 'cursor-default'}
              "
              onMouseEnter={() => !isMetricEmpty && setHoveredMetricId(metric.id)}
              onMouseLeave={() => !isMetricEmpty && setHoveredMetricId(null)}
            >
              {/* Main metric block with hover effects */}
              <div className="relative">
                <div className="w-fit
                  font-montserrat text-[46px] xl:text-[46px] font-normal 
                  flex items-baseline relative
                  max-[1336px]:text-[46px]
                  max-[1280px]:text-[46px]
                  max-[768px]:text-[38px] max-[768px]:font-light
                  ${isMetricEmpty ? 'text-black/30' : 'text-black'}
                ">
                  <span 
                    className="tracking-[1.28px] transition-colors duration-300"
                    style={{ 
                      color: isMetricEmpty 
                        ? 'rgba(0, 0, 0, 0.3)' 
                        : hoveredMetricId === metric.id 
                          ? (metric.arrowColor === 'red' ? '#EE6666' : '#669CEE')
                          : 'black'
                    }}
                  >
                    {metric.value}.
                  </span>
                  
                  {/* Decimal part or Arrow */}
                  {metric.decimal ? (
                    <span 
                      className="tracking-[1.28px] transition-colors duration-300"
                      style={{ 
                        color: isMetricEmpty 
                          ? 'rgba(199, 199, 199, 0.5)' 
                          : hoveredMetricId === metric.id 
                            ? (metric.arrowColor === 'blue' ? '#BDD4F9' : '#c7c7c7')
                            : '#c7c7c7'
                      }}
                    >
                      {metric.decimal}
                    </span>
                  ) : metric.hasArrow ? (
                    <img 
                      className="w-7 ml-1.5 transition-all duration-300" 
                      src="/dashboard/arrow.svg" 
                      alt="Arrow" 
                      style={{ 
                        width: '28px', 
                        marginLeft: '6px',
                        filter: getArrowFilter(metric),
                        transition: 'filter 0.3s ease',
                        opacity: isMetricEmpty ? 0.3 : 1
                      }}
                    />
                  ) : null}
                  
                  {/* Prefix/Suffix */}
                  {metric.prefix && (
                    <span 
                      className="absolute -left-5 top-3 text-[12px] transition-colors duration-300"
                      style={{ 
                        color: isMetricEmpty 
                          ? 'rgba(0, 0, 0, 0.3)'
                          : hoveredMetricId === metric.id 
                            ? '#669CEE'
                            : 'inherit',
                        opacity: isMetricEmpty ? 0.5 : 1
                      }}
                    >
                      {metric.prefix}
                    </span>
                  )}
                  
                  {metric.suffix && (
                    <span 
                      className="absolute -left-5 top-3 text-[12px] transition-colors duration-300"
                      style={{ 
                        color: isMetricEmpty 
                          ? 'rgba(0, 0, 0, 0.3)'
                          : hoveredMetricId === metric.id 
                            ? (metric.arrowColor === 'blue' ? '#669CEE' : '#EE6666')
                            : 'inherit',
                        opacity: isMetricEmpty ? 0.5 : 1
                      }}
                    >
                      {metric.suffix}
                    </span>
                  )}
                  
                  {/* Arrow indicators */}
                  {metric.hasArrow && !isMetricEmpty && (
                    <span 
                      className="absolute -right-5 top-3 text-[12px]"
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      <img 
                        src={getArrowImage(metric)}
                        alt={getArrowAltText(metric)} 
                        className="transition-all duration-300"
                        style={{ 
                          width: '12px',
                          height: '12px',
                          transition: 'transform 0.3s ease',
                          opacity: isMetricEmpty ? 0.3 : 1
                        }}
                      />
                    </span>
                  )}
                </div>
              </div>
              <p className="
                font-montserrat text-[12px] font-normal mt-1
                max-[768px]:mt-[-8px] max-[768px]:text-[10px] max-[768px]:w-[74%]
                transition-colors duration-300
                ${isMetricEmpty ? 'text-[#c7c7c7]/50' : 'text-[#c7c7c7]'}
              ">
                {metric.label}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
};