
import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Plus, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface UserSearchInputProps {
  onUserSelect: (userId: string, username: string) => void;
  excludeUserIds?: string[];
  placeholder?: string;
}

const UserSearchInput: React.FC<UserSearchInputProps> = ({ 
  onUserSelect, 
  excludeUserIds = [], 
  placeholder = "Buscar usuários..." 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showResults, setShowResults] = useState(false);

  const { data: users, isLoading } = useQuery({
    queryKey: ['users-search', searchTerm],
    queryFn: async () => {
      if (!searchTerm || searchTerm.length < 2) return [];
      
      const { data, error } = await supabase
        .from('profiles')
        .select('id, username, full_name, avatar_url')
        .or(`username.ilike.%${searchTerm}%,full_name.ilike.%${searchTerm}%`)
        .limit(10);

      if (error) throw error;
      return data?.filter(user => !excludeUserIds.includes(user.id)) || [];
    },
    enabled: searchTerm.length >= 2
  });

  const handleUserSelect = (user: any) => {
    onUserSelect(user.id, user.username || user.full_name || 'Usuário');
    setSearchTerm('');
    setShowResults(false);
  };

  useEffect(() => {
    setShowResults(searchTerm.length >= 2);
  }, [searchTerm]);

  return (
    <div className="relative">
      <Input
        type="text"
        placeholder={placeholder}
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        onFocus={() => setShowResults(searchTerm.length >= 2)}
        onBlur={() => setTimeout(() => setShowResults(false), 200)}
        className="w-full"
      />
      
      {showResults && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border rounded-md shadow-lg z-50 max-h-60 overflow-y-auto">
          {isLoading ? (
            <div className="p-3 flex items-center justify-center">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="ml-2 text-sm text-gray-500">Buscando...</span>
            </div>
          ) : users && users.length > 0 ? (
            users.map((user) => (
              <div
                key={user.id}
                className="p-3 hover:bg-gray-50 cursor-pointer flex items-center justify-between group"
                onClick={() => handleUserSelect(user)}
              >
                <div className="flex items-center space-x-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.avatar_url || ''} />
                    <AvatarFallback>
                      {(user.username || user.full_name || 'U')[0].toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium">{user.username || user.full_name}</p>
                    {user.username && user.full_name && (
                      <p className="text-xs text-gray-500">{user.full_name}</p>
                    )}
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            ))
          ) : searchTerm.length >= 2 ? (
            <div className="p-3 text-center text-sm text-gray-500">
              Nenhum usuário encontrado
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
};

export default UserSearchInput;
