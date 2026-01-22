
import * as z from 'zod';

export const profileFormSchema = z.object({
  full_name: z.string().min(2, { message: 'O nome deve ter pelo menos 2 caracteres.' }).max(50),
  username: z.string().min(3, { message: 'O nome de usuário deve ter pelo menos 3 caracteres.' }).max(30).regex(/^[a-zA-Z0-9_]+$/, 'O nome de usuário pode conter apenas letras, números e sublinhados.'),
  bio: z.string().max(160, { message: 'A biografia não pode ter mais de 160 caracteres.' }).optional(),
});

export type ProfileFormValues = z.infer<typeof profileFormSchema>;
