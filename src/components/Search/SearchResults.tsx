
import React from 'react';
import { SearchResult } from '@/api/search';
import UserSearchResultCard from './UserSearchResultCard';
import TweetSearchResultCard from './TweetSearchResultCard';
import { Loader2, ServerCrash, SearchX } from 'lucide-react';
import CodeblockCard from './CodeblockCard';

interface SearchResultsProps {
  results: SearchResult[] | undefined;
  isLoading: boolean;
  isError: boolean;
}

const SearchResults: React.FC<SearchResultsProps> = ({
  results,
  isLoading,
  isError,
}) => {
  if (isLoading) {
    return (
      <div className="h-40 flex flex-col items-center justify-center text-white/60">
        <Loader2 className="h-8 w-8 animate-spin text-mart-primary" />
        <p className="text-lg mt-2">Buscando...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="h-40 flex flex-col items-center justify-center text-red-500/80">
        <ServerCrash className="h-8 w-8" />
        <p className="text-lg mt-2">Ocorreu um erro na busca.</p>
        <p className="text-sm">Tente novamente mais tarde.</p>
      </div>
    );
  }

  if (results?.length === 0) {
    return (
      <div className="h-40 flex flex-col items-center justify-center text-white/60">
        <SearchX className="h-8 w-8" />
        <p className="text-lg mt-2">Nenhum resultado encontrado</p>
        <p className="text-sm">Tente buscar por outras palavras-chave.</p>
      </div>
    );
  }

  const codeblocks = results?.filter(r => r.result_type === 'codeblock') ?? [];
  const otherResults = results?.filter(r => r.result_type !== 'codeblock') ?? [];

  return (
    <div className="mt-6 space-y-8">
      {otherResults.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-xl font-bold text-white font-orbitron">Usuários & Tweets</h3>
          {otherResults.map(result => {
            if (result.result_type === 'profile') {
              return <UserSearchResultCard key={`user-${result.result_id}`} user={result} />;
            }
            if (result.result_type === 'tweet') {
              return <TweetSearchResultCard key={`tweet-${result.result_id}`} tweet={result} />;
            }
            return null;
          })}
        </div>
      )}

      {codeblocks.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-xl font-bold text-white font-orbitron">Codeblocks</h3>
          {codeblocks.map(result => {
            const codeblockData = {
              id: result.result_id,
              title: result.codeblock_title!,
              description: result.codeblock_description,
              content: result.codeblock_content!,
              language: result.codeblock_language,
              category: result.codeblock_category,
              tags: result.codeblock_tags,
              links: result.codeblock_links,
              created_at: result.result_created_at,
              updated_at: result.result_created_at,
              created_by: result.author_id,
              is_public: result.codeblock_is_public ?? true,
              is_blurred: false, // Por padrão, assumir que não é blurred para resultados de busca
              profiles: {
                username: result.author_username,
                full_name: result.author_full_name,
                avatar_url: result.author_avatar_url
              }
            };
            return <CodeblockCard key={`codeblock-${result.result_id}`} codeblock={codeblockData as any} />;
          })}
        </div>
      )}
    </div>
  );
};

export default SearchResults;
