
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getTweets, updateTweet, deleteTweet } from '@/api/tweets';
import { TweetWithAuthor } from '@/api/tweets';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Loader2, Pin, Trash2, Edit } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import EditTweetModal from './EditTweetModal';

const TweetsTable = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [editingTweet, setEditingTweet] = useState<TweetWithAuthor | null>(null);
  const itemsPerPage = 10;
  
  const queryClient = useQueryClient();
  const { data: tweetsData, isLoading } = useQuery({
    queryKey: ['allTweets'],
    queryFn: () => getTweets({}),
  });
  
  const tweets = tweetsData?.tweets;

  const pinMutation = useMutation({
    mutationFn: ({ tweetId, is_pinned }: { tweetId: string; is_pinned: boolean }) =>
      updateTweet(tweetId, { is_pinned }),
    onSuccess: () => {
      toast.success('Status de fixação do tweet atualizado!');
      queryClient.invalidateQueries({ queryKey: ['allTweets'] });
      queryClient.invalidateQueries({ queryKey: ['tweets'] }); // For timeline
    },
    onError: () => {
      toast.error('Falha ao atualizar tweet.');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (tweetId: string) => deleteTweet(tweetId),
    onSuccess: () => {
      toast.success('Tweet excluído!');
      queryClient.invalidateQueries({ queryKey: ['allTweets'] });
      queryClient.invalidateQueries({ queryKey: ['tweets'] });
    },
    onError: () => {
      toast.error('Falha ao excluir tweet.');
    },
  });

  const handleTogglePin = (tweetId: string, currentStatus: boolean) => {
    pinMutation.mutate({ tweetId, is_pinned: !currentStatus });
  };
  
  const handleDelete = (tweetId: string) => {
    if (window.confirm('Tem certeza que deseja excluir este tweet?')) {
      deleteMutation.mutate(tweetId);
    }
  };

  const handleEdit = (tweet: TweetWithAuthor) => {
    setEditingTweet(tweet);
  };

  const handleCloseEdit = () => {
    setEditingTweet(null);
  };

  // Pagination logic
  const totalItems = tweets?.length || 0;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentTweets = tweets?.slice(startIndex, endIndex) || [];

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };
  
  if (isLoading) return <div className="flex justify-center items-center p-8"><Loader2 className="animate-spin text-mart-primary" /></div>;

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-white/10 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-white/10 hover:bg-mart-dark-2/50">
              <TableHead className="text-white">Conteúdo</TableHead>
              <TableHead className="text-white">Autor</TableHead>
              <TableHead className="text-white">Data</TableHead>
              <TableHead className="text-white text-center">Fixado</TableHead>
              <TableHead className="text-white text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentTweets.map((tweet) => (
              <TableRow key={tweet.id} className="border-white/10 hover:bg-mart-dark-2/50">
                <TableCell className="font-medium text-white max-w-sm truncate">{tweet.content}</TableCell>
                <TableCell className="text-white/70">@{tweet.profiles?.username}</TableCell>
                <TableCell className="text-white/70 text-xs">{format(new Date(tweet.created_at), 'dd MMM, yyyy', { locale: ptBR })}</TableCell>
                <TableCell className="text-center">
                  {tweet.is_pinned && <Pin className="h-5 w-5 text-mart-primary inline-block" />}
                </TableCell>
                <TableCell className="text-right space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(tweet)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleTogglePin(tweet.id, tweet.is_pinned)}
                    disabled={pinMutation.isPending}
                  >
                    <Pin className="h-4 w-4 mr-1" />
                    {tweet.is_pinned ? 'Desfixar post' : 'Fixar post'}
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDelete(tweet.id)}
                    disabled={deleteMutation.isPending}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious 
                onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
              />
            </PaginationItem>
            
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <PaginationItem key={page}>
                <PaginationLink
                  onClick={() => handlePageChange(page)}
                  isActive={currentPage === page}
                  className="cursor-pointer"
                >
                  {page}
                </PaginationLink>
              </PaginationItem>
            ))}
            
            <PaginationItem>
              <PaginationNext 
                onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}

      <EditTweetModal 
        tweet={editingTweet}
        open={!!editingTweet}
        onClose={handleCloseEdit}
      />
    </div>
  );
};

export default TweetsTable;
