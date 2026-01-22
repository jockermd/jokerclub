
import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateProfile } from '@/api/profiles';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Loader2, UserPlus, Users, Palette } from 'lucide-react';
import UserSearchInput from './UserSearchInput';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { EditFounderDisplayModal } from './EditFounderDisplayModal';
import { useQuery } from '@tanstack/react-query';
import { getAllProfiles } from '@/api/profiles';

interface AddConsultantModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AddConsultantModal: React.FC<AddConsultantModalProps> = ({ isOpen, onClose }) => {
  const [selectedUsers, setSelectedUsers] = useState<Array<{ id: string; name: string }>>([]);
  const queryClient = useQueryClient();

  const { data: profiles } = useQuery({
    queryKey: ['allProfiles'],
    queryFn: getAllProfiles,
  });

  const mutation = useMutation({
    mutationFn: async (userIds: string[]) => {
      const promises = userIds.map(userId => 
        updateProfile(userId, { is_consultant: true })
      );
      return Promise.all(promises);
    },
    onSuccess: () => {
      toast.success(`${selectedUsers.length} usuário(s) promovido(s) a fundador(es) com sucesso!`);
      queryClient.invalidateQueries({ queryKey: ['allProfiles'] });
      setSelectedUsers([]);
    },
    onError: () => {
      toast.error('Falha ao promover usuários a fundadores.');
    },
  });

  const handleUserSelect = (userId: string, username: string) => {
    if (!selectedUsers.find(u => u.id === userId)) {
      setSelectedUsers(prev => [...prev, { id: userId, name: username }]);
    }
  };

  const handleRemoveUser = (userId: string) => {
    setSelectedUsers(prev => prev.filter(u => u.id !== userId));
  };

  const handleSubmit = () => {
    if (selectedUsers.length === 0) {
      toast.error('Selecione pelo menos um usuário.');
      return;
    }
    mutation.mutate(selectedUsers.map(u => u.id));
  };

  const handleClose = () => {
    setSelectedUsers([]);
    onClose();
  };

  const excludeUserIds = selectedUsers.map(u => u.id);
  const consultants = profiles?.filter(p => p.is_consultant) || [];

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[700px] glass-card border-mart-dark-1 max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-white font-orbitron">Gerenciar Fundadores</DialogTitle>
        </DialogHeader>
        
        <Tabs defaultValue="add" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-mart-dark-2">
            <TabsTrigger value="add" className="flex items-center gap-2">
              <UserPlus className="h-4 w-4" />
              Adicionar Fundadores
            </TabsTrigger>
            <TabsTrigger value="edit" className="flex items-center gap-2">
              <Palette className="h-4 w-4" />
              Editar Display
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="add" className="space-y-4 mt-4">
            <div>
              <label className="text-white/70 text-sm font-medium mb-2 block">
                Buscar usuários para promover a fundadores
              </label>
              <UserSearchInput 
                onUserSelect={handleUserSelect}
                excludeUserIds={excludeUserIds}
                placeholder="Digite o nome ou usuário..."
              />
            </div>

            {selectedUsers.length > 0 && (
              <div>
                <label className="text-white/70 text-sm font-medium mb-2 block">
                  Usuários selecionados ({selectedUsers.length})
                </label>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {selectedUsers.map((user) => (
                    <div
                      key={user.id}
                      className="flex items-center justify-between bg-mart-dark-2 p-2 rounded"
                    >
                      <span className="text-white text-sm">{user.name}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveUser(user.id)}
                        className="text-red-400 hover:text-red-300 hover:bg-red-400/10"
                      >
                        Remover
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            <div className="flex justify-end gap-2 pt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={handleClose}
                disabled={mutation.isPending}
              >
                Cancelar
              </Button>
              <Button 
                onClick={handleSubmit}
                disabled={mutation.isPending || selectedUsers.length === 0}
                className="mars-button"
              >
                {mutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                <UserPlus className="mr-2 h-4 w-4" />
                {mutation.isPending ? 'Adicionando...' : `Adicionar ${selectedUsers.length} Fundador(es)`}
              </Button>
            </div>
          </TabsContent>
          
          <TabsContent value="edit" className="space-y-4 mt-4">
            <div>
              <label className="text-white/70 text-sm font-medium mb-2 block">
                Fundadores atuais - Editar como aparecem no perfil
              </label>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {consultants.map((consultant) => (
                  <div
                    key={consultant.id}
                    className="flex items-center justify-between bg-mart-dark-2 p-3 rounded border border-white/10"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-r from-mart-primary to-mart-secondary flex items-center justify-center overflow-hidden">
                        {consultant.avatar_url ? (
                          <img 
                            src={consultant.avatar_url} 
                            alt={consultant.full_name || ''}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-white font-bold text-sm">
                            {(consultant.full_name || 'U').charAt(0)}
                          </span>
                        )}
                      </div>
                      <div>
                        <p className="text-white font-medium">{consultant.full_name}</p>
                        <p className="text-white/60 text-sm">@{consultant.username}</p>
                        {consultant.consultant_title && (
                          <p className="text-mart-primary text-xs">{consultant.consultant_title}</p>
                        )}
                      </div>
                    </div>
                    <EditFounderDisplayModal profile={consultant} />
                  </div>
                ))}
                
                {consultants.length === 0 && (
                  <div className="text-center py-8 text-white/60">
                    <Users className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>Nenhum fundador encontrado</p>
                    <p className="text-sm">Adicione usuários como fundadores primeiro</p>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default AddConsultantModal;
