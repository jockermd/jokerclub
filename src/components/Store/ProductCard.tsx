import React from 'react';
import { Tables } from '@/integrations/supabase/types';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Eye } from 'lucide-react';
import { Link } from 'react-router-dom';
interface ProductCardProps {
  product: Tables<'products'>;
}
const ProductCard: React.FC<ProductCardProps> = ({
  product
}) => {
  const formatPrice = (priceInCents: number) => {
    return (priceInCents / 100).toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    });
  };
  return <Link to={`/products/${product.id}`} className="block group">
      <Card className="glass-card flex flex-col h-full transition-all duration-300 group-hover:border-mart-primary group-hover:shadow-[0_0_10px_rgba(139,92,246,0.5)]">
        <CardHeader>
          <div className="aspect-square relative overflow-hidden rounded-md">
            <img src={product.image_url || '/placeholder.svg'} alt={product.name} className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105" />
          </div>
        </CardHeader>
        <CardContent className="flex-grow">
          <CardTitle className="text-lg text-white">{product.name}</CardTitle>
          <p className="text-sm text-white/70 mt-2 line-clamp-2">{product.description}</p>
        </CardContent>
        <CardFooter className="flex flex-col items-start mt-auto gap-2 p-6 pt-0">
          <p className="text-xl font-bold font-orbitron text-mart-primary transition-opacity duration-300 group-hover:opacity-80 glow-text">{formatPrice(product.price)}</p>
          <Button className="mars-button w-full">
            <Eye />
            Visualizar
          </Button>
        </CardFooter>
      </Card>
    </Link>;
};
export default ProductCard;