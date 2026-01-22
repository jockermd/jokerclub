
import React from 'react';
import { Lock, EyeOff } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CodeblockPrivacyOverlayProps {
  isPublic: boolean;
  isBlurred?: boolean;
}

const CodeblockPrivacyOverlay: React.FC<CodeblockPrivacyOverlayProps> = ({ isPublic, isBlurred }) => {
  if (isPublic && !isBlurred) return null;

  const isPrivate = !isPublic;

  return (
    <div className="absolute top-16 left-4 right-4 bg-black/20 backdrop-blur-[1px] rounded-lg z-10 flex items-center justify-center py-8">
      <div className={cn(
        "px-4 py-2 rounded-lg border flex items-center gap-2",
        "bg-red-500/20 text-red-300 border-red-500/30"
      )}>
        {isPrivate ? <Lock className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
        <span className="text-sm font-semibold">
          {isPrivate ? 'Conteúdo Privado' : 'Conteúdo Pago'}
        </span>
      </div>
    </div>
  );
};

export default CodeblockPrivacyOverlay;
