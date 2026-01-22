
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, X, AlertCircle } from 'lucide-react';
import { LinkItem } from './codeblock.schema';

interface LinkManagerProps {
  links: LinkItem[];
  onChange: (links: LinkItem[]) => void;
}

const LinkManager: React.FC<LinkManagerProps> = ({ links, onChange }) => {
  const addLink = () => {
    onChange([...links, { name: '', url: '' }]);
  };

  const removeLink = (index: number) => {
    const newLinks = links.filter((_, i) => i !== index);
    onChange(newLinks);
  };

  const updateLink = (index: number, field: 'name' | 'url', value: string) => {
    const newLinks = [...links];
    newLinks[index] = { ...newLinks[index], [field]: value };
    onChange(newLinks);
  };

  const isValidUrl = (url: string) => {
    if (!url || url.trim() === '') return true; // Empty is valid (will be filtered out)
    
    const trimmed = url.trim();
    
    // If it already has a protocol, validate it's a proper URL
    if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
      try {
        new URL(trimmed);
        return true;
      } catch {
        return false;
      }
    }
    
    // If no protocol, try adding https:// and validate
    try {
      new URL(`https://${trimmed}`);
      return true;
    } catch {
      return false;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label>Links</Label>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={addLink}
          className="flex items-center gap-1"
        >
          <Plus className="h-4 w-4" />
          Add Link
        </Button>
      </div>
      
      {links.map((link, index) => (
        <div key={index} className="space-y-2 p-4 border rounded-md">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium">Link {index + 1}</Label>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => removeLink(index)}
              className="h-6 w-6 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            <div>
              <Label className="text-xs text-muted-foreground">Name</Label>
              <Input
                placeholder="e.g., Download, Demo, GitHub"
                value={link.name}
                onChange={(e) => updateLink(index, 'name', e.target.value)}
              />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">URL</Label>
              <div className="relative">
                <Input
                  placeholder="example.com or https://example.com"
                  value={link.url}
                  onChange={(e) => updateLink(index, 'url', e.target.value)}
                  className={!isValidUrl(link.url) ? 'border-red-500' : ''}
                />
                {link.url && !isValidUrl(link.url) && (
                  <div className="flex items-center gap-1 mt-1 text-xs text-red-500">
                    <AlertCircle className="h-3 w-3" />
                    Please enter a valid URL
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      ))}
      
      {links.length === 0 && (
        <div className="text-center py-4 text-muted-foreground">
          <p>Nenhum link adicionado ainda. Clique em "Add Link" para começar.</p>
        </div>
      )}
    </div>
  );
};

export default LinkManager;
