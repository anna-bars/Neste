import React, { useState, useEffect } from 'react';

interface PolicyTimelineWidgetProps {
  percentage?: number;
  expiringPolicies?: number;
  totalPolicies?: number;
}

export const PolicyTimelineWidget: React.FC<PolicyTimelineWidgetProps> = ({
  percentage = 71,
  expiringPolicies = 7,
  totalPolicies = 22
}) => {
  const scoreNumber = percentage.toString();
  const [isHovered, setIsHovered] = useState(false);
  const [animatedPercentage, setAnimatedPercentage] = useState(percentage);

  // Smooth անիմացիա համար hover-ի ժամանակ
  useEffect(() => {
    if (isHovered) {
      // Smooth անիմացիա hover-ի սկզբում
      let startValue = 0;
      const endValue = percentage;
      const duration = 700;
      const startTime = Date.now();

      const animate = () => {
        const currentTime = Date.now();
        const elapsedTime = currentTime - startTime;
        const progress = Math.min(elapsedTime / duration, 1);
        
        // Ease out cubic ֆունկցիա
        const easeProgress = 1 - Math.pow(1 - progress, 3);
        const currentValue = startValue + (endValue - startValue) * easeProgress;
        
        setAnimatedPercentage(currentValue);
        
        if (progress < 1) {
          requestAnimationFrame(animate);
        }
      };

      requestAnimationFrame(animate);
    } else {
      // Արագ վերադառնալ սկզբնական արժեքին
      setAnimatedPercentage(percentage);
    }
  }, [isHovered, percentage]);

  // Ստուգել 0% կամ 100% դեպքերը - ավելի խիստ պայմաններ
  const showPointer = animatedPercentage > 1 && animatedPercentage < 99;

  // Հաշվել triangle pointer-ի դիրքը (պարզեցված տարբերակ)
  const getTriangleLeftPosition = () => {
    // Սահմանափակել արժեքը 0-100 սահմաններում
    const clampedPercentage = Math.max(0, Math.min(100, animatedPercentage));
    
    // Եթե 0% կամ 100%, տեղադրել եզրերին
    if (clampedPercentage === 0) return '-13.5px';
    if (clampedPercentage === 100) return 'calc(100% - 13.5px)';
    
    // Հաշվել նորմալ դիրքը
    return `calc(${clampedPercentage}% - 13.5px)`;
  };

  return (
    <div 
      className="
        relative w-full font-montserrat flex-grow min-h-[calc(32%-4px)] flex flex-col justify-between 
        xl:flex-[0_0_34%] xl:min-h-auto xl:h-auto
        max-[1336px]:flex-grow max-[1336px]:min-h-auto max-[1336px]:h-auto
        max-[768px]:flex-shrink-0 max-[768px]:w-[100%] max-[768px]:min-h-[200px] 
        max-[768px]:max-h-[220px] max-[768px]:min-h-[200px]
        max-[768px]:flex-col max-[768px]:justify-between max-[768px]:flex
        max-[480px]:w-[100%]
        backdrop-blur-[10px] rounded-[16px] p-4 justify-between
        flex flex-col gap-0 border border-[#d1d1d154] bg-[#fdfdf8cf] rounded-2xl p-4 
        hover:shadow-sm transition-all duration-300 ease-out
        group
      "
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Card Title */}
      <h3 className="
        text-[18px] font-medium text-black tracking-[0.36px] leading-normal
        max-[1024px]:text-[16px]
        max-[768px]:text-[17px]
        max-[480px]:text-[15px]
        transition-all duration-300 ease-out
        group-hover:text-[#2a2a2a]
      ">
        Policy Expiration Timeline
      </h3>

      {/* Score Display */}
      <div className="flex flex-row items-end relative gap-4">
        <div className="flex items-center gap-[3px]">
          <span className="
            text-[10px] font-normal text-black tracking-[0.20px] leading-[12px]
            max-[1024px]:text-[9px]
            max-[480px]:text-[8px]
            absolute -top-[5px]
            transition-all duration-300 ease-out
            group-hover:text-[#2a2a2a]
          ">%</span>
          
          <span className="
            text-[56px] font-normal text-black tracking-[1.12px] leading-[36px]
            max-[1024px]:text-[48px] max-[1024px]:tracking-[0.96px]
            max-[768px]:text-[50px]
            max-[480px]:text-[42px] max-[480px]:tracking-[0.84px]
            ml-4
            transition-all duration-300 ease-out
            group-hover:text-[#2a2a2a]
          ">
            {scoreNumber}
          </span>
          
        </div>
        
        <span className="
          text-[12px] font-medium text-[#c7c7c7] tracking-[0.24px] leading-normal
          max-[1024px]:text-[11px]
          max-[480px]:text-[10px]
          transition-all duration-300 ease-out
          group-hover:text-[#b0b0b0]
        ">
          Policies
        </span>
      </div>

      {/* Expiration Info */}
      <p className="
        text-[12px] font-medium text-[#c7c7c7] tracking-[0.24px] leading-normal
        max-[1024px]:text-[11px]
        max-[480px]:text-[10px]
        transition-all duration-300 ease-out
        group-hover:text-[#b0b0b0]
      ">
        Total expiring policies: {expiringPolicies} / {totalPolicies}
      </p>

      {/* Chart Container */}
      <div className="flex flex-col gap-2 flex-col-reverse">
        {/* Chart Labels */}
        <div className="
          flex justify-between items-center
          w-[340px] max-w-full
          max-[1024px]:w-[300px]
          max-[768px]:w-[320px]
          max-[480px]:w-full
        ">
          <span className="
            text-[12px] font-normal text-[#c7c7c7] tracking-[0.32px]
            transition-all duration-300 ease-out
            group-hover:text-[#b0b0b0]
          ">
            0%
          </span>
          
          <span className="
            text-[12px] font-normal text-black tracking-[0.32px]
            transition-all duration-300 ease-out
            group-hover:text-[#2a2a2a]
          ">
            50%
          </span>
          
          <span className="
            text-[12px] font-normal text-[#c7c7c7] tracking-[0.32px]
            transition-all duration-300 ease-out
            group-hover:text-[#b0b0b0]
          ">
            100%
          </span>
        </div>

        {/* Progress Bar Container */}
        <div className="
          relative w-[340px] h-[28px] max-w-full
          max-[1024px]:w-[300px]
          max-[768px]:w-[320px]
          max-[480px]:w-full max-[480px]:h-[24px]
        ">
          {/* Progress Track */}
          <div className="
            absolute top-[10px] left-0 w-full h-[4px]
            bg-[rgba(252,220,162,0.5)] rounded-[58px]
            max-[480px]:top-[8px] max-[480px]:h-[3px]
            transition-all duration-300 ease-out
            overflow-hidden
            group-hover:bg-[rgba(252,220,162,0.6)]
          ">
            {/* Progress Fill with Glow Effect */}
            <div 
              className="
                absolute top-0 left-0 h-full bg-[#FCDCA2] rounded-[58px]
                transition-all duration-700 ease-out
                group-hover:shadow-[0_0_12px_rgba(252,220,162,0.7)]
                group-hover:brightness-110
              "
              style={{ width: `${animatedPercentage}%` }}
            >
              {/* Inner Glow Effect */}
              <div className="
                absolute inset-0 w-full h-full
                bg-gradient-to-r from-transparent via-white/20 to-transparent
                opacity-0 group-hover:opacity-100
                transition-opacity duration-700 ease-out
              "></div>
            </div>
          </div>

          {/* Gradient Bar with Enhanced Hover */}
          <div 
            className="
              absolute top-[4px] left-0 h-[16px]
              max-[1024px]:h-[16px]
              max-[768px]:h-[16px]
              max-[480px]:h-[14px] max-[480px]:top-[3px]
              transition-all duration-700 ease-out
              group-hover:scale-y-[1.08]
              group-hover:origin-bottom
            " 
            style={{ width: `${Math.min(animatedPercentage + 10, 100)}%` }}
          >
            <img 
              src="/shipments/bar.svg" 
              alt="Gradient bar" 
              className="
                w-full h-full object-contain
                transition-all duration-700 ease-out
                group-hover:brightness-110
              "
            />
          </div>

          {/* Triangle Pointer with Enhanced Hover - Using CSS for visibility */}
          <div 
            className={`
              absolute top-[-1px] w-[27px] h-[25px]
              pointer-events-none transition-all duration-700 ease-out
              max-[1024px]:w-[24px] max-[1024px]:h-[22px]
              max-[480px]:w-[20px] max-[480px]:h-[18px]
              group-hover:scale-105
              ${showPointer ? 'visible opacity-100' : 'invisible opacity-0'}
            `}
            style={{ 
              left: getTriangleLeftPosition(),
            }}
          >
            <img 
              src="/shipments/bar0.svg" 
              alt="Progress pointer"
              className="
                w-full h-full object-contain
                transition-all duration-700 ease-out
                group-hover:brightness-110
              "
            />
          </div>

          {/* Pulse Effect Container - Also hide when at edges */}
          <div 
            className={`
              absolute top-[10px] h-[4px]
              rounded-[58px]
              transition-all duration-300 ease-out
              ${showPointer ? 'opacity-0 group-hover:opacity-100' : 'opacity-0'}
            `}
            style={{ 
              width: `${animatedPercentage}%`,
              background: 'linear-gradient(90deg, rgba(252,220,162,0.3) 0%, rgba(252,220,162,0.6) 50%, rgba(252,220,162,0.3) 100%)',
            }}
          />
        </div>
      </div>
    </div>
  );
};