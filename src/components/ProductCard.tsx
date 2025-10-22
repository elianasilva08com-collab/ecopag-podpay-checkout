import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface ProductCardProps {
  id: string;
  name: string;
  price: number;
  image: string;
  onFinishOrder: () => void;
}

export const ProductCard = ({ name, price, image, onFinishOrder }: ProductCardProps) => {
  return (
    <Card className="group overflow-hidden border-none bg-card shadow-[var(--shadow-card)] transition-all duration-300 hover:shadow-[var(--shadow-hover)] hover:-translate-y-1 animate-fade-in">
      <div className="p-6 flex flex-col items-center space-y-4">
        <div className="relative w-48 h-48 rounded-full overflow-hidden border-4 border-primary/10 group-hover:border-primary/30 transition-all duration-300">
          <img 
            src={image} 
            alt={name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          />
        </div>
        
        <div className="text-center space-y-2">
          <h3 className="text-xl font-bold text-card-foreground uppercase tracking-wide">
            {name}
          </h3>
          <p className="text-3xl font-bold text-primary">
            R$ {price.toFixed(2)}
          </p>
        </div>
        
        <Button 
          onClick={onFinishOrder}
          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-6 rounded-full transition-all duration-300 hover:scale-105"
        >
          Finalizar Pedido
        </Button>
      </div>
    </Card>
  );
};
