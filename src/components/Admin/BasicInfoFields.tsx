
import React from 'react';
import { Control } from 'react-hook-form';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { CodeblockFormInput } from './codeblock.schema';
import FileUploadComponent from './FileUploadComponent';

interface BasicInfoFieldsProps {
  control: Control<CodeblockFormInput>;
  uploadedFiles: Array<{ url: string; name: string; type: 'image' | 'zip' }>;
  onFileUpload: (url: string, fileName: string, type: 'image' | 'zip') => void;
  onFileRemove: (index: number) => void;
}

const BasicInfoFields: React.FC<BasicInfoFieldsProps> = ({
  control,
  uploadedFiles,
  onFileUpload,
  onFileRemove
}) => {
  return (
    <>
      <FormField
        control={control}
        name="title"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Title</FormLabel>
            <FormControl>
              <Input placeholder="e.g., React Fetch Hook" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={control}
        name="description"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Description</FormLabel>
            <FormControl>
              <Textarea placeholder="A brief description of the codeblock." {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={control}
        name="content"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Content</FormLabel>
            <FormControl>
              <Textarea placeholder="Paste your code or prompt here." {...field} rows={10} className="font-mono" />
            </FormControl>
            <div className="mt-2">
              <FileUploadComponent
                onFileUpload={onFileUpload}
                uploadedFiles={uploadedFiles}
                onFileRemove={onFileRemove}
              />
            </div>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
};

export default BasicInfoFields;
