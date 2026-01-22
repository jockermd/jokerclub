
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getAllProfiles, updateProfile } from '@/api/profiles';
import { Tables } from '@/integrations/supabase/types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Loader2, Edit, Trash2 } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import CustomBadge from '@/components/common/CustomBadge';
import { BadgeDetails } from '@/lib/badgeOptions';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import EditBadgeModal from './EditBadgeModal';

const BadgesTable = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedProfile, setSelectedProfile] = useState<Tables<'profiles'> | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const itemsPerPage = 10;
  
  const queryClient = useQueryClient();
  const { data: profiles, isLoading, refetch } = useQuery<Tables<'profiles'>[]>({
    queryKey: ['allProfiles'],
    queryFn: getAllProfiles,
  });

  const mutation = useMutation({
    mutationFn: ({ userId }: { userId: string }) =>
      updateProfile(userId, { badge_details: null }),
    onSuccess: () => {
      toast.success('Badge removido com sucesso!');
      queryClient.invalidateQueries({ queryKey: ['allProfiles'] });
    },
    onError: () => {
      toast.error('Falha ao remover badge.');
    },
  });

  const handleRemoveBadge = (userId: string) => {
    mutation.mutate({ userId });
  };

  const handleEditProfile = (profile: Tables<'profiles'>) => {
    setSelectedProfile(profile);
    setIsEditModalOpen(true);
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setSelectedProfile(null);
  };

  const handleSaveProfile = () => {
    queryClient.invalidateQueries({ queryKey: ['allProfiles'] });
    handleCloseEditModal();
  };
  
  const profilesWithBadges = profiles?.filter(p => p.badge_details) || [];

  // Pagination logic
  const totalItems = profilesWithBadges.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentProfiles = profilesWithBadges.slice(startIndex, endIndex);

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
                <TableHead className="text-white">Badge Atual</TableHead>
                <TableHead className="text-white text-right">Ações</TableHead>
            </TableRow>
            </TableHeader>
            <TableBody>
            {currentProfiles.map((profile) => {
                const badgeDetails = profile.badge_details as unknown as BadgeDetails | null;
                return (
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
                    <TableCell>
                    <CustomBadge details={badgeDetails} />
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditProfile(profile)}
                    >
                        <Edit className="mr-2 h-4 w-4" />
                        Editar
                    </Button>
                    <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleRemoveBadge(profile.id)}
                        disabled={mutation.isPending}
                    >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Remover
                    </Button>
                    </TableCell>
                </TableRow>
                );
            })}
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

        {profilesWithBadges.length === 0 && (
        <div className="text-center p-8 text-white/50">
            Nenhum usuário com badge encontrado.
        </div>
        )}

        {selectedProfile && (
          <EditBadgeModal
            isOpen={isEditModalOpen}
            onClose={handleCloseEditModal}
            profile={selectedProfile}
            onSave={handleSaveProfile}
          />
        )}
    </div>
  );
};

export default BadgesTable;
