
-- Function to check if the current user owns a tweet image.
-- This function is set with `SECURITY DEFINER` to safely bypass RLS on the tweets table
-- for the sole purpose of checking ownership against the user ID.
CREATE OR REPLACE FUNCTION public.is_tweet_image_owner(object_name TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  tweet_owner_id UUID;
BEGIN
  -- Check if the provided 'object_name' (the file path in the bucket)
  -- exists in the 'images' array of any tweet and get the tweet's owner.
  SELECT t.user_id INTO tweet_owner_id
  FROM public.tweets t
  WHERE object_name = ANY(t.images);

  -- If a tweet owner is found and it matches the current authenticated user, allow the operation.
  IF tweet_owner_id IS NOT NULL AND tweet_owner_id = auth.uid() THEN
    RETURN TRUE;
  END IF;
  
  -- Also, allow admins to delete any image.
  IF public.has_role(auth.uid(), 'admin') THEN
    RETURN TRUE;
  END IF;

  RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop the old, insecure DELETE policy for the 'tweet_images' bucket.
DROP POLICY IF EXISTS "Allow authenticated user deletes on tweet_images" ON storage.objects;

-- Create a new, secure DELETE policy for tweet_images that uses the ownership check function.
CREATE POLICY "Users can delete their own tweet images, and admins can delete any." ON storage.objects
FOR DELETE
TO authenticated
USING ( bucket_id = 'tweet_images' AND public.is_tweet_image_owner(name) );
