
import { filterSensitiveContent, filterSensitiveImages, filterSensitiveLinks } from '@/utils/contentSecurity';

interface ParsedContent {
  cleanContent: string;
  images: string[];
  fileLinks: string[];
  hasRestrictedContent: boolean;
}

export const parseCodeblockContent = (
  content: string, 
  links?: string[] | null, 
  shouldFilter: boolean = false
): ParsedContent => {
  // Se deve ser filtrado, aplicar filtros de segurança
  if (shouldFilter) {
    const secureContent = filterSensitiveContent(content, true);
    return {
      cleanContent: secureContent,
      images: [], // Remover todas as imagens para conteúdo restrito
      fileLinks: [], // Remover todos os links para conteúdo restrito
      hasRestrictedContent: true
    };
  }

  // Para usuários autorizados ou conteúdo público, processar normalmente
  const { content: secureContent, hasImages } = filterSensitiveImages(content, false);
  const secureLinks = filterSensitiveLinks(links, false);
  
  // Extrair imagens do conteúdo
  const imageRegex = /!\[.*?\]\((.*?)\)/g;
  const images: string[] = [];
  let match;
  while ((match = imageRegex.exec(secureContent)) !== null) {
    images.push(match[1]);
  }

  return {
    cleanContent: secureContent,
    images,
    fileLinks: secureLinks || [],
    hasRestrictedContent: false
  };
};
