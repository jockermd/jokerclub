
import React from 'react';

interface CodeblockImagesProps {
  images: string[];
  isBlurred?: boolean;
}

const CodeblockImages: React.FC<CodeblockImagesProps> = ({ images, isBlurred }) => {
  if (images.length === 0) return null;

  return (
    <div className="space-y-2">
      {images.map((imageSrc, index) => (
        <div key={index} className={`border rounded-md overflow-hidden ${isBlurred ? 'opacity-60' : ''}`}>
          <img 
            src={imageSrc} 
            alt={`Image ${index + 1}`}
            className="w-full max-h-64 object-contain bg-gray-100"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
          />
        </div>
      ))}
    </div>
  );
};

export default CodeblockImages;
