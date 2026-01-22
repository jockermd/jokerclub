
import React from 'react';
import { Textarea } from '@/components/ui/textarea';
import Button from '@/components/common/Button';
import { Send } from 'lucide-react';
import ImagePreviewGrid from './ImagePreviewGrid';
import ComposerActions from './ComposerActions';
import { EmojiClickData } from 'emoji-picker-react';

interface TweetComposerFormProps {
  handleSubmit: (e: React.FormEvent) => void;
  content: string;
  setContent: (value: string) => void;
  textareaRef: React.RefObject<HTMLTextAreaElement>;
  mutation: { isPending: boolean };
  isUploading: boolean;
  imageUrls: string[];
  removeImage: (index: number) => void;
  fileInputRef: React.RefObject<HTMLInputElement>;
  handleImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onEmojiClick: (emojiData: EmojiClickData) => void;
  formatBold: () => void;
  images: File[];
  isDisabled: boolean;
}

const TweetComposerForm = ({
  handleSubmit,
  content,
  setContent,
  textareaRef,
  mutation,
  isUploading,
  imageUrls,
  removeImage,
  fileInputRef,
  handleImageUpload,
  onEmojiClick,
  formatBold,
  images,
  isDisabled,
}: TweetComposerFormProps) => {
  return (
    <div className="w-full">
      <form onSubmit={handleSubmit}>
        <div className="relative w-full">
          <Textarea
            ref={textareaRef}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="O que está acontecendo?"
            className="w-full bg-transparent border-t border-b-0 border-x-0 border-white/20 rounded-none px-4 py-3 text-white focus:outline-none focus:ring-0 resize-none min-h-[96px] text-base pr-20"
            maxLength={1200}
            disabled={mutation.isPending || isUploading}
          />
          <div className={`absolute bottom-3 right-4 text-sm pointer-events-none ${content.length > 1200 ? 'text-red-400' : 'text-white/60'}`}>
            {content.length}/1200
          </div>
        </div>
        <input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/png, image/jpeg, image/gif" multiple hidden />
        <div className="px-4 pt-3">
          <ImagePreviewGrid imageUrls={imageUrls} removeImage={removeImage} />
          <div className="flex justify-between items-center mt-3 pb-4">
            <ComposerActions
              onImageUploadClick={() => fileInputRef.current?.click()}
              onEmojiClick={onEmojiClick}
              onFormatBold={formatBold}
              isUploading={isUploading}
              imageCount={images.length}
            />
            <div className="flex items-center gap-4">
              <Button type="submit" disabled={isDisabled || content.length > 1200}>
                <span>{mutation.isPending || isUploading ? 'Postando...' : 'Tweetar'}</span>
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default TweetComposerForm;
