import { useState, useMemo } from "react";
import { TrendingUp, TrendingDown } from "lucide-react";
import Navigation from "@/components/navigation";
import BottomNavigation from "@/components/bottom-navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useGameState } from "@/hooks/use-game-state";
import { GameEngine } from "@/lib/game-engine";

export default function Market() {
  const { inventory, gameState, updateBalance } = useGameState();
  const [marketPrices, setMarketPrices] = useState<Record<string, number>>({});

  // Generate market prices for inventory items
  useMemo(() => {
    if (inventory.length > 0) {
      const prices = GameEngine.generateMarketPrices(inventory.map(item => ({
        ...item,
        id: item.itemId,
        name: item.itemName,
        type: item.itemType as any,
        rarity: item.rarity as any,
        baseValue: item.baseValue,
        image: '',
        conditions: [],
        condition: { name: item.condition as any, displayName: item.condition, multiplier: 1, probability: 1 },
        statTrak: item.statTrak,
        kills: item.kills || 0,
        finalValue: item.currentValue,
        acquiredAt: item.acquiredAt || new Date(),
      })));
      setMarketPrices(prices);
    }
  }, [inventory]);

  const handleBuyItem = (itemId: string, price: number) => {
    if (gameState.balance >= price) {
      updateBalance(-price);
      // In a real implementation, this would add the item to inventory
      console.log(`Buying item ${itemId} for $${price}`);
    }
  };

  const getPriceChange = (currentValue: number, marketPrice: number) => {
    const change = ((marketPrice - currentValue) / currentValue) * 100;
    return change;
  };

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <Navigation />
      
      <main className="container mx-auto px-4 py-8">
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Market Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-secondary/20 rounded-lg p-4">
                <div className="text-sm text-muted-foreground">Market Cap</div>
                <div className="text-2xl font-bold text-primary">
                  ${Object.values(marketPrices).reduce((sum, price) => sum + price, 0).toFixed(2)}
                </div>
              </div>
              
              <div className="bg-secondary/20 rounded-lg p-4">
                <div className="text-sm text-muted-foreground">Active Listings</div>
                <div className="text-2xl font-bold">{inventory.length}</div>
              </div>
              
              <div className="bg-secondary/20 rounded-lg p-4">
                <div className="text-sm text-muted-foreground">Avg. Price Change</div>
                <div className="text-2xl font-bold text-primary">+2.5%</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Current Market Listings</CardTitle>
          </CardHeader>
          <CardContent>
            {inventory.length > 0 ? (
              <div className="space-y-4">
                {inventory.map((item) => {
                  const marketPrice = marketPrices[item.itemId] || item.currentValue;
                  const priceChange = getPriceChange(item.currentValue, marketPrice);
                  const isPositive = priceChange >= 0;
                  
                  return (
                    <div 
                      key={item.id} 
                      className="flex items-center justify-between p-4 bg-secondary/20 rounded-lg"
                      data-testid={`market-item-${item.id}`}
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`font-medium rarity-${item.rarity}`} data-testid={`market-item-name-${item.id}`}>
                            {item.itemName}
                          </span>
                          {item.statTrak && (
                            <Badge variant="destructive" className="text-xs">
                              StatTrak™
                            </Badge>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span>Condition: {item.condition.replace('_', ' ')}</span>
                          <span>Source: {item.caseSource}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <div className={`font-bold rarity-${item.rarity}`} data-testid={`market-price-${item.id}`}>
                            ${marketPrice.toFixed(2)}
                          </div>
                          <div className={`text-sm flex items-center gap-1 ${
                            isPositive ? 'text-green-500' : 'text-red-500'
                          }`}>
                            {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                            {Math.abs(priceChange).toFixed(1)}%
                          </div>
                        </div>
                        
                        <Button
                          size="sm"
                          disabled={gameState.balance < marketPrice}
                          onClick={() => handleBuyItem(item.itemId, marketPrice)}
                          data-testid={`buy-item-${item.id}`}
                        >
                          Buy
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="text-muted-foreground mb-4">
                  No items available in the market right now.
                </div>
                <div className="text-sm text-muted-foreground">
                  Open some cases to populate the market with items!
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </main>

      <BottomNavigation />
    </div>
  );
}
