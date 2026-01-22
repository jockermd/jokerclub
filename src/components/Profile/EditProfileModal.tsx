import React, { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import { Tables } from '@/integrations/supabase/types';
import { updateProfile, uploadProfileImage } from '@/api/profiles';
import { useAuth } from '@/contexts/AuthContext';
import { profileFormSchema, ProfileFormValues } from './profile.schema';
import { ProfileImageUploader } from './ProfileImageUploader';
import { ProfileFormFields } from './ProfileFormFields';

interface EditProfileModalProps {
  profile: Tables<'profiles'>;
  children: React.ReactNode;
}

export const EditProfileModal: React.FC<EditProfileModalProps> = ({ profile, children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [avatarPreview, setAvatarPreview] = useState<string | null>(profile.avatar_url);
  const [coverPreview, setCoverPreview] = useState<string | null>(profile.cover_photo_url);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);

  const avatarInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      full_name: profile.full_name || '',
      username: profile.username || '',
      bio: profile.bio || '',
    },
    mode: 'onChange',
  });

  useEffect(() => {
    if (isOpen) {
      form.reset({
        full_name: profile.full_name || '',
        username: profile.username || '',
        bio: profile.bio || '',
      });
      setAvatarPreview(profile.avatar_url);
      setCoverPreview(profile.cover_photo_url);
      setAvatarFile(null);
      setCoverFile(null);
    }
  }, [isOpen, profile, form]);

  const mutation = useMutation({
    mutationFn: async (data: ProfileFormValues) => {
      if (!user) throw new Error('Você deve estar logado para atualizar seu perfil.');

      let avatarUrl = profile.avatar_url;
      if (avatarFile) {
        avatarUrl = await uploadProfileImage({ userId: user.id, file: avatarFile, type: 'avatar', oldPath: profile.avatar_url });
      }

      let coverUrl = profile.cover_photo_url;
      if (coverFile) {
        coverUrl = await uploadProfileImage({ userId: user.id, file: coverFile, type: 'cover', oldPath: profile.cover_photo_url });
      }
      
      const updatedProfileData = {
        ...data,
        avatar_url: avatarUrl,
        cover_photo_url: coverUrl,
        updated_at: new Date().toISOString(),
      };
      
      return updateProfile(user.id, updatedProfileData);
    },
    onSuccess: () => {
      toast.success('Perfil atualizado com sucesso!');
      queryClient.invalidateQueries({ queryKey: ['profile', user?.id] });
      setIsOpen(false);
    },
    onError: (error: Error) => {
      toast.error(`Falha ao atualizar o perfil: ${error.message}`);
    },
  });

  const onSubmit = (data: ProfileFormValues) => {
    mutation.mutate(data);
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'avatar' | 'cover') => {
    const file = e.target.files?.[0];
    if (file) {
      const previewUrl = URL.createObjectURL(file);
      if (type === 'avatar') {
        setAvatarFile(file);
        setAvatarPreview(previewUrl);
      } else {
        setCoverFile(file);
        setCoverPreview(previewUrl);
      }
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="glass-card text-white sm:max-w-[600px] border-mart-primary/20">
        <DialogHeader>
          <DialogTitle>Editar Perfil</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <ProfileImageUploader
              coverPreview={coverPreview}
              avatarPreview={avatarPreview}
              onCoverClick={() => coverInputRef.current?.click()}
              onAvatarClick={() => avatarInputRef.current?.click()}
              fullName={profile.full_name}
            />
            <input type="file" accept="image/*" ref={coverInputRef} className="hidden" onChange={(e) => handleFileChange(e, 'cover')} />
            <input type="file" accept="image/*" ref={avatarInputRef} className="hidden" onChange={(e) => handleFileChange(e, 'avatar')} />
            
            <ProfileFormFields control={form.control} />
            
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>Cancelar</Button>
              <Button type="submit" disabled={mutation.isPending}>
                {mutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Salvar
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
