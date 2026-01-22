
import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { createProduct, updateProduct, deleteProduct } from '@/api/products';
import { Tables } from '@/integrations/supabase/types';

export const useProductManagement = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Tables<'products'> | null>(null);
  const [productToDelete, setProductToDelete] = useState<string | null>(null);
  
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: createProduct,
    onSuccess: () => {
      toast.success('Produto criado com sucesso!');
      queryClient.invalidateQueries({ queryKey: ['products'] });
      setIsModalOpen(false);
      setSelectedProduct(null);
    },
    onError: () => {
      toast.error('Erro ao criar produto');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, ...product }: { id: string } & Partial<Tables<'products'>>) =>
      updateProduct(id, product),
    onSuccess: () => {
      toast.success('Produto atualizado com sucesso!');
      queryClient.invalidateQueries({ queryKey: ['products'] });
      setIsModalOpen(false);
      setSelectedProduct(null);
    },
    onError: () => {
      toast.error('Erro ao atualizar produto');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteProduct,
    onSuccess: () => {
      toast.success('Produto excluído com sucesso!');
      queryClient.invalidateQueries({ queryKey: ['products'] });
      setIsDeleteDialogOpen(false);
      setProductToDelete(null);
    },
    onError: () => {
      toast.error('Erro ao excluir produto');
    },
  });

  const handleOpenModal = (product: Tables<'products'> | null = null) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedProduct(null);
  };

  const handleSubmit = (values: any) => {
    if (selectedProduct) {
      updateMutation.mutate({ id: selectedProduct.id, ...values });
    } else {
      createMutation.mutate(values);
    }
  };

  const handleOpenDeleteDialog = (productId: string) => {
    setProductToDelete(productId);
    setIsDeleteDialogOpen(true);
  };

  const handleCloseDeleteDialog = () => {
    setIsDeleteDialogOpen(false);
    setProductToDelete(null);
  };

  const handleConfirmDelete = () => {
    if (productToDelete) {
      deleteMutation.mutate(productToDelete);
    }
  };

  return {
    isModalOpen,
    isDeleteDialogOpen,
    selectedProduct,
    productToDelete,
    isSubmitting: createMutation.isPending || updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
    handleOpenModal,
    handleCloseModal,
    handleSubmit,
    handleOpenDeleteDialog,
    handleCloseDeleteDialog,
    handleConfirmDelete,
  };
};
