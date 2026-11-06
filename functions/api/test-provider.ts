type Env = { OPENROUTER_API_KEY?: string; VITE_SUPABASE_URL?: string; VITE_SUPABASE_ANON_KEY?: string };
const reply = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' } });
export async function onRequestPost({ request, env }: { request: Request; env: Env }): Promise<Response> {
  try {
    const body = await request.json() as { type?: string };
    const start = Date.now();
    if (body.type === 'openrouter') {
      if (!env.OPENROUTER_API_KEY) return reply({ status: 'error', message: 'OPENROUTER_API_KEY is missing.' }, 503);
      const r = await fetch('https://openrouter.ai/api/v1/models', { headers: { Authorization: `Bearer ${env.OPENROUTER_API_KEY}` } });
      return reply({ status: r.ok ? 'connected' : 'error', pingMs: Date.now() - start, message: r.ok ? 'OpenRouter API authenticated.' : `OpenRouter returned ${r.status}.` }, r.ok ? 200 : 502);
    }
    if (body.type === 'supabase') {
      if (!env.VITE_SUPABASE_URL || !env.VITE_SUPABASE_ANON_KEY) return reply({ status: 'error', message: 'Supabase URL or publishable key is missing.' }, 503);
      const r = await fetch(`${env.VITE_SUPABASE_URL.replace(/\/$/, '')}/auth/v1/health`, { headers: { apikey: env.VITE_SUPABASE_ANON_KEY } });
      return reply({ status: r.ok ? 'connected' : 'error', pingMs: Date.now() - start, message: r.ok ? 'Supabase endpoint reachable.' : `Supabase returned ${r.status}.` }, r.ok ? 200 : 502);
    }
    return reply({ status: 'error', message: 'This provider is not connected to the server yet.' }, 503);
  } catch { return reply({ status: 'error', message: 'Invalid provider test request.' }, 400); }
}
