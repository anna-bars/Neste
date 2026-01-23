import React, { useState } from 'react';

interface DocumentItemProps {
  type?: string;
  id?: string;
  status?: string;
  cargoType?: string;
  summary?: string;
  buttonText?: string;
  onClick?: () => void;
}

const DocumentItem: React.FC<DocumentItemProps> = ({
  type = 'Policy:',
  id = 'P-0812',
  status = 'Pending Review',
  cargoType = 'Electronics',
  summary = '1 Document Pending Review',
  buttonText = 'View All Docs',
  onClick 
  
}) => {
  const [isHovered, setIsHovered] = useState(false);

  // Ստատուսների համար գույների և կոճակների կոնֆիգուրացիա
  const statusConfig = {
    'Pending Review': {
      bgColor: 'bg-[#EAECBA]',
      hoverBgColor: 'group-hover:bg-[#d8da94]',
      glowColor: 'rgba(234, 236, 186, 0.6)',
      textColor: 'text-[#6B6B6B]',
      hoverTextColor: 'text-white',
      borderColor: 'border-[#EAECBA]',
      hoverBorderColor: 'border-[#F1F0F6]',
      dotColor: '#EAECBA',
      hoverDotColor: '#d8da94',
      buttons: [
        { text: 'View All Docs', variant: 'default' as const }
      ]
    },
    'Missing': {
      bgColor: 'bg-[#FAEDBC]',
      hoverBgColor: 'group-hover:bg-[#e8d9a4]',
      glowColor: 'rgba(250, 237, 188, 0.6)',
      textColor: 'text-[#6B6B6B]',
      hoverTextColor: 'text-white',
      borderColor: 'border-[#FAEDBC]',
      hoverBorderColor: 'border-[#F1F0F6]',
      dotColor: '#FAEDBC',
      hoverDotColor: '#e8d9a4',
      buttons: [
        { text: 'Upload Missing Docs', variant: 'primary' as const }
      ]
    },
    'Rejected': {
      bgColor: 'bg-[#ECB9BA]',
      hoverBgColor: 'group-hover:bg-[#daa7a8]',
      glowColor: 'rgba(236, 185, 186, 0.6)',
      textColor: 'text-[#6B6B6B]',
      hoverTextColor: 'text-white',
      borderColor: 'border-[#ECB9BA]',
      hoverBorderColor: 'border-[#F1F0F6]',
      dotColor: '#ECB9BA',
      hoverDotColor: '#daa7a8',
      buttons: [
        { text: 'Replace Document', variant: 'rejected' as const }
      ]
    },
    'Approved': {
      bgColor: 'bg-[#B9DAEC]',
      hoverBgColor: 'group-hover:bg-[#a7c8da]',
      glowColor: 'rgba(185, 218, 236, 0.6)',
      textColor: 'text-[#6B6B6B]',
      hoverTextColor: 'text-white',
      borderColor: 'border-[#B9DAEC]',
      hoverBorderColor: 'border-[#F1F0F6]',
      dotColor: '#B9DAEC',
      hoverDotColor: '#a7c8da',
      buttons: [
        { text: 'View All Docs', variant: 'default' as const }
      ]
    },
    'In Progress': {
      bgColor: 'bg-[#EAECBA]',
      hoverBgColor: 'group-hover:bg-[#d8da94]',
      glowColor: 'rgba(234, 236, 186, 0.6)',
      textColor: 'text-[#6B6B6B]',
      hoverTextColor: 'text-white',
      borderColor: 'border-[#EAECBA]',
      hoverBorderColor: 'border-[#F1F0F6]',
      dotColor: '#EAECBA',
      hoverDotColor: '#d8da94',
      buttons: [
        { text: 'View All Docs', variant: 'default' as const }
      ]
    }
  };

  // Ընթացիկ ստատուսի կոնֆիգը
  const currentStatus = statusConfig[status as keyof typeof statusConfig] || statusConfig['Pending Review'];

  return (
    <div 
      className="w-full max-w-[100%] sm:max-w-[24.3%] group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative">
        {/* Top part with background image */}
        <div 
          className="flex gap-2 items-start bg-no-repeat bg-top bg-contain pt-3 pl-4 pr-4"
          style={{ 
            backgroundImage: 'url(/documents/documents-item-top-part2.svg)',
            backgroundSize: 'revert-layer',
            backgroundPosition: 'left'
          }}
        >
          <p className="text-[14px] text-[#7E7E7E]">{id}</p>
        </div>
        
        {/* Bottom part */}
        <div className=" bg-[#fdfdf8cf] p-3 rounded-b-2xl rounded-tr-2xl flex flex-col gap-3">
          {/* Status with custom hover colors */}
          <div className="flex justify-end">
            <div className="relative">
              <span 
                className={`
                  text-xs 
                  px-2 py-0.5 
                  rounded-full 
                  border-2 
                  outline outline-2 outline-[#F3F3F5] 
                  relative
                  transition-all duration-300 ease-out
                  z-1
                  ${isHovered ? currentStatus.hoverTextColor : currentStatus.textColor}
                  ${isHovered ? currentStatus.hoverBorderColor : currentStatus.borderColor}
                  ${isHovered ? currentStatus.hoverBgColor : 'bg-[#FAFAFB]'}
                `}
                style={{
                  boxShadow: isHovered 
                    ? `0 0 10px ${currentStatus.glowColor}, 0 0 20px ${currentStatus.glowColor}` 
                    : 'none',
                  animation: isHovered ? 'glowPulse 1.5s ease-in-out infinite' : 'none',
                }}
              >
                {status}
                {/* Glowing dot with hover effect */}
                <span 
                  className={`
                    absolute -left-3 top-1/2 -translate-y-1/2 
                    w-2 h-2 
                    rounded-full
                    transition-all duration-300
                    z-2
                  `}
                  style={{ 
                    backgroundColor: isHovered ? currentStatus.hoverDotColor : currentStatus.dotColor,
                    boxShadow: isHovered 
                      ? `0 0 8px ${currentStatus.glowColor}, 0 0 12px ${currentStatus.glowColor}` 
                      : 'none',
                  }}
                ></span>
              </span>
            </div>
          </div>
          
          {/* Info section */}
          <div className="flex flex-col gap-1.5">
            <div>
              <h3 className="text-sm font-normal text-gray-800">Cargo Type:</h3>
              <div className="text-sm text-[#7E7E7E] mt-1 ml-4">{cargoType}</div>
            </div>
            <div>
              <h3 className="text-sm font-normal text-gray-800">Document Summary:</h3>
              <div className="text-sm text-[#7E7E7E] mt-1 ml-4">{summary}</div>
            </div>
          </div>
          
          {/* Buttons - տարբեր ստատուսների համար տարբեր կոճակներ */}
          <div className="mt-2 flex justify-end gap-2">
            {currentStatus.buttons.map((button, index) => (
              <button
                key={index}
                className={`
                  cursor-pointer px-4 py-1 rounded text-sm transition-colors
                  ${button.variant === 'default' 
                    ? 'bg-transparent border border-[#E3E6EA] text-[#374151] hover:bg-gray-50' 
                    : ''}
                  ${button.variant === 'primary' 
                    ? 'bg-[#2563EB] text-white border border-[#2563EB] hover:bg-[#1d4ed8]' 
                    : ''}
                  ${button.variant === 'rejected' 
                    ? 'bg-transparent border border-[#D03C3C] text-[#D03C3C] hover:bg-[#fef2f2]' 
                    : ''}
                `}
                onClick={onClick}
                style={
                  button.variant === 'rejected' 
                    ? { borderWidth: '1px' } 
                    : undefined
                }
              >
                {button.text}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Add CSS animation for glow effect */}
      <style jsx>{`
        @keyframes glowPulse {
          0% {
            box-shadow: 0 0 5px var(--glow-color), 0 0 10px var(--glow-color);
          }
          50% {
            box-shadow: 0 0 15px var(--glow-color), 0 0 25px var(--glow-color);
          }
          100% {
            box-shadow: 0 0 5px var(--glow-color), 0 0 10px var(--glow-color);
          }
        }
      `}</style>
    </div>
  );
};

export default DocumentItem;