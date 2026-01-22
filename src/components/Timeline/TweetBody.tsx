
import React from 'react';
import { useTextExpansion } from '@/hooks/useTextExpansion';
import { cn } from '@/lib/utils';
import ImageModal from './ImageModal';

interface TweetBodyProps {
  content: string;
  images?: (string | null)[] | null;
}

const TweetBody: React.FC<TweetBodyProps> = ({
  content,
  images
}) => {
  const { contentRef, isExpanded, canBeTruncated, toggleExpansion } = useTextExpansion();

  const renderContent = () => {
    if (!content) return null;
    const parts = content.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, index) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={index}>{part.slice(2, -2)}</strong>;
      }
      return part;
    });
  };

  const validImages = images?.filter((img): img is string => !!img) || [];

  return (
    <div className="text-white break-words overflow-hidden">
      <div 
        ref={contentRef}
        className={cn("whitespace-pre-wrap text-left mx-[5px] md:mx-0 word-wrap break-all overflow-wrap-anywhere", !isExpanded && "line-clamp-5")}
      >
        {renderContent()}
      </div>
      {canBeTruncated && (
        <button
          onClick={toggleExpansion}
          className="text-mart-primary font-semibold text-sm mt-1 hover:underline"
        >
          {isExpanded ? 'Ver Menos' : 'Ver Mais'}
        </button>
      )}
      {validImages.length > 0 && (
        <div className={`mt-3 grid gap-1 ${validImages.length > 1 ? 'grid-cols-2' : 'grid-cols-1'} ${validImages.length === 3 ? '[&>*:first-child]:col-span-2' : ''} rounded-xl overflow-hidden border border-white/10`}>
          {validImages.map((image, index) => (
            <ImageModal key={index} src={image} alt={`Tweet image ${index + 1}`}>
              <button className="cursor-zoom-in w-full h-full">
                <img 
                  src={image} 
                  alt={`Tweet image ${index + 1}`} 
                  className="w-full h-full object-cover aspect-video hover:opacity-90 transition-opacity" 
                />
              </button>
            </ImageModal>
          ))}
        </div>
      )}
    </div>
  );
};

export default TweetBody;
