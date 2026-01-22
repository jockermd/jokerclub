
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Tables } from '@/integrations/supabase/types';
import { ShoppingCart } from 'lucide-react';
import PaymentQRModal from './PaymentQRModal';

interface ProductInfoProps {
  product: Tables<'products'>;
}

const ProductInfo: React.FC<ProductInfoProps> = ({ product }) => {
  const [isQRModalOpen, setIsQRModalOpen] = useState(false);
  
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price / 100);
  };

  const isAvailable = product.is_available;

  return (
    <>
      <div className="glass-card rounded-xl p-6 h-fit">
        <h1 className="text-3xl font-orbitron font-bold text-white mb-4 break-words">
          {product.name}
        </h1>
        
        {product.description && (
          <p className="text-white/80 text-lg mb-6 leading-relaxed break-words overflow-wrap-anywhere">
            {product.description}
          </p>
        )}
        
        <div className="mb-6">
          <span className="text-2xl font-bold text-mart-primary">
            {formatPrice(product.price)}
          </span>
        </div>
        
        <div className="mb-4 text-sm text-white/60">
          <p>• Pagamento via PIX</p>
          <p>• Entrega digital imediata</p>
          <p>• Suporte 24/7</p>
        </div>
        
        <Button
          onClick={() => isAvailable && setIsQRModalOpen(true)}
          className={`w-full text-lg py-3 ${
            isAvailable 
              ? 'mars-button' 
              : 'bg-gray-600 text-gray-400 cursor-not-allowed hover:bg-gray-600'
          }`}
          size="lg"
          disabled={!isAvailable}
        >
          <ShoppingCart className="mr-2 h-5 w-5" />
          {isAvailable ? 'Comprar Agora' : 'Indisponível'}
        </Button>
      </div>
      
      {isAvailable && (
        <PaymentQRModal 
          isOpen={isQRModalOpen} 
          onClose={() => setIsQRModalOpen(false)}
          productPrice={product.price}
          productName={product.name}
        />
      )}
    </>
  );
};

export default ProductInfo;
