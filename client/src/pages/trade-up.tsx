import { useState } from "react";
import { ArrowUp, X } from "lucide-react";
import Navigation from "@/components/navigation";
import BottomNavigation from "@/components/bottom-navigation";
import ItemCard from "@/components/item-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useGameState } from "@/hooks/use-game-state";

export default function TradeUp() {
  const { inventory, tradeUpContract } = useGameState();
  const [selectedItems, setSelectedItems] = useState<string[]>([]);

  const handleToggleSelect = (itemId: string) => {
    setSelectedItems(prev => {
      if (prev.includes(itemId)) {
        return prev.filter(id => id !== itemId);
      } else if (prev.length < 10) {
        return [...prev, itemId];
      }
      return prev;
    });
  };

  const handleClearSelection = () => {
    setSelectedItems([]);
  };

  const handleTradeUp = async () => {
    if (selectedItems.length === 10) {
      await tradeUpContract(selectedItems);
      setSelectedItems([]);
    }
  };

  // Filter items that can be traded up (consumer to covert only)
  const tradeableItems = inventory.filter(item => 
    ['consumer', 'industrial', 'restricted', 'classified', 'covert'].includes(item.rarity)
  );

  // Check if selected items are valid for trade-up
  const selectedItemsData = tradeableItems.filter(item => selectedItems.includes(item.id));
  const canTradeUp = selectedItems.length === 10 && 
    selectedItemsData.every(item => item.rarity === selectedItemsData[0]?.rarity);

  const totalValue = selectedItemsData.reduce((sum, item) => sum + item.currentValue, 0);

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <Navigation />
      
      <main className="container mx-auto px-4 py-8">
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Trade-Up Contract</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-muted-foreground">
                Select 10 items of the same rarity to trade up for 1 item of the next higher rarity.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-secondary/20 rounded-lg p-4">
                  <div className="text-sm text-muted-foreground">Selected Items</div>
                  <div className="text-2xl font-bold" data-testid="selected-count">
                    {selectedItems.length}/10
                  </div>
                </div>
                
                <div className="bg-secondary/20 rounded-lg p-4">
                  <div className="text-sm text-muted-foreground">Total Value</div>
                  <div className="text-2xl font-bold text-primary" data-testid="selected-value">
                    ${totalValue.toFixed(2)}
                  </div>
                </div>
                
                <div className="bg-secondary/20 rounded-lg p-4">
                  <div className="text-sm text-muted-foreground">Expected Range</div>
                  <div className="text-2xl font-bold text-green-500" data-testid="expected-value">
                    ${(totalValue * 1.2).toFixed(2)} - ${(totalValue * 1.8).toFixed(2)}
                  </div>
                </div>
              </div>
              
              {selectedItems.length > 0 && (
                <div className="flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">
                    {selectedItemsData[0] && `Selected rarity: ${selectedItemsData[0].rarity.toUpperCase()}`}
                  </div>
                  
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleClearSelection}
                      data-testid="clear-selection"
                    >
                      <X className="w-4 h-4 mr-2" />
                      Clear
                    </Button>
                    
                    <Button
                      disabled={!canTradeUp}
                      onClick={handleTradeUp}
                      data-testid="trade-up-button"
                    >
                      <ArrowUp className="w-4 h-4 mr-2" />
                      Trade Up
                    </Button>
                  </div>
                </div>
              )}
              
              {selectedItems.length > 0 && !canTradeUp && selectedItems.length === 10 && (
                <Alert>
                  <AlertDescription>
                    All selected items must be of the same rarity to perform a trade-up.
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Available Items</CardTitle>
          </CardHeader>
          <CardContent>
            {tradeableItems.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
                {tradeableItems.map((item) => (
                  <ItemCard
                    key={item.id}
                    item={item}
                    onSell={() => {}} // No sell function in trade-up
                    isSelected={selectedItems.includes(item.id)}
                    onToggleSelect={handleToggleSelect}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="text-muted-foreground mb-4">
                  No items available for trade-up.
                </div>
                <div className="text-sm text-muted-foreground">
                  You need items of consumer, industrial, restricted, classified, or covert rarity to trade up.
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
