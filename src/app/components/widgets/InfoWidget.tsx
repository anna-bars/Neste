'use client'

import React, { useState } from 'react';

interface InfoWidgetProps {
  title?: string;
  rateValue?: number;
  description?: React.ReactNode;
  className?: string;
  perecntageInfo?: string;
  subText?: string; 
  /** Հովեր արվելու ժամանակ ցուցադրվող էֆեկտներ */
  hoverEffects?: {
    /** Բորդերի փոփոխություն */
    borderGlow?: boolean;
    /** Գրադիենտ ֆոն */
    gradientBackground?: boolean;
    /** Տոկոսի արժեքի անիմացիա */
    valuePulse?: boolean;
    /** Շայնի էֆեկտ */
    shineEffect?: boolean;
    /** Underline էֆեկտ տոկոսի տակ */
    underlineEffect?: boolean;
    /** Pulse կետ ներքևի աջ անկյունում */
    pulseDot?: boolean;
  };
}

export const InfoWidget: React.FC<InfoWidgetProps> = ({
  title = "Improve Your Quote Rate",
  rateValue = 0,
  description,
  className = "",
  perecntageInfo = "Quotes",
  subText = "No quotes yet",
  hoverEffects = {
    borderGlow: true,
    gradientBackground: true,
    valuePulse: true,
    shineEffect: true,
    underlineEffect: true,
    pulseDot: true
  }
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isClicked, setIsClicked] = useState(false);

  const defaultDescription = (
    <>
      Your Quotes are often Declined due to 
      <strong className="font-medium tracking-[0.03px]"> Inaccurate Cargo Value</strong>
    </>
  );

  // Հաշվարկել անիմացիոն CSS styles
  const getCardStyles = () => {
    const styles: React.CSSProperties = {};
    
    if (isHovered) {
      if (hoverEffects.borderGlow) {
        styles.borderColor = 'rgba(102, 156, 238, 0.3)';
      }
      
      if (hoverEffects.gradientBackground) {
        styles.background = 'linear-gradient(135deg, #fdfdf8cf 0%, #f8f9ffcf 100%)';
      }
    }
    
    return styles;
  };

  // Հաշվարկել տոկոսի արժեքի styles
  const getValueStyles = () => {
    if (isHovered && hoverEffects.valuePulse) {
      return {
        transform: 'scale(1.05)',
        textShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
        transition: 'all 0.3s ease'
      };
    }
    return {};
  };

  return (
    <div 
      className={`min-h-[calc(32%-4px)] xl:flex-[0_0_26%] flex-col flex justify-between stats-card border border-[#d1d1d154] bg-[#fdfdf8cf] rounded-2xl p-4 relative overflow-hidden transition-all duration-300 cursor-pointer ${className}`}
      style={getCardStyles()}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setIsClicked(false);
      }}
      onMouseDown={() => setIsClicked(true)}
      onMouseUp={() => setIsClicked(false)}
      onTouchStart={() => setIsClicked(true)}
      onTouchEnd={() => setIsClicked(false)}
    >
      {/* Shine effect */}
      {hoverEffects.shineEffect && isHovered && (
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] animate-shine" />
        </div>
      )}

      {/* Border glow effect */}
      {hoverEffects.borderGlow && isHovered && (
        <div className="absolute inset-0 rounded-2xl border-2 border-blue-300/20 pointer-events-none transition-all duration-300" />
      )}

      {/* Subtle gradient overlay */}
      {hoverEffects.gradientBackground && isHovered && (
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50/10 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300" />
      )}

      {/* Title - responsive text size */}
      <h3 className="font-montserrat text-base md:text-lg font-medium text-black relative z-10 transition-all duration-300">
        {title}
      </h3>
      
      <div className="stats-content relative z-10">
        <div className="rate-section relative w-[120px] md:w-[100%] h-[32px] md:h-[39px]">
          
          <div className="rate-value absolute top-0 left-0 w-full md:w-full h-[30px] md:h-[37px] flex gap-4 items-baseline">
            {/* Percentage value - responsive text size with hover effect */}
            <span 
              className="percentage gap-4 font-montserrat text-[40px] md:text-[56px] text-black font-normal tracking-[0.8px] md:tracking-[1.12px] leading-7 md:leading-9 ml-3 md:ml-4 transition-all duration-300 relative"
              style={getValueStyles()}
            >
              {rateValue}
              {/* Underline effect for percentage - ONLY under the number */}
              {hoverEffects.underlineEffect && (
                <div 
                  className="absolute bottom-[-2px] left-0 h-[2px] bg-gradient-to-r from-blue-400/50 to-blue-300/50 transition-all duration-500"
                  style={{
                    width: isHovered ? '100%' : '0',
                    maxWidth: '60px' // Սահմանափակում ենք ընդամենը թվի երկարությանը
                  }}
                />
              )}
            </span>
            
            {/* Percent symbol - responsive positioning */}
            <span className="percent-symbol font-montserrat text-xs text-black font-normal tracking-[0.20px] w-2 absolute top-[-2px] md:top-[-4px] left-0 transition-all duration-300">
              %
            </span>
            
            {/* Rate label */}
            <div className="rate-label w-max top-5 md:top-6 font-montserrat text-xs font-medium text-[#c7c7c7] tracking-[0.24px] transition-all duration-300">
              {perecntageInfo}
            </div>
          </div>
        </div>
      </div>
      
      {/* Description - responsive text size and max-width */}
      <p className="mt-2 stats-description font-montserrat text-xs font-normal text-[#afaeae] tracking-[0.20px] md:tracking-[0.24px] max-w-[220px] md:max-w-[268px] relative z-10 transition-all duration-300">
        {description || defaultDescription}
      </p>
      
      {/* Sub text - additional info */}
      {subText && (
        <p className="mt-2 font-montserrat text-xs font-medium text-[#c7c7c7] tracking-[0.20px] relative z-10 transition-all duration-300">
          {subText}
        </p>
      )}

      {/* Subtle indicator dot */}
      {hoverEffects.pulseDot && isHovered && (
        <div className="absolute bottom-3 right-3 w-1.5 h-1.5 bg-blue-400/60 rounded-full animate-pulse" />
      )}

      <style jsx global>{`
        @keyframes shine {
          0% {
            transform: translateX(-100%) skewX(-15deg);
          }
          100% {
            transform: translateX(200%) skewX(-15deg);
          }
        }

        @keyframes pulse {
          0%, 100% {
            opacity: 1;
            transform: scale(1);
          }
          50% {
            opacity: 0.7;
            transform: scale(1.1);
          }
        }

        .animate-shine {
          animation: shine 2s ease-in-out;
        }

        .animate-pulse {
          animation: pulse 2s infinite;
        }

        .stats-card {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .stats-card:hover {
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .percentage {
          position: relative;
        }
      `}</style>
    </div>
  );
};

export default InfoWidget;