export interface QuoteValidationRules {
  maxShipmentValue: number;
  approvedCargoTypes: string[];
  blacklistedCountries: string[];
  coverageDateRules: {
    maxDays: number;
    minDays: number;
  };
  riskThresholds: {
    highValueThreshold: number;
    highRiskMultiplier: number;
  };
}

export interface ValidationResult {
  isValid: boolean;
  status: 'approved' | 'rejected' | 'under_review';
  reasons: string[];
  flags: string[];
  requiresManualReview: boolean;
}

export class QuoteValidator {
  private static defaultRules: QuoteValidationRules = {
    maxShipmentValue: 50000, // $50,000 maximum
    approvedCargoTypes: [
      'electronics', 'clothing', 'machinery', 'food', 
      'pharma', 'other'
    ],
    blacklistedCountries: ['Russia', 'North Korea', 'Iran', 'Syria'],
    coverageDateRules: {
      maxDays: 365, // Maximum 1 year coverage
      minDays: 1    // Minimum 1 day coverage
    },
    riskThresholds: {
      highValueThreshold: 25000, // $25,000 for high value
      highRiskMultiplier: 1.5
    }
  };

  static validateQuote(quoteData: any, customRules?: Partial<QuoteValidationRules>): ValidationResult {
    const rules = { ...this.defaultRules, ...customRules };
    const results: ValidationResult = {
      isValid: true,
      status: 'approved',
      reasons: [],
      flags: [],
      requiresManualReview: false
    };

    // 1. Shipment Value Check
    if (quoteData.shipment_value > rules.maxShipmentValue) {
      results.isValid = false;
      results.status = 'rejected';
      results.reasons.push(`Shipment value exceeds maximum limit of $${rules.maxShipmentValue.toLocaleString()}`);
    }

    // 2. Cargo Type Validation
    const cargoType = quoteData.cargo_type.toLowerCase();
    if (!rules.approvedCargoTypes.includes(cargoType)) {
      results.isValid = false;
      results.status = 'rejected';
      results.reasons.push(`Cargo type "${quoteData.cargo_type}" is not approved for coverage`);
    }

    // 3. Route/Destination Validation
    const originCountry = quoteData.origin?.country || '';
    const destinationCountry = quoteData.destination?.country || '';
    
    if (rules.blacklistedCountries.some(country => 
      originCountry.toLowerCase().includes(country.toLowerCase()) ||
      destinationCountry.toLowerCase().includes(country.toLowerCase())
    )) {
      results.isValid = false;
      results.status = 'rejected';
      results.reasons.push(`Route involves restricted countries`);
    }

    // 4. Coverage Dates Validity
    const startDate = new Date(quoteData.start_date);
    const endDate = new Date(quoteData.end_date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (startDate < today) {
      results.isValid = false;
      results.status = 'rejected';
      results.reasons.push('Start date cannot be in the past');
    }

    const coverageDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    
    if (coverageDays > rules.coverageDateRules.maxDays) {
      results.isValid = false;
      results.status = 'rejected';
      results.reasons.push(`Coverage period exceeds maximum of ${rules.coverageDateRules.maxDays} days`);
    }

    if (coverageDays < rules.coverageDateRules.minDays) {
      results.isValid = false;
      results.status = 'rejected';
      results.reasons.push(`Coverage period must be at least ${rules.coverageDateRules.minDays} day`);
    }

    // 5. Risk Assessment
    const isHighValue = quoteData.shipment_value > rules.riskThresholds.highValueThreshold;
    const isHighRiskCargo = ['chemicals', 'machinery'].includes(cargoType);
    const isAirTransport = quoteData.transportation_mode === 'air';
    
    // Risk score calculation
    let riskScore = 0;
    if (isHighValue) riskScore += 2;
    if (isHighRiskCargo) riskScore += 2;
    if (isAirTransport) riskScore += 1;
    
    // Check for manual review requirements
    if (riskScore >= 3) {
      results.requiresManualReview = true;
      results.flags.push('High risk combination requires manual review');
      
      if (!results.reasons.length) {
        results.status = 'under_review';
      }
    }

    // 6. Additional Business Rules
    // Example: Machinery over $10,000 requires manual review
    if (cargoType === 'machinery' && quoteData.shipment_value > 10000) {
      results.requiresManualReview = true;
      results.flags.push('High-value machinery requires manual review');
      
      if (results.status === 'approved') {
        results.status = 'under_review';
      }
    }

    // 7. Check for duplicates (simplified)
    // In production, you would check database for similar recent quotes

    // If no reasons for rejection, check if needs manual review
    if (results.reasons.length === 0 && results.requiresManualReview) {
      results.status = 'under_review';
    }

    return results;
  }

  static calculateRiskScore(quoteData: any): number {
    let score = 0;
    
    // Value-based risk
    if (quoteData.shipment_value > 10000) score += 1;
    if (quoteData.shipment_value > 25000) score += 2;
    if (quoteData.shipment_value > 50000) score += 3;
    
    // Cargo-based risk
    const cargoRiskMap: Record<string, number> = {
      'chemicals': 3,
      'machinery': 2,
      'electronics': 1,
      'food': 1,
      'pharma': 2,
      'clothing': 0,
      'other': 1
    };
    
    const cargoType = quoteData.cargo_type.toLowerCase();
    score += cargoRiskMap[cargoType] || 1;
    
    // Transport-based risk
    const transportRiskMap: Record<string, number> = {
      'air': 1,
      'sea': 0,
      'road': 1
    };
    
    score += transportRiskMap[quoteData.transportation_mode] || 0;
    
    return Math.min(score, 10); // Cap at 10
  }

  static getRejectionMessage(reasons: string[]): string {
    if (reasons.length === 0) return '';
    
    const messages: Record<string, string> = {
      'Shipment value exceeds maximum limit': 'Your shipment value exceeds our maximum coverage limit. Please contact our sales team for custom quotes.',
      'Cargo type is not approved': 'This cargo type requires special approval. Please contact our team for more information.',
      'Route involves restricted countries': 'We cannot provide coverage for shipments to/from restricted countries.',
      'Start date cannot be in the past': 'Coverage must start on or after today\'s date.',
      'Coverage period exceeds maximum': 'The coverage period is too long. Please select a shorter period or contact us for annual policies.',
      'High risk combination requires manual review': 'Your shipment requires additional review. Our team will contact you within 24 hours.'
    };
    
    return reasons.map(reason => messages[reason] || reason).join(' ');
  }
}