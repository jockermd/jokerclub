
import { z } from 'zod';

// Custom URL validation that accepts URLs with or without protocol
const urlValidation = z.string().refine((val) => {
  if (!val || val.trim() === '') return false;
  
  const trimmed = val.trim();
  
  // If it already has a protocol, validate it's a proper URL
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    try {
      new URL(trimmed);
      return true;
    } catch {
      return false;
    }
  }
  
  // If no protocol, try adding https:// and validate
  try {
    new URL(`https://${trimmed}`);
    return true;
  } catch {
    return false;
  }
}, {
  message: 'Please enter a valid URL'
});

const linkSchema = z.object({
  name: z.string().min(1, 'Link name is required'),
  url: urlValidation
});

export const codeblockSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters long.'),
  description: z.string().optional(),
  content: z.string().min(10, 'Content must be at least 10 characters long.'),
  language: z.string().optional(),
  category: z.string().optional(),
  tags: z.union([
    z.string(),
    z.array(z.string())
  ]).optional().transform(val => {
    if (!val) return [];
    if (Array.isArray(val)) return val.filter(Boolean);
    return val.split(',').map(tag => tag.trim()).filter(Boolean);
  }),
  links: z.union([
    z.string(),
    z.array(z.string()),
    z.array(linkSchema)
  ]).optional().transform(val => {
    if (!val) return [];
    if (Array.isArray(val)) {
      // Check if it's an array of link objects by checking the first valid item
      const firstValidItem = val.find(item => item != null);
      if (firstValidItem && typeof firstValidItem === 'object' && 'name' in firstValidItem && 'url' in firstValidItem) {
        // Filter out empty links and normalize URLs
        return val.filter(link => {
          // Type guard to ensure we're dealing with an object
          if (typeof link !== 'object' || link === null) return false;
          if (!('name' in link) || !('url' in link)) return false;
          
          const linkObj = link as { name: string; url: string };
          return linkObj.name && 
                 linkObj.name.trim() !== '' &&
                 linkObj.url && 
                 linkObj.url.trim() !== '';
        }).map(link => {
          const linkObj = link as { name: string; url: string };
          return {
            name: linkObj.name,
            url: linkObj.url.startsWith('http://') || linkObj.url.startsWith('https://') 
              ? linkObj.url 
              : `https://${linkObj.url}`
          };
        });
      }
      // Otherwise it's an array of strings (backward compatibility)
      return val.filter(Boolean);
    }
    // String format (backward compatibility)
    return val.split(',').map(link => link.trim()).filter(Boolean);
  }),
  is_public: z.boolean().default(true),
  is_blurred: z.boolean().default(false),
});

export type CodeblockFormData = z.output<typeof codeblockSchema>;
export type CodeblockFormInput = z.input<typeof codeblockSchema>;
export type LinkItem = z.infer<typeof linkSchema>;
