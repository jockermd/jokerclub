
import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getProductById } from '@/api/products';
import ParticleBackground from '@/components/Layout/ParticleBackground';
import Navbar from '@/components/Layout/Navbar';
import MobileNavbar from '@/components/Layout/MobileNavbar';
import RightSidebar from '@/components/Layout/RightSidebar';
import ProductGallery from '@/components/Store/ProductGallery';
import ProductInfo from '@/components/Store/ProductInfo';
import ProductBreadcrumb from '@/components/Store/ProductBreadcrumb';
import { Button } from '@/components/ui/button';
import { AlertTriangle, ArrowLeft, Loader2 } from 'lucide-react';

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();

  const { data: product, isLoading, isError } = useQuery({
    queryKey: ['product', id],
    queryFn: () => getProductById(id!),
    enabled: !!id,
  });

  return (
    <div className="min-h-screen pb-16 md:pb-0">
      <ParticleBackground />
      <Navbar />
      
      <main className="container mx-auto py-6">
        <div className="flex justify-start mb-6">
          <Button asChild variant="ghost" className="text-white hover:bg-white/10 hover:text-white">
            <Link to="/products">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar para produtos
            </Link>
          </Button>
        </div>

        {isLoading && (
          <div className="flex justify-center items-center h-[60vh]">
            <Loader2 className="h-12 w-12 text-mart-primary animate-spin" />
          </div>
        )}

        {isError && (
          <div className="flex flex-col justify-center items-center h-[60vh] glass-card rounded-xl p-4">
            <AlertTriangle className="h-12 w-12 text-red-500 mb-4" />
            <p className="text-white text-lg">Ocorreu um erro ao buscar o produto.</p>
            <p className="text-white/70">Tente novamente mais tarde.</p>
          </div>
        )}

        {product && (
          <>
            <div className="mb-6">
              <ProductBreadcrumb productName={product.name} />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div>
                <ProductGallery imageUrl={product.image_url || ''} productName={product.name} />
              </div>
              <div>
                <ProductInfo product={product} />
              </div>
            </div>
          </>
        )}
      </main>

      <MobileNavbar />
    </div>
  );
};

export default ProductDetail;
