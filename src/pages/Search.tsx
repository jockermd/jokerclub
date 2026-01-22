
import React, { useState } from 'react';
import ParticleBackground from '@/components/Layout/ParticleBackground';
import Navbar from '@/components/Layout/Navbar';
import { Search as SearchIcon } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import MobileNavbar from '@/components/Layout/MobileNavbar';
import RightSidebar from '@/components/Layout/RightSidebar';
import { useMutation, useQuery } from '@tanstack/react-query';
import { searchAll } from '@/api/search';
import SearchResults from '@/components/Search/SearchResults';
import { getCodeblocks } from '@/api/codeblocks';
import CodeblockCard from '@/components/Search/CodeblockCard';
import { Skeleton } from '@/components/ui/skeleton';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';

const Search = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 4;
  
  const searchMutation = useMutation({
    mutationFn: (query: string) => searchAll(query)
  });
  const {
    data: codeblocks,
    isLoading: isLoadingCodeblocks
  } = useQuery({
    queryKey: ['all-codeblocks'],
    queryFn: getCodeblocks
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setCurrentPage(1); // Reset to first page when searching
      searchMutation.mutate(searchQuery);
    }
  };

  // Separar resultados da pesquisa para exibir codeblocks encontrados na busca
  const searchResults = searchMutation.data || [];
  const searchCodeblocks = searchResults.filter(r => r.result_type === 'codeblock');
  const otherSearchResults = searchResults.filter(r => r.result_type !== 'codeblock');

  // Mostrar codeblocks da pesquisa se houver busca ativa, senão mostrar todos
  const shouldShowSearchResults = searchQuery.trim() && searchMutation.data;
  const codeblocksToShow = shouldShowSearchResults ? searchCodeblocks : codeblocks;

  // Pagination logic
  const totalItems = codeblocksToShow?.length || 0;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentCodeblocks = codeblocksToShow?.slice(startIndex, endIndex) || [];

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return <div className="min-h-screen pb-16 md:pb-0">
      <ParticleBackground />
      <Navbar />
      
      <main className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8">
            <div className="glass-card p-6 bg-transparent rounded-sm border-0">
              <div className="flex items-center gap-4 mb-6">
                <SearchIcon className="h-8 w-8 text-mart-primary" />
                <h1 className="text-2xl font-orbitron font-bold text-white">Buscar</h1>
              </div>
              
              <form onSubmit={handleSearch} className="mb-6">
                <div className="flex flex-col md:flex-row gap-2">
                  <Input type="text" placeholder="Prompts, usuários, tweets e codeblocks..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="bg-transparent border-white/20 text-white" />
                  <Button type="submit" className="mars-button" disabled={searchMutation.isPending}>
                    <SearchIcon className="h-4 w-4" />
                    <span>Buscar</span>
                  </Button>
                </div>
              </form>
              
              {/* Resultados da busca (usuários e tweets) */}
              {shouldShowSearchResults && otherSearchResults.length > 0 && (
                <SearchResults results={otherSearchResults} isLoading={searchMutation.isPending} isError={searchMutation.isError} />
              )}
              
              {/* Mensagem quando não há resultados */}
              {shouldShowSearchResults && searchResults.length === 0 && !searchMutation.isPending && !searchMutation.isError && (
                <div className="h-40 flex flex-col items-center justify-center text-white/60">
                  <SearchIcon className="h-8 w-8" />
                  <p className="text-lg mt-2">Nenhum resultado encontrado</p>
                  <p className="text-sm">Tente buscar por outras palavras-chave.</p>
                </div>
              )}
            </div>

            {/* Seção de Codeblocks */}
            <div className="mt-8">
              <div className="flex items-center gap-4 mb-6">
                <h2 className="text-xl font-orbitron font-bold text-white">
                  {shouldShowSearchResults ? 'Codeblocks Encontrados' : 'Todos os Codeblocks'}
                </h2>
                {shouldShowSearchResults && searchCodeblocks.length > 0 && (
                  <span className="text-sm text-white/60">({searchCodeblocks.length} resultado{searchCodeblocks.length !== 1 ? 's' : ''})</span>
                )}
              </div>
              
              {searchMutation.isPending ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Skeleton className="h-48 w-full bg-slate-800" />
                  <Skeleton className="h-48 w-full bg-slate-800" />
                </div>
              ) : shouldShowSearchResults ? (
                // Exibir codeblocks encontrados na pesquisa
                searchCodeblocks.length > 0 ? (
                  <>
                    <div className="grid grid-cols-1 gap-6">
                      {currentCodeblocks.map(result => {
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
                          is_blurred: result.codeblock_is_blurred ?? false, // Usar o valor real do banco
                          profiles: {
                            username: result.author_username,
                            full_name: result.author_full_name,
                            avatar_url: result.author_avatar_url
                          }
                        };
                        return <CodeblockCard key={`codeblock-${result.result_id}`} codeblock={codeblockData as any} />;
                      })}
                    </div>
                    
                    {/* Paginação para resultados de busca */}
                    {totalPages > 1 && (
                      <div className="mt-8">
                        <Pagination>
                          <PaginationContent>
                            <PaginationItem>
                              <PaginationPrevious 
                                onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                                className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                              />
                            </PaginationItem>
                            
                            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                              <PaginationItem key={page}>
                                <PaginationLink
                                  onClick={() => handlePageChange(page)}
                                  isActive={currentPage === page}
                                  className="cursor-pointer"
                                >
                                  {page}
                                </PaginationLink>
                              </PaginationItem>
                            ))}
                            
                            <PaginationItem>
                              <PaginationNext 
                                onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                                className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                              />
                            </PaginationItem>
                          </PaginationContent>
                        </Pagination>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-center text-white/60 py-10 glass-card rounded-xl">
                    <p>Nenhum codeblock encontrado para "{searchQuery}".</p>
                  </div>
                )
              ) : (
                // Exibir todos os codeblocks quando não há pesquisa
                isLoadingCodeblocks ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Skeleton className="h-48 w-full bg-slate-800" />
                    <Skeleton className="h-48 w-full bg-slate-800" />
                  </div>
                ) : codeblocks && codeblocks.length > 0 ? (
                  <>
                    <div className="grid grid-cols-1 gap-6">
                      {currentCodeblocks.map(codeblock => <CodeblockCard key={codeblock.id} codeblock={codeblock} />)}
                    </div>
                    
                    {/* Paginação para todos os codeblocks */}
                    {totalPages > 1 && (
                      <div className="mt-8">
                        <Pagination>
                          <PaginationContent>
                            <PaginationItem>
                              <PaginationPrevious 
                                onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                                className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                              />
                            </PaginationItem>
                            
                            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                              <PaginationItem key={page}>
                                <PaginationLink
                                  onClick={() => handlePageChange(page)}
                                  isActive={currentPage === page}
                                  className="cursor-pointer"
                                >
                                  {page}
                                </PaginationLink>
                              </PaginationItem>
                            ))}
                            
                            <PaginationItem>
                              <PaginationNext 
                                onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                                className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                              />
                            </PaginationItem>
                          </PaginationContent>
                        </Pagination>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-center text-white/60 py-10 glass-card rounded-xl">
                    <p>Nenhum codeblock encontrado.</p>
                  </div>
                )
              )}
            </div>

          </div>
          <div className="lg:col-span-4">
            <RightSidebar />
          </div>
        </div>
      </main>
      
      <MobileNavbar />
    </div>;
};

export default Search;
