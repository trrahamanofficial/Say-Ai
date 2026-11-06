type Env = { OPENROUTER_API_KEY?: string; VITE_SUPABASE_URL?: string; VITE_SUPABASE_ANON_KEY?: string };
export async function onRequestGet({ env }: { env: Env }): Promise<Response> {
  const chat = Boolean(env.OPENROUTER_API_KEY);
  const db = Boolean(env.VITE_SUPABASE_URL && env.VITE_SUPABASE_ANON_KEY);
  return new Response(JSON.stringify({ backend: true, edge: true, database: db, activeApis: chat ? 1 : 0, environment: 'cloudflare-pages', providers: { openrouter: chat ? 'configured' : 'not_configured', supabase: db ? 'configured' : 'not_configured', image: 'not_configured', video: 'not_configured' } }), { headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' } });
}
