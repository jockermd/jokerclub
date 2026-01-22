
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getAllProfiles, updateProfile } from '@/api/profiles';
import { Tables } from '@/integrations/supabase/types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Loader2, CheckCircle } from 'lucide-react';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';

const UsersTable = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
  const queryClient = useQueryClient();
  const { data: profiles, isLoading } = useQuery<Tables<'profiles'>[]>({
    queryKey: ['allProfiles'],
    queryFn: getAllProfiles,
  });

  const mutation = useMutation({
    mutationFn: ({ userId, is_verified }: { userId: string; is_verified: boolean }) =>
      updateProfile(userId, { is_verified }),
    onSuccess: () => {
      toast.success('Status de verificação do usuário atualizado!');
      queryClient.invalidateQueries({ queryKey: ['allProfiles'] });
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
    onError: () => {
      toast.error('Falha ao atualizar usuário.');
    },
  });

  const handleToggleVerify = (userId: string, currentStatus: boolean) => {
    mutation.mutate({ userId, is_verified: !currentStatus });
  };

  // Pagination logic
  const totalItems = profiles?.length || 0;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentProfiles = profiles?.slice(startIndex, endIndex) || [];

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
              <TableHead className="text-white">Usuário</TableHead>
              <TableHead className="text-white">Nome de usuário</TableHead>
              <TableHead className="text-white">ID do Usuário</TableHead>
              <TableHead className="text-white text-center">Verificado</TableHead>
              <TableHead className="text-white text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentProfiles.map((profile) => (
              <TableRow key={profile.id} className="border-white/10 hover:bg-mart-dark-2/50">
                <TableCell className="font-medium text-white">{profile.full_name}</TableCell>
                <TableCell className="text-white/70">@{profile.username}</TableCell>
                <TableCell className="text-white/50 text-xs">{profile.id}</TableCell>
                <TableCell className="text-center">
                  {profile.is_verified && <CheckCircle className="h-5 w-5 text-mart-primary inline-block" />}
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleToggleVerify(profile.id, profile.is_verified)}
                    disabled={mutation.isPending}
                  >
                    {profile.is_verified ? 'Desverificar' : 'Verificar'}
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center w-full overflow-x-auto">
          <Pagination>
            <PaginationContent className="flex flex-wrap gap-1 justify-center">
              <PaginationItem>
                <PaginationPrevious 
                  onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                  className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                />
              </PaginationItem>
              
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                let page;
                if (totalPages <= 5) {
                  page = i + 1;
                } else if (currentPage <= 3) {
                  page = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  page = totalPages - 4 + i;
                } else {
                  page = currentPage - 2 + i;
                }
                return (
                  <PaginationItem key={page}>
                    <PaginationLink
                      onClick={() => handlePageChange(page)}
                      isActive={currentPage === page}
                      className="cursor-pointer"
                    >
                      {page}
                    </PaginationLink>
                  </PaginationItem>
                );
              })}
              
              <PaginationItem>
                <PaginationNext 
                  onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                  className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </div>
  );
};

export default UsersTable;
