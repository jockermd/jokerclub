
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Loader2, Briefcase } from 'lucide-react';

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import { Tables } from '@/integrations/supabase/types';
import { updateProfile } from '@/api/profiles';
import { useAuth } from '@/contexts/AuthContext';
import { consultantProfileFormSchema, ConsultantProfileFormValues } from './consultant.schema';
import { ConsultantFormFields } from './ConsultantFormFields';

interface EditConsultantProfileModalProps {
  profile: Tables<'profiles'>;
}

export const EditConsultantProfileModal: React.FC<EditConsultantProfileModalProps> = ({ profile }) => {
  const [isOpen, setIsOpen] = useState(false);
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const form = useForm<ConsultantProfileFormValues>({
    resolver: zodResolver(consultantProfileFormSchema),
    defaultValues: {
      is_consultant: profile.is_consultant || false,
      consultant_title: profile.consultant_title || '',
      consultant_bio: profile.consultant_bio || '',
      hourly_rate: profile.hourly_rate || undefined,
    },
    mode: 'onChange',
  });

  useEffect(() => {
    if (isOpen) {
      form.reset({
        is_consultant: profile.is_consultant || false,
        consultant_title: profile.consultant_title || '',
        consultant_bio: profile.consultant_bio || '',
        hourly_rate: profile.hourly_rate || undefined,
      });
    }
  }, [isOpen, profile, form]);

  const mutation = useMutation({
    mutationFn: async (data: ConsultantProfileFormValues) => {
      if (!user) throw new Error('Você deve estar logado para atualizar seu perfil.');

      const updatedProfileData = {
        ...data,
        updated_at: new Date().toISOString(),
      };
      
      return updateProfile(user.id, updatedProfileData);
    },
    onSuccess: () => {
      toast.success('Perfil de consultor atualizado com sucesso!');
      queryClient.invalidateQueries({ queryKey: ['profile', user?.id] });
      setIsOpen(false);
    },
    onError: (error: Error) => {
      toast.error(`Falha ao atualizar o perfil: ${error.message}`);
    },
  });

  const onSubmit = (data: ConsultantProfileFormValues) => {
    mutation.mutate(data);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Briefcase className="mr-2 h-4 w-4" />
          Perfil de Consultor
        </Button>
      </DialogTrigger>
      <DialogContent className="glass-card text-white sm:max-w-[600px] border-mart-primary/20">
        <DialogHeader>
          <DialogTitle>Editar Perfil de Consultor</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <ConsultantFormFields control={form.control} />
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
