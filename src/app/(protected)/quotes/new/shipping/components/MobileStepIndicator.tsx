import { CheckCircle } from 'lucide-react';

interface MobileStepIndicatorProps {
  currentStep: number;
}

const MobileStepIndicator: React.FC<MobileStepIndicatorProps> = ({ currentStep }) => {
  const steps = [
    { id: 1, name: 'Shipment Details' },
    { id: 2, name: 'Coverage Options' },
    { id: 3, name: 'Quote Review' },
  ];

  return (
    <div></div>
  );
};

export default MobileStepIndicator;