import { Case } from "@shared/schema";
import { Clock } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CaseCardProps {
  case: Case;
  cooldownUntil?: Date;
  onOpenCase: (caseId: string) => void;
}

export default function CaseCard({ case: gameCase, cooldownUntil, onOpenCase }: CaseCardProps) {
  const isOnCooldown = cooldownUntil && new Date() < cooldownUntil;
  const cooldownMinutes = isOnCooldown 
    ? Math.ceil((cooldownUntil!.getTime() - Date.now()) / (1000 * 60))
    : 0;

  const tierColors = {
    free: "bg-secondary",
    budget: "bg-blue-600",
    standard: "bg-yellow-600",
    premium: "bg-purple-600",
    elite: "bg-red-600",
  };

  const tierColor = tierColors[gameCase.tier];

  // Get rarity indicators
  const rarityDots = gameCase.items
    .map(item => item.rarity)
    .filter((rarity, index, arr) => arr.indexOf(rarity) === index)
    .slice(0, 5);

  return (
    <div 
      className={`bg-card border border-border rounded-lg overflow-hidden hover:border-primary transition-all duration-300 transform hover:scale-105 cursor-pointer group ${
        gameCase.guaranteedSpecial ? 'knife-pulse' : ''
      }`}
      data-testid={`case-${gameCase.id}`}
    >
      <div className="relative">
        <img 
          src={gameCase.image} 
          alt={gameCase.name} 
          className="w-full h-48 object-cover"
          data-testid={`case-image-${gameCase.id}`}
        />
        <div className={`absolute top-2 right-2 ${tierColor} px-2 py-1 rounded text-xs font-medium uppercase`}>
          {gameCase.tier === 'elite' && gameCase.guaranteedSpecial ? 'COLLECTOR' : gameCase.tier}
        </div>
        {isOnCooldown && (
          <div className="absolute top-2 left-2 bg-orange-600 px-2 py-1 rounded text-xs font-medium">
            {cooldownMinutes}m
          </div>
        )}
        {gameCase.guaranteedSpecial && (
          <div className="absolute top-2 left-2 bg-knife text-black px-2 py-1 rounded text-xs font-medium">
            GUARANTEED
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>
      
      <div className="p-4">
        <h3 className="font-bold text-lg mb-2" data-testid={`case-name-${gameCase.id}`}>
          {gameCase.name}
        </h3>
        <p className="text-muted-foreground text-sm mb-3" data-testid={`case-description-${gameCase.id}`}>
          {gameCase.description}
        </p>
        
        <div className="flex items-center justify-between mb-3">
          <span 
            className={`text-2xl font-bold ${
              gameCase.price === 0 ? 'text-primary' : 
              gameCase.guaranteedSpecial ? 'text-knife' : 'text-primary'
            }`}
            data-testid={`case-price-${gameCase.id}`}
          >
            {gameCase.price === 0 ? 'FREE' : `$${gameCase.price}`}
          </span>
          
          <div className="flex items-center space-x-1">
            {rarityDots.map((rarity, index) => (
              <div 
                key={index}
                className={`w-2 h-2 rounded-full rarity-${rarity}`}
                style={{ backgroundColor: `var(--${rarity})` }}
                data-testid={`rarity-dot-${rarity}`}
              />
            ))}
          </div>
        </div>
        
        <Button
          className={`w-full font-medium py-2 rounded-lg transition-colors ${
            isOnCooldown 
              ? 'bg-gray-600 text-gray-300 cursor-not-allowed hover:bg-gray-600' 
              : gameCase.guaranteedSpecial 
                ? 'bg-knife hover:bg-yellow-400 text-black' 
                : 'bg-primary hover:bg-primary/90 text-primary-foreground'
          }`}
          disabled={isOnCooldown}
          onClick={() => onOpenCase(gameCase.id)}
          data-testid={`open-case-${gameCase.id}`}
        >
          {isOnCooldown ? (
            <>
              <Clock className="w-4 h-4 mr-2" />
              Cooldown Active
            </>
          ) : (
            'Open Case'
          )}
        </Button>
      </div>
    </div>
  );
}
