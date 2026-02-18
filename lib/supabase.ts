import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface Podcast {
  id: string;
  title: string;
  script: string | null;
  audio_url: string | null;
  sources: Source[];
  duration: number | null;
  status: 'generating' | 'ready' | 'failed';
  created_at: string;
  error_message: string | null;
}

export interface Source {
  title: string;
  url: string;
  date: string;
}
