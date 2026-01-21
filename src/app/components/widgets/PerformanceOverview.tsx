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
}

interface PerformanceOverviewProps {
  title?: string;
  timePeriod?: string;
  metrics?: MetricItem[];
}

export const PerformanceOverview: React.FC<PerformanceOverviewProps> = ({
  title = "Performance Overview",
  timePeriod = "This Month",
  metrics = [
    {
      id: 'insured-amount',
      value: '84',
      decimal: '5k',
      prefix: '$',
      label: 'Total Insured Amount',
      hasArrow: false
    },
    {
      id: 'active-policies',
      value: '8',
      decimal: '47',
      suffix: '%',
      label: 'Active Policies',
      hasArrow: true,
      arrowDirection: 'up'
    },
    {
      id: 'quotes-awaiting',
      value: '3',
      decimal: '',
      suffix: '%',
      label: 'Quotes Awaiting Approval',
      hasArrow: true,
      arrowDirection: 'down'
    },
    {
      id: 'contracts-expire',
      value: '2',
      decimal: '',
      suffix: '%',
      label: 'Contracts Due to Expire',
      hasArrow: true,
      arrowDirection: 'down'
    },
    {
      id: 'documents-uploads',
      value: '1',
      decimal: '',
      suffix: '%',
      label: 'Required Document Uploads',
      hasArrow: true,
      arrowDirection: 'down'
    }
  ]
}) => {
  const [hoveredMetricId, setHoveredMetricId] = useState<string | null>(null);

  const getMetricColor = (metric: MetricItem, isDecimal: boolean = false) => {
    if (hoveredMetricId === metric.id) {
      return metric.arrowDirection === 'up' ? '#669CEE' : '#EE6666';
    }
    
    if (hoveredMetricId !== metric.id) {
      return isDecimal ? '#c7c7c7' : 'black';
    }
    
    if (metric.arrowDirection === 'up') {
      return isDecimal ? '#BDD4F9' : '#669CEE';
    } else if (metric.arrowDirection === 'down') {
      return '#EE6666';
    }
    
    return isDecimal ? '#c7c7c7' : 'black';
  };

  const getArrowFilter = (metric: MetricItem) => {
    // Եթե hover է, ապա գույնը փոխել
    if (hoveredMetricId === metric.id) {
      if (metric.arrowDirection === 'up') {
        return 'invert(49%) sepia(57%) saturate(4783%) hue-rotate(192deg) brightness(95%) contrast(95%)'; // Կապույտ
      } else if (metric.arrowDirection === 'down') {
        return 'invert(39%) sepia(89%) saturate(1720%) hue-rotate(331deg) brightness(95%) contrast(99%)'; // Կարմիր
      }
    }
    
    // Ստատիկ վիճակում - սև
    return 'invert(0%) sepia(0%) saturate(0%) hue-rotate(0deg) brightness(0%) contrast(100%)'; // Սև
  };

  const getTopArrowFilter = (metric: MetricItem) => {
    // Top arrow-ի համար միշտ գույնը (ոչ սև)
    if (metric.arrowDirection === 'up') {
      return 'invert(49%) sepia(57%) saturate(4783%) hue-rotate(192deg) brightness(95%) contrast(95%)'; // Կապույտ
    } else if (metric.arrowDirection === 'down') {
      return 'invert(39%) sepia(89%) saturate(1720%) hue-rotate(331deg) brightness(95%) contrast(99%)'; // Կարմիր
    }
    
    return '';
  };

  return (
    <section className="
      border border-[#d1d1d1]/33 bg-[#fdfdf8cf] rounded-2xl p-4 h-auto
      max-[768px]:p-4
      max-[768px]:pl-4.5
    ">
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
          ">
            {title}
          </h2>
        </div>
        <div className="
          flex items-center gap-3 px-3 py-1 rounded-lg border border-[#c7c7c7]/51 
          hover:border-[#a0a0a0]/51 transition-colors duration-300 cursor-pointer
        ">
          <span className="font-montserrat text-[12px] font-normal text-[#7b7b7b]">
            {timePeriod}
          </span>
          {/* <img 
            src="https://c.animaapp.com/mjiggi0jSqvoj5/img/arrow-3-1.svg" 
            alt="Dropdown" 
            className="w-2 h-1"
          /> */}
        </div>
      </div>
      
      {/* Metrics Grid */}
      <div className="
        flex justify-around xl:flex-nowrap gap-8 xl:gap-2 
        max-[1336px]:justify-around max-[1336px]:gap-2
        max-[1280px]:justify-around max-[1280px]:gap-2
        max-[1024px]:flex max-[1024px]:gap-8 max-[1024px]:px-5
        max-[768px]:flex-wrap max-[768px]:gap-4 max-[768px]:gap-y-4 max-[768px]:justify-between
      ">
        {metrics.map((metric) => (
          <div 
            key={metric.id}
            className="
              w-[43%] xl:w-[12%]
              max-[1336px]:w-[12%]
              max-[1280px]:w-[12%]
              max-[1024px]:w-[43%]
              cursor-pointer group
            "
            onMouseEnter={() => setHoveredMetricId(metric.id)}
            onMouseLeave={() => setHoveredMetricId(null)}
          >
            {/* Main metric block with hover effects */}
            <div className="relative">
              <div className="w-fit
                font-montserrat text-[46px] xl:text-[46px] font-normal text-black 
                flex items-baseline relative
                max-[1336px]:text-[46px]
                max-[1280px]:text-[46px]
                max-[768px]:text-[38px] max-[768px]:font-light
              ">
                <span 
                  className="tracking-[1.28px] transition-colors duration-300 group-hover:text-[#669CEE]"
                  style={{ 
                    color: hoveredMetricId === metric.id 
                      ? (metric.arrowDirection === 'down' ? '#EE6666' : '#669CEE')
                      : 'black'
                  }}
                >
                  {metric.value}.
                </span>
                
                {/* Decimal part or Arrow */}
                {metric.decimal ? (
                  <span 
                    className="tracking-[1.28px] transition-colors duration-300 group-hover:text-[#BDD4F9]"
                    style={{ 
                      color: hoveredMetricId === metric.id 
                        ? (metric.arrowDirection === 'up' ? '#BDD4F9' : '#c7c7c7')
                        : '#c7c7c7'
                    }}
                  >
                    {metric.decimal}
                  </span>
                ) : metric.hasArrow ? (
                  <img 
                    className="w-7 ml-1.5 transition-all duration-300 group-hover:translate-y-0.5" 
                    src="/dashboard/arrow.svg" 
                    alt="Arrow" 
                    style={{ 
                      width: '28px', 
                      marginLeft: '6px',
                      filter: getArrowFilter(metric), // Ստատիկում սև, hover-ում գույն
                      transition: 'filter 0.3s ease'
                    }}
                  />
                ) : null}
                
                {/* Prefix/Suffix - սլաները ձախից */}
                {metric.prefix && (
                  <span 
                    className="absolute -left-5 top-3 text-[12px] transition-colors duration-300 group-hover:text-[#669CEE]"
                    style={{ 
                      color: hoveredMetricId === metric.id 
                        ? '#669CEE'
                        : 'inherit' 
                    }}
                  >
                    {metric.prefix}
                  </span>
                )}
                
                {metric.suffix && (
                  <span 
                    className="absolute -left-5 top-3 text-[12px] transition-colors duration-300 group-hover:text-[#669CEE]"
                    style={{ 
                      color: hoveredMetricId === metric.id 
                        ? (metric.arrowDirection === 'up' ? '#669CEE' : '#EE6666')
                        : 'inherit' 
                    }}
                  >
                    {metric.suffix}
                  </span>
                )}
                
                {/* Arrow indicators - միշտ օգտագործել top-arrow.svg, բայց պտտել երբ down է */}
                {metric.hasArrow && (
                  <span 
                    className="absolute -right-5 top-3 text-[12px]"
                    style={{
                      transform: metric.arrowDirection === 'down' ? 'rotateZ(180deg)' : 'none'
                    }}
                  >
                    <img 
                      src="/dashboard/top-arrow.svg" 
                      alt={metric.arrowDirection === 'up' ? 'Up arrow' : 'Down arrow'} 
                      className={`transition-all duration-300 ${
                        metric.arrowDirection === 'up' 
                          ? 'group-hover:-translate-y-0.5' 
                          : 'group-hover:translate-y-0.5'
                      }`}
                      style={{ 
                        filter: getTopArrowFilter(metric), // Միշտ գույնով
                      }}
                    />
                  </span>
                )}
              </div>
            </div>
            <p className="
              font-montserrat text-[12px] font-normal text-[#c7c7c7] mt-1
              max-[768px]:mt-[-8px] max-[768px]:text-[10px] max-[768px]:w-[74%]
              transition-colors duration-300 group-hover:text-[#a0a0a0]
            ">
              {metric.label}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
};