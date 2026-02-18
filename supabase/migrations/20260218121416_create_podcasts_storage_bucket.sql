/*
  # Create Storage Bucket for Podcasts

  1. Storage
    - Create `podcasts` bucket for audio files
    - Set bucket to public access for easy playback
    - Add policies for public upload and read

  2. Security
    - Public can read files (needed for audio playback)
    - Public can upload files (needed for podcast generation)
*/

INSERT INTO storage.buckets (id, name, public)
VALUES ('podcasts', 'podcasts', true)
ON CONFLICT (id) DO NOTHING;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' 
    AND tablename = 'objects' 
    AND policyname = 'Public can read podcast files'
  ) THEN
    CREATE POLICY "Public can read podcast files"
      ON storage.objects
      FOR SELECT
      TO public
      USING (bucket_id = 'podcasts');
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' 
    AND tablename = 'objects' 
    AND policyname = 'Public can upload podcast files'
  ) THEN
    CREATE POLICY "Public can upload podcast files"
      ON storage.objects
      FOR INSERT
      TO public
      WITH CHECK (bucket_id = 'podcasts');
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' 
    AND tablename = 'objects' 
    AND policyname = 'Public can update podcast files'
  ) THEN
    CREATE POLICY "Public can update podcast files"
      ON storage.objects
      FOR UPDATE
      TO public
      USING (bucket_id = 'podcasts')
      WITH CHECK (bucket_id = 'podcasts');
  END IF;
END $$;
