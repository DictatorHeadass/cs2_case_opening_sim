import { useState, useEffect } from "react";
import { GameState, InventoryItem, OpenedItem, Case, Achievement, DailyChallenge } from "@shared/schema";
import { GameEngine } from "@/lib/game-engine";
import { CASES, ACHIEVEMENTS, DAILY_CHALLENGES } from "@/lib/constants";
import { useToast } from "@/hooks/use-toast";

interface GameStateHook {
  gameState: GameState;
  inventory: InventoryItem[];
  achievements: Achievement[];
  dailyChallenges: DailyChallenge[];
  caseCooldowns: Record<string, Date>;
  openCase: (caseId: string) => Promise<OpenedItem | null>;
  sellItem: (itemId: string) => Promise<void>;
  sellAllItems: () => Promise<void>;
  buyCase: (caseId: string) => Promise<boolean>;
  tradeUpContract: (itemIds: string[]) => Promise<OpenedItem | null>;
  updateBalance: (amount: number) => void;
  isLoading: boolean;
}

const STORAGE_KEYS = {
  GAME_STATE: 'cs2_game_state',
  INVENTORY: 'cs2_inventory',
  ACHIEVEMENTS: 'cs2_achievements',
  CHALLENGES: 'cs2_challenges',
  COOLDOWNS: 'cs2_cooldowns',
};

export function useGameState(): GameStateHook {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  
  const [gameState, setGameState] = useState<GameState>({
    id: 'local',
    userId: 'local',
    balance: 1000,
    level: 1,
    xp: 0,
    casesOpened: 0,
    totalSpent: 0,
    totalEarned: 0,
    bestDrop: null,
    achievements: {},
    lastLogin: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>(ACHIEVEMENTS);
  const [dailyChallenges, setDailyChallenges] = useState<DailyChallenge[]>(DAILY_CHALLENGES);
  const [caseCooldowns, setCaseCooldowns] = useState<Record<string, Date>>({});

  // Load game state from localStorage
  useEffect(() => {
    const loadGameState = () => {
      try {
        const savedState = localStorage.getItem(STORAGE_KEYS.GAME_STATE);
        if (savedState) {
          setGameState(JSON.parse(savedState));
        }

        const savedInventory = localStorage.getItem(STORAGE_KEYS.INVENTORY);
        if (savedInventory) {
          setInventory(JSON.parse(savedInventory));
        }

        const savedAchievements = localStorage.getItem(STORAGE_KEYS.ACHIEVEMENTS);
        if (savedAchievements) {
          setAchievements(JSON.parse(savedAchievements));
        }

        const savedChallenges = localStorage.getItem(STORAGE_KEYS.CHALLENGES);
        if (savedChallenges) {
          setDailyChallenges(JSON.parse(savedChallenges));
        }

        const savedCooldowns = localStorage.getItem(STORAGE_KEYS.COOLDOWNS);
        if (savedCooldowns) {
          const cooldowns = JSON.parse(savedCooldowns);
          // Convert string dates back to Date objects
          const parsedCooldowns: Record<string, Date> = {};
          for (const [key, value] of Object.entries(cooldowns)) {
            parsedCooldowns[key] = new Date(value as string);
          }
          setCaseCooldowns(parsedCooldowns);
        }
      } catch (error) {
        console.error('Failed to load game state:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadGameState();
  }, []);

  // Save game state to localStorage
  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem(STORAGE_KEYS.GAME_STATE, JSON.stringify(gameState));
    }
  }, [gameState, isLoading]);

  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem(STORAGE_KEYS.INVENTORY, JSON.stringify(inventory));
    }
  }, [inventory, isLoading]);

  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem(STORAGE_KEYS.ACHIEVEMENTS, JSON.stringify(achievements));
    }
  }, [achievements, isLoading]);

  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem(STORAGE_KEYS.CHALLENGES, JSON.stringify(dailyChallenges));
    }
  }, [dailyChallenges, isLoading]);

  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem(STORAGE_KEYS.COOLDOWNS, JSON.stringify(caseCooldowns));
    }
  }, [caseCooldowns, isLoading]);

  const openCase = async (caseId: string): Promise<OpenedItem | null> => {
    const gameCase = CASES.find(c => c.id === caseId);
    if (!gameCase) return null;

    // Check cooldown
    if (gameCase.cooldown && caseCooldowns[caseId]) {
      const cooldownEnd = caseCooldowns[caseId];
      if (new Date() < cooldownEnd) {
        toast({
          title: "Case on Cooldown",
          description: `This case is still on cooldown for ${Math.ceil((cooldownEnd.getTime() - Date.now()) / (1000 * 60))} minutes.`,
          variant: "destructive",
        });
        return null;
      }
    }

    // Check balance
    if (gameState.balance < gameCase.price) {
      toast({
        title: "Insufficient Funds",
        description: `You need $${gameCase.price} to open this case.`,
        variant: "destructive",
      });
      return null;
    }

    try {
      console.log('Opening case:', gameCase.name, 'Price:', gameCase.price, 'Current balance:', gameState.balance);
      
      // Open the case
      const openedItem = GameEngine.openCase(gameCase);
      
      // Calculate new balance
      const newBalance = gameState.balance - gameCase.price;
      
      console.log('New balance should be:', newBalance);
      
      // Parse current best drop value safely
      const currentBestValue = gameState.bestDrop 
        ? parseFloat(gameState.bestDrop.split(' - $')[1] || '0')
        : 0;
      
      // Update game state
      const newGameState = {
        ...gameState,
        balance: newBalance,
        casesOpened: gameState.casesOpened + 1,
        totalSpent: gameState.totalSpent + gameCase.price,
        xp: gameState.xp + GameEngine.calculateXpGain(gameState.casesOpened),
        level: GameEngine.getLevelFromXp(gameState.xp + GameEngine.calculateXpGain(gameState.casesOpened)),
        bestDrop: !gameState.bestDrop || openedItem.finalValue > currentBestValue
          ? `${openedItem.name} - $${openedItem.finalValue.toFixed(2)}`
          : gameState.bestDrop,
      };
      
      console.log('Setting new game state:', newGameState);
      setGameState(newGameState);

      // Add to inventory
      const inventoryItem: InventoryItem = {
        id: `${Date.now()}_${Math.random()}`,
        userId: 'local',
        itemId: openedItem.id,
        itemName: openedItem.name,
        itemType: openedItem.type,
        rarity: openedItem.rarity,
        condition: openedItem.condition.name,
        statTrak: openedItem.statTrak,
        kills: openedItem.kills,
        baseValue: openedItem.baseValue,
        currentValue: openedItem.finalValue,
        caseSource: gameCase.name,
        acquiredAt: new Date(),
      };
      
      setInventory(prev => [...prev, inventoryItem]);

      // Set cooldown if applicable
      if (gameCase.cooldown) {
        setCaseCooldowns(prev => ({
          ...prev,
          [caseId]: new Date(Date.now() + gameCase.cooldown! * 60 * 1000),
        }));
      }

      // Show success toast
      toast({
        title: "Case Opened!",
        description: `You got ${openedItem.name} worth $${openedItem.finalValue.toFixed(2)}!`,
        variant: openedItem.rarity === 'knife' || openedItem.rarity === 'covert' ? "default" : "default",
      });

      return openedItem;
    } catch (error) {
      console.error('Error opening case:', error);
      toast({
        title: "Error",
        description: "Failed to open case. Please try again.",
        variant: "destructive",
      });
      return null;
    }
  };

  const sellItem = async (itemId: string): Promise<void> => {
    const item = inventory.find(i => i.id === itemId);
    if (!item) return;

    // Apply market fluctuation
    const marketPrice = item.currentValue * (0.85 + Math.random() * 0.3); // 85-115% of current value
    
    setGameState(prev => ({
      ...prev,
      balance: prev.balance + marketPrice,
      totalEarned: prev.totalEarned + marketPrice,
    }));

    setInventory(prev => prev.filter(i => i.id !== itemId));

    toast({
      title: "Item Sold",
      description: `Sold ${item.itemName} for $${marketPrice.toFixed(2)}`,
    });
  };

  const sellAllItems = async (): Promise<void> => {
    if (inventory.length === 0) return;

    const totalValue = inventory.reduce((sum, item) => {
      const marketPrice = item.currentValue * (0.85 + Math.random() * 0.3);
      return sum + marketPrice;
    }, 0);

    setGameState(prev => ({
      ...prev,
      balance: prev.balance + totalValue,
      totalEarned: prev.totalEarned + totalValue,
    }));

    setInventory([]);

    toast({
      title: "All Items Sold",
      description: `Sold ${inventory.length} items for $${totalValue.toFixed(2)}`,
    });
  };

  const buyCase = async (caseId: string): Promise<boolean> => {
    const gameCase = CASES.find(c => c.id === caseId);
    if (!gameCase || gameState.balance < gameCase.price) return false;

    setGameState(prev => ({
      ...prev,
      balance: prev.balance - gameCase.price,
      totalSpent: prev.totalSpent + gameCase.price,
    }));

    return true;
  };

  const tradeUpContract = async (itemIds: string[]): Promise<OpenedItem | null> => {
    if (itemIds.length !== 10) return null;

    const items = inventory.filter(item => itemIds.includes(item.id));
    if (items.length !== 10) return null;

    // Convert inventory items to OpenedItem format for trade-up
    const openedItems: OpenedItem[] = items.map(item => ({
      id: item.itemId,
      name: item.itemName,
      type: item.itemType as any,
      rarity: item.rarity as any,
      baseValue: item.baseValue,
      image: '', // Would need to map this properly
      conditions: [],
      condition: { 
        name: item.condition as any, 
        displayName: item.condition, 
        multiplier: 1, 
        probability: 1 
      },
      statTrak: item.statTrak,
      kills: item.kills || 0,
      finalValue: item.currentValue,
      acquiredAt: item.acquiredAt || new Date(),
    }));

    const result = GameEngine.tradeUpContract(openedItems);
    if (!result) return null;

    // Remove input items from inventory
    setInventory(prev => prev.filter(item => !itemIds.includes(item.id)));

    // Add result to inventory
    const inventoryItem: InventoryItem = {
      id: `${Date.now()}_${Math.random()}`,
      userId: 'local',
      itemId: result.id,
      itemName: result.name,
      itemType: result.type,
      rarity: result.rarity,
      condition: result.condition.name,
      statTrak: result.statTrak,
      kills: result.kills,
      baseValue: result.baseValue,
      currentValue: result.finalValue,
      caseSource: 'Trade-Up Contract',
      acquiredAt: new Date(),
    };

    setInventory(prev => [...prev, inventoryItem]);

    toast({
      title: "Trade-Up Complete!",
      description: `You received ${result.name} worth $${result.finalValue.toFixed(2)}!`,
    });

    return result;
  };

  const updateBalance = (amount: number): void => {
    setGameState(prev => ({
      ...prev,
      balance: prev.balance + amount,
    }));
  };

  return {
    gameState,
    inventory,
    achievements,
    dailyChallenges,
    caseCooldowns,
    openCase,
    sellItem,
    sellAllItems,
    buyCase,
    tradeUpContract,
    updateBalance,
    isLoading,
  };
}
