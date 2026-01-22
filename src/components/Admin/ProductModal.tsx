
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import ProductForm from './ProductForm';
import { Tables } from '@/integrations/supabase/types';

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Tables<'products'> | null;
  onSubmit: (values: any) => void;
  isSubmitting: boolean;
}

const ProductModal: React.FC<ProductModalProps> = ({ isOpen, onClose, product, onSubmit, isSubmitting }) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] glass-card border-mart-dark-1">
        <DialogHeader>
          <DialogTitle className="text-white font-orbitron">{product ? 'Editar Produto' : 'Criar Novo Produto'}</DialogTitle>
          <DialogDescription>
            {product ? 'Edite os detalhes do produto.' : 'Preencha os detalhes para o novo produto.'}
          </DialogDescription>
        </DialogHeader>
        <ProductForm
          product={product}
          onSubmit={onSubmit}
          onCancel={onClose}
          isSubmitting={isSubmitting}
        />
      </DialogContent>
    </Dialog>
  );
};

export default ProductModal;
