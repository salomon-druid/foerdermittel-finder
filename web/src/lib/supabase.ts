import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseKey);

export interface FundingProgram {
  id: string;
  title: string;
  description: string;
  provider: string;
  country: string;
  category: string;
  max_funding: number | null;
  funding_rate: number | null;
  deadline: string | null;
  url: string;
  status: string;
  created_at: string;
}
