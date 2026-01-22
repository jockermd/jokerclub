import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { addReply } from '@/api/replies';
import { getProfile } from '@/api/profiles';
import { toast } from 'sonner';
import { Textarea } from '@/components/ui/textarea';
import Button from '@/components/common/Button';
import { Send } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
interface ReplyFormProps {
  tweetId: string;
  authorUsername: string;
  onReplySuccess: () => void;
}
const ReplyForm: React.FC<ReplyFormProps> = ({
  tweetId,
  authorUsername,
  onReplySuccess
}) => {
  const [content, setContent] = useState('');
  const {
    user
  } = useAuth();
  const queryClient = useQueryClient();
  const {
    data: userProfile,
    isLoading: isLoadingProfile
  } = useQuery({
    queryKey: ['profile', user?.id],
    queryFn: () => getProfile(user!.id),
    enabled: !!user,
    staleTime: 5 * 60 * 1000 // 5 minutes
  });
  const replyMutation = useMutation({
    mutationFn: addReply,
    onSuccess: newReply => {
      toast.success('Sua resposta foi postada!');
      setContent('');
      queryClient.setQueryData(['replies', tweetId], (oldData: any) => {
        return oldData ? [...oldData, newReply] : [newReply];
      });
      queryClient.invalidateQueries({
        queryKey: ['tweetInteractions', tweetId, user?.id]
      });
      onReplySuccess();
    },
    onError: error => {
      toast.error(error.message);
    }
  });
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !content.trim()) return;
    replyMutation.mutate({
      content,
      tweetId,
      userId: user.id
    });
  };
  if (!user) {
    return null;
  }
  const userAvatar = userProfile?.avatar_url || user.user_metadata.avatar_url;
  const fullName = userProfile?.full_name || user.user_metadata.full_name;
  const userNameInitial = (fullName || 'U').charAt(0);
  return <form onSubmit={handleSubmit} className="pt-4">
      <div className="flex items-start gap-4">
         {isLoadingProfile ? <Skeleton className="w-10 h-10 rounded-full" /> : userAvatar ? <img src={userAvatar} alt={fullName || ''} className="w-10 h-10 rounded-full border border-mart-primary" /> : <div className="w-10 h-10 rounded-full bg-mart-secondary flex items-center justify-center text-white font-semibold text-base">
              {userNameInitial}
            </div>}
        <div className="flex-1">
          <div className="relative w-full">
            <Textarea value={content} onChange={e => setContent(e.target.value)} placeholder={`Respondendo a @${authorUsername}`} className="w-full bg-mart-dark/50 border border-white/10 text-white focus:outline-none focus:ring-1 focus:ring-mart-primary resize-none min-h-[85px] text-base p-3 pr-12 rounded-lg transition-colors" maxLength={280} disabled={replyMutation.isPending} />
            <div className="absolute bottom-3 right-3 text-white/40 text-xs pointer-events-none">
              {content.length}/280
            </div>
          </div>
          <div className="flex justify-end items-center mt-3 mb-3">
            <Button type="submit" size="sm" disabled={!content.trim() || replyMutation.isPending}>
              <span>{replyMutation.isPending ? 'Respondendo...' : 'Responder'}</span>
              <Send className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </div>
    </form>;
};
export default ReplyForm;