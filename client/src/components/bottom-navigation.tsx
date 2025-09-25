import { Link, useLocation } from "wouter";
import { Package, Backpack, Store, ArrowUpDown, BarChart3 } from "lucide-react";

export default function BottomNavigation() {
  const [location] = useLocation();

  const navigation = [
    { name: "Cases", href: "/", icon: Package },
    { name: "Inventory", href: "/inventory", icon: Backpack },
    { name: "Market", href: "/market", icon: Store },
    { name: "Trade-Up", href: "/trade-up", icon: ArrowUpDown },
    { name: "Stats", href: "/statistics", icon: BarChart3 },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-border md:hidden z-40">
      <div className="grid grid-cols-5 gap-1 p-2">
        {navigation.map((item) => {
          const Icon = item.icon;
          const isActive = location === item.href;
          
          return (
            <Link key={item.name} href={item.href}>
              <button 
                className={`flex flex-col items-center py-2 transition-colors ${
                  isActive ? "text-primary" : "text-muted-foreground"
                }`}
                data-testid={`bottom-nav-${item.name.toLowerCase()}`}
              >
                <Icon className="w-5 h-5 mb-1" />
                <span className="text-xs">{item.name}</span>
              </button>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
