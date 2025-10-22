import { useState } from "react";
import { ProductCard } from "@/components/ProductCard";
import { QuantityDialog } from "@/components/QuantityDialog";
import { CheckoutDialog } from "@/components/CheckoutDialog";
import { AdminAccessButton } from "@/components/AdminAccessButton";
import cacamba4m3 from "@/assets/cacamba-4m3.jpg";
import cacamba3m3 from "@/assets/cacamba-3m3.jpg";
import cacamba5m3 from "@/assets/cacamba-5m3.jpg";
import cacamba7m3 from "@/assets/cacamba-7m3.jpg";

interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
}

const products: Product[] = [
  { id: "1", name: "Caçamba de 4m³", price: 290, image: cacamba4m3 },
  { id: "2", name: "Caçamba de 3m³", price: 260, image: cacamba3m3 },
  { id: "3", name: "Caçamba de 5m³", price: 340, image: cacamba5m3 },
  { id: "4", name: "Caçamba de 7m³", price: 380, image: cacamba7m3 },
];

const Index = () => {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [quantityDialogOpen, setQuantityDialogOpen] = useState(false);
  const [checkoutDialogOpen, setCheckoutDialogOpen] = useState(false);
  const [orderQuantity, setOrderQuantity] = useState(1);

  const handleFinishOrder = (product: Product) => {
    setSelectedProduct(product);
    setQuantityDialogOpen(true);
  };

  const handleQuantityConfirm = (quantity: number) => {
    setOrderQuantity(quantity);
    setQuantityDialogOpen(false);
    setCheckoutDialogOpen(true);
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground py-12 px-4 shadow-lg">
        <div className="container mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold text-center tracking-tight">
            CAÇAMBAS DE ENTULHOS
          </h1>
          <p className="text-center mt-4 text-lg text-primary-foreground/90">
            Aluguel de caçambas com qualidade e rapidez
          </p>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              {...product}
              onFinishOrder={() => handleFinishOrder(product)}
            />
          ))}
        </div>
      </main>

      {selectedProduct && (
        <>
          <QuantityDialog
            open={quantityDialogOpen}
            onOpenChange={setQuantityDialogOpen}
            productName={selectedProduct.name}
            productPrice={selectedProduct.price}
            onConfirm={handleQuantityConfirm}
          />

          <CheckoutDialog
            open={checkoutDialogOpen}
            onOpenChange={setCheckoutDialogOpen}
            productName={selectedProduct.name}
            quantity={orderQuantity}
            totalAmount={selectedProduct.price * orderQuantity}
          />
        </>
      )}

      <AdminAccessButton />
    </div>
  );
};

export default Index;
