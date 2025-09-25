import { useState, useMemo } from "react";
import { Search, Trash2 } from "lucide-react";
import Navigation from "@/components/navigation";
import BottomNavigation from "@/components/bottom-navigation";
import ItemCard from "@/components/item-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useGameState } from "@/hooks/use-game-state";

export default function Inventory() {
  const { inventory, sellItem, sellAllItems } = useGameState();
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("value");
  const [rarityFilter, setRarityFilter] = useState("all");

  // Filter and sort inventory
  const filteredInventory = useMemo(() => {
    let filtered = inventory.filter(item => {
      const matchesSearch = item.itemName.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesRarity = rarityFilter === "all" || item.rarity === rarityFilter;
      return matchesSearch && matchesRarity;
    });

    // Sort inventory
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "name":
          return a.itemName.localeCompare(b.itemName);
        case "value":
          return b.currentValue - a.currentValue;
        case "rarity":
          const rarityOrder = { consumer: 0, industrial: 1, restricted: 2, classified: 3, covert: 4, knife: 5 };
          return rarityOrder[b.rarity as keyof typeof rarityOrder] - rarityOrder[a.rarity as keyof typeof rarityOrder];
        case "date":
          return new Date(b.acquiredAt || 0).getTime() - new Date(a.acquiredAt || 0).getTime();
        default:
          return 0;
      }
    });

    return filtered;
  }, [inventory, searchTerm, sortBy, rarityFilter]);

  const totalValue = inventory.reduce((sum, item) => sum + item.currentValue, 0);

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <Navigation />
      
      <main className="container mx-auto px-4 py-8">
        {/* Inventory Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm">Total Items</p>
                  <p className="text-2xl font-bold" data-testid="inventory-count">
                    {inventory.length}
                  </p>
                </div>
                <div className="text-primary text-xl">🎒</div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm">Total Value</p>
                  <p className="text-2xl font-bold text-primary" data-testid="inventory-value">
                    ${totalValue.toFixed(2)}
                  </p>
                </div>
                <div className="text-primary text-xl">💰</div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm">StatTrak™ Items</p>
                  <p className="text-2xl font-bold text-orange-500" data-testid="stattrak-count">
                    {inventory.filter(item => item.statTrak).length}
                  </p>
                </div>
                <div className="text-orange-500 text-xl">📊</div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Inventory Controls */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
              <CardTitle>Your Inventory</CardTitle>
              
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <Input
                    type="text"
                    placeholder="Search items..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pr-10"
                    data-testid="search-inventory"
                  />
                  <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                </div>
                
                <Select value={rarityFilter} onValueChange={setRarityFilter}>
                  <SelectTrigger className="w-[150px]" data-testid="rarity-filter">
                    <SelectValue placeholder="All Rarities" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Rarities</SelectItem>
                    <SelectItem value="consumer">Consumer</SelectItem>
                    <SelectItem value="industrial">Industrial</SelectItem>
                    <SelectItem value="restricted">Restricted</SelectItem>
                    <SelectItem value="classified">Classified</SelectItem>
                    <SelectItem value="covert">Covert</SelectItem>
                    <SelectItem value="knife">Knife</SelectItem>
                  </SelectContent>
                </Select>
                
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-[150px]" data-testid="sort-inventory">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="value">Sort by Value</SelectItem>
                    <SelectItem value="name">Sort by Name</SelectItem>
                    <SelectItem value="rarity">Sort by Rarity</SelectItem>
                    <SelectItem value="date">Sort by Date</SelectItem>
                  </SelectContent>
                </Select>
                
                {inventory.length > 0 && (
                  <Button
                    variant="destructive"
                    onClick={sellAllItems}
                    data-testid="sell-all-button"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Sell All
                  </Button>
                )}
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Inventory Grid */}
        {filteredInventory.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
            {filteredInventory.map((item) => (
              <ItemCard
                key={item.id}
                item={item}
                onSell={sellItem}
              />
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-12">
                <div className="text-muted-foreground mb-4">
                  {inventory.length === 0 
                    ? "Your inventory is empty. Start opening cases to collect items!"
                    : "No items found matching your criteria"
                  }
                </div>
                {inventory.length > 0 && (
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setSearchTerm("");
                      setRarityFilter("all");
                    }}
                    data-testid="clear-inventory-filters"
                  >
                    Clear Filters
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </main>

      <BottomNavigation />
    </div>
  );
}
