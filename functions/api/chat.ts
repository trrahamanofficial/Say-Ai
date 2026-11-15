type Env = { OPENROUTER_API_KEY?: string; OPENROUTER_MODEL?: string; SAY_AI_CONFIG?: KVNamespace };
const corsHeaders:Record<string,string>={'Access-Control-Allow-Origin':'*','Access-Control-Allow-Methods':'POST, OPTIONS','Access-Control-Allow-Headers':'Content-Type, Authorization','Access-Control-Max-Age':'86400','Vary':'Origin'};
type HistoryItem = { sender?: string; text?: string };
type Provider = { id:string; name:string; type:string; model:string; apiKey:string; enabled:boolean; baseUrl:string };
type SavedConfig = { providers?:Provider[]; selectedProviderId?:string };
const json = (data: unknown, status = 200) => new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', ...corsHeaders } });
export async function onRequestOptions(){return new Response(null,{status:204,headers:corsHeaders});}
const getText=(data:any):string=>{
 const content=data?.choices?.[0]?.message?.content;
 if(typeof content==='string')return content;
 if(Array.isArray(content))return content.map((p:any)=>p.text||'').join('\n');
 if(Array.isArray(data?.message?.content))return data.message.content.map((p:any)=>p.text||'').join('\n');
 return typeof data?.text==='string'?data.text:'';
};
async function askProvider(provider:Provider,messages:Array<{role:string;content:any}>):Promise<string>{
 let upstream:Response;
 if(provider.type==='gemini'){
  const contents=messages.filter(m=>m.role!=='system').map(m=>{
   const value=m.content;
   const parts=typeof value==='string'?[{text:value}]:[
    {text:value.text||''},
    ...(Array.isArray(value.attachments)?value.attachments.map((a:any)=>({inlineData:{mimeType:a.mimeType,data:a.data}})):[])
   ];
   return {role:m.role==='assistant'?'model':'user',parts};
  });
  const system=messages.find(m=>m.role==='system')?.content;
  upstream=await fetch('https://generativelanguage.googleapis.com/v1beta/models/'+encodeURIComponent(provider.model)+':generateContent?key='+encodeURIComponent(provider.apiKey),{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({systemInstruction:system?{parts:[{text:system}]}:undefined,contents})});
 }else if(provider.type==='cohere'){
  upstream=await fetch('https://api.cohere.com/v2/chat',{method:'POST',headers:{Authorization:'Bearer '+provider.apiKey,'Content-Type':'application/json'},body:JSON.stringify({model:provider.model,messages:messages.map(m=>({role:m.role==='assistant'?'assistant':m.role==='system'?'system':'user',content:typeof m.content==='string'?m.content:[{type:'text',text:m.content.text||''},...(m.content.attachments||[]).map((a:any)=>({type:'image_url',image_url:{url:'data:'+a.mimeType+';base64,'+a.data}}))]}))})});
 }else if(provider.type==='anthropic'){
  const system=messages.find(m=>m.role==='system')?.content;
  upstream=await fetch(provider.baseUrl.replace(/\/$/,'')+'/messages',{method:'POST',headers:{'x-api-key':provider.apiKey,'anthropic-version':'2023-06-01','Content-Type':'application/json'},body:JSON.stringify({model:provider.model,max_tokens:2048,system,messages:messages.filter(m=>m.role!=='system').map(m=>({role:m.role==='assistant'?'assistant':'user',content:typeof m.content==='string'?m.content:[{type:'text',text:m.content.text||''},...(m.content.attachments||[]).map((a:any)=>({type:'image',source:{type:'base64',media_type:a.mimeType,data:a.data}}))]}))})});
 }else{
  const openAIMessages=messages.map(m=>({role:m.role,content:typeof m.content==='string'?m.content:[{type:'text',text:m.content.text||''},...(m.content.attachments||[]).map((a:any)=>({type:'image_url',image_url:{url:'data:'+a.mimeType+';base64,'+a.data}}))]}));
  upstream=await fetch(provider.baseUrl.replace(/\/$/,'')+'/chat/completions',{method:'POST',headers:{Authorization:'Bearer '+provider.apiKey,'Content-Type':'application/json'},body:JSON.stringify({model:provider.model,messages:openAIMessages,temperature:0.7})});
 }
 const data=await upstream.json() as any;
 if(!upstream.ok)throw new Error(data?.error?.message||data?.message||provider.name+' returned HTTP '+upstream.status);
 const reply=getText(data);
 if(!reply.trim())throw new Error(provider.name+' returned an empty response.');
 return reply;
}
function detectReplyLanguage(input: string): 'Bengali' | 'English' | 'Banglish' {
 const value = input.trim();
 if (/[\\u0980-\\u09ff]/.test(value)) return 'Bengali';
 const words = value.toLowerCase().replace(/[^a-z0-9\\s]/g, ' ').split(/\\s+/).filter(Boolean);
 const banglishWords = new Set([
  'ami','amar','amr','amake','amk','amra','amader','apni','apnar','apnake','tumi','tomar','tomake','tor',
  'kemon','kmn','achen','acho','aso','achi','acchi','achhi','ache','ase','valo','bhalo','khub',
  'ki','kikore','keno','kothay','kothai','kokhon','kar','kake','ke','theke','sathe','jonno','janno',
  'baniye','banie','korbo','korben','koren','korcho','korchen','korche','korchi','korte','koro','kore','hobe','hobey','hoy',
  'hocche','hochhe','hoise','hoye','dite','dao','den','din','bolun','bolo','bolben','bolbe','bolchi',
  'chai','lagbe','parbo','parben','parbe','parchi','bujhi','bujhlam','bujhte','bujhcho',
  'eta','ota','eita','oita','ekhane','okhane','ekhono','ekhon','abar','ar','na','naki','mane',
  'dhonnobad','assalamu','alaikum','inshaallah','kirokom','kotha','bari','taka','kaj','hoyeche'
 ]);
 const matches = words.filter(word => banglishWords.has(word)).length;
 return matches > 0 ? 'Banglish' : 'English';
}

const SAY_AI_SYSTEM_PROMPT = `You are SAY AI, the personal AI assistant created and developed by the TR Official Team.
IDENTITY: If asked who created, made, developed, owns, or built you, answer that the TR Official Team created SAY AI. State this naturally in the same language and writing style as the user's latest message. Never give a Bengali-and-English bilingual answer unless the user explicitly asks for both languages. Do not claim that OpenAI, Google, or another AI provider created SAY AI. You may explain that SAY AI can use third-party AI models/providers to generate answers, but the SAY AI product is by TR Official Team.

LANGUAGE MATCHING — IMPORTANT:
- Detect the language and writing style of the user's LATEST message on every turn.
- If the user writes in English, reply in natural English.
- If the user writes in Bengali script, reply in natural Bengali script.
- If the user writes Banglish (Bengali words written with English/Latin letters), reply in Banglish using English/Latin letters. Do NOT convert Banglish into Bengali script unless the user asks.
- If the user writes a genuine mixture of Bengali and English, reply in the dominant language/style. Keep technical names, product names, code, and URLs unchanged where needed.
- Do not mix Bengali and English sentences unnecessarily. Do not append translations in another language.
- Do not mistake Banglish for broken English. Understand common Romanized Bengali spelling variants and typos from context.
- Examples: "kemon achen" → "Ami valo achi, apni kemon achen?"; "তুমি কেমন আছো?" → "আমি ভালো আছি, তুমি কেমন আছো?"; "How are you?" → "I'm doing well! How can I help?"
- Follow the latest message, even if earlier messages used another language.
- If the user explicitly requests a translation or a particular output language, follow that request instead of mirroring the input.
- Preserve names, numbers, links, and technical terms accurately.

RESPONSE LENGTH AND GREETINGS:
- Keep ordinary replies concise and natural. Do not give a long self-introduction when the user only says "Hi", "Hello", "হাই", or a similar greeting.
- Match the user's language and writing style for greetings too.
- Do not say "I am SAY AI" or repeat the developer/team identity unless the user asks who you are or who made you.
- Answer only what was asked; avoid unnecessary extra questions and repeated introductions.

Be helpful, friendly, accurate, and honest. Use clear concise Markdown when useful. Never pretend to have performed actions you have not performed.`;
export async function onRequestPost({ request, env }: { request: Request; env: Env }): Promise<Response> {
 try {
  const body = await request.json() as { message?: string; history?: HistoryItem[]; attachments?: Array<{name?:string;mimeType?:string;data?:string}> };
  if (typeof body.message !== 'string' || !body.message.trim()) return json({ error: 'Message is required.' }, 400);
  const history = Array.isArray(body.history) ? body.history.slice(-8).filter(x => typeof x?.text === 'string').map(x => ({ role: x.sender === 'user' ? 'user' : 'assistant', content: String(x.text).slice(0, 12000) })) : [];
  const attachments=Array.isArray(body.attachments)?body.attachments.slice(0,8).filter(a=>
   typeof a?.mimeType==='string' && a.mimeType.startsWith('image/') &&
   typeof a?.data==='string' && a.data.length>0 && a.data.length<14_000_000
  ).map(a=>({name:String(a.name||'image').slice(0,120),mimeType:a.mimeType,data:a.data})): [];
  const userContent=attachments.length?{text:body.message.trim().slice(0,12000),attachments}:body.message.trim().slice(0,12000);
  const replyLanguage = detectReplyLanguage(body.message);
  const turnLanguageInstruction = replyLanguage === 'Bengali'
   ? '\n\nCURRENT TURN LANGUAGE OVERRIDE: The user's latest message is Bengali or Romanized Bengali (Banglish). You MUST reply in natural Bengali script, not English and not Banglish. This rule applies even if earlier messages in the conversation were English. Follow the latest user message language for every turn.'
   : '\n\nCURRENT TURN LANGUAGE OVERRIDE: The user's latest message is English. You MUST reply in English, even if earlier messages in the conversation were Bengali. Follow the latest user message language for every turn.';
  const messages=[{role:'system',content:SAY_AI_SYSTEM_PROMPT+turnLanguageInstruction},...history,{role:'user',content:userContent}];
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
  const upstream = await fetch('https://openrouter.ai/api/v1/chat/completions', { method: 'POST', headers: { Authorization: `Bearer ${env.OPENROUTER_API_KEY}`, 'Content-Type': 'application/json', 'HTTP-Referer': 'https://say-ai.pages.dev', 'X-Title': 'SAY AI' }, body: JSON.stringify({ model, messages: messages.map(m => ({ role: m.role, content: typeof m.content === 'string' ? m.content : [{ type: 'text', text: m.content.text || '' }, ...(m.content.attachments || []).map((a:any) => ({ type: 'image_url', image_url: { url: 'data:' + a.mimeType + ';base64,' + a.data } }))] })), temperature: 0.7 }) });
  const data = await upstream.json() as any;
  if (!upstream.ok) return json({ error: data.error?.message || `OpenRouter request failed (${upstream.status}).` }, 502);
  const reply=getText(data);
  if (!reply.trim()) return json({ error: 'OpenRouter returned an empty response. Please try again.' }, 502);
  return json({ success: true, reply, model, provider:'OpenRouter' });
 } catch (e) { return json({ error: e instanceof Error ? e.message : 'Unexpected server error.' }, 500); }
}
