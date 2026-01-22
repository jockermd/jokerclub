
import React from 'react';
import { X } from 'lucide-react';

interface ImagePreviewGridProps {
  imageUrls: string[];
  removeImage: (index: number) => void;
}

const ImagePreviewGrid = ({ imageUrls, removeImage }: ImagePreviewGridProps) => {
  if (imageUrls.length === 0) {
    return null;
  }

  return (
    <div className="mt-3 grid gap-2 grid-cols-2 max-w-md">
      {imageUrls.map((url, index) => (
        <div key={index} className="relative">
          <img src={url} alt={`preview ${index}`} className="rounded-lg w-full h-auto object-cover" />
          <button
            type="button"
            onClick={() => removeImage(index)}
            className="absolute top-1 right-1 bg-black/50 rounded-full p-1 text-white hover:bg-black/80 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
};

export default ImagePreviewGrid;
