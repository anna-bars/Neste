import React, { useState, useEffect, useRef } from 'react';

export interface ApprovalRateProps {
  /** Գլխավոր վերնագիր */
  title?: string;
  /** Ենթավերնագիր */
  subtitle?: string;
  /** Հաստատման տոկոս (0-100) */
  approvalPercentage?: number;
  /** Հաստատված փաստաթղթերի քանակ */
  approvedCount?: number;
  /** Տեսականու անվանում (օր. "Document", "Quote", "Request", և այլն) */
  typeLabel?: string;
  /** Կարգավորումներ թարմացման համար */
  autoUpdate?: boolean;
  /** Թարմացման ինտերվալ (միլիվայրկյաններով) */
  updateInterval?: number;
  /** Callback, երբ տոկոսը փոխվում է */
  onPercentageChange?: (percentage: number) => void;
  /** Հատուկ գույներ */
  colors?: {
    primary?: string;
    secondary?: string;
    progressStart?: string;
    progressEnd?: string;
    textPrimary?: string;
    textSecondary?: string;
    progressDisabled?: string;
  };
  /** Ցուցադրել առաջադեմ ցուցիչը */
  showAdvancedIndicator?: boolean;
  /** Progress bar-ը դարձնել disabled/blurred */
  disabledProgress?: boolean;
  /** Disabled progress bar-ի համար custom message */
  disabledMessage?: string;
}

export const ApprovalRate: React.FC<ApprovalRateProps> = ({
  title = 'Document Approval Rate',
  subtitle = 'Approved documents percentage.',
  approvalPercentage = 0,
  approvedCount = 0,
  typeLabel = 'Document',
  autoUpdate = false,
  updateInterval = 5000,
  onPercentageChange,
  colors = {
    primary: '#000000',
    secondary: '#c7c7c7',
    progressStart: 'rgba(216, 228, 254, 0.52)',
    progressEnd: 'rgba(39, 100, 235, 0.35)',
    textPrimary: '#2d3748',
    textSecondary: '#4a5568',
    progressDisabled: '#e2e8f0'
  },
  showAdvancedIndicator = true,
  disabledProgress = false,
  disabledMessage = 'Upload documents to track progress'
}) => {
  const [percentage, setPercentage] = useState(approvalPercentage);
  const [count, setCount] = useState(approvedCount);
  const [isAnimating, setIsAnimating] = useState(false);
  const [animationProgress, setAnimationProgress] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const progressBarRef = useRef<HTMLDivElement>(null);

  // Սկզբնական արժեքների սահմանում
  useEffect(() => {
    setPercentage(approvalPercentage);
    setCount(approvedCount);
  }, [approvalPercentage, approvedCount]);

  // Ավտոմատ թարմացում (միացնել միայն եթե disabled չէ)
  useEffect(() => {
    if (!autoUpdate || disabledProgress) return;

    const interval = setInterval(() => {
      const randomChange = Math.floor(Math.random() * 5) - 2;
      const newPercentage = Math.max(0, Math.min(100, percentage + randomChange));
      const newCount = Math.max(0, Math.min(100, count + randomChange));
      
      setIsAnimating(true);
      setAnimationProgress(0);
      
      const animationDuration = 500;
      const steps = 60;
      const stepDuration = animationDuration / steps;
      
      let currentStep = 0;
      const animate = () => {
        if (currentStep > steps) {
          setIsAnimating(false);
          setPercentage(newPercentage);
          setCount(newCount);
          if (onPercentageChange) {
            onPercentageChange(newPercentage);
          }
          return;
        }
        
        setAnimationProgress(currentStep / steps);
        currentStep++;
        setTimeout(animate, stepDuration);
      };
      
      animate();
    }, updateInterval);

    return () => clearInterval(interval);
  }, [autoUpdate, updateInterval, percentage, count, onPercentageChange, disabledProgress]);

  // Հաշվարկել անիմացիայի արժեքը
  const animatedPercentage = isAnimating 
    ? percentage + (approvalPercentage - percentage) * animationProgress
    : percentage;

    console.log("😡😡😡😡", animatedPercentage);
    

  const animatedCount = isAnimating
    ? Math.round(count + (approvedCount - count) * animationProgress)
    : count;

  // Հաշվարկել progress bar-ի գույնը
  const getProgressGradient = () => {
    if (disabledProgress) {
      return `linear-gradient(
        180deg,
        ${colors.progressDisabled || '#e2e8f0'} 0%,
        ${colors.progressDisabled ? `${colors.progressDisabled}CC` : '#cbd5e0'} 100%
      )`;
    }
    
    if (isAnimating) {
      const intensity = 0.5 + 0.5 * Math.sin(animationProgress * Math.PI * 4);
      return `linear-gradient(
        180deg,
        rgba(255, 255, 200, ${0.3 + intensity * 0.3}) 0%,
        rgba(255, 200, 100, ${0.2 + intensity * 0.2}) 100%
      )`;
    }
    
    if (isHovered) {
      return `linear-gradient(
        180deg,
        rgba(216, 228, 254, 0.7) 0%,
        rgba(39, 100, 235, 0.5) 100%
      )`;
    }
    
    return `linear-gradient(
      180deg,
      ${colors.progressStart} 0%,
      ${colors.progressEnd} 100%
    )`;
  };

  return (
    <article 
      className="frame approval-rate-container w-full box-border relative flex flex-col items-start gap-6 p-4 border border-[#d1d1d154] bg-[#fdfdf8cf] rounded-2xl hover:shadow-sm transition-shadow duration-300"
      onMouseEnter={() => !disabledProgress && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Վերնագիր և ենթավերնագիր */}
      <header 
        className="approval-rate-header w-full flex flex-col items-start gap-1 flex-none relative"
      >
        <h1 
          className="approval-rate-title w-full mt-[-1px] font-['Montserrat',_Helvetica,_Arial,_sans-serif] font-medium text-[18px] tracking-[0.36px] leading-normal m-0"
          style={{ color: colors.textPrimary }}
        >
          {title}
        </h1>
        <p 
          className="text-[#C8C8C8] approval-rate-subtitle w-full relative font-['Montserrat',_Helvetica,_Arial,_sans-serif] font-medium text-[14px] tracking-[0.28px] leading-normal m-0"
          style={{ color: colors.textSecondary }}
        >
          {subtitle}
        </p>
      </header>

      {/* Տոկոսի ցուցադրում */}
      <section 
        className="approval-percentage-section relative w-[161px] h-10"
        aria-label="Approval percentage"
      >
        <div 
          className="percentage-container absolute top-0 left-0 flex gap-1 w-[76px] h-[38px] items-start"
        >
          <span 
            className="percentage-symbol w-[9px] h-3 font-['Montserrat',_Helvetica,_Arial,_sans-serif] font-normal text-[10px] tracking-[0.20px] leading-normal whitespace-nowrap pt-1.5"
            aria-hidden="true"
            style={{ 
              color: disabledProgress ? colors.textSecondary : colors.textPrimary,
              opacity: disabledProgress ? 0.5 : 1
            }}
          >
            %
          </span>
          <div className='flex gap-[12px] items-end'>
            <span 
            className="percentage-value mt-0.5 w-fit h-9 font-['Montserrat',_Helvetica,_Arial,_sans-serif] font-normal text-[48px] tracking-[0.96px] leading-9 whitespace-nowrap transition-all duration-300 ease-in-out"
            style={{ 
              color: disabledProgress ? colors.textSecondary : colors.textPrimary,
              transition: isAnimating && !disabledProgress ? 'all 0.3s ease' : 'none',
              transform: isAnimating && !disabledProgress ? 'scale(1.05)' : 'scale(1)',
              filter: disabledProgress ? 'blur(0.8px)' : 'none',
              opacity: disabledProgress ? 0.6 : 1
            }}
          >
            {Math.round(animatedPercentage)}
          </span>
          <span 
            className="type-label  bottom-[25px] left-[91px] font-['Montserrat',_Helvetica,_Arial,_sans-serif] font-medium text-[12px] tracking-[0.24px] leading-normal"
            style={{ 
              color: disabledProgress ? colors.textSecondary : colors.textPrimary,
              opacity: disabledProgress ? 0.6 : 1
            }}
          >
            {typeLabel}
          </span>
          </div>
        </div>
        
      </section>

      {/* Առաջընթացի տող */}
      <section 
        className="progress-section relative w-full h-[68px]"
        aria-label="Document approval progress"
      >
        <div 
          className="progress-wrapper flex flex-col w-full"
        >
          {/* Վերնագիր և քանակ */}
          <div 
            className="progress-header flex flex-col w-full"
          >
            <div 
              className="count-display flex items-center justify-between w-full h-[17px] relative"
            >
              <span 
                className="progress-title relative w-fit font-['Montserrat',_Helvetica,_Arial,_sans-serif] font-medium text-[12px] tracking-[0.24px] leading-normal"
                style={{ 
                  color: colors.textPrimary,
                  opacity: disabledProgress ? 0.6 : 1
                }}
              >
                Documents Approved
              </span>
              <span 
                className="progress-count relative w-fit mt-[-1px] font-['Montserrat',_Helvetica,_Arial,_sans-serif] font-normal text-[14px] tracking-[0.28px] leading-normal transition-all duration-300 ease-in-out"
                style={{ 
                  color: colors.textSecondary,
                  transition: isAnimating && !disabledProgress ? 'all 0.3s ease' : 'none',
                  filter: disabledProgress ? 'blur(0.5px)' : 'none',
                  opacity: disabledProgress ? 0.6 : 1
                }}
              >
                {animatedCount}
              </span>
            </div>
          </div>

          {/* Առաջընթացի տող - հիմնական մասը */}
          <div 
            ref={progressBarRef}
            className="progress-bar-container mt-1.5 w-full h-6 rounded overflow-hidden relative flex"
          >
            <div 
              className="progress-bar-fill relative top-0 left-0 h-full rounded transition-all duration-500 ease-in-out"
              role="progressbar"
              aria-valuenow={animatedPercentage}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label={disabledProgress ? "Progress tracking disabled - upload documents" : "Document approval progress bar"}
              style={{
                width: `${animatedPercentage}%`,
                background: getProgressGradient(),
                transition: disabledProgress ? 'none' : isAnimating ? 'width 0.5s ease, background 0.3s ease' : 'width 0.3s ease, background 0.3s ease',
                boxShadow: disabledProgress ? 'none' : isAnimating ? '0 0 10px rgba(255, 200, 100, 0.5)' : isHovered ? '0 0 12px rgba(39, 100, 235, 0.25)' : 'none',
                zIndex: 2,
                // Blur/muted effects միայն progress bar-ի վրա
                backdropFilter: disabledProgress ? 'blur(4px) saturate(0.5)' : 'none',
                filter: disabledProgress ? 'blur(1px) opacity(0.8)' : 'none',
                borderRight: disabledProgress ? '1px solid rgba(255, 255, 255, 0.3)' : 'none'
              }}
            >
              {/* Progress indicator - միայն եթե enabled է */}
              {!disabledProgress && (
                <div 
                  className="progress-indicator absolute right-[3px] top-1/2 transform -translate-y-1/2 w-[3px] h-[18px] bg-[#f6f8fa] rounded-[1px] transition-all duration-200 ease-out"
                  style={{
                    ...(isHovered ? {
                      background: '#ffffff',
                      boxShadow: '0 0 6px rgba(255, 255, 255, 0.8)',
                      width: '4px',
                      height: '20px'
                    } : {})
                  }}
                />
              )}
              
              {/* Shimmer effect - միայն եթե enabled է */}
              {!disabledProgress && isHovered && (
                <div 
                  className="progress-shimmer absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 hover:opacity-100"
                  style={{
                    animation: 'shimmer 1.5s infinite'
                  }}
                />
              )}
              
              {/* Disabled վիճակի համար overlay և տեքստ */}
              {disabledProgress && (
                <div 
                  className="disabled-overlay absolute inset-0 w-full h-full flex items-center justify-center"
                >
                  <div 
                    className="disabled-text-content px-2 py-0.5 rounded-full bg-white/40 backdrop-blur-sm"
                    style={{
                      transform: 'translateX(-50%)'
                    }}
                  >
                    <span 
                      className="disabled-message font-['Montserrat'] font-medium text-[10px] tracking-[0.2px] whitespace-nowrap"
                      style={{
                        color: colors.textSecondary,
                        textShadow: '0 1px 2px rgba(255, 255, 255, 0.8)'
                      }}
                    >
                      {disabledMessage}
                    </span>
                  </div>
                </div>
              )}
            </div>
            
            {/* Առաջադեմ ցուցիչ (գծիկներ) */}
            {showAdvancedIndicator && !disabledProgress && (
              <div 
                className={`
                  advanced-indicator-container
                  filter opacity-30 top-0 left-0 h-full
                  inline-flex gap-[4.5px] ml-[2px]
                  justify-start items-center
                  overflow-hidden z-10 -ml-0.5
                  ${animatedPercentage === 0 ? 'drop-shadow-[2px_4px_6px_blue]' : ''}
                `}
                style={{ 
                  width: `${100 - animatedPercentage}%`,
                  // filter: animatedPercentage ? ' opacity(1) drop-shadow-[2px_4px_6px_blue]' : 'drop-shadow-[2px_4px_6px_blue]';

                }}
                
              >
                {Array.from({ length: 187 }).map((_, index) => (
                  <div
                    key={index}
                    className="indicator-line w-px h-[18px] bg-[#E8E8E8] flex-shrink-0 scale-x-[2.7]"
                    style={{
                      opacity: disabledProgress ? 0.4 : 1
                    }}
                  />
                ))}
              </div>
            )}
            
            {/* Background track - նույնպես blurred եթե disabled */}
            <div 
              className="progress-track absolute inset-0 w-full h-full rounded"
              style={{
                filter: disabledProgress ? 'blur(0.5px) opacity(0.6)' : 'none',
                zIndex: 1
              }}
            />
          </div>

          {/* Սանդղակ */}
          <div 
            className="progress-scale mt-1 flex items-center justify-between w-full h-[17px] relative"
          >
            <span 
              className="text-[10px] scale-min relative w-fit mt-[-1px] font-['Montserrat',_Helvetica,_Arial,_sans-serif] font-normal tracking-[0.28px] leading-normal"
              style={{ 
                color: colors.textSecondary,
                opacity: disabledProgress ? 0.5 : 1
              }}
            >
              0
            </span>
            <span 
              className="text-[10px] scale-max relative w-fit mt-[-1px] font-['Montserrat',_Helvetica,_Arial,_sans-serif] font-normal tracking-[0.28px] leading-normal"
              style={{ 
                color: colors.textSecondary,
                opacity: disabledProgress ? 0.5 : 1
              }}
            >
              100
            </span>
          </div>
        </div>
      </section>

      {/* Հավելյալ ոճեր */}
      <style jsx global>{`
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.7;
          }
        }
        
        @keyframes shimmer {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }
        
        @keyframes subtle-pulse {
          0%, 100% {
            opacity: 0.4;
          }
          50% {
            opacity: 0.6;
          }
        }
        
        .approval-rate-container {
          transition: all 0.3s ease;
        }
        
        .progress-bar-fill {
          animation: ${disabledProgress ? 'subtle-pulse 2s ease-in-out infinite' : 
                    isAnimating ? 'pulse 0.5s ease-in-out infinite' : 
                    isHovered ? 'pulse 1s ease-in-out infinite' : 'none'};
        }
        
        .progress-shimmer {
          animation: shimmer 2s infinite linear;
        }
        
        @media screen and (max-width: 768px) {
          .frame {
            padding: 16px;
            gap: 16px;
          }
          
          .approval-rate-title {
            font-size: 16px;
          }
          
          .approval-rate-subtitle {
            font-size: 12px;
          }
          
          .percentage-value {
            font-size: 36px;
          }
        }
      `}</style>
    </article>
  );
};