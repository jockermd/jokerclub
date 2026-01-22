
import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface AccessPermission {
  id: string;
  user_id: string;
  created_at: string;
  profiles: {
    username: string | null;
    full_name: string | null;
    avatar_url: string | null;
  } | null;
  granted_by_profile: {
    username: string | null;
    full_name: string | null;
  } | null;
}

interface AccessPermissionsListProps {
  permissions: AccessPermission[];
  onRevokeAccess: (userId: string) => void;
  isRevoking?: boolean;
}

const AccessPermissionsList: React.FC<AccessPermissionsListProps> = ({
  permissions,
  onRevokeAccess,
  isRevoking = false
}) => {
  if (permissions.length === 0) {
    return (
      <div className="text-center py-6 text-gray-500">
        <p>Nenhuma permissão concedida ainda.</p>
        <p className="text-sm mt-1">Use o campo acima para adicionar usuários.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {permissions.map((permission) => (
        <div
          key={permission.id}
          className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
        >
          <div className="flex items-center space-x-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={permission.profiles?.avatar_url || ''} />
              <AvatarFallback>
                {(permission.profiles?.username || permission.profiles?.full_name || 'U')[0].toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium">
                {permission.profiles?.username || permission.profiles?.full_name || 'Usuário'}
              </p>
              {permission.profiles?.username && permission.profiles?.full_name && (
                <p className="text-sm text-gray-500">{permission.profiles.full_name}</p>
              )}
              <p className="text-xs text-gray-400">
                Concedido por {permission.granted_by_profile?.username || permission.granted_by_profile?.full_name || 'Admin'} em {' '}
                {format(new Date(permission.created_at), 'dd/MM/yyyy', { locale: ptBR })}
              </p>
            </div>
          </div>
          
          <Button
            size="sm"
            variant="destructive"
            onClick={() => onRevokeAccess(permission.user_id)}
            disabled={isRevoking}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ))}
    </div>
  );
};

export default AccessPermissionsList;
