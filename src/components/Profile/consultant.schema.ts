
import { z } from 'zod';

export const consultantProfileFormSchema = z.object({
  is_consultant: z.boolean().default(false),
  consultant_title: z.string().max(100, "O título deve ter no máximo 100 caracteres.").optional().nullable(),
  consultant_bio: z.string().max(500, "A bio deve ter no máximo 500 caracteres.").optional().nullable(),
  hourly_rate: z.coerce.number().positive("A taxa por hora deve ser um número positivo.").optional().nullable(),
});

export type ConsultantProfileFormValues = z.infer<typeof consultantProfileFormSchema>;
