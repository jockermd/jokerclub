
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Loader2, Palette } from 'lucide-react';
import { z } from 'zod';

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Form, FormField, FormControl, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tables } from '@/integrations/supabase/types';
import { updateProfile } from '@/api/profiles';

const founderDisplaySchema = z.object({
  consultant_section_title: z.string().optional(),
  consultant_title: z.string().optional(),
  consultant_bio: z.string().optional(),
  consultant_badge_text: z.string().optional(),
  hourly_rate: z.number().optional(),
});

type FounderDisplayFormValues = z.infer<typeof founderDisplaySchema>;

interface EditFounderDisplayModalProps {
  profile: Tables<'profiles'>;
}

export const EditFounderDisplayModal: React.FC<EditFounderDisplayModalProps> = ({ profile }) => {
  const [isOpen, setIsOpen] = useState(false);
  const queryClient = useQueryClient();

  const form = useForm<FounderDisplayFormValues>({
    resolver: zodResolver(founderDisplaySchema),
    defaultValues: {
      consultant_section_title: (profile as any).consultant_section_title || 'PERFIL DO FUNDADOR',
      consultant_title: (profile as any).consultant_title || '',
      consultant_bio: (profile as any).consultant_bio || '',
      consultant_badge_text: (profile as any).consultant_badge_text || 'FUNDADOR',
      hourly_rate: (profile as any).hourly_rate || undefined,
    },
  });

  useEffect(() => {
    if (isOpen) {
      form.reset({
        consultant_section_title: (profile as any).consultant_section_title || 'PERFIL DO FUNDADOR',
        consultant_title: (profile as any).consultant_title || '',
        consultant_bio: (profile as any).consultant_bio || '',
        consultant_badge_text: (profile as any).consultant_badge_text || 'FUNDADOR',
        hourly_rate: (profile as any).hourly_rate || undefined,
      });
    }
  }, [isOpen, profile, form]);

  const mutation = useMutation({
    mutationFn: async (data: FounderDisplayFormValues) => {
      const updatedData = {
        ...data,
        updated_at: new Date().toISOString(),
      };
      
      return updateProfile(profile.id, updatedData);
    },
    onSuccess: () => {
      toast.success('Display do fundador atualizado com sucesso!');
      queryClient.invalidateQueries({ queryKey: ['allProfiles'] });
      queryClient.invalidateQueries({ queryKey: ['profile', profile.id] });
      setIsOpen(false);
    },
    onError: (error: Error) => {
      toast.error(`Falha ao atualizar display: ${error.message}`);
    },
  });

  const onSubmit = (data: FounderDisplayFormValues) => {
    mutation.mutate(data);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Palette className="mr-2 h-4 w-4" />
          Editar Display
        </Button>
      </DialogTrigger>
      <DialogContent className="glass-card text-white sm:max-w-[600px] border-mart-primary/20">
        <DialogHeader>
          <DialogTitle>Editar Display do Fundador</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="consultant_section_title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Título da Seção (H3)</FormLabel>
                  <FormControl>
                    <Input {...field} value={field.value ?? ''} placeholder="Ex: PERFIL DO FUNDADOR, PERFIL DO SUBADMINISTRADOR" className="bg-transparent border-white/20 focus:border-mart-primary" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="consultant_title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Título do Usuário (H3)</FormLabel>
                  <FormControl>
                    <Input {...field} value={field.value ?? ''} placeholder="Ex: Fundador Sênior, CTO, Subadministrador" className="bg-transparent border-white/20 focus:border-mart-primary" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="consultant_badge_text"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Texto da Badge</FormLabel>
                  <FormControl>
                    <Input {...field} value={field.value ?? ''} placeholder="Ex: FUNDADOR, SUBADMIN, CTO" className="bg-transparent border-white/20 focus:border-mart-primary" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="consultant_bio"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Biografia (Parágrafo)</FormLabel>
                  <FormControl>
                    <Textarea {...field} value={field.value ?? ''} placeholder="Descreva a experiência e especialidades..." className="bg-transparent border-white/20 focus:border-mart-primary min-h-[100px]" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="hourly_rate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Valor por Hora (em R$)</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      {...field} 
                      value={field.value ? field.value / 100 : ''} 
                      onChange={e => field.onChange(e.target.value ? parseFloat(e.target.value) * 100 : null)} 
                      placeholder="Ex: 150" 
                      className="bg-transparent border-white/20 focus:border-mart-primary" 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={mutation.isPending} className="mars-button">
                {mutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Salvar Display
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
