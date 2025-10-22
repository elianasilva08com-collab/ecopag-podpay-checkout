import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { MinusCircle, PlusCircle } from "lucide-react";

interface QuantityDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  productName: string;
  productPrice: number;
  onConfirm: (quantity: number) => void;
}

export const QuantityDialog = ({ 
  open, 
  onOpenChange, 
  productName, 
  productPrice,
  onConfirm 
}: QuantityDialogProps) => {
  const [quantity, setQuantity] = useState(1);

  const handleDecrease = () => {
    if (quantity > 1) setQuantity(quantity - 1);
  };

  const handleIncrease = () => {
    setQuantity(quantity + 1);
  };

  const handleConfirm = () => {
    onConfirm(quantity);
    setQuantity(1);
  };

  const total = productPrice * quantity;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-popover border-border">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center text-popover-foreground">
            {productName}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          <div className="flex items-center justify-center gap-6">
            <Button
              variant="outline"
              size="icon"
              onClick={handleDecrease}
              disabled={quantity === 1}
              className="h-12 w-12 rounded-full border-2"
            >
              <MinusCircle className="h-6 w-6" />
            </Button>
            
            <div className="text-5xl font-bold text-primary min-w-[80px] text-center">
              {quantity}
            </div>
            
            <Button
              variant="outline"
              size="icon"
              onClick={handleIncrease}
              className="h-12 w-12 rounded-full border-2"
            >
              <PlusCircle className="h-6 w-6" />
            </Button>
          </div>
          
          <div className="bg-muted rounded-lg p-4 space-y-2">
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Preço unitário:</span>
              <span>R$ {productPrice.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-xl font-bold text-popover-foreground">
              <span>Total:</span>
              <span className="text-primary">R$ {total.toFixed(2)}</span>
            </div>
          </div>
          
          <Button 
            onClick={handleConfirm}
            className="w-full py-6 text-lg font-semibold rounded-full bg-primary hover:bg-primary/90"
          >
            Continuar para Pagamento
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
