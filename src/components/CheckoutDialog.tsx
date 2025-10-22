import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { QrCode, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface CheckoutDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  productName: string;
  quantity: number;
  totalAmount: number;
}

export const CheckoutDialog = ({ 
  open, 
  onOpenChange, 
  productName, 
  quantity,
  totalAmount 
}: CheckoutDialogProps) => {
  const [name, setName] = useState("");
  const [cpf, setCpf] = useState("");
  const [loading, setLoading] = useState(false);
  const [qrCodeData, setQrCodeData] = useState<string | null>(null);

  const formatCPF = (value: string) => {
    const numbers = value.replace(/\D/g, "");
    if (numbers.length <= 11) {
      return numbers
        .replace(/(\d{3})(\d)/, "$1.$2")
        .replace(/(\d{3})(\d)/, "$1.$2")
        .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
    }
    return value;
  };

  const validateCPF = (cpf: string): boolean => {
    const numbers = cpf.replace(/\D/g, "");
    
    if (numbers.length !== 11) return false;
    
    // Verifica se todos os dígitos são iguais
    if (/^(\d)\1{10}$/.test(numbers)) return false;
    
    // Validação do primeiro dígito verificador
    let sum = 0;
    for (let i = 0; i < 9; i++) {
      sum += parseInt(numbers.charAt(i)) * (10 - i);
    }
    let checkDigit = 11 - (sum % 11);
    if (checkDigit >= 10) checkDigit = 0;
    if (checkDigit !== parseInt(numbers.charAt(9))) return false;
    
    // Validação do segundo dígito verificador
    sum = 0;
    for (let i = 0; i < 10; i++) {
      sum += parseInt(numbers.charAt(i)) * (11 - i);
    }
    checkDigit = 11 - (sum % 11);
    if (checkDigit >= 10) checkDigit = 0;
    if (checkDigit !== parseInt(numbers.charAt(10))) return false;
    
    return true;
  };

  const handleCPFChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCpf(formatCPF(e.target.value));
  };

  const handleGenerateQRCode = async () => {
    if (!name || !cpf) {
      toast.error("Preencha todos os campos");
      return;
    }

    if (!validateCPF(cpf)) {
      toast.error("CPF inválido. Por favor, verifique o número digitado.");
      return;
    }

    setLoading(true);
    
    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-pix-qrcode`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name,
            cpf,
            amount: totalAmount,
            productName,
            quantity,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        
        // Mensagens de erro mais amigáveis
        let errorMessage = 'Erro ao gerar QR Code';
        
        if (errorData.details?.includes('Cpf do comprador inválido')) {
          errorMessage = 'CPF inválido. Verifique o número digitado.';
        } else if (errorData.error) {
          errorMessage = errorData.error;
        }
        
        throw new Error(errorMessage);
      }

      const data = await response.json();
      setQrCodeData(data.qrCode);
      
      toast.success("QR Code gerado com sucesso!");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erro ao gerar QR Code. Tente novamente.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setName("");
    setCpf("");
    setQrCodeData(null);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md bg-popover border-border">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center text-popover-foreground">
            Finalizar Pedido
          </DialogTitle>
        </DialogHeader>
        
        {!qrCodeData ? (
          <div className="space-y-6 py-4">
            <div className="bg-muted rounded-lg p-4 space-y-1">
              <p className="text-sm text-muted-foreground">Produto:</p>
              <p className="font-semibold text-popover-foreground">{productName} x{quantity}</p>
              <p className="text-2xl font-bold text-primary mt-2">
                R$ {totalAmount.toFixed(2)}
              </p>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-popover-foreground">Nome Completo</Label>
                <Input
                  id="name"
                  placeholder="Digite seu nome"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="border-border bg-background"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="cpf" className="text-popover-foreground">CPF</Label>
                <Input
                  id="cpf"
                  placeholder="000.000.000-00"
                  value={cpf}
                  onChange={handleCPFChange}
                  maxLength={14}
                  className="border-border bg-background"
                />
              </div>
            </div>

            <Button 
              onClick={handleGenerateQRCode}
              disabled={loading}
              className="w-full py-6 text-lg font-semibold rounded-full bg-primary hover:bg-primary/90"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Gerando QR Code...
                </>
              ) : (
                <>
                  <QrCode className="mr-2 h-5 w-5" />
                  Gerar QR Code
                </>
              )}
            </Button>
          </div>
        ) : (
          <div className="space-y-6 py-4">
            <div className="flex flex-col items-center space-y-4">
              <div className="bg-white p-4 rounded-lg">
                <img 
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(qrCodeData)}`}
                  alt="QR Code PIX"
                  className="w-64 h-64"
                />
              </div>
              
              <div className="text-center space-y-2">
                <p className="font-semibold text-popover-foreground">
                  Escaneie o QR Code para pagar
                </p>
                <p className="text-2xl font-bold text-primary">
                  R$ {totalAmount.toFixed(2)}
                </p>
              </div>

              <Button
                onClick={() => {
                  navigator.clipboard.writeText(qrCodeData);
                  toast.success("Código PIX copiado!");
                }}
                variant="outline"
                className="w-full py-4 text-base font-semibold border-2 hover:bg-primary hover:text-primary-foreground"
              >
                📋 Copiar Código PIX
              </Button>

              <div className="w-full bg-muted rounded-lg p-3">
                <p className="text-xs text-muted-foreground break-all text-center">
                  {qrCodeData}
                </p>
              </div>
            </div>

            <Button 
              onClick={handleClose}
              variant="outline"
              className="w-full py-6 text-lg font-semibold rounded-full"
            >
              Fechar
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
