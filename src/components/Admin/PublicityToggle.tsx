
import React from 'react';
import { Control } from 'react-hook-form';
import { FormControl, FormField, FormItem, FormLabel } from '@/components/ui/form';
import { Switch } from '@/components/ui/switch';
import { CodeblockFormInput } from './codeblock.schema';

interface PublicityToggleProps {
  control: Control<CodeblockFormInput>;
}

const PublicityToggle: React.FC<PublicityToggleProps> = ({ control }) => {
  return (
    <FormField
      control={control}
      name="is_public"
      render={({ field }) => (
        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
          <div className="space-y-0.5">
            <FormLabel>Public</FormLabel>
          </div>
          <FormControl>
            <Switch checked={field.value} onCheckedChange={field.onChange} />
          </FormControl>
        </FormItem>
      )}
    />
  );
};

export default PublicityToggle;
