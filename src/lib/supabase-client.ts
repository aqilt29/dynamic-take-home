import { createClient } from "@supabase/supabase-js";
import { SUPABASE_CONFIG, validateSupabaseConfig } from "@/lib/config";

export const getSupabaseClient = () => {
  validateSupabaseConfig();

  return createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anonKey);
};
