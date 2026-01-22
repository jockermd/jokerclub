import { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateTweet } from '@/api/tweets';
import { TweetWithAuthor } from '@/api/tweets';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

interface EditTweetModalProps {
  tweet: TweetWithAuthor | null;
  open: boolean;
  onClose: () => void;
}

const EditTweetModal = ({ tweet, open, onClose }: EditTweetModalProps) => {
  const [content, setContent] = useState('');
  const queryClient = useQueryClient();

  // Update content when tweet changes
  useEffect(() => {
    if (tweet) {
      setContent(tweet.content);
    }
  }, [tweet]);

  const updateMutation = useMutation({
    mutationFn: ({ tweetId, content }: { tweetId: string; content: string }) =>
      updateTweet(tweetId, { content }),
    onSuccess: () => {
      toast.success('Tweet editado com sucesso!');
      queryClient.invalidateQueries({ queryKey: ['allTweets'] });
      queryClient.invalidateQueries({ queryKey: ['tweets'] });
      onClose();
    },
    onError: () => {
      toast.error('Falha ao editar tweet.');
    },
  });

  const handleSave = () => {
    if (!tweet || !content.trim()) return;
    
    updateMutation.mutate({ 
      tweetId: tweet.id, 
      content: content.trim() 
    });
  };

  const handleClose = () => {
    setContent(tweet?.content || '');
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md bg-mart-dark-1 border-white/10">
        <DialogHeader>
          <DialogTitle className="text-white">Editar Tweet</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-white/70 mb-2 block">
              Conteúdo
            </label>
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Digite o conteúdo do tweet..."
              rows={4}
              className="bg-mart-dark-2 border-white/10 text-white resize-none"
            />
          </div>
          
          <div className="flex justify-end gap-2">
            <Button 
              variant="outline" 
              onClick={handleClose}
              disabled={updateMutation.isPending}
            >
              Cancelar
            </Button>
            <Button 
              onClick={handleSave}
              disabled={!content.trim() || updateMutation.isPending}
              className="bg-mart-primary hover:bg-mart-primary/80"
            >
              {updateMutation.isPending ? 'Salvando...' : 'Salvar'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EditTweetModal;