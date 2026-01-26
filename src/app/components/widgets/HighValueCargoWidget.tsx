// components/widgets/HighValueCargoWidget.tsx
import React from 'react';

interface HighValueCargoWidgetProps {
  percentage?: number;
  mtdValue?: string;
  widgetType?: 'high-value' | 'coverage-utilization' | 'average-value';
}

export const HighValueCargoWidget: React.FC<HighValueCargoWidgetProps> = ({
  percentage = 75.55,
  mtdValue = "62,3k",
  widgetType = 'coverage-utilization'
}) => {
  // Ձևաչափել տոկոսը՝ հեռացնելով ավելորդ .00
  const formatPercentage = (value: number): { whole: string; decimal: string } => {
    const rounded = Math.round(value * 100) / 100; // Կլորացնել 2 տասնորդական
    const isInteger = Number.isInteger(rounded);
    
    if (isInteger) {
      return {
        whole: rounded.toString(),
        decimal: ''
      };
    }
    
    const [wholePart, decimalPart] = rounded.toFixed(2).split('.');
    return {
      whole: wholePart,
      decimal: decimalPart
    };
  };

  const { whole, decimal } = formatPercentage(percentage);

  // Որոշել վերնագրերն ու պիտակները
  const getWidgetConfig = () => {
    switch (widgetType) {
      case 'coverage-utilization':
        return {
          title: 'Insurance Coverage Utilization',
          description: 'of quotes converted to active policies',
          valueLabel: 'Avg cov:',
          valuePrefix: '',
          showCurrencySymbol: false
        };
      case 'average-value':
        return {
          title: 'Average Cargo Value',
          description: 'average value per shipment this month',
          valueLabel: 'MTD avg:',
          valuePrefix: '$',
          showCurrencySymbol: true
        };
      case 'high-value':
      default:
        return {
          title: 'High-value cargo insured this month',
          description: 'of total insured value this month',
          valueLabel: 'MTD ·',
          valuePrefix: '$',
          showCurrencySymbol: true
        };
    }
  };

  const config = getWidgetConfig();

  return (
    <div className="group relative w-full font-montserrat flex-grow min-h-[calc(29%-4px)] 
      xl:flex-[0_0_28%] xl:min-h-auto xl:h-auto
      max-[1336px]:flex-grow max-[1336px]:min-h-auto max-[1336px]:h-auto
      max-[1280px]:flex-grow max-[1280px]:min-h-[240px] max-[1280px]:h-[240px] max-[1280px]:block
      max-[768px]:w-[49%] max-[1024px]:min-h-[240px] max-[1024px]:max-h-[240px]
      max-[1024px]:block
      max-[768px]:flex-shrink-0 max-[768px]:w-[100%] max-[768px]:min-h-[240px] 
      max-[768px]:max-h-[280px]
      max-[480px]:w-[100%] max-[480px]:min-h-[100%] max-[480px]:max-h-[100%]
      transition-all duration-300 ease-out">
      
      <div className="absolute top-0 left-0 w-full h-full bg-[#fdfdf8cf] rounded-xl
        transition-all duration-300 ease-out
        group-hover:bg-[#f9f9f4]"></div>
      
      <div className="max-[480px]:min-h-[240px] relative z-10 p-4 h-full flex flex-col justify-between">
        
        {/* Header */}
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-[#3c3c3c] text-[16px] font-normal tracking-[0.24px] 
            w-[60%] leading-tight
            max-[1024px]:text-[14px] max-[1024px]:tracking-[0.2px]
            max-[768px]:text-[15px] max-[768px]:w-[55%]
            max-[480px]:text-[13px] max-[480px]:w-[65%] max-[480px]:tracking-[0.18px]
            transition-colors duration-300 ease-out
            group-hover:text-[#2a2a2a]">
            {config.title}
          </h3>

          <div className="relative w-fit">
            {config.showCurrencySymbol && (
              <span className="absolute -left-1 top-0 text-white/84 text-[4px] tracking-[0.08px]
                max-[1024px]:text-[3px]
                transition-all duration-300 ease-out
                group-hover:text-white/95">$</span>
            )}
            <div className="bg-[#71a3ef] rounded-[20px] px-2 py-0.5 flex items-center justify-center
              max-[1024px]:px-1.5 max-[1024px]:py-0.5
              max-[480px]:px-1
              transition-all duration-300 ease-out
              group-hover:bg-[#5d95e9] group-hover:shadow-sm">
              <span className="text-white text-xs tracking-[0.24px]
                max-[1024px]:text-[10px] max-[1024px]:tracking-[0.2px]
                max-[480px]:text-[8px]
                transition-all duration-300 ease-out">
                <span className="tracking-[0.04px] max-[1024px]:tracking-[0.03px]">
                  {config.valueLabel} {mtdValue}
                </span>
              </span>
            </div>
          </div>
        </div>

        <div>
          {/* Percentage Section */}
          <div className="flex mb-3 items-end justify-start
            max-[480px]:flex-col max-[480px]:items-start max-[480px]:gap-1">
            <div className="flex items-start gap-0.5 mb-0.5">
              <span className="pl-2 text-black text-[48px] tracking-[0.84px] leading-none
                max-[1024px]:text-[34px] max-[1024px]:tracking-[0.68px]
                max-[768px]:text-[36px]
                max-[480px]:text-[28px] max-[480px]:tracking-[0.56px]
                transition-colors duration-300 ease-out
                group-hover:text-[#111111]">
                <span className="tracking-[0.54px] max-[1024px]:tracking-[0.43px]">{whole}</span>
                {decimal && (
                  <>
                    <span className="tracking-[0.54px] max-[1024px]:tracking-[0.43px]">.</span>
                    <span className="text-[#c7c7c7] tracking-[0.54px] max-[1024px]:tracking-[0.43px]
                      transition-colors duration-300 ease-out
                      group-hover:text-[#a8a8a8]">{decimal}</span>
                  </>
                )}
              </span>
              <span className="text-black text-[7px] tracking-[0.14px] mt-[6px]
                max-[1024px]:text-[6px] max-[1024px]:mt-[7px]
                max-[480px]:text-[5px] max-[480px]:mt-[6px]
                transition-colors duration-300 ease-out
                group-hover:text-[#111111] absolute">%</span>
            </div>
            
            <p className="text-[#c7c7c7] text-xs tracking-[0.24px] text-right leading-tight 
              w-[50%] text-left mb-1
              max-[1024px]:text-[10px] max-[1024px]:tracking-[0.2px] max-[1024px]:w-[45%]
              max-[768px]:w-[50%]
              max-[480px]:w-[90%] max-[480px]:text-left max-[480px]:mb-0 max-[480px]:text-[9px]
              transition-colors duration-300 ease-out
              group-hover:text-gray-500">
              {config.description}
            </p>
          </div>

          {/* Progress Bar */}
          <div className="space-y-1">
            <div className="relative h-5
              max-[1024px]:h-4
              max-[480px]:h-3.5">
              
              <div 
                className="absolute top-1 left-0 h-3 
                  bg-gradient-to-r from-[#bfd5f8] to-[#669cee] 
                  rounded-l-[40px] rounded-r-none
                  max-[1024px]:top-0.5 max-[1024px]:h-2.5
                  max-[480px]:top-0.5 max-[480px]:h-2
                  transition-all duration-300 ease-out
                  group-hover:from-[#a0c2ff] group-hover:to-[#4a8cff]"
                style={{ width: `${percentage}%` }}
              ></div>
              
              <div 
                className="absolute top-1 h-3 
                  bg-gradient-to-r from-[#6da1ef4f] to-[#f6f8fa40] 
                  rounded-r-[40px] rounded-l-none
                  max-[1024px]:top-0.5 max-[1024px]:h-2.5
                  max-[480px]:top-0.5 max-[480px]:h-2
                  transition-all duration-300 ease-out
                  group-hover:from-[#a0c2ff33] group-hover:to-[#f6f8fa66]"
                style={{ left: `${percentage}%`, width: `${100 - percentage}%` }}
              ></div>
              
              <img 
                className="absolute top-[-0.5px] w-[20px] h-[20px]
                  max-[1024px]:w-[16px] max-[1024px]:h-[16px] max-[1024px]:top-[-1px]
                  max-[480px]:w-[12px] max-[480px]:h-[12px]
                  transition-all duration-300 ease-out
                  group-hover:brightness-110 group-hover:drop-shadow-[0_0_6px_rgba(102,156,238,0.4)]" 
                src="https://c.animaapp.com/mk1qdxa5LsxC7P/img/polygon-1.svg" 
                alt="Progress marker"
                style={{ left: `calc(${percentage}% - ${window.innerWidth < 480 ? 6 : window.innerWidth < 1024 ? 8 : 10}px)` }}
              />
            </div>
            
            <div className="flex justify-between text-[#c7c7c7] 
              text-[8px] tracking-[0.16px]
              max-[1024px]:text-[7px]
              max-[480px]:text-[6px]
              lg:hidden
              transition-colors duration-300 ease-out
              group-hover:text-gray-400">
              <span>0%</span>
              <span>100%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};