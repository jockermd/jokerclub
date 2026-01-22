
/**
 * Utilitários para filtrar conteúdo sensível em codeblocks
 */

export const filterSensitiveContent = (content: string, shouldFilter: boolean): string => {
  if (!shouldFilter || !content) return content;
  
  // Limitar a 50 caracteres para conteúdo restrito
  const preview = content.substring(0, 50);
  return preview + (content.length > 50 ? '...' : '');
};

export const filterDescription = (description: string | null | undefined, shouldFilter: boolean): string | null => {
  if (!shouldFilter || !description) return description;
  
  // Limitar a 30 caracteres para descrição restrita
  const preview = description.substring(0, 30);
  return preview + (description.length > 30 ? '...' : '');
};

export const filterSensitiveImages = (content: string, shouldFilter: boolean): { content: string; hasImages: boolean } => {
  if (!shouldFilter) {
    const hasImages = /!\[.*?\]\(.*?\)/.test(content);
    return { content, hasImages };
  }
  
  // Remover todas as imagens do conteúdo se deve ser filtrado
  const filteredContent = content.replace(/!\[.*?\]\(.*?\)/g, '[Imagem removida]');
  return { content: filteredContent, hasImages: true };
};

export const filterSensitiveLinks = (links: string[] | null | undefined, shouldFilter: boolean): string[] => {
  if (!shouldFilter || !links) return links || [];
  
  // Retornar array vazio se deve ser filtrado
  return [];
};
