type Env = { SAY_AI_CONFIG?: KVNamespace; VITE_SUPABASE_URL?: string; VITE_SUPABASE_ANON_KEY?: string };
type ImageConfig = { provider: 'cloudflare'; model: '@cf/black-forest-labs/flux-1-schnell'; enabled: boolean };
const defaults: ImageConfig = { provider: 'cloudflare', model: '@cf/black-forest-labs/flux-1-schnell', enabled: true };
const json = (data: unknown, status = 200) => new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' } });
async function isAdmin(request: Request, env: Env) {
  const token = request.headers.get('Authorization')?.replace(/^Bearer\\s+/i, '');
  if (!token || !env.VITE_SUPABASE_URL || !env.VITE_SUPABASE_ANON_KEY) return false;
  try {
    const response = await fetch(env.VITE_SUPABASE_URL.replace(/\\/$/, '') + '/auth/v1/user', { headers: { Authorization: 'Bearer ' + token, apikey: env.VITE_SUPABASE_ANON_KEY } });
    if (!response.ok) return false;
    const user = await response.json() as { email?: string };
    return (user.email || '').toLowerCase() === 'trrahaman.official0.6@gmail.com';
  } catch { return false; }
}
export async function onRequest({ request, env }: { request: Request; env: Env }): Promise<Response> {
  if (!await isAdmin(request, env)) return json({ error: 'Admin access required.' }, 403);
  if (!env.SAY_AI_CONFIG) return json({ error: 'Global configuration storage is not connected.' }, 503);
  const key = 'private-image-ai-config';
  if (request.method === 'GET') {
    const saved = await env.SAY_AI_CONFIG.get<ImageConfig>(key, 'json') || defaults;
    return json(saved);
  }
  if (request.method === 'PUT') {
    try {
      const input = await request.json() as Partial<ImageConfig>;
      const config: ImageConfig = { provider: 'cloudflare', model: '@cf/black-forest-labs/flux-1-schnell', enabled: Boolean(input.enabled) };
      await env.SAY_AI_CONFIG.put(key, JSON.stringify(config));
      return json({ success: true, message: 'Image AI settings saved.' });
    } catch { return json({ error: 'Invalid image settings.' }, 400); }
  }
  return json({ error: 'Method not allowed.' }, 405);
}
