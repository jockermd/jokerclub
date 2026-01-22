
import React from 'react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateProduct } from '@/api/products';
import { toast } from 'sonner';
import { Tables } from '@/integrations/supabase/types';

interface ProductAvailabilityToggleProps {
  product: Tables<'products'>;
}

const ProductAvailabilityToggle: React.FC<ProductAvailabilityToggleProps> = ({ product }) => {
  const queryClient = useQueryClient();

  const toggleMutation = useMutation({
    mutationFn: (isAvailable: boolean) => 
      updateProduct(product.id, { is_available: isAvailable }),
    onSuccess: (_, isAvailable) => {
      toast.success(`Produto ${isAvailable ? 'disponibilizado' : 'indisponibilizado'} com sucesso!`);
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
    onError: () => {
      toast.error('Erro ao alterar disponibilidade do produto');
    },
  });

  const handleToggle = (checked: boolean) => {
    toggleMutation.mutate(checked);
  };

  return (
    <div className="flex items-center space-x-2">
      <Switch
        id={`availability-${product.id}`}
        checked={product.is_available}
        onCheckedChange={handleToggle}
        disabled={toggleMutation.isPending}
      />
      <Label 
        htmlFor={`availability-${product.id}`}
        className={`text-sm ${product.is_available ? 'text-green-400' : 'text-red-400'}`}
      >
        {product.is_available ? 'Disponível' : 'Indisponível'}
      </Label>
    </div>
  );
};

export default ProductAvailabilityToggle;
