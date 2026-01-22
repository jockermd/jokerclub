import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tables } from '@/integrations/supabase/types';
import { Loader2, QrCode } from 'lucide-react';
import PaymentQRModal from '@/components/Store/PaymentQRModal';

const formSchema = z.object({
  name: z.string().min(2, { message: 'O nome deve ter pelo menos 2 caracteres.' }),
  description: z.string().optional(),
  price: z.coerce.number().int().min(1, { message: 'O preço deve ser de pelo menos 1 centavo.' }),
  image_url: z.string().url({ message: 'Por favor, insira uma URL válida.' }).optional().or(z.literal('')),
  purchase_link: z.string().optional(),
});

type ProductFormValues = z.infer<typeof formSchema>;

interface ProductFormProps {
  product?: Tables<'products'> | null;
  onSubmit: (values: ProductFormValues) => void;
  onCancel: () => void;
  isSubmitting: boolean;
}

const ProductForm: React.FC<ProductFormProps> = ({ product, onSubmit, onCancel, isSubmitting }) => {
  const [isQRModalOpen, setIsQRModalOpen] = useState(false);
  
  const form = useForm<ProductFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: product?.name || '',
      description: product?.description || '',
      price: product?.price || 0,
      image_url: product?.image_url || '',
      purchase_link: '/lovable-uploads/b7708d78-e9ad-4fa1-bb5a-9214b7304437.png',
    },
  });

  const handleFormSubmit = (values: ProductFormValues) => {
    // Sempre define o purchase_link como a imagem do QR Code
    const formData = {
      ...values,
      purchase_link: '/lovable-uploads/b7708d78-e9ad-4fa1-bb5a-9214b7304437.png'
    };
    onSubmit(formData);
  };

  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-white/70">Nome</FormLabel>
                <FormControl>
                  <Input placeholder="Nome do Produto" {...field} className="bg-white border-gray-300 text-black" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-white/70">Descrição</FormLabel>
                <FormControl>
                  <Textarea placeholder="Descrição do Produto" {...field} className="bg-white border-gray-300 text-black" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="price"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-white/70">Preço (em centavos)</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="5000" {...field} className="bg-white border-gray-300 text-black" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="image_url"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-white/70">URL da Imagem</FormLabel>
                <FormControl>
                  <Input placeholder="https://example.com/image.png" {...field} className="bg-white border-gray-300 text-black" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormItem>
            <FormLabel className="text-white/70">Método de Pagamento</FormLabel>
            <FormControl>
              <Button
                type="button"
                onClick={() => setIsQRModalOpen(true)}
                className="w-full bg-white border-gray-300 text-black hover:bg-gray-100 justify-start"
                variant="outline"
              >
                <QrCode className="mr-2 h-4 w-4" />
                QR Code PIX - Clique para visualizar
              </Button>
            </FormControl>
          </FormItem>
          
          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
                Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting} className="mars-button">
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isSubmitting ? 'Salvando...' : 'Salvar'}
            </Button>
          </div>
        </form>
      </Form>
      
      <PaymentQRModal 
        isOpen={isQRModalOpen} 
        onClose={() => setIsQRModalOpen(false)} 
      />
    </>
  );
};

export default ProductForm;
