export interface PremiumCalculationInput {
  cargoType: string;
  shipmentValue: number;
  transportationMode: string;
  coverageType: string;
  startDate: string;
  endDate: string;
}

export interface PremiumCalculationResult {
  basePremium: number;
  deductible: number;
  totalPremium: number;
  serviceFee: number;
  taxes: number;
  totalAmount: number;
}

export class PremiumCalculator {
  // Cargo type risk multipliers
  private static cargoRiskMultipliers: Record<string, number> = {
    'electronics': 1.2,
    'clothing': 1.0,
    'machinery': 1.5,
    'food': 1.3,
    'chemicals': 2.0,
    'pharma': 1.1,
    'other': 1.0
  };

  // Transportation mode multipliers
  private static modeMultipliers: Record<string, number> = {
    'sea': 1.0,
    'air': 1.1,
    'road': 1.2
  };

  // Coverage type multipliers
  private static coverageMultipliers = {
    'standard': 1.0,
    'premium': 1.5,
    'enterprise': 2.0
  };

  // Deductibles
  private static deductibles = {
    'standard': 1000,
    'premium': 500,
    'enterprise': 250
  };

  static calculate(input: PremiumCalculationInput): PremiumCalculationResult {
    // Base rate: 2.3% of shipment value
    const baseRate = input.shipmentValue * 0.023;

    // Apply multipliers
    const cargoMultiplier = this.cargoRiskMultipliers[input.cargoType] || 1.0;
    const modeMultiplier = this.modeMultipliers[input.transportationMode] || 1.0;
    const coverageMultiplier = this.coverageMultipliers[input.coverageType as keyof typeof this.coverageMultipliers] || 1.0;

    // Duration multiplier
    const durationDays = Math.ceil(
      (new Date(input.endDate).getTime() - new Date(input.startDate).getTime()) / (1000 * 60 * 60 * 24)
    );
    const durationMultiplier = Math.max(1, durationDays / 30);

    // Calculate base premium
    let basePremium = baseRate * cargoMultiplier * modeMultiplier * coverageMultiplier * durationMultiplier;

    // Apply minimum premiums
    const minimumPremiums = {
      'standard': 450,
      'premium': 675,
      'enterprise': 900
    };
    const minimum = minimumPremiums[input.coverageType as keyof typeof minimumPremiums] || 0;
    basePremium = Math.max(basePremium, minimum);

    // Round to nearest dollar
    basePremium = Math.round(basePremium);

    // Get deductible
    const deductible = this.deductibles[input.coverageType as keyof typeof this.deductibles] || 1000;

    // Calculate additional fees
    const serviceFee = 99;
    const taxes = Math.round(basePremium * 0.08);
    const totalAmount = basePremium + serviceFee + taxes;

    return {
      basePremium,
      deductible,
      totalPremium: basePremium,
      serviceFee,
      taxes,
      totalAmount
    };
  }

  // Ավտոմատ approval check
  static shouldAutoApprove(input: PremiumCalculationInput): boolean {
    // Business logic for auto-approval
    const highRiskCargo = ['chemicals', 'machinery'];
    const highValueThreshold = 100000;
    
    // Auto-approve unless:
    // 1. High risk cargo
    // 2. Very high value
    // 3. Special requirements
    if (highRiskCargo.includes(input.cargoType)) {
      return false;
    }
    
    if (input.shipmentValue > highValueThreshold) {
      return false;
    }
    
    return true;
  }
}