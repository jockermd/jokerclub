
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getAllProfiles, updateProfile } from '@/api/profiles';
import { Tables } from '@/integrations/supabase/types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Loader2, UserX, Search, RotateCw, UserPlus } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import AddConsultantModal from './AddConsultantModal';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';

const ConsultantsTable = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
  const queryClient = useQueryClient();
  const { data: profiles, isLoading, refetch } = useQuery<Tables<'profiles'>[]>({
    queryKey: ['allProfiles'],
    queryFn: getAllProfiles,
  });

  const mutation = useMutation({
    mutationFn: ({ userId }: { userId: string }) =>
      updateProfile(userId, { is_consultant: false }),
    onSuccess: () => {
      toast.success('Fundador removido com sucesso!');
      queryClient.invalidateQueries({ queryKey: ['allProfiles'] });
    },
    onError: () => {
      toast.error('Falha ao remover fundador.');
    },
  });

  const handleRemoveConsultant = (userId: string) => {
    mutation.mutate({ userId });
  };
  
  const consultants = profiles
    ?.filter(p => p.is_consultant)
    ?.filter(p => 
        p.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.consultant_title?.toLowerCase().includes(searchTerm.toLowerCase())
    );

  // Pagination logic
  const totalItems = consultants?.length || 0;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentConsultants = consultants?.slice(startIndex, endIndex) || [];

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  if (isLoading) return <div className="flex justify-center items-center p-8"><Loader2 className="animate-spin text-mart-primary" /></div>;

  return (
    <div className="space-y-4">
        <div className="flex items-center justify-between gap-2 mb-4">
            <div className="flex items-center gap-2">
                <div className="relative w-full max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/50" />
                    <Input 
                        placeholder="Buscar fundadores..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="bg-mart-dark-2 border-white/10 pl-10 text-white"
                    />
                </div>
                <Button variant="outline" onClick={() => refetch()}><RotateCw className="mr-2 h-4 w-4"/> Atualizar</Button>
            </div>
            <Button 
                onClick={() => setIsAddModalOpen(true)}
                className="mars-button"
            >
                <UserPlus className="mr-2 h-4 w-4" />
                Adicionar Fundador
            </Button>
        </div>
        <div className="rounded-lg border border-white/10 overflow-hidden">
        <Table>
            <TableHeader>
            <TableRow className="border-white/10 hover:bg-mart-dark-2/50">
                <TableHead className="text-white">Fundador</TableHead>
                <TableHead className="text-white">Título</TableHead>
                <TableHead className="text-white">Bio</TableHead>
                <TableHead className="text-white text-right">Ações</TableHead>
            </TableRow>
            </TableHeader>
            <TableBody>
            {currentConsultants.map((profile) => (
                <TableRow key={profile.id} className="border-white/10 hover:bg-mart-dark-2/50">
                <TableCell className="font-medium text-white">
                    <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10 border-2 border-mart-primary/50">
                        <AvatarImage src={profile.avatar_url || ''} alt={profile.full_name || ''} />
                        <AvatarFallback>{(profile.full_name || 'U').charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                            <p>{profile.full_name}</p>
                            <p className="text-sm text-white/60">@{profile.username}</p>
                        </div>
                    </div>
                </TableCell>
                <TableCell className="text-white/70 max-w-[200px] truncate">{profile.consultant_title}</TableCell>
                <TableCell className="text-white/70 max-w-sm truncate">{profile.consultant_bio}</TableCell>
                <TableCell className="text-right">
                    <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleRemoveConsultant(profile.id)}
                    disabled={mutation.isPending}
                    >
                    <UserX className="mr-2 h-4 w-4" />
                    Remover
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
        
        <AddConsultantModal 
            isOpen={isAddModalOpen} 
            onClose={() => setIsAddModalOpen(false)} 
        />
    </div>
  );
};

export default ConsultantsTable;
