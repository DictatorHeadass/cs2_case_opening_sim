import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertGameStateSchema, 
  insertInventoryItemSchema, 
  insertCaseCooldownSchema,
  insertUserSchema
} from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Game state routes
  app.get("/api/gamestate/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      const gameState = await storage.getGameState(userId);
      
      if (!gameState) {
        return res.status(404).json({ message: "Game state not found" });
      }
      
      res.json(gameState);
    } catch (error) {
      res.status(500).json({ message: "Failed to get game state" });
    }
  });

  app.post("/api/gamestate", async (req, res) => {
    try {
      const validatedData = insertGameStateSchema.parse(req.body);
      const gameState = await storage.createGameState(validatedData);
      res.status(201).json(gameState);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create game state" });
    }
  });

  app.patch("/api/gamestate/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      const updates = req.body;
      
      const gameState = await storage.updateGameState(userId, updates);
      
      if (!gameState) {
        return res.status(404).json({ message: "Game state not found" });
      }
      
      res.json(gameState);
    } catch (error) {
      res.status(500).json({ message: "Failed to update game state" });
    }
  });

  // Inventory routes
  app.get("/api/inventory/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      const items = await storage.getInventoryItems(userId);
      res.json(items);
    } catch (error) {
      res.status(500).json({ message: "Failed to get inventory" });
    }
  });

  app.post("/api/inventory", async (req, res) => {
    try {
      const validatedData = insertInventoryItemSchema.parse(req.body);
      const item = await storage.addInventoryItem(validatedData);
      res.status(201).json(item);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to add inventory item" });
    }
  });

  app.delete("/api/inventory/:userId/:itemId", async (req, res) => {
    try {
      const { userId, itemId } = req.params;
      const success = await storage.removeInventoryItem(itemId, userId);
      
      if (!success) {
        return res.status(404).json({ message: "Item not found" });
      }
      
      res.json({ message: "Item removed successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to remove inventory item" });
    }
  });

  app.delete("/api/inventory/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      await storage.clearInventory(userId);
      res.json({ message: "Inventory cleared successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to clear inventory" });
    }
  });

  // Case cooldown routes
  app.get("/api/cooldowns/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      const cooldowns = await storage.getCaseCooldowns(userId);
      res.json(cooldowns);
    } catch (error) {
      res.status(500).json({ message: "Failed to get cooldowns" });
    }
  });

  app.post("/api/cooldowns", async (req, res) => {
    try {
      const validatedData = insertCaseCooldownSchema.parse(req.body);
      const cooldown = await storage.setCaseCooldown(validatedData);
      res.status(201).json(cooldown);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to set cooldown" });
    }
  });

  app.delete("/api/cooldowns/:userId/:caseId", async (req, res) => {
    try {
      const { userId, caseId } = req.params;
      const success = await storage.removeCaseCooldown(userId, caseId);
      
      if (!success) {
        return res.status(404).json({ message: "Cooldown not found" });
      }
      
      res.json({ message: "Cooldown removed successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to remove cooldown" });
    }
  });

  // User routes
  app.post("/api/users", async (req, res) => {
    try {
      const validatedData = insertUserSchema.parse(req.body);
      const user = await storage.createUser(validatedData);
      res.status(201).json(user);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create user" });
    }
  });

  app.get("/api/users/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      res.json(user);
    } catch (error) {
      res.status(500).json({ message: "Failed to get user" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
