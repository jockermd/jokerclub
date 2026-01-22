
import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { createCodeblock, updateCodeblock, Codeblock, NewCodeblock, UpdateCodeblock } from '@/api/codeblocks';
import { useAuth } from '@/contexts/AuthContext';
import CodeblockForm from './CodeblockForm';
import { CodeblockFormData, LinkItem } from './codeblock.schema';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Edit, PlusCircle } from 'lucide-react';

interface CodeblockModalProps {
  codeblock?: Codeblock | null;
}

const CodeblockModal = ({ codeblock }: CodeblockModalProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Helper function to convert LinkItem[] to string[] for API compatibility
  const convertLinksForApi = (links: (string | LinkItem)[]): string[] => {
    return links.map(link => {
      if (typeof link === 'string') {
        return link;
      }
      // Convert LinkItem to a string format that can be parsed back
      return `${link.name}|${link.url}`;
    });
  };

  const mutation = useMutation({
    mutationFn: (data: { formData: CodeblockFormData & { uploadedFiles?: Array<{ url: string; name: string; type: 'image' | 'zip' }> }; id?: string }) => {
      if (!user) throw new Error('User not authenticated');

      const { title, description, content, language, category, tags, links, is_public, is_blurred, uploadedFiles } = data.formData;
      
      console.log('Processing links for API:', links);
      
      // Adicionar URLs dos arquivos uploadados no content
      let finalContent = content;
      if (uploadedFiles && uploadedFiles.length > 0) {
        const fileReferences = uploadedFiles.map(file => {
          if (file.type === 'image') {
            return `\n\n![${file.name}](${file.url})`;
          } else {
            return `\n\n[📁 ${file.name}](${file.url})`;
          }
        }).join('');
        finalContent = content + fileReferences;
      }

      // Convert links to API format - ensure we're handling the correct type
      const apiLinks = convertLinksForApi(links as (string | LinkItem)[]);
      console.log('Converted links for API:', apiLinks);

      if (data.id) {
        const payload: UpdateCodeblock = { title, description, content: finalContent, language, category, tags, links: apiLinks, is_public, is_blurred };
        return updateCodeblock(data.id, payload);
      }
      
      const payload: NewCodeblock = {
        title,
        content: finalContent,
        description,
        language,
        category,
        tags,
        links: apiLinks,
        is_public,
        is_blurred,
        created_by: user.id,
      };
      
      console.log('Final payload:', payload);
      return createCodeblock(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['codeblocks'] });
      toast.success(codeblock ? 'Codeblock updated successfully!' : 'Codeblock created successfully!');
      setIsOpen(false);
    },
    onError: (error) => {
      console.error('Mutation error:', error);
      let errorMessage = error.message;
      try {
        const parsedError = JSON.parse(errorMessage);
        if (Array.isArray(parsedError) && parsedError[0].message) {
            errorMessage = parsedError.map((e: any) => `${e.path.join('.')} - ${e.message}`).join(', ');
        }
      } catch (e) {
        // Not a JSON error, use the original message
      }
      toast.error(`Error: ${errorMessage}`);
    },
  });

  const handleSubmit = (data: CodeblockFormData & { uploadedFiles?: Array<{ url: string; name: string; type: 'image' | 'zip' }> }) => {
    console.log('Form submitted with data:', data);
    mutation.mutate({ formData: data, id: codeblock?.id });
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {codeblock ? (
          <Button variant="ghost" size="icon">
            <Edit className="h-4 w-4" />
          </Button>
        ) : (
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" /> Add Codeblock
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[625px]">
        <DialogHeader>
          <DialogTitle>{codeblock ? 'Edit Codeblock' : 'Create New Codeblock'}</DialogTitle>
        </DialogHeader>
        <CodeblockForm
          onSubmit={handleSubmit}
          isSubmitting={mutation.isPending}
          defaultValues={codeblock}
        />
      </DialogContent>
    </Dialog>
  );
};

export default CodeblockModal;
