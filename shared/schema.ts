import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, real, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const gameStates = pgTable("game_states", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  balance: real("balance").notNull().default(1000),
  level: integer("level").notNull().default(1),
  xp: integer("xp").notNull().default(0),
  casesOpened: integer("cases_opened").notNull().default(0),
  totalSpent: real("total_spent").notNull().default(0),
  totalEarned: real("total_earned").notNull().default(0),
  bestDrop: text("best_drop"),
  achievements: jsonb("achievements").default({}),
  lastLogin: timestamp("last_login"),
  createdAt: timestamp("created_at").default(sql`now()`),
  updatedAt: timestamp("updated_at").default(sql`now()`),
});

export const inventoryItems = pgTable("inventory_items", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  itemId: text("item_id").notNull(),
  itemName: text("item_name").notNull(),
  itemType: text("item_type").notNull(), // weapon, glove, sticker, etc.
  rarity: text("rarity").notNull(), // consumer, industrial, restricted, classified, covert, knife
  condition: text("condition").notNull(), // factory_new, minimal_wear, field_tested, well_worn, battle_scarred
  statTrak: boolean("stat_trak").notNull().default(false),
  kills: integer("kills").default(0),
  baseValue: real("base_value").notNull(),
  currentValue: real("current_value").notNull(),
  caseSource: text("case_source").notNull(),
  acquiredAt: timestamp("acquired_at").default(sql`now()`),
});

export const caseCooldowns = pgTable("case_cooldowns", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  caseId: text("case_id").notNull(),
  cooldownUntil: timestamp("cooldown_until").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertGameStateSchema = createInsertSchema(gameStates).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertInventoryItemSchema = createInsertSchema(inventoryItems).omit({
  id: true,
  acquiredAt: true,
});

export const insertCaseCooldownSchema = createInsertSchema(caseCooldowns).omit({
  id: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertGameState = z.infer<typeof insertGameStateSchema>;
export type GameState = typeof gameStates.$inferSelect;
export type InsertInventoryItem = z.infer<typeof insertInventoryItemSchema>;
export type InventoryItem = typeof inventoryItems.$inferSelect;
export type InsertCaseCooldown = z.infer<typeof insertCaseCooldownSchema>;
export type CaseCooldown = typeof caseCooldowns.$inferSelect;

// Game types for frontend
export interface Case {
  id: string;
  name: string;
  description: string;
  price: number;
  tier: 'free' | 'budget' | 'standard' | 'premium' | 'elite';
  cooldown?: number; // in minutes
  items: CaseItem[];
  image: string;
  guaranteedSpecial?: boolean;
}

export interface CaseItem {
  id: string;
  name: string;
  type: 'weapon' | 'glove' | 'sticker' | 'knife';
  rarity: 'consumer' | 'industrial' | 'restricted' | 'classified' | 'covert' | 'knife';
  baseValue: number;
  image: string;
  statTrakChance?: number;
  conditions: WearCondition[];
}

export interface WearCondition {
  name: 'factory_new' | 'minimal_wear' | 'field_tested' | 'well_worn' | 'battle_scarred';
  displayName: string;
  multiplier: number;
  probability: number;
}

export interface OpenedItem extends CaseItem {
  condition: WearCondition;
  statTrak: boolean;
  kills: number;
  finalValue: number;
  acquiredAt: Date;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  requirement: number;
  reward: number; // XP or money
  unlocked: boolean;
  progress: number;
}

export interface DailyChallenge {
  id: string;
  name: string;
  description: string;
  requirement: number;
  progress: number;
  reward: number;
  completed: boolean;
  expiresAt: Date;
}
