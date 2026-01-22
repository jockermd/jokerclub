
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Users, Loader2 } from 'lucide-react';
import { getCodeblockPermissions, grantCodeblockAccess, revokeCodeblockAccess } from '@/api/codeblockPermissions';
import UserSearchInput from './UserSearchInput';
import AccessPermissionsList from './AccessPermissionsList';

interface CodeblockAccessModalProps {
  codeblockId: string;
  codeblockTitle: string;
}

const CodeblockAccessModal: React.FC<CodeblockAccessModalProps> = ({
  codeblockId,
  codeblockTitle
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data: permissions, isLoading } = useQuery({
    queryKey: ['codeblock-permissions', codeblockId],
    queryFn: () => getCodeblockPermissions(codeblockId),
    enabled: isOpen
  });

  const grantAccessMutation = useMutation({
    mutationFn: ({ userId }: { userId: string }) => grantCodeblockAccess(codeblockId, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['codeblock-permissions', codeblockId] });
      toast.success('Acesso concedido com sucesso!');
    },
    onError: (error: any) => {
      if (error.message.includes('duplicate key')) {
        toast.error('Este usuário já possui acesso a este codeblock');
      } else {
        toast.error('Erro ao conceder acesso: ' + error.message);
      }
    }
  });

  const revokeAccessMutation = useMutation({
    mutationFn: ({ userId }: { userId: string }) => revokeCodeblockAccess(codeblockId, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['codeblock-permissions', codeblockId] });
      toast.success('Acesso removido com sucesso!');
    },
    onError: (error: any) => {
      toast.error('Erro ao remover acesso: ' + error.message);
    }
  });

  const handleGrantAccess = (userId: string, username: string) => {
    grantAccessMutation.mutate({ userId });
  };

  const handleRevokeAccess = (userId: string) => {
    revokeAccessMutation.mutate({ userId });
  };

  const excludeUserIds = permissions?.map(p => p.user_id) || [];

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Users className="h-4 w-4 mr-2" />
          Gerenciar Acesso
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Gerenciar Acesso - {codeblockTitle}</DialogTitle>
          <p className="text-sm text-gray-600">
            Conceda acesso específico para que usuários possam visualizar este conteúdo borrado sem o efeito blur.
          </p>
        </DialogHeader>

        <div className="space-y-6">
          <div>
            <h3 className="text-sm font-medium mb-3">Adicionar Usuário</h3>
            <UserSearchInput
              onUserSelect={handleGrantAccess}
              excludeUserIds={excludeUserIds}
              placeholder="Buscar usuário para conceder acesso..."
            />
            {grantAccessMutation.isPending && (
              <div className="flex items-center mt-2 text-sm text-gray-500">
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Concedendo acesso...
              </div>
            )}
          </div>

          <Separator />

          <div>
            <h3 className="text-sm font-medium mb-3">
              Usuários com Acesso ({permissions?.length || 0})
            </h3>
            {isLoading ? (
              <div className="flex items-center justify-center py-6">
                <Loader2 className="h-6 w-6 animate-spin" />
                <span className="ml-2">Carregando permissões...</span>
              </div>
            ) : (
              <AccessPermissionsList
                permissions={permissions || []}
                onRevokeAccess={handleRevokeAccess}
                isRevoking={revokeAccessMutation.isPending}
              />
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CodeblockAccessModal;
