import { 
  type User, 
  type InsertUser, 
  type GameState, 
  type InsertGameState,
  type InventoryItem,
  type InsertInventoryItem,
  type CaseCooldown,
  type InsertCaseCooldown
} from "@shared/schema";
import { randomUUID } from "crypto";

// Modify the interface with any CRUD methods needed
export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Game state operations
  getGameState(userId: string): Promise<GameState | undefined>;
  createGameState(gameState: InsertGameState): Promise<GameState>;
  updateGameState(userId: string, updates: Partial<GameState>): Promise<GameState | undefined>;

  // Inventory operations
  getInventoryItems(userId: string): Promise<InventoryItem[]>;
  addInventoryItem(item: InsertInventoryItem): Promise<InventoryItem>;
  removeInventoryItem(itemId: string, userId: string): Promise<boolean>;
  clearInventory(userId: string): Promise<boolean>;

  // Case cooldown operations
  getCaseCooldowns(userId: string): Promise<CaseCooldown[]>;
  setCaseCooldown(cooldown: InsertCaseCooldown): Promise<CaseCooldown>;
  removeCaseCooldown(userId: string, caseId: string): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private gameStates: Map<string, GameState>;
  private inventoryItems: Map<string, InventoryItem[]>;
  private caseCooldowns: Map<string, CaseCooldown[]>;

  constructor() {
    this.users = new Map();
    this.gameStates = new Map();
    this.inventoryItems = new Map();
    this.caseCooldowns = new Map();
  }

  // User operations
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    
    // Initialize default game state for new user
    const defaultGameState: GameState = {
      id: randomUUID(),
      userId: id,
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
    };
    this.gameStates.set(id, defaultGameState);
    
    return user;
  }

  // Game state operations
  async getGameState(userId: string): Promise<GameState | undefined> {
    return this.gameStates.get(userId);
  }

  async createGameState(insertGameState: InsertGameState): Promise<GameState> {
    const id = randomUUID();
    const gameState: GameState = {
      id,
      userId: insertGameState.userId,
      balance: insertGameState.balance ?? 1000,
      level: insertGameState.level ?? 1,
      xp: insertGameState.xp ?? 0,
      casesOpened: insertGameState.casesOpened ?? 0,
      totalSpent: insertGameState.totalSpent ?? 0,
      totalEarned: insertGameState.totalEarned ?? 0,
      bestDrop: insertGameState.bestDrop ?? null,
      achievements: insertGameState.achievements ?? {},
      lastLogin: insertGameState.lastLogin ?? new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.gameStates.set(insertGameState.userId, gameState);
    return gameState;
  }

  async updateGameState(userId: string, updates: Partial<GameState>): Promise<GameState | undefined> {
    const existing = this.gameStates.get(userId);
    if (!existing) return undefined;

    const updated: GameState = {
      ...existing,
      ...updates,
      updatedAt: new Date(),
    };
    this.gameStates.set(userId, updated);
    return updated;
  }

  // Inventory operations
  async getInventoryItems(userId: string): Promise<InventoryItem[]> {
    return this.inventoryItems.get(userId) || [];
  }

  async addInventoryItem(insertItem: InsertInventoryItem): Promise<InventoryItem> {
    const id = randomUUID();
    const item: InventoryItem = {
      id,
      userId: insertItem.userId,
      itemId: insertItem.itemId,
      itemName: insertItem.itemName,
      itemType: insertItem.itemType,
      rarity: insertItem.rarity,
      condition: insertItem.condition,
      statTrak: insertItem.statTrak ?? false,
      kills: insertItem.kills ?? null,
      baseValue: insertItem.baseValue,
      currentValue: insertItem.currentValue,
      caseSource: insertItem.caseSource,
      acquiredAt: new Date(),
    };
    
    const existing = this.inventoryItems.get(insertItem.userId) || [];
    this.inventoryItems.set(insertItem.userId, [...existing, item]);
    
    return item;
  }

  async removeInventoryItem(itemId: string, userId: string): Promise<boolean> {
    const existing = this.inventoryItems.get(userId) || [];
    const filtered = existing.filter(item => item.id !== itemId);
    
    if (filtered.length === existing.length) return false;
    
    this.inventoryItems.set(userId, filtered);
    return true;
  }

  async clearInventory(userId: string): Promise<boolean> {
    this.inventoryItems.set(userId, []);
    return true;
  }

  // Case cooldown operations
  async getCaseCooldowns(userId: string): Promise<CaseCooldown[]> {
    const cooldowns = this.caseCooldowns.get(userId) || [];
    // Filter out expired cooldowns
    const validCooldowns = cooldowns.filter(c => c.cooldownUntil > new Date());
    this.caseCooldowns.set(userId, validCooldowns);
    return validCooldowns;
  }

  async setCaseCooldown(insertCooldown: InsertCaseCooldown): Promise<CaseCooldown> {
    const id = randomUUID();
    const cooldown: CaseCooldown = {
      ...insertCooldown,
      id,
    };
    
    const existing = this.caseCooldowns.get(insertCooldown.userId) || [];
    // Remove any existing cooldown for this case
    const filtered = existing.filter(c => c.caseId !== insertCooldown.caseId);
    this.caseCooldowns.set(insertCooldown.userId, [...filtered, cooldown]);
    
    return cooldown;
  }

  async removeCaseCooldown(userId: string, caseId: string): Promise<boolean> {
    const existing = this.caseCooldowns.get(userId) || [];
    const filtered = existing.filter(c => c.caseId !== caseId);
    
    if (filtered.length === existing.length) return false;
    
    this.caseCooldowns.set(userId, filtered);
    return true;
  }
}

export const storage = new MemStorage();
