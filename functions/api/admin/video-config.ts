type Env = { SAY_AI_CONFIG?: KVNamespace; VITE_SUPABASE_URL?: string; VITE_SUPABASE_ANON_KEY?: string };
type VideoConfig = { provider: 'huggingface'; model: string; apiKey: string; enabled: boolean };
const json = (data: unknown, status = 200) => new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' } });
const trimSlash = (value: string) => value.endsWith('/') ? value.slice(0, -1) : value;
async function isAdmin(request: Request, env: Env) {
  const token = request.headers.get('Authorization')?.replace(/^Bearer\s+/i, '');
  if (!token || !env.VITE_SUPABASE_URL || !env.VITE_SUPABASE_ANON_KEY) return false;
  try {
    const response = await fetch(trimSlash(env.VITE_SUPABASE_URL) + '/auth/v1/user', { headers: { Authorization: 'Bearer ' + token, apikey: env.VITE_SUPABASE_ANON_KEY } });
    if (!response.ok) return false;
    const user = await response.json() as { email?: string };
    return (user.email || '').toLowerCase() === 'trrahaman.official0.6@gmail.com';
  } catch { return false; }
}
const defaults: VideoConfig = { provider: 'huggingface', model: 'Wan-AI/Wan2.2-TI2V-5B', apiKey: '', enabled: false };
export async function onRequest({ request, env }: { request: Request; env: Env }): Promise<Response> {
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
      const config: VideoConfig = { provider: 'huggingface', model: String(input.model || old.model), apiKey: String(input.apiKey || old.apiKey), enabled: Boolean(input.enabled) };
      if (!config.model.trim()) return json({ error: 'A video model ID is required.' }, 400);
      await env.SAY_AI_CONFIG.put(key, JSON.stringify(config));
      return json({ success: true, message: 'Video API settings saved globally.' });
    } catch { return json({ error: 'Invalid video settings.' }, 400); }
  }
  if (request.method === 'POST') {
    try {
      const input = await request.json() as { apiKey?: string };
      const token = String(input.apiKey || '');
      if (!token && !(await env.SAY_AI_CONFIG.get<VideoConfig>(key, 'json'))?.apiKey) return json({ error: 'Paste your Hugging Face token first.' }, 400);
      const saved = await env.SAY_AI_CONFIG.get<VideoConfig>(key, 'json') || defaults;
      const response = await fetch('https://huggingface.co/api/whoami-v2', { headers: { Authorization: 'Bearer ' + (token || saved.apiKey) } });
      if (!response.ok) return json({ error: 'Hugging Face rejected this token (HTTP ' + response.status + '). Check the token permissions.' }, 502);
      return json({ success: true, message: 'Hugging Face token authenticated.' });
    } catch { return json({ error: 'Could not reach Hugging Face to validate the token.' }, 502); }
  }
  return json({ error: 'Method not allowed.' }, 405);
}
