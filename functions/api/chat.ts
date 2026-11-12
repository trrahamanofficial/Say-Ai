type Env = { OPENROUTER_API_KEY?: string; OPENROUTER_MODEL?: string; SAY_AI_CONFIG?: KVNamespace };
type HistoryItem = { sender?: string; text?: string };
type Provider = { id:string; name:string; type:string; model:string; apiKey:string; enabled:boolean; baseUrl:string };
type SavedConfig = { providers?:Provider[]; selectedProviderId?:string };
const json = (data: unknown, status = 200) => new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' } });
const getText=(data:any):string=>{
 const content=data?.choices?.[0]?.message?.content;
 if(typeof content==='string')return content;
 if(Array.isArray(content))return content.map((p:any)=>p.text||'').join('\n');
 if(Array.isArray(data?.message?.content))return data.message.content.map((p:any)=>p.text||'').join('\n');
 return typeof data?.text==='string'?data.text:'';
};
async function askProvider(provider:Provider,messages:Array<{role:string;content:string}>):Promise<string>{
 let upstream:Response;
 if(provider.type==='gemini'){
  const contents=messages.filter(m=>m.role!=='system').map(m=>({role:m.role==='assistant'?'model':'user',parts:[{text:m.content}]}));
  const system=messages.find(m=>m.role==='system')?.content;
  upstream=await fetch('https://generativelanguage.googleapis.com/v1beta/models/'+encodeURIComponent(provider.model)+':generateContent?key='+encodeURIComponent(provider.apiKey),{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({systemInstruction:system?{parts:[{text:system}]}:undefined,contents})});
 }else if(provider.type==='cohere'){
  upstream=await fetch('https://api.cohere.com/v2/chat',{method:'POST',headers:{Authorization:'Bearer '+provider.apiKey,'Content-Type':'application/json'},body:JSON.stringify({model:provider.model,messages:messages.map(m=>({role:m.role==='assistant'?'assistant':m.role==='system'?'system':'user',content:m.content}))})});
 }else if(provider.type==='anthropic'){
  const system=messages.find(m=>m.role==='system')?.content;
  upstream=await fetch(provider.baseUrl.replace(/\/$/,'')+'/messages',{method:'POST',headers:{'x-api-key':provider.apiKey,'anthropic-version':'2023-06-01','Content-Type':'application/json'},body:JSON.stringify({model:provider.model,max_tokens:2048,system,messages:messages.filter(m=>m.role!=='system').map(m=>({role:m.role==='assistant'?'assistant':'user',content:m.content}))})});
 }else{
  upstream=await fetch(provider.baseUrl.replace(/\/$/,'')+'/chat/completions',{method:'POST',headers:{Authorization:'Bearer '+provider.apiKey,'Content-Type':'application/json'},body:JSON.stringify({model:provider.model,messages,temperature:0.7})});
 }
 const data=await upstream.json() as any;
 if(!upstream.ok)throw new Error(data?.error?.message||data?.message||provider.name+' returned HTTP '+upstream.status);
 const reply=getText(data);
 if(!reply.trim())throw new Error(provider.name+' returned an empty response.');
 return reply;
}
export async function onRequestPost({ request, env }: { request: Request; env: Env }): Promise<Response> {
 try {
  const body = await request.json() as { message?: string; history?: HistoryItem[] };
  if (typeof body.message !== 'string' || !body.message.trim()) return json({ error: 'Message is required.' }, 400);
  const history = Array.isArray(body.history) ? body.history.slice(-8).filter(x => typeof x?.text === 'string').map(x => ({ role: x.sender === 'user' ? 'user' : 'assistant', content: String(x.text).slice(0, 12000) })) : [];
  const messages=[{role:'system',content:'You are SAY AI, a helpful, friendly personal AI assistant. Be accurate and honest. Use clear concise Markdown when useful.'},...history,{role:'user',content:body.message.trim().slice(0,12000)}];
  let saved:SavedConfig|null=null;
  if(env.SAY_AI_CONFIG){try{saved=await env.SAY_AI_CONFIG.get<SavedConfig>('private-ai-brain-config','json');}catch{}}
  const active=(saved?.providers||[]).filter(p=>p.enabled&&p.apiKey&&p.model&&p.baseUrl);
  if(active.length){
   const selected=active.find(p=>p.id===saved?.selectedProviderId);
   const ordered=selected?[selected,...active.filter(p=>p.id!==selected.id)]:active;
   const failures:string[]=[];
   for(const provider of ordered){
    try{return json({success:true,reply:await askProvider(provider,messages),model:provider.model,provider:provider.name});}
    catch(error){failures.push(provider.name+': '+(error instanceof Error?error.message:'request failed'));}
   }
   return json({error:'All enabled AI providers failed. '+failures.join(' | ')},502);
  }
  if (!env.OPENROUTER_API_KEY) return json({ error: 'No Chat AI provider is enabled. Add an API key and enable a provider in API Management, or configure OPENROUTER_API_KEY.' }, 503);
  const model = env.OPENROUTER_MODEL || 'openrouter/free';
  const upstream = await fetch('https://openrouter.ai/api/v1/chat/completions', { method: 'POST', headers: { Authorization: `Bearer ${env.OPENROUTER_API_KEY}`, 'Content-Type': 'application/json', 'HTTP-Referer': 'https://say-ai.pages.dev', 'X-Title': 'SAY AI' }, body: JSON.stringify({ model, messages, temperature: 0.7 }) });
  const data = await upstream.json() as any;
  if (!upstream.ok) return json({ error: data.error?.message || `OpenRouter request failed (${upstream.status}).` }, 502);
  const reply=getText(data);
  if (!reply.trim()) return json({ error: 'OpenRouter returned an empty response. Please try again.' }, 502);
  return json({ success: true, reply, model, provider:'OpenRouter' });
 } catch (e) { return json({ error: e instanceof Error ? e.message : 'Unexpected server error.' }, 500); }
}