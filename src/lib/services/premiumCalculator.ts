// lib/services/premiumCalculator.ts
export class PremiumCalculator {
  // Cargo risk factors
  private static cargoRiskFactors: Record<string, number> = {
    'electronics': 1.2,
    'clothing': 1.0,
    'machinery': 1.4,
    'food': 1.1,
    'pharma': 1.05,
    'chemicals': 1.6
  };

  // Transport risk factors
  private static transportRiskFactors: Record<string, number> = {
    'sea': 1.3,
    'air': 1.1,
    'road': 1.2
  };

  // Base insurance rate (0.8%)
  private static BASE_RATE = 0.008;

  static calculate(input: {
    cargoType: string;
    shipmentValue: number;
    transportationMode: string;
    startDate: string;
    endDate: string;
    duration?: number;
  }) {
    // Calculate duration in days
    const start = new Date(input.startDate);
    const end = new Date(input.endDate);
    const duration = input.duration || Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    
    // Get risk factors
    const cargoRisk = this.cargoRiskFactors[input.cargoType.toLowerCase()] || 1.0;
    const transportRisk = this.transportRiskFactors[input.transportationMode] || 1.0;
    
    // Duration factor (1 + days/100)
    const durationFactor = 1 + (duration / 100);
    
    // Route factor (simplified - could be enhanced with actual route data)
    const routeFactor = 1.2; // Default international
    
    // Calculate base premium
    const basePremium = input.shipmentValue * 
                       this.BASE_RATE * 
                       cargoRisk * 
                       transportRisk * 
                       routeFactor * 
                       durationFactor;
    
    // Apply coverage plan multipliers
    const planMultipliers = {
      standard: 1.00,
      premium: 1.15,
      enterprise: 1.35
    };

    // Deductibles per plan
    const deductibles = {
      standard: 1000,
      premium: 500,
      enterprise: 250
    };

    return {
      basePremium: Math.round(basePremium),
      planMultipliers,
      deductibles
    };
  }
}