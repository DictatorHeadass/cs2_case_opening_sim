import { Case, CaseItem, OpenedItem, WearCondition, GameState, Achievement } from "@shared/schema";
import { RARITY_DROP_RATES, WEAR_CONDITIONS, STATTRAK_CHANCE, STATTRAK_MULTIPLIER, XP_PER_CASE } from "./constants";

export class GameEngine {
  static openCase(gameCase: Case): OpenedItem {
    // Select item based on rarity probabilities
    const selectedItem = this.selectItemByRarity(gameCase);
    
    // Determine wear condition
    const condition = this.selectWearCondition();
    
    // Determine StatTrak™
    const statTrak = Math.random() < (selectedItem.statTrakChance || STATTRAK_CHANCE);
    
    // Calculate final value
    const conditionMultiplier = condition.multiplier;
    const statTrakMultiplier = statTrak ? STATTRAK_MULTIPLIER : 1;
    const marketVariance = 0.7 + Math.random() * 0.6; // 70-130% variance
    
    const finalValue = selectedItem.baseValue * conditionMultiplier * statTrakMultiplier * marketVariance;
    
    return {
      ...selectedItem,
      condition,
      statTrak,
      kills: statTrak ? Math.floor(Math.random() * 1000) : 0,
      finalValue: Math.round(finalValue * 100) / 100,
      acquiredAt: new Date(),
    };
  }
  
  private static selectItemByRarity(gameCase: Case): CaseItem {
    const random = Math.random();
    let cumulativeProbability = 0;
    
    // Adjust probabilities for special cases
    const adjustedRates = gameCase.guaranteedSpecial 
      ? { ...RARITY_DROP_RATES, knife: 1.0, covert: 0 } 
      : RARITY_DROP_RATES;
    
    // Create weighted pool based on case items and rarity rates
    const itemPool: { item: CaseItem; weight: number }[] = [];
    
    for (const item of gameCase.items) {
      const rarityRate = adjustedRates[item.rarity] || 0;
      itemPool.push({ item, weight: rarityRate });
    }
    
    // Normalize weights
    const totalWeight = itemPool.reduce((sum, entry) => sum + entry.weight, 0);
    
    for (const entry of itemPool) {
      cumulativeProbability += entry.weight / totalWeight;
      if (random <= cumulativeProbability) {
        return entry.item;
      }
    }
    
    // Fallback to first item
    return gameCase.items[0];
  }
  
  private static selectWearCondition(): WearCondition {
    const random = Math.random();
    let cumulativeProbability = 0;
    
    for (const condition of WEAR_CONDITIONS) {
      cumulativeProbability += condition.probability;
      if (random <= cumulativeProbability) {
        return condition;
      }
    }
    
    return WEAR_CONDITIONS[2]; // Field-Tested as fallback
  }
  
  static calculateXpGain(casesOpened: number): number {
    return XP_PER_CASE + Math.floor(casesOpened / 10) * 5; // Bonus XP every 10 cases
  }
  
  static getLevelFromXp(xp: number): number {
    return Math.floor(xp / 1000) + 1;
  }
  
  static getXpForNextLevel(currentXp: number): number {
    const currentLevel = this.getLevelFromXp(currentXp);
    return currentLevel * 1000 - currentXp;
  }
  
  static checkAchievements(gameState: GameState, newItem: OpenedItem): Achievement[] {
    const unlockedAchievements: Achievement[] = [];
    
    // Implementation would check various achievement conditions
    // This is a simplified version
    
    return unlockedAchievements;
  }
  
  static tradeUpContract(items: OpenedItem[]): OpenedItem | null {
    if (items.length !== 10) return null;
    
    // All items must be same rarity and different
    const rarity = items[0].rarity;
    if (!items.every(item => item.rarity === rarity)) return null;
    
    // Calculate next tier
    const rarityOrder = ['consumer', 'industrial', 'restricted', 'classified', 'covert'];
    const currentIndex = rarityOrder.indexOf(rarity);
    if (currentIndex === -1 || currentIndex === rarityOrder.length - 1) return null;
    
    const nextRarity = rarityOrder[currentIndex + 1] as any;
    
    // Create a mock higher-tier item
    const avgValue = items.reduce((sum, item) => sum + item.finalValue, 0) / items.length;
    const upgradedValue = avgValue * 1.5; // Trade-up typically increases value
    
    return {
      id: `tradeup_${Date.now()}`,
      name: `Trade-Up Contract Result`,
      type: 'weapon',
      rarity: nextRarity,
      baseValue: upgradedValue,
      image: items[0].image,
      conditions: WEAR_CONDITIONS,
      condition: items[0].condition,
      statTrak: false,
      kills: 0,
      finalValue: upgradedValue,
      acquiredAt: new Date(),
    };
  }
  
  static generateMarketPrices(items: OpenedItem[]): Record<string, number> {
    const prices: Record<string, number> = {};
    
    for (const item of items) {
      // Simulate market fluctuation (±20% from current value)
      const fluctuation = 0.8 + Math.random() * 0.4;
      prices[item.id] = Math.round(item.finalValue * fluctuation * 100) / 100;
    }
    
    return prices;
  }
}
