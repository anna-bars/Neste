import { Info } from 'lucide-react';

interface MobileTipsCardProps {
  completionPercentage: number;
}

const MobileTipsCard: React.FC<MobileTipsCardProps> = ({ completionPercentage }) => {
  return (
    <div className="md:hidden bg-blue-50 rounded border border-blue-100 p-4 mb-4">
      <div className="flex items-center gap-2 mb-2">
        <Info className="w-4 h-4 text-blue-600" />
        <h3 className="font-medium text-blue-900">Important</h3>
      </div>
      
      <div className="space-y-1">
        <p className="text-sm text-blue-800">
          • Include all costs in shipment value
        </p>
        <p className="text-sm text-blue-800">
          • Accurate classification reduces premiums
        </p>
      </div>

      <div className="mt-3 pt-3 border-t border-blue-200">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs text-blue-700">Progress</span>
          <span className="text-xs font-medium text-blue-900">
            {Math.round(completionPercentage/100*7)} of 7
          </span>
        </div>
        <div className="w-full bg-blue-200 rounded-full h-1">
          <div 
            className="bg-blue-600 h-1 rounded-full transition-all duration-300"
            style={{ width: `${completionPercentage}%` }}
          />
        </div>
      </div>
    </div>
  );
};

export default MobileTipsCard;