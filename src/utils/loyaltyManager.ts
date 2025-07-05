
export interface LoyaltyPoints {
  customerId: string;
  points: number;
  tier: 'Bronze' | 'Silver' | 'Gold' | 'Platinum';
  totalSpent: number;
  lastPurchase: string;
}

export interface LoyaltyReward {
  id: string;
  name: string;
  pointsRequired: number;
  type: 'discount' | 'freeItem' | 'cashback';
  value: number;
  description: string;
}

class LoyaltyManager {
  private pointsPerRupee = 1; // 1 point per PKR spent
  private tierThresholds = {
    Bronze: 0,
    Silver: 5000,
    Gold: 15000,
    Platinum: 50000
  };

  private rewards: LoyaltyReward[] = [
    {
      id: '1',
      name: '5% Discount',
      pointsRequired: 500,
      type: 'discount',
      value: 5,
      description: '5% off on next purchase'
    },
    {
      id: '2',
      name: '10% Discount',
      pointsRequired: 1000,
      type: 'discount',
      value: 10,
      description: '10% off on next purchase'
    },
    {
      id: '3',
      name: 'Free Medicine',
      pointsRequired: 2000,
      type: 'freeItem',
      value: 100,
      description: 'Free medicine worth PKR 100'
    },
    {
      id: '4',
      name: 'PKR 50 Cashback',
      pointsRequired: 1500,
      type: 'cashback',
      value: 50,
      description: 'PKR 50 cashback on next purchase'
    }
  ];

  calculatePoints(amount: number): number {
    return Math.floor(amount * this.pointsPerRupee);
  }

  async addPoints(customerId: string, amount: number): Promise<LoyaltyPoints> {
    const currentPoints = await this.getCustomerPoints(customerId);
    const newPoints = this.calculatePoints(amount);
    
    const updatedPoints: LoyaltyPoints = {
      customerId,
      points: currentPoints.points + newPoints,
      totalSpent: currentPoints.totalSpent + amount,
      lastPurchase: new Date().toISOString(),
      tier: this.calculateTier(currentPoints.totalSpent + amount)
    };

    await this.saveCustomerPoints(updatedPoints);
    return updatedPoints;
  }

  async getCustomerPoints(customerId: string): Promise<LoyaltyPoints> {
    const res = await fetch(`/api/loyalty/${customerId}`);
    if (res.ok) return await res.json();
    return {
      customerId,
      points: 0,
      tier: 'Bronze',
      totalSpent: 0,
      lastPurchase: new Date().toISOString()
    };
  }

  private async saveCustomerPoints(loyaltyPoints: LoyaltyPoints) {
    await fetch(`/api/loyalty/${loyaltyPoints.customerId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(loyaltyPoints)
    });
  }

  private calculateTier(totalSpent: number): 'Bronze' | 'Silver' | 'Gold' | 'Platinum' {
    if (totalSpent >= this.tierThresholds.Platinum) return 'Platinum';
    if (totalSpent >= this.tierThresholds.Gold) return 'Gold';
    if (totalSpent >= this.tierThresholds.Silver) return 'Silver';
    return 'Bronze';
  }

  async getAvailableRewards(customerId: string): Promise<LoyaltyReward[]> {
    const customerPoints = await this.getCustomerPoints(customerId);
    return this.rewards.filter(reward => reward.pointsRequired <= customerPoints.points);
  }

  async redeemReward(customerId: string, rewardId: string): Promise<{ success: boolean; message: string; discount?: number }> {
    const customerPoints = await this.getCustomerPoints(customerId);
    const reward = this.rewards.find(r => r.id === rewardId);
    
    if (!reward) {
      return { success: false, message: 'Reward not found' };
    }
    
    if (customerPoints.points < reward.pointsRequired) {
      return { success: false, message: 'Insufficient points' };
    }
    
    // Deduct points
    const updatedPoints: LoyaltyPoints = {
      ...customerPoints,
      points: customerPoints.points - reward.pointsRequired
    };
    
    await this.saveCustomerPoints(updatedPoints);
    
    return {
      success: true,
      message: `${reward.name} redeemed successfully!`,
      discount: reward.type === 'discount' ? reward.value : 0
    };
  }

  getTierBenefits(tier: string) {
    const benefits = {
      Bronze: ['1 point per PKR', 'Basic support'],
      Silver: ['1.2 points per PKR', 'Priority support', '2% extra discount'],
      Gold: ['1.5 points per PKR', 'Priority support', '5% extra discount', 'Free delivery'],
      Platinum: ['2 points per PKR', 'VIP support', '10% extra discount', 'Free delivery', 'Monthly bonus points']
    };
    
    return benefits[tier as keyof typeof benefits] || benefits.Bronze;
  }

  async getAllCustomersLoyalty(): Promise<LoyaltyPoints[]> {
  const res = await fetch('/api/loyalty');
  if (res.ok) return (await res.json()).sort((a: LoyaltyPoints, b: LoyaltyPoints) => b.points - a.points);
  return [];
}
}

export const loyaltyManager = new LoyaltyManager();
