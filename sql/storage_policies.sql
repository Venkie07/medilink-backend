-- Storage Bucket Policies for MediLink
-- Run this in Supabase SQL Editor after creating the storage buckets

-- Enable RLS on storage.objects (if not already enabled)
-- Note: RLS is enabled by default on storage buckets

-- IMPORTANT: Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Allow authenticated uploads to photos" ON storage.objects;
DROP POLICY IF EXISTS "Allow public read from photos" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated update photos" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated delete photos" ON storage.objects;
DROP POLICY IF EXISTS "Allow anonymous uploads to photos" ON storage.objects;

DROP POLICY IF EXISTS "Allow authenticated uploads to reports" ON storage.objects;
DROP POLICY IF EXISTS "Allow public read from reports" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated update reports" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated delete reports" ON storage.objects;
DROP POLICY IF EXISTS "Allow anonymous uploads to reports" ON storage.objects;

-- Policy for 'photos' bucket: Allow anonymous uploads (for backend server-side uploads)
CREATE POLICY "Allow anonymous uploads to photos"
ON storage.objects
FOR INSERT
TO anon
WITH CHECK (
  bucket_id = 'photos'
);

-- Policy for 'photos' bucket: Allow authenticated users to upload
CREATE POLICY "Allow authenticated uploads to photos"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'photos'
);

-- Policy for 'photos' bucket: Allow public read access
CREATE POLICY "Allow public read from photos"
ON storage.objects
FOR SELECT
TO public
USING (
  bucket_id = 'photos'
);

-- Policy for 'photos' bucket: Allow authenticated users to update their own files
CREATE POLICY "Allow authenticated update photos"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'photos'
)
WITH CHECK (
  bucket_id = 'photos'
);

-- Policy for 'photos' bucket: Allow authenticated users to delete their own files
CREATE POLICY "Allow authenticated delete photos"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'photos'
);

-- Policy for 'reports' bucket: Allow anonymous uploads (for backend server-side uploads)
CREATE POLICY "Allow anonymous uploads to reports"
ON storage.objects
FOR INSERT
TO anon
WITH CHECK (
  bucket_id = 'reports'
);

-- Policy for 'reports' bucket: Allow authenticated users to upload
CREATE POLICY "Allow authenticated uploads to reports"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'reports'
);

-- Policy for 'reports' bucket: Allow public read access
CREATE POLICY "Allow public read from reports"
ON storage.objects
FOR SELECT
TO public
USING (
  bucket_id = 'reports'
);

-- Policy for 'reports' bucket: Allow authenticated users to update their own files
CREATE POLICY "Allow authenticated update reports"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'reports'
)
WITH CHECK (
  bucket_id = 'reports'
);

-- Policy for 'reports' bucket: Allow authenticated users to delete their own files
CREATE POLICY "Allow authenticated delete reports"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'reports'
);

-- Alternative: If you want to allow anonymous uploads (less secure, but simpler for testing)
-- Uncomment the following policies and comment out the authenticated ones above

/*
-- Policy for 'photos' bucket: Allow anonymous uploads
CREATE POLICY "Allow anonymous uploads to photos"
ON storage.objects
FOR INSERT
TO anon
WITH CHECK (
  bucket_id = 'photos'
);

-- Policy for 'reports' bucket: Allow anonymous uploads
CREATE POLICY "Allow anonymous uploads to reports"
ON storage.objects
FOR INSERT
TO anon
WITH CHECK (
  bucket_id = 'reports'
);
*/

