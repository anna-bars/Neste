export class QuoteIdGenerator {
  private static usedIds = new Set<string>();
  
  static generateQuoteId(): string {
    // Try to generate unique ID
    for (let i = 0; i < 10; i++) {
      const randomNum = Math.floor(Math.random() * 10000).toString().padStart(5, '0');
      const quoteId = `Q-${randomNum}`;
      
      if (!this.usedIds.has(quoteId)) {
        this.usedIds.add(quoteId);
        return quoteId;
      }
    }
    
    // Fallback with timestamp if can't generate unique random
    const timestamp = Date.now().toString().slice(-5);
    return `Q-${timestamp}`;
  }
  
  static generatePolicyId(): string {
    // Try to generate unique ID
    for (let i = 0; i < 10; i++) {
      const randomNum = Math.floor(Math.random() * 10000).toString().padStart(5, '0');
      const policyId = `P-${randomNum}`;
      
      if (!this.usedIds.has(policyId)) {
        this.usedIds.add(policyId);
        return policyId;
      }
    }
    
    // Fallback with timestamp if can't generate unique random
    const timestamp = Date.now().toString().slice(-5);
    return `P-${timestamp}`;
  }
  
  static formatExistingId(id: string): string {
    if (!id) return this.generateQuoteId();
    
    // If already formatted, keep as is
    if (id.startsWith('Q-') || id.startsWith('P-')) {
      return id;
    }
    
    // If it's a temp ID, generate new formatted ID
    if (id.startsWith('temp-')) {
      return this.generateQuoteId();
    }
    
    // If it's a number or other format, create Q- prefix
    const lastPart = id.slice(-5);
    return `Q-${lastPart}`;
  }
  
  static isTempId(id: string): boolean {
    return id.startsWith('temp-');
  }
}