
import React from 'react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateProduct } from '@/api/products';
import { toast } from 'sonner';
import { Tables } from '@/integrations/supabase/types';
import { Pin } from 'lucide-react';

interface ProductPinToggleProps {
  product: Tables<'products'> & { is_pinned?: boolean };
}

const ProductPinToggle: React.FC<ProductPinToggleProps> = ({ product }) => {
  const queryClient = useQueryClient();

  const toggleMutation = useMutation({
    mutationFn: (isPinned: boolean) => 
      updateProduct(product.id, { is_pinned: isPinned } as any),
    onSuccess: (_, isPinned) => {
      toast.success(`Produto ${isPinned ? 'fixado' : 'desfixado'} com sucesso!`);
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
    onError: () => {
      toast.error('Erro ao alterar fixação do produto');
    },
  });

  const handleToggle = (checked: boolean) => {
    toggleMutation.mutate(checked);
  };

  const isPinned = (product as any).is_pinned || false;

  return (
    <div className="flex items-center space-x-2">
      <Switch
        id={`pin-${product.id}`}
        checked={isPinned}
        onCheckedChange={handleToggle}
        disabled={toggleMutation.isPending}
      />
      <Label 
        htmlFor={`pin-${product.id}`}
        className={`text-sm flex items-center gap-1 ${isPinned ? 'text-yellow-400' : 'text-white/50'}`}
      >
        <Pin className="h-3 w-3" />
        {isPinned ? 'Fixado' : 'Normal'}
      </Label>
    </div>
  );
};

export default ProductPinToggle;
