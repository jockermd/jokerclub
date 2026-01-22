
import React from 'react';
import { Dialog, DialogContent, DialogTrigger, DialogClose } from '@/components/ui/dialog';
import { X } from 'lucide-react';

interface ImageModalProps {
  src: string;
  alt: string;
  children: React.ReactNode;
}

const ImageModal: React.FC<ImageModalProps> = ({ src, alt, children }) => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] p-0 bg-transparent border-2 border-mart-primary shadow-[0_0_20px_rgba(139,92,246,0.5)]">
        <div className="relative">
          <DialogClose asChild>
            <button 
              className="absolute top-4 right-4 z-50 bg-black/50 backdrop-blur-sm rounded-full p-2 text-mart-primary hover:text-white hover:bg-mart-primary/70 transition-all duration-300 border border-mart-primary hover:shadow-[0_0_10px_rgba(139,92,246,0.7)]"
            >
              <X className="h-4 w-4" />
            </button>
          </DialogClose>
          <img 
            src={src} 
            alt={alt} 
            className="w-full h-full max-h-[80vh] object-contain rounded-lg"
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ImageModal;
