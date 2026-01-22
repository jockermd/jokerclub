
import { supabase } from '@/integrations/supabase/client';
import { v4 as uuidv4 } from 'uuid';

export const uploadCodeblockFile = async (file: File, userId: string) => {
  const fileExtension = file.name.split('.').pop();
  const fileName = `${userId}/${uuidv4()}.${fileExtension}`;
  
  const { data, error } = await supabase.storage
    .from('codeblock-files')
    .upload(fileName, file);

  if (error) {
    throw new Error(`Failed to upload file: ${error.message}`);
  }

  const { data: { publicUrl } } = supabase.storage
    .from('codeblock-files')
    .getPublicUrl(data.path);
    
  return publicUrl;
};
