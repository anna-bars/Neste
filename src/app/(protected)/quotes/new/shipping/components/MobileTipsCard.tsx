import { CheckCircle } from 'lucide-react';

interface MobileTipsCardProps {
  completionPercentage: number;
}

const MobileTipsCard: React.FC<MobileTipsCardProps> = ({ completionPercentage }) => {
  return (
    <div className="md:hidden bg-[url('/quotes/new/shipping-wd-back.png')] bg-cover bg-center flex flex-col gap-6 rounded-2xl shadow-lg border border-gray-200 p-5 mb-6 text-white">
      <div className="flex items-center gap-2 mb-2">
        <h3 className="text-lg font-semibold">Smart Quote Tips</h3>
      </div>
      
      <div className="space-y-4">
        <div className="flex items-start gap-3">
          <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
            <CheckCircle className="w-3 h-3" />
          </div>
          <p className="text-sm leading-relaxed">
            <span className="font-semibold">Full Coverage:</span> Include all freight charges and duties in shipment value for complete protection.
          </p>
        </div>
        
        <div className="flex items-start gap-3">
          <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
            <CheckCircle className="w-3 h-3" />
          </div>
          <p className="text-sm leading-relaxed">
            <span className="font-semibold">Lower Premiums:</span> Accurate cargo classification can reduce premiums by up to 30%.
          </p>
        </div>
      </div>

      <div className="pt-4 border-t border-white/20">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-white/90">Progress</span>
          <span className="text-sm font-semibold text-white">
            {Math.round(completionPercentage/100*7)} of 7 fields
          </span>
        </div>
        <div className="w-full bg-white/20 rounded-full h-2">
          <div 
            className="bg-white h-2 rounded-full transition-all duration-300"
            style={{ width: `${completionPercentage}%` }}
          />
        </div>
      </div>
    </div>
  );
};

export default MobileTipsCard;