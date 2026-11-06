import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
  supabaseAnonKey &&
  supabaseUrl !== 'https://your-project.supabase.co' &&
  !supabaseUrl.includes('placeholder')
);

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        // Android returns OAuth to the app via a custom deep link; PKCE is required
        // so the returned authorization code can be exchanged for a persistent session.
        flowType: 'pkce'
      }
    })
  : null;

export interface SupabaseStatusInfo {
  isConfigured: boolean;
  url: string | null;
  status: 'connected' | 'not_configured' | 'error';
  message: string;
}

export async function testSupabaseConnection(): Promise<SupabaseStatusInfo> {
  if (!isSupabaseConfigured || !supabase) {
    return {
      isConfigured: false,
      url: null,
      status: 'not_configured',
      message: 'Supabase URL/Key not configured in environment. Using Local Storage & Edge Server fallback.'
    };
  }

  try {
    const start = performance.now();
    const { error } = await supabase.from('users_profiles').select('count', { count: 'exact', head: true });
    const latency = Math.round(performance.now() - start);

    if (error && error.code !== 'PGRST116') {
      return {
        isConfigured: true,
        url: supabaseUrl,
        status: 'error',
        message: `Connected with error: ${error.message} (${latency}ms)`
      };
    }

    return {
      isConfigured: true,
      url: supabaseUrl,
      status: 'connected',
      message: `Database online and responsive (${latency}ms)`
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return {
      isConfigured: true,
      url: supabaseUrl,
      status: 'error',
      message: `Connection failed: ${msg}`
    };
  }
}
