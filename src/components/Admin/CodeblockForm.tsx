
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { codeblockSchema, CodeblockFormData, CodeblockFormInput, LinkItem } from './codeblock.schema';
import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import { Codeblock } from '@/api/codeblocks';
import { Loader2 } from 'lucide-react';
import LinkManager from './LinkManager';
import BasicInfoFields from './BasicInfoFields';
import MetadataFields from './MetadataFields';
import VisibilityToggle from './VisibilityToggle';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';

interface CodeblockFormProps {
  onSubmit: (data: CodeblockFormData & { uploadedFiles?: Array<{ url: string; name: string; type: 'image' | 'zip' }> }) => void;
  isSubmitting: boolean;
  defaultValues?: Codeblock | null;
}

const CodeblockForm = ({ onSubmit, isSubmitting, defaultValues }: CodeblockFormProps) => {
    const [uploadedFiles, setUploadedFiles] = useState<Array<{ url: string; name: string; type: 'image' | 'zip' }>>([]);
    const [links, setLinks] = useState<LinkItem[]>([]);
    
    const form = useForm<CodeblockFormInput>({
        resolver: zodResolver(codeblockSchema),
        defaultValues: {
            title: defaultValues?.title ?? '',
            description: defaultValues?.description ?? '',
            content: defaultValues?.content ?? '',
            language: defaultValues?.language ?? '',
            category: defaultValues?.category ?? '',
            tags: defaultValues?.tags?.join(', ') ?? '',
            links: [], // We'll handle links separately with LinkManager
            is_public: defaultValues?.is_public ?? true,
            is_blurred: defaultValues?.is_blurred ?? false,
        },
    });

    // Initialize links from defaultValues with backward compatibility
    useEffect(() => {
        if (defaultValues?.links) {
            const convertedLinks: LinkItem[] = defaultValues.links.map((link, index) => {
                if (typeof link === 'string') {
                    // Check if it's the new format (name|url)
                    if (link.includes('|')) {
                        const [name, url] = link.split('|');
                        return { name: name.trim(), url: url.trim() };
                    }
                    // Old format - use generic name
                    return { name: `Link ${index + 1}`, url: link };
                }
                // Already in correct format
                return link as LinkItem;
            });
            setLinks(convertedLinks);
        }
    }, [defaultValues]);

    const handleFileUpload = (url: string, fileName: string, type: 'image' | 'zip') => {
        setUploadedFiles(prev => [...prev, { url, name: fileName, type }]);
    };

    const handleFileRemove = (index: number) => {
        setUploadedFiles(prev => prev.filter((_, i) => i !== index));
    };

    const handleFormSubmit = (data: CodeblockFormInput) => {
        console.log('Form data before validation:', data);
        
        // Filter out empty links before validation
        const filteredLinks = links.filter(link => 
            link.name && link.name.trim() !== '' && 
            link.url && link.url.trim() !== ''
        );
        
        try {
            // Transform the input data to output data using the schema
            const transformedData = codeblockSchema.parse({
                ...data,
                links: filteredLinks // Use the filtered links
            });
            console.log('Transformed data after validation:', transformedData);
            onSubmit({ ...transformedData, uploadedFiles });
        } catch (error) {
            console.error('Schema validation error:', error);
            if (error instanceof Error) {
                toast.error(`Validation error: ${error.message}`);
            } else {
                toast.error('Please check all fields and try again');
            }
        }
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-4">
                <BasicInfoFields
                    control={form.control}
                    uploadedFiles={uploadedFiles}
                    onFileUpload={handleFileUpload}
                    onFileRemove={handleFileRemove}
                />
                
                <MetadataFields control={form.control} />
                
                <div className="space-y-2">
                    <LinkManager links={links} onChange={setLinks} />
                </div>

                <VisibilityToggle control={form.control} />

                <Button type="submit" disabled={isSubmitting} className="w-full">
                    {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {defaultValues ? 'Update Codeblock' : 'Create Codeblock'}
                </Button>
            </form>
        </Form>
    );
};

export default CodeblockForm;
