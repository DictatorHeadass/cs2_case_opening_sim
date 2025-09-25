import { useState, useMemo } from "react";
import { Search, Filter } from "lucide-react";
import Navigation from "@/components/navigation";
import BottomNavigation from "@/components/bottom-navigation";
import CaseCard from "@/components/case-card";
import CaseOpeningModal from "@/components/case-opening-modal";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useGameState } from "@/hooks/use-game-state";
import { CASES } from "@/lib/constants";
import { OpenedItem } from "@shared/schema";

export default function Home() {
  const { gameState, caseCooldowns, openCase } = useGameState();
  const [searchTerm, setSearchTerm] = useState("");
  const [tierFilter, setTierFilter] = useState("all");
  const [sortBy, setSortBy] = useState("price");
  const [isOpeningCase, setIsOpeningCase] = useState(false);
  const [lastOpenedItem, setLastOpenedItem] = useState<OpenedItem | null>(null);
  const [lastOpenedCaseName, setLastOpenedCaseName] = useState("");

  // Filter and sort cases
  const filteredCases = useMemo(() => {
    let filtered = CASES.filter(caseItem => {
      const matchesSearch = caseItem.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesTier = tierFilter === "all" || caseItem.tier === tierFilter;
      return matchesSearch && matchesTier;
    });

    // Sort cases
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "name":
          return a.name.localeCompare(b.name);
        case "price":
          return a.price - b.price;
        case "tier":
          const tierOrder = { free: 0, budget: 1, standard: 2, premium: 3, elite: 4 };
          return tierOrder[a.tier] - tierOrder[b.tier];
        default:
          return 0;
      }
    });

    return filtered;
  }, [searchTerm, tierFilter, sortBy]);

  const handleOpenCase = async (caseId: string) => {
    const gameCase = CASES.find(c => c.id === caseId);
    if (!gameCase) return;

    setLastOpenedCaseName(gameCase.name);
    setIsOpeningCase(true);
    
    try {
      const result = await openCase(caseId);
      if (result) {
        setLastOpenedItem(result);
      } else {
        setIsOpeningCase(false);
      }
    } catch (error) {
      console.error('Error opening case:', error);
      setIsOpeningCase(false);
    }
  };

  const handleCloseModal = () => {
    setIsOpeningCase(false);
    setLastOpenedItem(null);
    setLastOpenedCaseName("");
  };

  const handleOpenAnother = () => {
    setIsOpeningCase(false);
    setLastOpenedItem(null);
    // Keep the same case name for potential reopening
  };

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <Navigation />
      
      <main className="container mx-auto px-4 py-8">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm">Cases Opened</p>
                  <p className="text-2xl font-bold" data-testid="stat-cases-opened">
                    {gameState.casesOpened}
                  </p>
                </div>
                <div className="text-primary text-xl">📦</div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm">Total Profit</p>
                  <p 
                    className={`text-2xl font-bold ${
                      gameState.totalEarned - gameState.totalSpent >= 0 ? 'text-primary' : 'text-destructive'
                    }`}
                    data-testid="stat-profit"
                  >
                    ${(gameState.totalEarned - gameState.totalSpent).toFixed(2)}
                  </p>
                </div>
                <div className="text-primary text-xl">📈</div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm">Best Drop</p>
                  <p className="text-lg font-bold text-knife" data-testid="stat-best-drop">
                    {gameState.bestDrop || "None yet"}
                  </p>
                </div>
                <div className="text-knife text-xl">👑</div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm">Current Level</p>
                  <p className="text-2xl font-bold" data-testid="stat-level">
                    {gameState.level}
                  </p>
                </div>
                <div className="text-primary text-xl">⭐</div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Case Filter Bar */}
        <Card className="mb-8">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
              <div className="flex items-center space-x-4">
                <h2 className="text-xl font-bold">Case Collection</h2>
                <div className="flex items-center space-x-2">
                  <Button
                    size="sm"
                    variant={tierFilter === "all" ? "default" : "secondary"}
                    onClick={() => setTierFilter("all")}
                    data-testid="filter-all"
                  >
                    All
                  </Button>
                  <Button
                    size="sm"
                    variant={tierFilter === "free" ? "default" : "secondary"}
                    onClick={() => setTierFilter("free")}
                    data-testid="filter-free"
                  >
                    Free
                  </Button>
                  <Button
                    size="sm"
                    variant={tierFilter === "premium" ? "default" : "secondary"}
                    onClick={() => setTierFilter("premium")}
                    data-testid="filter-premium"
                  >
                    Premium
                  </Button>
                  <Button
                    size="sm"
                    variant={tierFilter === "elite" ? "default" : "secondary"}
                    onClick={() => setTierFilter("elite")}
                    data-testid="filter-elite"
                  >
                    Elite
                  </Button>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <Input
                    type="text"
                    placeholder="Search cases..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pr-10"
                    data-testid="search-cases"
                  />
                  <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                </div>
                
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-[180px]" data-testid="sort-select">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="price">Sort by Price</SelectItem>
                    <SelectItem value="name">Sort by Name</SelectItem>
                    <SelectItem value="tier">Sort by Tier</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Cases Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
          {filteredCases.map((gameCase) => (
            <CaseCard
              key={gameCase.id}
              case={gameCase}
              cooldownUntil={caseCooldowns[gameCase.id]}
              onOpenCase={handleOpenCase}
            />
          ))}
        </div>
        
        {filteredCases.length === 0 && (
          <div className="text-center py-12">
            <div className="text-muted-foreground mb-4">No cases found matching your criteria</div>
            <Button 
              variant="outline" 
              onClick={() => {
                setSearchTerm("");
                setTierFilter("all");
              }}
              data-testid="clear-filters"
            >
              Clear Filters
            </Button>
          </div>
        )}
      </main>

      <BottomNavigation />
      
      <CaseOpeningModal
        isOpen={isOpeningCase}
        onClose={handleCloseModal}
        onOpenAnother={handleOpenAnother}
        caseName={lastOpenedCaseName}
        openedItem={lastOpenedItem}
      />
    </div>
  );
}
