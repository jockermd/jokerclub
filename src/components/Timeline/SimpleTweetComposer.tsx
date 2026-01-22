
import React, { useState, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { addTweet } from '@/api/tweets';
import { uploadFile } from '@/lib/uploadFile';
import { toast } from 'sonner';
import { Textarea } from '@/components/ui/textarea';
import Button from '@/components/common/Button';
import { Send, Image as ImageIcon, Smile, Bold, X, Loader2 } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import EmojiPicker, { EmojiClickData, Theme } from 'emoji-picker-react';

const SimpleTweetComposer = () => {
  const [content, setContent] = useState('');
  const [images, setImages] = useState<File[]>([]);
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { user } = useAuth();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: addTweet,
    onSuccess: () => {
      toast.success('Tweet postado!');
      setContent('');
      setImages([]);
      setImageUrls([]);
      queryClient.invalidateQueries({ queryKey: ['tweets'] });
      if (user) {
        queryClient.invalidateQueries({ queryKey: ['tweets', user.id] });
      }
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const files = Array.from(e.target.files);
    
    if (images.length + files.length > 4) {
      toast.error("Você pode enviar no máximo 4 imagens.");
      return;
    }

    const validFiles: File[] = [];
    const allowedTypes = ['image/png', 'image/jpeg', 'image/gif'];
    const maxSize = 5 * 1024 * 1024; // 5MB

    for (const file of files) {
      if (!allowedTypes.includes(file.type)) {
        toast.error(`Tipo de arquivo não permitido: ${file.name}. Use PNG, JPG ou GIF.`);
        continue;
      }
      if (file.size > maxSize) {
        toast.error(`Arquivo muito grande: ${file.name}. O máximo é 5MB.`);
        continue;
      }
      validFiles.push(file);
    }
    
    if(validFiles.length === 0) {
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    setImages(prev => [...prev, ...validFiles]);
    
    setIsUploading(true);
    try {
      const uploadedUrls = await Promise.all(validFiles.map(file => uploadFile(file)));
      setImageUrls(prev => [...prev, ...uploadedUrls]);
    } catch (error) {
      toast.error("Falha ao enviar uma ou mais imagens. Por favor, tente novamente.");
      // On failure, remove the files we just tried to upload from the state
      setImages(prev => prev.filter(f => !validFiles.includes(f)));
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };
  
  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
    setImageUrls(prev => prev.filter((_, i) => i !== index));
  };

  const onEmojiClick = (emojiData: EmojiClickData) => {
    if (textareaRef.current) {
      const cursorPosition = textareaRef.current.selectionStart;
      const newContent = content.slice(0, cursorPosition) + emojiData.emoji + content.slice(cursorPosition);
      setContent(newContent);
      textareaRef.current.focus();
    }
  };

  const formatBold = () => {
    if (textareaRef.current) {
      const start = textareaRef.current.selectionStart;
      const end = textareaRef.current.selectionEnd;
      if (start !== end) {
        const selectedText = content.substring(start, end);
        const newContent = `${content.substring(0, start)}**${selectedText}**${content.substring(end)}`;
        setContent(newContent);
      }
       textareaRef.current.focus();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || (!content.trim() && imageUrls.length === 0)) return;
    mutation.mutate({ content, userId: user.id, images: imageUrls });
  };
  
  const isDisabled = mutation.isPending || isUploading || (!content.trim() && imageUrls.length === 0);

  return (
    <div className="glass-card rounded-xl p-4">
      <form onSubmit={handleSubmit}>
        <div className="relative">
          <Textarea
            ref={textareaRef}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="O que está acontecendo?"
            className="w-full bg-transparent border-0 rounded-lg px-3 py-2 pr-16 text-white focus:outline-none focus:ring-0 resize-none min-h-[96px] text-base transition-colors"
            maxLength={1200}
            disabled={mutation.isPending || isUploading}
          />
          <div className={`absolute bottom-2 right-3 text-sm ${content.length > 1200 ? 'text-red-400' : 'text-white/60'}`}>
            {content.length}/1200
          </div>
        </div>
        {imageUrls.length > 0 && (
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
        )}
        <div className="flex justify-between items-center mt-3">
          <div className="flex items-center gap-4 text-white/60">
             <input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/png, image/jpeg, image/gif" multiple hidden />
            <button type="button" onClick={() => fileInputRef.current?.click()} className="hover:text-mart-primary transition-colors" disabled={images.length >= 4 || isUploading}>
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
            <button type="button" onClick={formatBold} className="hover:text-mart-primary transition-colors"><Bold className="w-5 h-5" /></button>
          </div>
          <Button type="submit" disabled={isDisabled || content.length > 1200} className="bg-gradient-to-r from-mart-primary to-mart-accent text-white font-bold">
            <span>{mutation.isPending || isUploading ? 'Postando...' : 'Tweetar'}</span>
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </form>
    </div>
  );
};

export default SimpleTweetComposer;
