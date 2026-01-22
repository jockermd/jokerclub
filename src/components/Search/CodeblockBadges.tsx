
import React from 'react';
import { Badge } from '@/components/ui/badge';

interface CodeblockBadgesProps {
  language?: string | null;
  category?: string | null;
  tags?: string[] | null;
  isPublic: boolean;
  isBlurred?: boolean;
}

const CodeblockBadges: React.FC<CodeblockBadgesProps> = ({ 
  language, 
  category, 
  tags 
}) => {
  return (
    <div className="flex flex-wrap gap-2">
      {language && (
        <Badge variant="secondary" className="text-xs">
          {language}
        </Badge>
      )}
      {category && (
        <Badge variant="outline" className="text-xs">
          {category}
        </Badge>
      )}
      {tags && tags.length > 0 && (
        <>
          {tags.slice(0, 2).map((tag, index) => (
            <Badge key={index} variant="outline" className="text-xs">
              #{tag}
            </Badge>
          ))}
          {tags.length > 2 && (
            <Badge variant="outline" className="text-xs">
              +{tags.length - 2}
            </Badge>
          )}
        </>
      )}
    </div>
  );
};

export default CodeblockBadges;
