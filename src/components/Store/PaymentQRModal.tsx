
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Send, Loader2 } from 'lucide-react';

interface PaymentQRModalProps {
  isOpen: boolean;
  onClose: () => void;
  productPrice?: number;
  productName?: string;
}

const PaymentQRModal: React.FC<PaymentQRModalProps> = ({ 
  isOpen, 
  onClose, 
  productPrice,
  productName 
}) => {
  const [imageLoading, setImageLoading] = useState(true);

  const handleSendReceipt = () => {
    window.open('https://wa.me/message/ZFVHTFMDYHBQJ1', '_blank');
  };

  const handleImageLoad = () => {
    setImageLoading(false);
  };

  const handleImageError = () => {
    setImageLoading(false);
  };

  // Reset loading state when modal opens
  React.useEffect(() => {
    if (isOpen) {
      setImageLoading(true);
    }
  }, [isOpen]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price / 100);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] glass-card border-mart-dark-1">
        <DialogHeader>
          <DialogTitle className="text-white font-orbitron text-center">QR CODE PIX</DialogTitle>
          <DialogDescription className="text-white/70 text-center">
            Use o QR code para fazer o pagamento!
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          <div className="text-white/90 space-y-2">
            <p className="font-semibold">Passos:</p>
            <ol className="list-decimal list-inside space-y-1 text-sm">
              <li>Abra o app de pagamento</li>
              <li>Escaneie a imagem QR code</li>
              <li>Coloque o valor do produto</li>
              <li>Envie o comprovante para o Joker</li>
            </ol>
          </div>
          
          <div className="flex justify-center">
            <div className="bg-white p-2 rounded-lg shadow-lg relative">
              {imageLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-white rounded-lg">
                  <div className="flex flex-col items-center space-y-3">
                    <Loader2 className="h-8 w-8 text-mart-primary animate-spin" />
                    <p className="text-mart-primary font-orbitron text-sm">Carregando QR Code...</p>
                  </div>
                </div>
              )}
              <img 
                src="/lovable-uploads/b7708d78-e9ad-4fa1-bb5a-9214b7304437.png" 
                alt="QR Code PIX para pagamento" 
                className={`w-64 h-64 object-contain transition-opacity duration-300 ${
                  imageLoading ? 'opacity-0' : 'opacity-100'
                }`}
                onLoad={handleImageLoad}
                onError={handleImageError}
              />
            </div>
          </div>

          {/* Valor do produto */}
          {productPrice && (
            <div className="bg-mart-primary/10 border border-mart-primary/30 rounded-lg p-4 mx-2">
              <div className="text-center space-y-2">
                {productName && (
                  <p className="text-white/80 text-sm font-medium">{productName}</p>
                )}
                <div className="text-2xl font-bold text-mart-primary font-orbitron">
                  {formatPrice(productPrice)}
                </div>
                <p className="text-white/60 text-xs">Valor a ser pago via PIX</p>
              </div>
            </div>
          )}
          
          <div className="px-2">
            <Button
              onClick={handleSendReceipt}
              className="mars-button w-full text-lg py-3"
              size="lg"
              disabled={imageLoading}
            >
              <Send className="mr-2 h-5 w-5" />
              Enviar Comprovante
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PaymentQRModal;
