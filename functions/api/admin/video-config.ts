const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, PUT, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Authorization, Content-Type, Accept',
  'Access-Control-Max-Age': '86400',
  'Vary': 'Origin'
};
type Env = { SAY_AI_CONFIG?: KVNamespace; VITE_SUPABASE_URL?: string; VITE_SUPABASE_ANON_KEY?: string };
type VideoConfig = { provider: 'zerogpu' | 'huggingface'; model: string; apiKey: string; enabled: boolean };
const json = (data: unknown, status = 200) => new Response(JSON.stringify(data), { status, headers: { ...corsHeaders, 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' } });
export async function onRequestOptions(): Promise<Response> {
  return new Response(null, { status: 204, headers: corsHeaders });
}
const trimSlash = (value: string) => value.endsWith('/') ? value.slice(0, -1) : value;
async function isAdmin(request: Request, env: Env) {
  const token = request.headers.get('Authorization')?.replace(/^Bearer\s+/i, '').trim();
  if (!token || !env.VITE_SUPABASE_URL || !env.VITE_SUPABASE_ANON_KEY) return false;
  try {
    const base = trimSlash(env.VITE_SUPABASE_URL);
    const authResponse = await fetch(base + '/auth/v1/user', {
      headers: { Authorization: 'Bearer ' + token, apikey: env.VITE_SUPABASE_ANON_KEY }
    });
    if (!authResponse.ok) return false;
    const user = await authResponse.json() as { id?: string };
    if (!user.id) return false;
    const profileResponse = await fetch(base + '/rest/v1/profiles?id=eq.' + encodeURIComponent(user.id) + '&select=role', {
      headers: { Authorization: 'Bearer ' + token, apikey: env.VITE_SUPABASE_ANON_KEY }
    });
    if (!profileResponse.ok) return false;
    const profiles = await profileResponse.json() as Array<{ role?: string }>;
    return profiles.some(profile => profile.role === 'admin');
  } catch { return false; }
}
const defaults: VideoConfig = { provider: 'zerogpu', model: 'Wan-AI/Wan2.2-TI2V-5B', apiKey: '', enabled: false };
export async function onRequest({ request, env }: { request: Request; env: Env }): Promise<Response> {
  if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: corsHeaders });
  if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: corsHeaders });
  if (!await isAdmin(request, env)) return json({ error: 'Admin access required.' }, 403);
  if (!env.SAY_AI_CONFIG) return json({ error: 'Global configuration storage is not connected.' }, 503);
  const key = 'private-video-ai-config';
  if (request.method === 'GET') {
    const saved = await env.SAY_AI_CONFIG.get<VideoConfig>(key, 'json') || defaults;
    return json({ ...saved, apiKeyConfigured: Boolean(saved.apiKey), apiKey: '' });
  }
  if (request.method === 'PUT') {
    try {
      const input = await request.json() as Partial<VideoConfig>;
      const old = await env.SAY_AI_CONFIG.get<VideoConfig>(key, 'json') || defaults;
      const config: VideoConfig = { provider: input.provider === 'huggingface' ? 'huggingface' : 'zerogpu', model: String(input.model || old.model), apiKey: String(input.apiKey || old.apiKey), enabled: Boolean(input.enabled) };
      if (!config.model.trim()) return json({ error: 'A video model ID is required.' }, 400);
      await env.SAY_AI_CONFIG.put(key, JSON.stringify(config));
      return json({ success: true, message: 'Video API settings saved globally.' });
    } catch { return json({ error: 'Invalid video settings.' }, 400); }
  }
  if (request.method === 'POST') {
    try {
      const input = await request.json() as { apiKey?: string };
      const token = String(input.apiKey || '').trim();
      const saved = await env.SAY_AI_CONFIG.get<VideoConfig>(key, 'json') || defaults;
      const candidate = token || saved.apiKey;
      if (!candidate) return json({ error: 'Paste your Hugging Face token first.' }, 400);
      const response = await fetch('https://huggingface.co/api/whoami-v2', { headers: { Authorization: 'Bearer ' + candidate } });
      if (!response.ok) return json({ error: 'Hugging Face rejected this token (HTTP ' + response.status + '). Check that the token has Inference Providers permission.' }, 502);
      return json({ success: true, message: 'Hugging Face token authenticated.' });
    } catch { return json({ error: 'Could not reach Hugging Face to validate the token.' }, 502); }
  }
  return json({ error: 'Method not allowed.' }, 405);
}
