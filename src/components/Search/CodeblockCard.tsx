import React, { useState } from 'react';
import { Copy, AlertTriangle, Lock, ExternalLink, CheckCircle, Eye } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useCodeblockAccess } from '@/hooks/useCodeblockAccess';
import { useAuth } from '@/contexts/AuthContext';
import { parseCodeblockContent } from './utils/parseCodeblockContent';
import CodeblockContent from './CodeblockContent';
import CodeblockImages from './CodeblockImages';
import CodeblockFileLinks from './CodeblockFileLinks';
import CodeblockBadges from './CodeblockBadges';
import CodeblockPrivacyOverlay from './CodeblockPrivacyOverlay';
import { filterDescription } from '@/utils/contentSecurity';

interface CodeblockCardProps {
  codeblock: {
    id: string;
    title: string;
    description?: string | null;
    content: string;
    language?: string | null;
    category?: string | null;
    tags?: string[] | null;
    links?: string[] | null;
    created_at: string;
    updated_at: string;
    created_by: string;
    is_public: boolean;
    is_blurred: boolean;
    profiles?: {
      username: string | null;
      full_name: string | null;
      avatar_url: string | null;
    } | null;
  };
}

const CodeblockCard: React.FC<CodeblockCardProps> = ({ codeblock }) => {
  const { user } = useAuth();
  const { data: accessInfo } = useCodeblockAccess(codeblock.id, codeblock.created_by);
  const [isContentRevealed, setIsContentRevealed] = useState(false);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(codeblock.content);
    toast.success('Code copied to clipboard!');
  };

  const handleRevealContent = () => {
    setIsContentRevealed(true);
  };

  const isPrivate = !codeblock.is_public;
  const isBlurred = codeblock.is_blurred;
  const shouldFilter = isBlurred && !user;
  const hasAccess = user && (accessInfo?.hasAccess || accessInfo?.isOwner || accessInfo?.isAdmin);
  const shouldFilterForUser = isBlurred && user && !hasAccess;
  const needsFiltering = shouldFilter || shouldFilterForUser;

  const filteredDescription = needsFiltering && codeblock.description 
    ? filterDescription(codeblock.description, true) 
    : codeblock.description;

  const { cleanContent, images, fileLinks, hasRestrictedContent } = parseCodeblockContent(
    codeblock.content, 
    codeblock.links, 
    needsFiltering
  );

  const shouldShowOverlay = isPrivate || needsFiltering;

  return (
    <Card className="glass-card border-mart-primary/20 relative overflow-hidden bg-transparent">
      {/* Badge de acesso liberado para conteúdo pago com acesso - posicionado no canto superior direito */}
      {isContentRevealed && isBlurred && hasAccess && (
        <div className="absolute top-4 right-4 z-20">
          <Badge variant="outline" className="bg-green-500/20 text-green-300 border-green-500/50">
            <CheckCircle className="h-3 w-3 mr-1" />
            Acesso Liberado
          </Badge>
        </div>
      )}

      {/* Badge de conteúdo restrito APENAS para conteúdo pago sem acesso - posicionado no canto superior esquerdo */}
      {isContentRevealed && needsFiltering && hasRestrictedContent && (
        <div className="absolute top-1 left-4 z-20">
          <Badge variant="outline" className="bg-orange-500/20 text-orange-300 border-orange-500/50">
            <AlertTriangle className="h-3 w-3 mr-1" />
            Conteúdo Parcial
          </Badge>
        </div>
      )}

      <CardHeader className="pb-3 bg-transparent">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-white mb-2 font-orbitron">{codeblock.title}</h3>
            {filteredDescription && (
              <p className="text-white/70 text-sm mb-3 line-clamp-2">{filteredDescription}</p>
            )}
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleCopyCode}
            className="text-white/60 hover:text-white shrink-0 ml-2"
            disabled={!isContentRevealed || shouldShowOverlay}
          >
            <Copy className="h-4 w-4" />
          </Button>
        </div>

        {isContentRevealed && (
          <CodeblockBadges 
            language={codeblock.language} 
            category={codeblock.category} 
            tags={codeblock.tags} 
            isPublic={codeblock.is_public}
            isBlurred={needsFiltering}
          />
        )}

        {/* Aviso de conteúdo restrito APENAS para conteúdo pago sem acesso - com margem superior para não sobrepor */}
        {isContentRevealed && needsFiltering && hasRestrictedContent && (
          <div className="p-3 bg-orange-500/10 border border-orange-500/30 rounded-lg mt-3">
            <div className="flex items-center gap-2 text-orange-300 text-sm">
              <Lock className="h-4 w-4" />
              Este codeblock possui conteúdo restrito. Algumas informações foram ocultadas.
            </div>
          </div>
        )}
      </CardHeader>

      <CardContent className="pt-0 bg-transparent">
        {!isContentRevealed ? (
          /* Access Block - Bloco de acesso antes de revelar o conteúdo */
          <div className="space-y-4">
            <div className="bg-mart-primary/5 border border-mart-primary/20 rounded-lg p-6 text-center">
              <div className="flex flex-col items-center gap-3">
                <div 
                  className={`p-3 rounded-full cursor-pointer transition-all duration-300 hover:scale-105 animate-particle-pulse ring-1 ${
                    needsFiltering 
                      ? 'bg-red-500/10 ring-red-500/30 hover:ring-red-500/50' 
                      : 'bg-mart-primary/10 ring-mart-primary/30 hover:ring-mart-primary/50'
                  }`}
                  onClick={handleRevealContent}
                >
                  <Eye className={`h-6 w-6 ${needsFiltering ? 'text-red-400' : 'text-mart-primary'}`} />
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Overlay de privacidade */}
            {shouldShowOverlay && (
              <CodeblockPrivacyOverlay isPublic={codeblock.is_public} isBlurred={needsFiltering} />
            )}

            <CodeblockContent content={cleanContent} isBlurred={shouldShowOverlay} />

            <CodeblockImages images={images} isBlurred={shouldShowOverlay} />

            <CodeblockFileLinks fileLinks={fileLinks} isBlurred={shouldShowOverlay} />
          </div>
        )}

        {/* Autor e data */}
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/10">
          <div className="flex items-center gap-2">
            <Avatar className="h-6 w-6">
              <AvatarImage src={codeblock.profiles?.avatar_url || ''} />
              <AvatarFallback className="text-xs">
                {codeblock.profiles?.full_name?.[0] || 'U'}
              </AvatarFallback>
            </Avatar>
            <span className="text-sm text-white/60">
              {codeblock.profiles?.full_name || codeblock.profiles?.username || 'Usuário'}
            </span>
          </div>
          <span className="text-xs text-white/40">
            {format(new Date(codeblock.created_at), 'dd/MM/yyyy', { locale: ptBR })}
          </span>
        </div>
      </CardContent>
    </Card>
  );
};

export default CodeblockCard;
