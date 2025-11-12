import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface QRLink {
  id: string;
  code: string;
  label: string;
  target_url: string;
  short_url: string;
  scan_count: number;
  created_at: string;
  updated_at: string;
  user_id?: string;
}

export interface QRScan {
  id: string;
  qr_link_id: string;
  scanned_at: string;
  user_agent?: string;
  ip_address?: string;
  referrer?: string;
}
