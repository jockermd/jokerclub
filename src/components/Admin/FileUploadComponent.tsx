
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { X, Upload, Image, FileArchive } from 'lucide-react';
import { uploadCodeblockFile } from '@/lib/uploadCodeblockFile';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface FileUploadComponentProps {
  onFileUpload: (url: string, fileName: string, type: 'image' | 'zip') => void;
  uploadedFiles: Array<{ url: string; name: string; type: 'image' | 'zip' }>;
  onFileRemove: (index: number) => void;
}

const FileUploadComponent = ({ onFileUpload, uploadedFiles, onFileRemove }: FileUploadComponentProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const { user } = useAuth();

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    // Validar tipo de arquivo
    const isImage = file.type.startsWith('image/');
    const isZip = file.type === 'application/zip' || file.name.endsWith('.zip');
    
    if (!isImage && !isZip) {
      toast.error('Apenas imagens e arquivos ZIP são permitidos');
      return;
    }

    setIsUploading(true);
    try {
      const url = await uploadCodeblockFile(file, user.id);
      const fileType = isImage ? 'image' : 'zip';
      onFileUpload(url, file.name, fileType);
      toast.success('Arquivo enviado com sucesso!');
    } catch (error) {
      toast.error('Erro ao enviar arquivo');
      console.error('Upload error:', error);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Input
          type="file"
          accept="image/*,.zip"
          onChange={handleFileUpload}
          disabled={isUploading}
          className="hidden"
          id="file-upload"
        />
        <label htmlFor="file-upload">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={isUploading}
            asChild
          >
            <span className="cursor-pointer">
              <Upload className="h-4 w-4 mr-2" />
              {isUploading ? 'Enviando...' : 'Upload Arquivo'}
            </span>
          </Button>
        </label>
        <span className="text-xs text-muted-foreground">
          Imagens e arquivos ZIP
        </span>
      </div>
      
      {uploadedFiles.length > 0 && (
        <div className="space-y-1">
          {uploadedFiles.map((file, index) => (
            <div key={index} className="flex items-center gap-2 p-2 border rounded">
              {file.type === 'image' ? (
                <Image className="h-4 w-4 text-green-600" />
              ) : (
                <FileArchive className="h-4 w-4 text-blue-600" />
              )}
              <span className="text-sm flex-1 truncate">{file.name}</span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => onFileRemove(index)}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FileUploadComponent;
