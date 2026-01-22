
import React from 'react';
import { Button } from '@/components/ui/button';
import { Download, ExternalLink } from 'lucide-react';

interface CodeblockFileLinksProps {
  fileLinks: string[];
  isBlurred?: boolean;
}

const CodeblockFileLinks: React.FC<CodeblockFileLinksProps> = ({ fileLinks, isBlurred }) => {
  if (fileLinks.length === 0) return null;

  // Helper function to extract the actual URL from the link string
  const extractUrl = (link: string): string => {
    // If the link contains a pipe separator (|), extract the URL part after it
    if (link.includes('|')) {
      const parts = link.split('|');
      return parts[parts.length - 1]; // Get the last part which should be the URL
    }
    return link; // Return the original link if no pipe separator is found
  };

  return (
    <div className="space-y-2">
      <h4 className="text-sm font-semibold text-white/80 flex items-center gap-2">
        <Download className="h-4 w-4" />
        Archives
      </h4>
      <div className="flex flex-wrap gap-2">
        {fileLinks.map((link, index) => {
          const actualUrl = extractUrl(link);
          return (
            <Button
              key={index}
              variant="outline"
              size="sm"
              asChild
              className={`text-xs border-mart-primary/50 hover:border-mart-primary hover:bg-mart-primary/10 ${
                isBlurred ? 'opacity-60 pointer-events-none' : ''
              }`}
            >
              <a
                href={actualUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1"
              >
                <ExternalLink className="h-3 w-3" />
                {`Link ${index + 1}`}
              </a>
            </Button>
          );
        })}
      </div>
    </div>
  );
};

export default CodeblockFileLinks;
