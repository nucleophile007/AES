import 'server-only';
import { createClient } from '@supabase/supabase-js';

function getRequiredEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`${name} is required for server Supabase client.`);
  }
  return value;
}

export const supabaseServer = createClient(
  getRequiredEnv('SUPABASE_URL'),
  getRequiredEnv('SUPABASE_SERVICE_ROLE_KEY')
);
