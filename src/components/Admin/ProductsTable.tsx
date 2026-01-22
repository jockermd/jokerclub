import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Tables } from '@/integrations/supabase/types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Loader2, Edit, Plus, Trash2 } from 'lucide-react';
import ProductModal from './ProductModal';
import DeleteProductDialog from './DeleteProductDialog';
import ProductAvailabilityToggle from './ProductAvailabilityToggle';
import ProductPinToggle from './ProductPinToggle';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import { useProductManagement } from '@/hooks/useProductManagement';

const ProductsTable = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
  const { data: products, isLoading } = useQuery<Tables<'products'>[]>({
    queryKey: ['products'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('is_pinned', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const {
    isModalOpen,
    isDeleteDialogOpen,
    selectedProduct,
    isSubmitting,
    isDeleting,
    handleOpenModal,
    handleCloseModal,
    handleSubmit,
    handleOpenDeleteDialog,
    handleCloseDeleteDialog,
    handleConfirmDelete,
  } = useProductManagement();

  // Pagination logic
  const totalItems = products?.length || 0;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentProducts = products?.slice(startIndex, endIndex) || [];

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  if (isLoading) return <div className="flex justify-center items-center p-8"><Loader2 className="animate-spin text-mart-primary" /></div>;

  return (
    <div className="space-y-4">
      <div className="flex justify-end mb-4">
        <Button onClick={() => handleOpenModal()}>
          <Plus className="mr-2 h-4 w-4" />
          Adicionar Produto
        </Button>
      </div>
      
      <div className="rounded-lg border border-white/10 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-white/10 hover:bg-mart-dark-2/50">
              <TableHead className="text-white">Produto</TableHead>
              <TableHead className="text-white">Preço</TableHead>
              <TableHead className="text-white">Descrição</TableHead>
              <TableHead className="text-white">Status</TableHead>
              <TableHead className="text-white">Fixado</TableHead>
              <TableHead className="text-white text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentProducts.map((product) => (
              <TableRow key={product.id} className="border-white/10 hover:bg-mart-dark-2/50">
                <TableCell className="font-medium text-white">
                  <div className="flex items-center gap-3">
                    {product.image_url && (
                      <img 
                        src={product.image_url} 
                        alt={product.name}
                        className="w-12 h-12 rounded-lg object-cover"
                      />
                    )}
                    <div>
                      <p>{product.name}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-white/70">
                  R$ {(product.price / 100).toFixed(2).replace('.', ',')}
                </TableCell>
                <TableCell className="text-white/70 max-w-sm truncate">
                  {product.description}
                </TableCell>
                <TableCell>
                  <ProductAvailabilityToggle product={product} />
                </TableCell>
                <TableCell>
                  <ProductPinToggle product={product} />
                </TableCell>
                <TableCell className="text-right space-x-2">
                  <Button variant="outline" size="sm" onClick={() => handleOpenModal(product)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleOpenDeleteDialog(product.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious 
                onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
              />
            </PaginationItem>
            
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <PaginationItem key={page}>
                <PaginationLink
                  onClick={() => handlePageChange(page)}
                  isActive={currentPage === page}
                  className="cursor-pointer"
                >
                  {page}
                </PaginationLink>
              </PaginationItem>
            ))}
            
            <PaginationItem>
              <PaginationNext 
                onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}

      {products?.length === 0 && (
        <div className="text-center p-8 text-white/50">
          Nenhum produto encontrado.
        </div>
      )}

      <ProductModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        product={selectedProduct}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
      />

      <DeleteProductDialog
        isOpen={isDeleteDialogOpen}
        onClose={handleCloseDeleteDialog}
        onConfirm={handleConfirmDelete}
        isDeleting={isDeleting}
      />
    </div>
  );
};

export default ProductsTable;
