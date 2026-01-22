
import React from 'react';
import { Card } from '@/components/ui/card';

interface ProductGalleryProps {
  imageUrl: string;
  productName: string;
}

const ProductGallery: React.FC<ProductGalleryProps> = ({ imageUrl, productName }) => {
  return (
    <Card className="glass-card overflow-hidden">
      <div className="aspect-square relative">
        <img src={imageUrl || '/placeholder.svg'} alt={productName} className="object-cover w-full h-full" />
      </div>
    </Card>
  );
};

export default ProductGallery;
