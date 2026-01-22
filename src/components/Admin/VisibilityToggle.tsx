
import React from 'react';
import { Control, useFormContext } from 'react-hook-form';
import { FormControl, FormField, FormItem, FormLabel } from '@/components/ui/form';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { CodeblockFormInput } from './codeblock.schema';

interface VisibilityToggleProps {
  control: Control<CodeblockFormInput>;
}

const VisibilityToggle: React.FC<VisibilityToggleProps> = ({ control }) => {
  const { setValue, getValues } = useFormContext<CodeblockFormInput>();

  return (
    <FormField
      control={control}
      name="is_public"
      render={({ field }) => (
        <FormItem className="space-y-3">
          <FormLabel>Visibilidade</FormLabel>
          <FormControl>
            <RadioGroup
              onValueChange={(value) => {
                if (value === 'public') {
                  setValue('is_public', true);
                  setValue('is_blurred', false);
                } else if (value === 'blurred') {
                  setValue('is_public', true);
                  setValue('is_blurred', true);
                } else if (value === 'private') {
                  setValue('is_public', false);
                  setValue('is_blurred', false);
                }
              }}
              value={
                !getValues('is_public') ? 'private' :
                getValues('is_blurred') ? 'blurred' : 'public'
              }
              className="flex flex-col space-y-2"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="public" id="public" />
                <label htmlFor="public" className="text-sm font-normal cursor-pointer">
                  Público - Todos podem ver normalmente
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="blurred" id="blurred" />
                <label htmlFor="blurred" className="text-sm font-normal cursor-pointer">
                  Borrado Público - Todos veem borrado
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="private" id="private" />
                <label htmlFor="private" className="text-sm font-normal cursor-pointer">
                  Privado - Apenas você e admins
                </label>
              </div>
            </RadioGroup>
          </FormControl>
        </FormItem>
      )}
    />
  );
};

export default VisibilityToggle;
