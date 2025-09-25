import { Link, useLocation } from "wouter";
import { Coins, User } from "lucide-react";
import { useGameState } from "@/hooks/use-game-state";

export default function Navigation() {
  const [location] = useLocation();
  const { gameState } = useGameState();

  const navigation = [
    { name: "Cases", href: "/", active: location === "/" },
    { name: "Inventory", href: "/inventory", active: location === "/inventory" },
    { name: "Market", href: "/market", active: location === "/market" },
    { name: "Trade-Up", href: "/trade-up", active: location === "/trade-up" },
    { name: "Statistics", href: "/statistics", active: location === "/statistics" },
  ];

  return (
    <nav className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/">
              <h1 className="text-2xl font-bold text-primary cursor-pointer" data-testid="logo">
                CS2 Case Simulator
              </h1>
            </Link>
            <div className="hidden md:flex items-center space-x-6">
              {navigation.map((item) => (
                <Link key={item.name} href={item.href}>
                  <button
                    className={`transition-colors ${
                      item.active
                        ? "text-primary"
                        : "text-muted-foreground hover:text-primary"
                    }`}
                    data-testid={`nav-${item.name.toLowerCase()}`}
                  >
                    {item.name}
                  </button>
                </Link>
              ))}
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 bg-secondary px-4 py-2 rounded-lg">
              <Coins className="w-4 h-4 text-primary" />
              <span className="font-semibold" data-testid="balance">
                ${gameState.balance.toFixed(2)}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-sm" data-testid="level">
                  {gameState.level}
                </span>
              </div>
              <div className="hidden sm:block">
                <div className="text-sm font-medium" data-testid="username">Player</div>
                <div className="w-20 h-1 bg-secondary rounded-full">
                  <div 
                    className="h-1 bg-primary rounded-full transition-all duration-300"
                    style={{ width: `${((gameState.xp % 1000) / 1000) * 100}%` }}
                    data-testid="xp-progress"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
