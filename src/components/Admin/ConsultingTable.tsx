import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getConsultingCardSettings, updateConsultingCardSettings, ConsultingCardSettings } from '@/api/consulting';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { toast } from 'sonner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import Consulting from '@/components/Sidebar/Consulting';
const consultingCardSchema = z.object({
  consultant_name: z.string().min(1, 'Nome é obrigatório.'),
  consultant_title: z.string().min(1, 'Título é obrigatório.'),
  consultant_avatar_url: z.string().url('URL da imagem inválida.').or(z.literal('')),
  rating: z.coerce.number().min(0, 'A avaliação mínima é 0.').max(5, 'A avaliação máxima é 5.'),
  custom_badge_text: z.string().optional(),
  skills: z.preprocess(val => typeof val === 'string' ? val.split(',').map(s => s.trim()).filter(Boolean) : val, z.array(z.string()).optional()),
  availability_text: z.string().optional(),
  button_text: z.string().min(1, 'Texto do botão é obrigatório.'),
  button_link: z.string().url('URL do link inválida.').or(z.literal(''))
});
type ConsultingCardFormValues = z.infer<typeof consultingCardSchema>;
const ConsultingCardEditor = () => {
  const queryClient = useQueryClient();
  const {
    data: settings,
    isLoading
  } = useQuery<ConsultingCardSettings>({
    queryKey: ['consultingCardSettings'],
    queryFn: getConsultingCardSettings
  });
  const form = useForm<ConsultingCardFormValues>({
    resolver: zodResolver(consultingCardSchema),
    defaultValues: {
      consultant_name: '',
      consultant_title: '',
      consultant_avatar_url: '',
      rating: 0,
      custom_badge_text: '',
      skills: [],
      availability_text: '',
      button_text: '',
      button_link: ''
    }
  });
  useEffect(() => {
    if (settings) {
      form.reset({
        ...settings,
        consultant_name: settings.consultant_name || '',
        consultant_title: settings.consultant_title || '',
        rating: settings.rating || 0,
        button_text: settings.button_text || '',
        skills: settings.skills || [],
        consultant_avatar_url: settings.consultant_avatar_url || '',
        custom_badge_text: settings.custom_badge_text || '',
        availability_text: settings.availability_text || '',
        button_link: settings.button_link || ''
      });
    }
  }, [settings, form]);
  const mutation = useMutation({
    mutationFn: updateConsultingCardSettings,
    onSuccess: () => {
      toast.success('Card de consultoria atualizado com sucesso!');
      queryClient.invalidateQueries({
        queryKey: ['consultingCardSettings']
      });
    },
    onError: error => {
      toast.error('Falha ao atualizar o card.', {
        description: error.message
      });
    }
  });
  const onSubmit = (values: ConsultingCardFormValues) => {
    mutation.mutate(values);
  };
  if (isLoading) {
    return <div className="flex justify-center items-center p-8"><Loader2 className="animate-spin text-mart-primary h-8 w-8" /></div>;
  }
  return <div className="grid lg:grid-cols-2 gap-8 items-start">
      <Card className="bg-transparent border-white/10">
        <CardHeader>
          <CardTitle className="text-white">Editar Card de Consultoria</CardTitle>
          <CardDescription>
            Use este formulário para atualizar as informações exibidas no card da barra lateral.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <FormField control={form.control} name="consultant_name" render={({
                field
              }) => <FormItem><FormLabel className="text-white/80">Nome do Consultor</FormLabel><FormControl><Input className="bg-transparent border-white/20 text-white" {...field} /></FormControl><FormMessage /></FormItem>} />
                <FormField control={form.control} name="consultant_title" render={({
                field
              }) => <FormItem><FormLabel className="text-white/80">Título/Cargo</FormLabel><FormControl><Input className="bg-transparent border-white/20 text-white" {...field} /></FormControl><FormMessage /></FormItem>} />
              </div>
              <FormField control={form.control} name="consultant_avatar_url" render={({
              field
            }) => <FormItem><FormLabel className="text-white/80">URL da Imagem do Avatar</FormLabel><FormControl><Input className="bg-transparent border-white/20 text-white" {...field} placeholder="https://..." /></FormControl><FormMessage /></FormItem>} />
              <div className="grid sm:grid-cols-2 gap-4">
                <FormField control={form.control} name="rating" render={({
                field
              }) => <FormItem><FormLabel className="text-white/80">Avaliação (0-5)</FormLabel><FormControl><Input type="number" step="0.1" className="bg-transparent border-white/20 text-white" {...field} /></FormControl><FormMessage /></FormItem>} />
                <FormField control={form.control} name="custom_badge_text" render={({
                field
              }) => <FormItem><FormLabel className="text-white/80">Texto do Badge</FormLabel><FormControl><Input className="bg-transparent border-white/20 text-white" {...field} placeholder="Ex: POPULAR" /></FormControl><FormMessage /></FormItem>} />
              </div>
              <FormField control={form.control} name="skills" render={({
              field
            }) => <FormItem><FormLabel className="text-white/80">Habilidades</FormLabel><FormControl><Input className="bg-transparent border-white/20 text-white" {...field} value={Array.isArray(field.value) ? field.value.join(', ') : ''} /></FormControl><FormDescription>Separe as habilidades por vírgula.</FormDescription><FormMessage /></FormItem>} />
              <FormField control={form.control} name="availability_text" render={({
              field
            }) => <FormItem><FormLabel className="text-white/80">Texto de Disponibilidade</FormLabel><FormControl><Textarea className="bg-transparent border-white/20 text-white" {...field} /></FormControl><FormMessage /></FormItem>} />
              <div className="grid sm:grid-cols-2 gap-4">
                <FormField control={form.control} name="button_text" render={({
                field
              }) => <FormItem><FormLabel className="text-white/80">Texto do Botão</FormLabel><FormControl><Input className="bg-transparent border-white/20 text-white" {...field} /></FormControl><FormMessage /></FormItem>} />
                <FormField control={form.control} name="button_link" render={({
                field
              }) => <FormItem><FormLabel className="text-white/80">Link do Botão</FormLabel><FormControl><Input className="bg-transparent border-white/20 text-white" {...field} placeholder="https://..." /></FormControl><FormMessage /></FormItem>} />
              </div>
              <Button type="submit" disabled={mutation.isPending} className="w-full">
                {mutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Salvar Alterações
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
      <div className="sticky top-24">
        <h3 className="text-lg font-orbitron font-bold text-white mb-4">Pré-visualização</h3>
        <Consulting />
      </div>
    </div>;
};
export default ConsultingCardEditor;
