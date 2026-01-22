
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getCodeblocks, Codeblock } from '@/api/codeblocks';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Loader2, AlertTriangle, ExternalLink, Eye, EyeOff, Lock } from 'lucide-react';
import CodeblockModal from './CodeblockModal';
import DeleteCodeblockDialog from './DeleteCodeblockDialog';
import CodeblockAccessModal from './CodeblockAccessModal';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';

type CodeblockWithProfile = Codeblock & {
  profiles: {
    id: string;
    username: string | null;
    full_name: string | null;
    avatar_url: string | null;
  } | null;
};

const CodeblocksTable = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
  const { data: codeblocks, isLoading, isError, error } = useQuery<CodeblockWithProfile[], Error>({
    queryKey: ['codeblocks'],
    queryFn: getCodeblocks
  });

  const renderLinks = (links: string[] | null) => {
    if (!links || links.length === 0) return 'N/A';
    
    return (
      <div className="flex flex-wrap gap-1">
        {links.slice(0, 2).map((link, index) => (
          <a
            key={index}
            href={link}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 underline"
          >
            <ExternalLink className="h-3 w-3" />
            Link {index + 1}
          </a>
        ))}
        {links.length > 2 && (
          <span className="text-xs text-muted-foreground">
            +{links.length - 2} more
          </span>
        )}
      </div>
    );
  };

  const getVisibilityInfo = (codeblock: CodeblockWithProfile) => {
    if (!codeblock.is_public) {
      return {
        icon: <Lock className="h-4 w-4 text-red-500" />,
        badge: <Badge variant="destructive" className="bg-red-500/20 text-red-300 border-red-500/30">Privado</Badge>,
        shouldBlur: true
      };
    } else if (codeblock.is_blurred) {
      return {
        icon: <EyeOff className="h-4 w-4 text-orange-500" />,
        badge: <Badge variant="outline" className="bg-orange-500/20 text-orange-300 border-orange-500/30">Borrado Público</Badge>,
        shouldBlur: false
      };
    } else {
      return {
        icon: <Eye className="h-4 w-4 text-green-500" />,
        badge: <Badge variant="default" className="bg-green-500/20 text-green-300 border-green-500/30">Público</Badge>,
        shouldBlur: false
      };
    }
  };

  // Pagination logic
  const totalItems = codeblocks?.length || 0;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentCodeblocks = codeblocks?.slice(startIndex, endIndex) || [];

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  if (isLoading) return <div className="flex justify-center items-center h-40"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  if (isError) return <div className="text-red-500 flex justify-center items-center h-40"><AlertTriangle className="mr-2" /> Error: {error.message}</div>;

  return (
    <div className="space-y-4">
      <div className="flex justify-end mb-4">
        <CodeblockModal />
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Language</TableHead>
              <TableHead>Links</TableHead>
              <TableHead>Creator</TableHead>
              <TableHead>Visibility</TableHead>
              <TableHead>Created At</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentCodeblocks.map((codeblock) => {
              const visibilityInfo = getVisibilityInfo(codeblock);

              return (
                <TableRow key={codeblock.id} className={cn(
                  !codeblock.is_public && "bg-red-500/5 border-red-500/20",
                  codeblock.is_blurred && codeblock.is_public && "bg-orange-500/5 border-orange-500/20"
                )}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <span className={cn(
                        visibilityInfo.shouldBlur && "filter blur-sm select-none"
                      )}>
                        {codeblock.title}
                      </span>
                      {visibilityInfo.icon}
                    </div>
                  </TableCell>
                  <TableCell><Badge variant="secondary">{codeblock.category || 'N/A'}</Badge></TableCell>
                  <TableCell><Badge>{codeblock.language || 'N/A'}</Badge></TableCell>
                  <TableCell>{renderLinks(codeblock.links)}</TableCell>
                  <TableCell>{codeblock.profiles?.username || 'N/A'}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {visibilityInfo.icon}
                      {visibilityInfo.badge}
                    </div>
                  </TableCell>
                  <TableCell>{format(new Date(codeblock.created_at), 'PPP')}</TableCell>
                  <TableCell className="flex gap-2">
                    <CodeblockModal codeblock={codeblock} />
                    {codeblock.is_blurred && codeblock.is_public && (
                      <CodeblockAccessModal 
                        codeblockId={codeblock.id}
                        codeblockTitle={codeblock.title}
                      />
                    )}
                    <DeleteCodeblockDialog codeblockId={codeblock.id} />
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
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
      )}

      {codeblocks?.length === 0 && <div className="text-center p-8 text-white/50">No codeblocks found.</div>}
    </div>
  );
};

export default CodeblocksTable;
