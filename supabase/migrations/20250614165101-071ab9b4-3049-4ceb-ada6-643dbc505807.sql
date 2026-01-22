
-- Add an 'images' column to the tweets table to store an array of image URLs
ALTER TABLE public.tweets ADD COLUMN images text[];

-- Create a storage bucket for tweet images
-- This bucket will be public so anyone can view the images.
-- We're setting a 5MB file size limit and allowing common image types.
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('tweet_images', 'tweet_images', true, 5242880, ARRAY['image/png', 'image/jpeg', 'image/gif']);

-- Add Row-Level Security policies for the new bucket

-- Allow public read access to all images in the bucket
CREATE POLICY "Allow public read access on tweet_images" ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'tweet_images');

-- Allow authenticated users to upload images to the bucket
CREATE POLICY "Allow authenticated user uploads on tweet_images" ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'tweet_images');

-- Allow authenticated users to delete images from the bucket
-- Note: In the app, we'll ensure users can only delete images from their own tweets.
CREATE POLICY "Allow authenticated user deletes on tweet_images" ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'tweet_images');
