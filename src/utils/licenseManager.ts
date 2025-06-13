
export interface License {
  id: string;
  branchId: string;
  branchName: string;
  licenseKey: string;
  hardwareFingerprint: string;
  plan: 'monthly' | 'yearly' | 'lifetime';
  status: 'active' | 'expired' | 'suspended' | 'grace_period';
  issuedDate: string;
  expiryDate: string;
  gracePeriodDays: number;
  remainingGraceDays: number;
  features: string[];
  pricing: {
    amount: number;
    currency: string;
    billingCycle: string;
  };
  encryptedData: string;
  lastValidation: string;
  validationCount: number;
}

export interface LicenseValidationResult {
  valid: boolean;
  license?: License;
  error?: string;
  daysRemaining?: number;
  gracePeriodActive?: boolean;
  requiresRenewal?: boolean;
}

class LicenseManager {
  private licenses: License[] = [];
  private currentLicense: License | null = null;
  private validationInterval: number | null = null;

  constructor() {
    this.loadFromStorage();
    this.initializeDefaultLicense();
    this.startPeriodicValidation();
  }

  private initializeDefaultLicense() {
    if (this.licenses.length === 0) {
      const defaultLicense = this.generateLicense('main', 'Main Branch', 'lifetime');
      this.licenses.push(defaultLicense);
      this.currentLicense = defaultLicense;
      this.saveToStorage();
    } else {
      this.currentLicense = this.licenses[0];
    }
  }

  generateLicense(branchId: string, branchName: string, plan: License['plan']): License {
    const hardwareFingerprint = this.generateHardwareFingerprint();
    const licenseKey = this.generateLicenseKey(branchId, hardwareFingerprint);
    
    let expiryDate: string;
    let pricing: License['pricing'];
    
    switch (plan) {
      case 'monthly':
        expiryDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
        pricing = { amount: 5000, currency: 'PKR', billingCycle: 'monthly' };
        break;
      case 'yearly':
        expiryDate = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString();
        pricing = { amount: 40000, currency: 'PKR', billingCycle: 'yearly' };
        break;
      case 'lifetime':
        expiryDate = new Date(2099, 11, 31).toISOString();
        pricing = { amount: 100000, currency: 'PKR', billingCycle: 'one-time' };
        break;
    }

    const license: License = {
      id: this.generateId(),
      branchId,
      branchName,
      licenseKey,
      hardwareFingerprint,
      plan,
      status: 'active',
      issuedDate: new Date().toISOString(),
      expiryDate,
      gracePeriodDays: 7,
      remainingGraceDays: 7,
      features: this.getFeaturesForPlan(plan),
      pricing,
      encryptedData: this.encryptLicenseData(licenseKey, hardwareFingerprint),
      lastValidation: new Date().toISOString(),
      validationCount: 0
    };

    return license;
  }

  private getFeaturesForPlan(plan: License['plan']): string[] {
    const baseFeatures = ['pos', 'inventory', 'basic_reports'];
    const premiumFeatures = ['multi_branch', 'advanced_reports', 'analytics', 'loyalty'];
    const enterpriseFeatures = ['api_access', 'integrations', 'custom_branding', 'priority_support'];

    switch (plan) {
      case 'monthly':
        return [...baseFeatures, ...premiumFeatures];
      case 'yearly':
        return [...baseFeatures, ...premiumFeatures, 'bulk_discount'];
      case 'lifetime':
        return [...baseFeatures, ...premiumFeatures, ...enterpriseFeatures];
      default:
        return baseFeatures;
    }
  }

  validateLicense(): LicenseValidationResult {
    if (!this.currentLicense) {
      return { valid: false, error: 'No license found' };
    }

    const license = this.currentLicense;
    const now = new Date();
    const expiryDate = new Date(license.expiryDate);
    const daysRemaining = Math.ceil((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    // Check hardware fingerprint
    if (license.hardwareFingerprint !== this.generateHardwareFingerprint()) {
      license.status = 'suspended';
      this.saveToStorage();
      return { valid: false, error: 'License tied to different hardware' };
    }

    // Check if expired
    if (now > expiryDate) {
      if (license.remainingGraceDays > 0) {
        license.status = 'grace_period';
        license.remainingGraceDays--;
        this.saveToStorage();
        return {
          valid: true,
          license,
          gracePeriodActive: true,
          daysRemaining: license.remainingGraceDays,
          requiresRenewal: true
        };
      } else {
        license.status = 'expired';
        this.saveToStorage();
        return { valid: false, error: 'License expired', requiresRenewal: true };
      }
    }

    // Check if renewal reminder needed (30 days before expiry)
    const requiresRenewal = daysRemaining <= 30 && license.plan !== 'lifetime';

    // Update validation info
    license.lastValidation = now.toISOString();
    license.validationCount++;
    this.saveToStorage();

    return {
      valid: true,
      license,
      daysRemaining,
      requiresRenewal
    };
  }

  renewLicense(licenseId: string, plan: License['plan']): boolean {
    const license = this.licenses.find(l => l.id === licenseId);
    if (!license) return false;

    const now = new Date();
    let newExpiryDate: Date;

    switch (plan) {
      case 'monthly':
        newExpiryDate = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
        license.pricing = { amount: 5000, currency: 'PKR', billingCycle: 'monthly' };
        break;
      case 'yearly':
        newExpiryDate = new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000);
        license.pricing = { amount: 40000, currency: 'PKR', billingCycle: 'yearly' };
        break;
      case 'lifetime':
        newExpiryDate = new Date(2099, 11, 31);
        license.pricing = { amount: 100000, currency: 'PKR', billingCycle: 'one-time' };
        break;
    }

    license.plan = plan;
    license.expiryDate = newExpiryDate.toISOString();
    license.status = 'active';
    license.remainingGraceDays = license.gracePeriodDays;
    license.features = this.getFeaturesForPlan(plan);

    this.saveToStorage();
    return true;
  }

  hasFeature(feature: string): boolean {
    const validation = this.validateLicense();
    if (!validation.valid || !validation.license) return false;
    return validation.license.features.includes(feature);
  }

  getLicenseInfo(): License | null {
    return this.currentLicense;
  }

  getAllLicenses(): License[] {
    return this.licenses;
  }

  private generateHardwareFingerprint(): string {
    // Simulate hardware fingerprint (in real app, use actual hardware info)
    const navigator_info = navigator.userAgent + navigator.platform;
    const screen_info = screen.width + 'x' + screen.height + 'x' + screen.colorDepth;
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    
    return this.hashString(navigator_info + screen_info + timezone);
  }

  private generateLicenseKey(branchId: string, hardwareFingerprint: string): string {
    const timestamp = Date.now().toString();
    const random = Math.random().toString(36).substring(2);
    const combined = branchId + hardwareFingerprint + timestamp + random;
    return this.hashString(combined).substring(0, 24).toUpperCase();
  }

  private encryptLicenseData(licenseKey: string, hardwareFingerprint: string): string {
    const data = JSON.stringify({ licenseKey, hardwareFingerprint, timestamp: Date.now() });
    return btoa(data); // Simple base64 encoding (use proper encryption in production)
  }

  private hashString(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(36);
  }

  private startPeriodicValidation() {
    // Validate license every hour
    this.validationInterval = window.setInterval(() => {
      const validation = this.validateLicense();
      if (!validation.valid) {
        this.handleLicenseViolation(validation.error || 'License validation failed');
      }
    }, 60 * 60 * 1000);
  }

  private handleLicenseViolation(error: string) {
    console.error('License violation:', error);
    // In a real app, this would disable functionality or show a modal
    // For now, we'll just log it
  }

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  private loadFromStorage() {
    const stored = localStorage.getItem('pharmacy_licenses');
    if (stored) {
      this.licenses = JSON.parse(stored);
    }
  }

  private saveToStorage() {
    localStorage.setItem('pharmacy_licenses', JSON.stringify(this.licenses));
  }

  // Public methods for license management UI
  createLicenseForBranch(branchId: string, branchName: string, plan: License['plan']): License {
    const license = this.generateLicense(branchId, branchName, plan);
    this.licenses.push(license);
    this.saveToStorage();
    return license;
  }

  revokeLicense(licenseId: string): boolean {
    const license = this.licenses.find(l => l.id === licenseId);
    if (license) {
      license.status = 'suspended';
      this.saveToStorage();
      return true;
    }
    return false;
  }

  exportLicenseReport(): string {
    return JSON.stringify(this.licenses, null, 2);
  }
}

export const licenseManager = new LicenseManager();
