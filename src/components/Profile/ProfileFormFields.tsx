
import React from 'react';
import { Control } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { FormField, FormControl, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { ProfileFormValues } from './profile.schema';

interface ProfileFormFieldsProps {
    control: Control<ProfileFormValues>;
}

export const ProfileFormFields: React.FC<ProfileFormFieldsProps> = ({ control }) => {
    return (
        <div className="pt-14 space-y-4">
            <FormField
                control={control}
                name="full_name"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Nome</FormLabel>
                        <FormControl>
                            <Input {...field} className="bg-transparent border-white/20 focus:border-mart-primary" />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />
            <FormField
                control={control}
                name="username"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Nome de usuário</FormLabel>
                        <FormControl>
                            <Input {...field} className="bg-transparent border-white/20 focus:border-mart-primary" />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />
            <FormField
                control={control}
                name="bio"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Biografia</FormLabel>
                        <FormControl>
                            <Textarea {...field} className="bg-transparent border-white/20 focus:border-mart-primary" />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />
        </div>
    );
}
