import { Medicine } from '@/types/medicine';

type TaxConfig = {
  enabled: boolean;
  rate: number;
  inclusive: boolean;
};

function getBackendBaseUrl() {
  // @ts-ignore
  if (window?.electronAPI?.getBackendBaseUrl) {
    // @ts-ignore
    return window.electronAPI.getBackendBaseUrl();
  }
  return 'http://localhost:3001/api';
}

export class TaxService {
  private taxConfig: TaxConfig = { enabled: true, rate: 0.17, inclusive: false };

  async fetchTaxConfig(): Promise<TaxConfig> {
    const res = await fetch(`${getBackendBaseUrl()}/tax-config`);
    const config = await res.json();
    this.taxConfig = {
      enabled: !!config.enabled,
      rate: config.rate,
      inclusive: !!config.inclusive
    };
    return this.taxConfig;
  }

  async updateTaxConfig(config: Partial<TaxConfig>): Promise<void> {
    const newConfig = { ...this.taxConfig, ...config };
    await fetch(`${getBackendBaseUrl()}/tax-config`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newConfig)
    });
    this.taxConfig = newConfig;
  }

  public getTaxConfig(): TaxConfig {
    return this.taxConfig;
  }

  public calculateTax(amount: number): number {
    if (!this.taxConfig.enabled || amount <= 0) return 0;
    return parseFloat((amount * this.taxConfig.rate).toFixed(2));
  }

  public calculateTotalWithTax(amount: number): number {
    if (!this.taxConfig.enabled || amount <= 0) return amount;
    
    return this.taxConfig.inclusive 
      ? amount 
      : parseFloat((amount + this.calculateTax(amount)).toFixed(2));
  }

  public applyTaxToMedicines(medicines: Medicine[]): Medicine[] {
    return medicines.map(med => ({
      ...med,
      price: this.calculateTotalWithTax(med.price)
    }));
  }
}

export const taxService = new TaxService();
