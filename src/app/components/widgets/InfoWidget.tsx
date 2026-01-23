import React from 'react';

interface InfoWidgetProps {
  title?: string;
  rateValue?: number;
  description?: React.ReactNode;
  className?: string;
  perecntageInfo?: string;
  subText?: string; 
}

export const InfoWidget: React.FC<InfoWidgetProps> = ({
  title = "Improve Your Quote Rate",
  rateValue = 72,
  description,
  className = "",
  perecntageInfo="Quotes"
}) => {
  const defaultDescription = (
    <>
      Your Quotes are often Declined due to 
      <strong className="font-medium tracking-[0.03px]"> Inaccurate Cargo Value</strong>
    </>
  );

  return (
    <div className={`min-h-[calc(26%-4px)] xl:flex-[0_0_26%] flex-col flex justify-between stats-card border border-[#d1d1d154] bg-[#fdfdf8cf] rounded-2xl p-4 hover:shadow-sm transition-shadow duration-300 ${className}`}>
      {/* Title - responsive text size */}
      <h3 className="font-montserrat text-base md:text-lg font-medium text-black">
        {title}
      </h3>
      
      <div className="stats-content">
        <div className="rate-section relative w-[120px] md:w-[100%] h-[32px] md:h-[39px]">
          
          <div className="rate-value absolute top-0 left-0 w-full md:w-full h-[30px] md:h-[37px] flex gap-1 items-baseline">
            {/* Percentage value - responsive text size */}
            <span className="percentage font-montserrat text-[40px] md:text-[56px] text-black font-normal tracking-[0.8px] md:tracking-[1.12px] leading-7 md:leading-9  ml-3 md:ml-4">
              {rateValue}
            </span>
            {/* Percent symbol - responsive positioning */}
            <span className="percent-symbol font-montserrat text-xs text-black font-normal tracking-[0.20px] w-2 absolute top-[-2px] md:top-[-4px] left-0">
              %
            </span>
            {/* ------------ */}
            <div className="rate-label w-max top-5 md:top-6  font-montserrat text-xs font-medium text-[#c7c7c7] tracking-[0.24px]">
            {perecntageInfo}
          </div>
          </div>
        </div>
      </div>
      
      {/* Description - responsive text size and max-width */}
      <p className="mt-2 stats-description font-montserrat text-xs font-normal text-[#afaeae] tracking-[0.20px] md:tracking-[0.24px] max-w-[220px] md:max-w-[268px]">
        {description || defaultDescription}
      </p>
    </div>
  );
};

export default InfoWidget;