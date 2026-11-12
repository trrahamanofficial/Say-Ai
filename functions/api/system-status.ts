type Env = { OPENROUTER_API_KEY?: string; VITE_SUPABASE_URL?: string; VITE_SUPABASE_ANON_KEY?: string; SAY_AI_CONFIG?: KVNamespace };
export async function onRequestGet({ env }: { env: Env }): Promise<Response> {
  const chat = Boolean(env.OPENROUTER_API_KEY);
  const db = Boolean(env.VITE_SUPABASE_URL && env.VITE_SUPABASE_ANON_KEY);
  let saved:any=null;
  if(env.SAY_AI_CONFIG){try{saved=await env.SAY_AI_CONFIG.get('private-ai-brain-config','json');}catch{}}
  const chatProviders=Array.isArray(saved?.providers)?saved.providers.filter((p:any)=>p.enabled&&p.apiKey).length:0;
  const imageProviders=Array.isArray(saved?.imageProviders)?saved.imageProviders.filter((p:any)=>p.enabled&&p.apiKey).length:0;
  const videoProviders=Array.isArray(saved?.videoProviders)?saved.videoProviders.filter((p:any)=>p.enabled&&p.apiKey).length:0;
  const activeApis=chatProviders+(chat?1:0);
  return new Response(JSON.stringify({ backend: true, edge: true, database: db, activeApis, chatProviders, imageProviders, videoProviders, environment: 'cloudflare-pages', providers: { chat: chatProviders?'configured':chat?'configured':'not_configured', supabase: db ? 'configured' : 'not_configured', image: imageProviders?'configured':'not_configured', video: videoProviders?'configured':'not_configured' } }), { headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' } });
}