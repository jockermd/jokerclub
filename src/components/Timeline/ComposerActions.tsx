
import React from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import EmojiPicker, { EmojiClickData, Theme } from 'emoji-picker-react';
import { Image as ImageIcon, Smile, Bold, Loader2 } from 'lucide-react';

interface ComposerActionsProps {
  onImageUploadClick: () => void;
  onEmojiClick: (emojiData: EmojiClickData) => void;
  onFormatBold: () => void;
  isUploading: boolean;
  imageCount: number;
}

const ComposerActions = ({
  onImageUploadClick,
  onEmojiClick,
  onFormatBold,
  isUploading,
  imageCount,
}: ComposerActionsProps) => {
  return (
    <div className="flex items-center gap-4 text-white/60">
      <button type="button" onClick={onImageUploadClick} className="hover:text-mart-primary transition-colors" disabled={imageCount >= 4 || isUploading}>
        {isUploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <ImageIcon className="w-5 h-5" />}
      </button>
      <Popover>
        <PopoverTrigger asChild>
          <button type="button" className="hover:text-mart-primary transition-colors"><Smile className="w-5 h-5" /></button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0 border-0 bg-transparent">
          <EmojiPicker onEmojiClick={onEmojiClick} theme={Theme.DARK} />
        </PopoverContent>
      </Popover>
      <button type="button" onClick={onFormatBold} className="hover:text-mart-primary transition-colors"><Bold className="w-5 h-5" /></button>
    </div>
  );
};

export default ComposerActions;
