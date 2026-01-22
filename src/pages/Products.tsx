
import React from 'react';
import ParticleBackground from '@/components/Layout/ParticleBackground';
import Navbar from '@/components/Layout/Navbar';
import MobileNavbar from '@/components/Layout/MobileNavbar';
import RightSidebar from '@/components/Layout/RightSidebar';
import { useQuery } from '@tanstack/react-query';
import { getProducts } from '@/api/products';
import ProductCard from '@/components/Store/ProductCard';
import { AlertTriangle, Loader2 } from 'lucide-react';

const Products = () => {
  const { data: products, isLoading, isError } = useQuery({
    queryKey: ['products'],
    queryFn: getProducts,
  });

  return (
    <div className="min-h-screen pb-16 md:pb-0">
      <ParticleBackground />
      <Navbar />
      
      <main className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8">
            <h1 className="text-2xl font-orbitron font-bold text-white mb-6 lg:hidden">Nossos Produtos</h1>
            
            {isLoading && (
              <div className="flex justify-center items-center h-64">
                <Loader2 className="h-8 w-8 text-mart-primary animate-spin" />
              </div>
            )}

            {isError && (
              <div className="flex flex-col justify-center items-center h-64 glass-card rounded-xl p-4">
                <AlertTriangle className="h-8 w-8 text-red-500 mb-2" />
                <p className="text-white">Ocorreu um erro ao buscar os produtos.</p>
              </div>
            )}

            {products?.length === 0 && !isLoading && !isError && (
              <div className="flex flex-col justify-center items-center h-64 glass-card rounded-xl p-4">
                <p className="text-white text-lg">Nenhum produto disponível no momento.</p>
                <p className="text-white/70 text-sm mt-2">Novos produtos serão adicionados em breve!</p>
              </div>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {products?.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
          <div className="lg:col-span-4">
            <RightSidebar />
          </div>
        </div>
      </main>

      <MobileNavbar />
    </div>
  );
};

export default Products;
