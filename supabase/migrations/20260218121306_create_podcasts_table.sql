/*
  # Create TechVibe Podcasts Table

  1. New Tables
    - `podcasts`
      - `id` (uuid, primary key) - Unique identifier for each podcast
      - `title` (text) - Title of the podcast episode
      - `script` (text) - Generated podcast script
      - `audio_url` (text, nullable) - URL to the generated audio file
      - `sources` (jsonb) - Array of source articles used
      - `duration` (integer, nullable) - Duration in seconds
      - `status` (text) - Status: 'generating', 'ready', 'failed'
      - `created_at` (timestamptz) - Creation timestamp
      - `error_message` (text, nullable) - Error message if generation failed

  2. Security
    - Enable RLS on `podcasts` table
    - Add policy for public read access (podcasts are public)
    - Add policy for inserting new podcasts (public can create)
*/

CREATE TABLE IF NOT EXISTS podcasts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL DEFAULT 'TechVibe Daily Briefing',
  script text,
  audio_url text,
  sources jsonb DEFAULT '[]'::jsonb,
  duration integer,
  status text NOT NULL DEFAULT 'generating',
  created_at timestamptz DEFAULT now(),
  error_message text
);

ALTER TABLE podcasts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view podcasts"
  ON podcasts
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Anyone can create podcasts"
  ON podcasts
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Anyone can update podcasts"
  ON podcasts
  FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_podcasts_created_at ON podcasts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_podcasts_status ON podcasts(status);
