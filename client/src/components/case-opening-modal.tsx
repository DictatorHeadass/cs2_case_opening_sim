import { useState, useEffect } from "react";
import { OpenedItem } from "@shared/schema";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface CaseOpeningModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenAnother: () => void;
  caseName: string;
  openedItem: OpenedItem | null;
}

export default function CaseOpeningModal({
  isOpen,
  onClose,
  onOpenAnother,
  caseName,
  openedItem,
}: CaseOpeningModalProps) {
  const [isRevealing, setIsRevealing] = useState(false);
  const [showItem, setShowItem] = useState(false);

  useEffect(() => {
    if (isOpen && openedItem) {
      setIsRevealing(true);
      setShowItem(false);
      
      // Start case opening animation
      const timer = setTimeout(() => {
        setIsRevealing(false);
        setShowItem(true);
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [isOpen, openedItem]);

  const handleClose = () => {
    setIsRevealing(false);
    setShowItem(false);
    onClose();
  };

  const handleOpenAnother = () => {
    setIsRevealing(false);
    setShowItem(false);
    onOpenAnother();
  };

  if (!openedItem) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl w-full mx-4 p-8" data-testid="case-opening-modal">
        <div className="text-center">
          <div className="mb-8">
            <h2 className="text-3xl font-bold mb-2" data-testid="opening-case-title">
              Opening {caseName}
            </h2>
            <p className="text-muted-foreground">
              {isRevealing ? "Preparing to reveal your item..." : "Item revealed!"}
            </p>
          </div>

          {/* Case Animation Container */}
          {isRevealing && (
            <div className="relative mb-8">
              <div className="w-48 h-48 mx-auto bg-gradient-to-br from-primary to-orange-600 rounded-xl flex items-center justify-center case-opening">
                <div className="text-6xl text-white">📦</div>
              </div>
              <div className="absolute inset-0 bg-white/20 rounded-xl animate-pulse" />
            </div>
          )}

          {/* Item Reveal */}
          {showItem && (
            <div className="mb-8" data-testid="item-reveal">
              <div 
                className={`w-64 h-64 mx-auto bg-card border-4 rounded-xl p-4 case-reveal ${
                  openedItem.rarity === 'knife' || openedItem.rarity === 'covert' ? 'rare-glow' : ''
                }`}
                style={{ borderColor: `var(--${openedItem.rarity})` }}
              >
                <img 
                  src={openedItem.image} 
                  alt={openedItem.name} 
                  className="w-full h-40 object-cover rounded-lg mb-4"
                  data-testid="revealed-item-image"
                />
                <h3 
                  className={`text-xl font-bold mb-2 rarity-${openedItem.rarity}`}
                  data-testid="revealed-item-name"
                >
                  {openedItem.name}
                </h3>
                <p className="text-muted-foreground mb-2" data-testid="revealed-item-condition">
                  {openedItem.condition.displayName}
                </p>
                <p 
                  className={`text-2xl font-bold rarity-${openedItem.rarity}`}
                  data-testid="revealed-item-value"
                >
                  ${openedItem.finalValue.toFixed(2)}
                </p>
                <div className="flex items-center justify-center mt-2 gap-2">
                  {openedItem.statTrak && (
                    <Badge variant="destructive" data-testid="stattrak-badge">
                      StatTrak™
                    </Badge>
                  )}
                  {openedItem.rarity === 'knife' && (
                    <Badge 
                      className="bg-knife text-black hover:bg-knife/80"
                      data-testid="knife-badge"
                    >
                      ★ RARE SPECIAL ITEM
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          )}

          {showItem && (
            <div className="flex justify-center space-x-4">
              <Button
                variant="secondary"
                onClick={handleClose}
                data-testid="close-modal-button"
              >
                Close
              </Button>
              <Button
                onClick={handleOpenAnother}
                data-testid="open-another-button"
              >
                Open Another
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
