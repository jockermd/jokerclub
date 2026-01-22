
import React from 'react';
import { Control, useWatch } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { FormField, FormControl, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { Switch } from '@/components/ui/switch';
import { ConsultantProfileFormValues } from './consultant.schema';

interface ConsultantFormFieldsProps {
    control: Control<ConsultantProfileFormValues>;
}

export const ConsultantFormFields: React.FC<ConsultantFormFieldsProps> = ({ control }) => {
    const isConsultant = useWatch({
        control,
        name: 'is_consultant',
    });

    return (
        <div className="space-y-4">
            <FormField
                control={control}
                name="is_consultant"
                render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border border-white/20 p-3 shadow-sm bg-black/20">
                        <div className="space-y-0.5">
                            <FormLabel>Oferecer Consultoria</FormLabel>
                            <FormDescription className="text-white/60">
                                Ative para aparecer como consultor e definir seus serviços.
                            </FormDescription>
                        </div>
                        <FormControl>
                            <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                            />
                        </FormControl>
                    </FormItem>
                )}
            />

            {isConsultant && (
                <div className="space-y-4 pt-4 border-t border-white/10">
                     <FormField
                        control={control}
                        name="consultant_title"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Título Profissional</FormLabel>
                                <FormControl>
                                    <Input {...field} value={field.value ?? ''} placeholder="Ex: Engenheiro de Software Sênior" className="bg-transparent border-white/20 focus:border-mart-primary" />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={control}
                        name="consultant_bio"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Bio de Consultor</FormLabel>
                                <FormControl>
                                    <Textarea {...field} value={field.value ?? ''} placeholder="Descreva seus serviços e especialidades." className="bg-transparent border-white/20 focus:border-mart-primary" />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={control}
                        name="hourly_rate"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Valor por Hora (em R$)</FormLabel>
                                <FormControl>
                                    <Input type="number" {...field} value={field.value ? field.value / 100 : ''} onChange={e => field.onChange(e.target.value ? parseFloat(e.target.value) * 100 : null)} placeholder="Ex: 150" className="bg-transparent border-white/20 focus:border-mart-primary" />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>
            )}
        </div>
    );
}
