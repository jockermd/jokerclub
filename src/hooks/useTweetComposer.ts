
import { useState, useRef } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { addTweet } from '@/api/tweets';
import { uploadFile } from '@/lib/uploadFile';
import { toast } from 'sonner';
import { EmojiClickData } from 'emoji-picker-react';
import { User } from '@supabase/supabase-js';

export const useTweetComposer = (user: User | null) => {
  const [content, setContent] = useState('');
  const [images, setImages] = useState<File[]>([]);
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
    setImages(prev => [...prev, ...files]);
    
    setIsUploading(true);
    try {
      const uploadedUrls = await Promise.all(files.map(file => uploadFile(file)));
      setImageUrls(prev => [...prev, ...uploadedUrls]);
    } catch (error) {
      toast.error("Falha ao enviar imagens. Por favor, tente novamente.");
      setImages(prev => prev.slice(0, prev.length - files.length));
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

  return {
    content,
    setContent,
    imageUrls,
    isUploading,
    textareaRef,
    fileInputRef,
    handleImageUpload,
    removeImage,
    onEmojiClick,
    formatBold,
    handleSubmit,
    mutation,
    isDisabled,
    images
  };
};
