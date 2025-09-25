import { InventoryItem } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface ItemCardProps {
  item: InventoryItem;
  onSell: (itemId: string) => void;
  isSelected?: boolean;
  onToggleSelect?: (itemId: string) => void;
}

export default function ItemCard({ item, onSell, isSelected, onToggleSelect }: ItemCardProps) {
  return (
    <div 
      className={`bg-card border-2 rounded-lg p-4 transition-all duration-200 ${
        isSelected 
          ? `border-primary bg-primary/10` 
          : `border-border hover:border-primary/50`
      } ${onToggleSelect ? 'cursor-pointer' : ''}`}
      onClick={() => onToggleSelect?.(item.id)}
      data-testid={`item-card-${item.id}`}
    >
      <div className="space-y-3">
        <div className={`text-sm font-medium rarity-${item.rarity}`} data-testid={`item-name-${item.id}`}>
          {item.itemName}
        </div>
        
        <div className="flex items-center gap-2 flex-wrap">
          <Badge 
            variant="outline" 
            className={`rarity-${item.rarity} text-xs`}
            data-testid={`item-rarity-${item.id}`}
          >
            {item.rarity.toUpperCase()}
          </Badge>
          
          <Badge variant="secondary" className="text-xs" data-testid={`item-condition-${item.id}`}>
            {item.condition.replace('_', ' ').toUpperCase()}
          </Badge>
          
          {item.statTrak && (
            <Badge variant="destructive" className="text-xs" data-testid={`item-stattrak-${item.id}`}>
              StatTrak™
            </Badge>
          )}
        </div>
        
        <div className="flex items-center justify-between">
          <div className="text-sm">
            <div className={`font-bold rarity-${item.rarity}`} data-testid={`item-value-${item.id}`}>
              ${item.currentValue.toFixed(2)}
            </div>
            <div className="text-xs text-muted-foreground" data-testid={`item-source-${item.id}`}>
              {item.caseSource}
            </div>
          </div>
          
          {!onToggleSelect && (
            <Button 
              size="sm" 
              variant="destructive"
              onClick={(e) => {
                e.stopPropagation();
                onSell(item.id);
              }}
              data-testid={`sell-item-${item.id}`}
            >
              Sell
            </Button>
          )}
        </div>
        
        {item.statTrak && item.kills !== undefined && (
          <div className="text-xs text-muted-foreground" data-testid={`item-kills-${item.id}`}>
            Kills: {item.kills}
          </div>
        )}
      </div>
    </div>
  );
}
