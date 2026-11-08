type Env = { SAY_AI_CONFIG?: KVNamespace; VITE_SUPABASE_URL?: string; VITE_SUPABASE_ANON_KEY?: string };
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, PUT, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Authorization, Content-Type, Accept',
  'Access-Control-Max-Age': '86400',
  'Vary': 'Origin'
};
type ImageConfig = { provider: 'cloudflare' | 'huggingface'; model: string; enabled: boolean; apiKey?: string };
const defaults: ImageConfig = { provider: 'cloudflare', model: '@cf/black-forest-labs/flux-1-schnell', enabled: true };
const json = (data: unknown, status = 200) => new Response(JSON.stringify(data), { status, headers: { ...corsHeaders, 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' } });
export async function onRequestOptions(): Promise<Response> {
  return new Response(null, { status: 204, headers: corsHeaders });
}
async function isAdmin(request: Request, env: Env) {
  const token = request.headers.get('Authorization')?.replace(/^Bearer\s+/i, '');
  if (!token || !env.VITE_SUPABASE_URL || !env.VITE_SUPABASE_ANON_KEY) return false;
  try {
    const response = await fetch(env.VITE_SUPABASE_URL.replace(/\/$/, '') + '/auth/v1/user', { headers: { Authorization: 'Bearer ' + token, apikey: env.VITE_SUPABASE_ANON_KEY } });
    if (!response.ok) return false;
    const user = await response.json() as { id?: string };
    if (!user.id) return false;
    const profileResponse = await fetch(env.VITE_SUPABASE_URL.replace(/\/$/, '') + '/rest/v1/profiles?id=eq.' + encodeURIComponent(user.id) + '&select=role', {
      headers: { Authorization: 'Bearer ' + token, apikey: env.VITE_SUPABASE_ANON_KEY }
    });
    if (!profileResponse.ok) return false;
    const profiles = await profileResponse.json() as Array<{ role?: string }>;
    return profiles.some(profile => profile.role === 'admin');
  } catch { return false; }
}
export async function onRequest({ request, env }: { request: Request; env: Env }): Promise<Response> {
  if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: corsHeaders });
  if (!await isAdmin(request, env)) return json({ error: 'Admin access required.' }, 403);
  if (!env.SAY_AI_CONFIG) return json({ error: 'Global configuration storage is not connected.' }, 503);
  const key = 'private-image-ai-config';
  const saved = await env.SAY_AI_CONFIG.get<ImageConfig>(key, 'json') || defaults;
  if (request.method === 'GET') {
    return json({ provider: saved.provider, model: saved.model, enabled: saved.enabled, apiKeyConfigured: Boolean(saved.apiKey) });
  }
  if (request.method === 'PUT') {
    try {
      const input = await request.json() as Partial<ImageConfig>;
      const provider = input.provider === 'huggingface' ? 'huggingface' : 'cloudflare';
      const model = typeof input.model === 'string' ? input.model.trim().slice(0, 200) : '';
      if (!model) return json({ error: 'Please enter an image model ID.' }, 400);
      const apiKey = typeof input.apiKey === 'string' && input.apiKey.trim() ? input.apiKey.trim() : saved.apiKey;
      if (provider === 'huggingface' && !apiKey) return json({ error: 'Add a Hugging Face access token first.' }, 400);
      const config: ImageConfig = { provider, model, enabled: Boolean(input.enabled), ...(apiKey ? { apiKey } : {}) };
      await env.SAY_AI_CONFIG.put(key, JSON.stringify(config));
      return json({ success: true, apiKeyConfigured: Boolean(apiKey) });
    } catch { return json({ error: 'Invalid image settings.' }, 400); }
  }
  if (request.method === 'POST') {
    try {
      const input = await request.json() as { provider?: string; apiKey?: string };
      const provider = input.provider === 'huggingface' ? 'huggingface' : 'cloudflare';
      if (provider === 'cloudflare') return json({ success: true, message: 'Cloudflare provider selected. Binding availability is checked when generating.' });
      const token = input.apiKey?.trim() || saved.apiKey;
      if (!token) return json({ error: 'Add a Hugging Face token first.' }, 400);
      const response = await fetch('https://huggingface.co/api/whoami-v2', { headers: { Authorization: 'Bearer ' + token } });
      if (!response.ok) return json({ error: 'Hugging Face rejected this token. Check that it is valid and has inference permissions.' }, 400);
      return json({ success: true });
    } catch { return json({ error: 'Could not contact Hugging Face to validate the token.' }, 502); }
  }
  return json({ error: 'Method not allowed.' }, 405);
}
