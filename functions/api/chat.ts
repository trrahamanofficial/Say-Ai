type Env = { OPENROUTER_API_KEY?: string; OPENROUTER_MODEL?: string; SAY_AI_CONFIG?: KVNamespace };
const corsHeaders:Record<string,string>={'Access-Control-Allow-Origin':'*','Access-Control-Allow-Methods':'POST, OPTIONS','Access-Control-Allow-Headers':'Content-Type, Authorization','Access-Control-Max-Age':'86400','Vary':'Origin'};
type HistoryItem = { sender?: string; text?: string };
type Provider = { id:string; name:string; type:string; model:string; apiKey:string; enabled:boolean; baseUrl:string };
type SavedConfig = { providers?:Provider[]; selectedProviderId?:string };
const json = (data: unknown, status = 200) => new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', ...corsHeaders } });
export async function onRequestOptions(){return new Response(null,{status:204,headers:corsHeaders});}
const getText=(data:any):string=>{
 const geminiParts=data?.candidates?.flatMap((candidate:any)=>candidate?.content?.parts||[])||[];
 const geminiText=geminiParts.map((part:any)=>typeof part?.text==='string'?part.text:'').filter(Boolean).join('\\n');
 if(geminiText.trim())return geminiText;
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
  upstream=await fetch('https://generativelanguage.googleapis.com/v1beta/models/'+encodeURIComponent(provider.model)+':generateContent?key='+encodeURIComponent(provider.apiKey),{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({systemInstruction:system?{parts:[{text:system}]}:undefined,contents,tools:[{google_search:{}}]})});
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
 let reply=getText(data);
 if(!reply.trim())throw new Error(provider.name+' returned an empty response.');
 // Gemini Google Search grounding: show the web sources used in the answer.
 if(provider.type==='gemini'){
  const candidates=data?.candidates||[];
  const chunks=candidates.flatMap((candidate:any)=>candidate?.groundingMetadata?.groundingChunks||[]);
  const sources=chunks.map((chunk:any)=>chunk?.web).filter((web:any)=>web?.uri)
   .map((web:any)=>({title:String(web.title||web.uri),uri:String(web.uri)}));
  const uniqueSources=Array.from(new Map(sources.map((source:any)=>[source.uri,source])).values()).slice(0,8);
  if(uniqueSources.length){
   reply+='\\n\\n**Sources:**\\n'+uniqueSources.map((source:any)=>'- ['+source.title.replace(/\\[/g,'(').replace(/\\]/g,')')+']('+source.uri+')').join('\\n');
  }
  const queries=candidates.flatMap((candidate:any)=>candidate?.groundingMetadata?.webSearchQueries||[]);
  const uniqueQueries=Array.from(new Set(queries.map((query:any)=>String(query)))).slice(0,4);
  if(uniqueQueries.length) reply+='\\n\\n**Web searches:** '+uniqueQueries.join('; ');
 }
 return reply;
}
function detectReplyLanguage(input: string): 'Bengali' | 'English' | 'Other' {
 const value=input.trim();
 if (/[\u0980-\u09ff]/.test(value)) return 'Bengali';
 const words=value.toLowerCase().replace(/[^a-z0-9\s]/g,' ').split(/\s+/).filter(Boolean);
 const bengaliRomanWords=new Set(['ami','amar','amr','amake','amk','amra','amader','apni','apnar','apnake','tumi','tomar','tomake','tomra','tor','kemon','kmn','achen','acho','aso','achi','acchi','achhi','ache','ase','valo','bhalo','khub','onek','ki','kikore','kivabe','keno','kothay','kothai','kokhon','kar','kake','ke','theke','sathe','songe','jonno','janno','baniye','banie','korbo','korben','koren','korcho','korchen','korche','korchi','korte','koro','kore','hobe','hobey','hoy','hocche','hochhe','hoise','hoye','dite','dao','den','din','bolun','bolo','bolben','bolbe','bolchi','bolche','chai','lagbe','parbo','parben','parbe','parchi','bujhi','bujhlam','bujhte','bujhcho','eta','ota','eita','oita','ekhane','okhane','ekhono','ekhon','abar','ar','na','naki','mane','dhonnobad','assalamu','alaikum','inshaallah','kirokom','kotha','bari','taka','kaj','hoyeche','hoyechhe','shudhu','sudhu','ekta','duto','hya','haa','thik','achha','accha','tahole','tobe','kintu','jodi','jemon','temon','sob','shob']);
 if(words.some(w=>bengaliRomanWords.has(w))) return 'Bengali';
 const englishIndicators=new Set(['the','is','are','was','were','what','who','when','where','why','how','please','hello','thanks','thank','you','your','can','could','would','should','does','do','did','have','has','with','from','this','that','and','but','for','not']);
 if(words.some(w=>englishIndicators.has(w))) return 'English';
 return 'Other';
}

const SAY_AI_SYSTEM_PROMPT = `You are SAY AI, the personal AI assistant created and developed by the TR Official Team.
IDENTITY: If asked who created, made, developed, owns, or built you, answer that the TR Official Team created SAY AI. State this naturally in the same language and writing style as the user's latest message. Never give a Bengali-and-English bilingual answer unless the user explicitly asks for both languages. Do not claim that OpenAI, Google, or another AI provider created SAY AI. You may explain that SAY AI can use third-party AI models/providers to generate answers, but the SAY AI product is by TR Official Team.

LANGUAGE MATCHING — IMPORTANT:
- Understand and support languages worldwide, not only Bengali and English. Reply in the same language the user used most recently, whenever possible.
- If the user writes Bengali in Bengali script, reply in natural Bengali script.
- If the user writes Bengali using English/Latin letters (Banglish/Romanized Bengali), understand it as Bengali and reply in proper Bengali script. Example: "ami valo achi, tumi kemon acho?" → "আমি ভালো আছি, তুমি কেমন আছো?" Never answer in Banglish unless explicitly requested.
- If the user writes in English, reply in natural English.
- If the user writes in Hindi, Urdu, Arabic, Spanish, French, or any other language, reply in that same language and its usual writing system/script.
- For mixed-language messages, reply in the dominant language. Preserve technical names, product names, code, and URLs.
- Never mistake Romanized Bengali for English merely because it uses Latin letters. Recognize common Bengali words, spelling variations, and typos from context.
- Follow the latest user message language, even if earlier messages used another language.
- If the user explicitly requests a translation or a particular output language, follow that request.
- Do not mix languages unnecessarily or append unsolicited translations.
- Preserve names, numbers, links, and technical terms accurately.

RESPONSE LENGTH AND GREETINGS:
- Keep ordinary replies concise and natural. Do not give a long self-introduction when the user only says "Hi", "Hello", "হাই", or a similar greeting.
- Match the user's language and writing style for greetings too.
- Do not say "I am SAY AI" or repeat the developer/team identity unless the user asks who you are or who made you.
- Answer only what was asked; avoid unnecessary extra questions and repeated introductions.

FACTUAL ANSWERING — IMPORTANT:
- Answer ordinary factual questions directly whenever you have enough reliable knowledge. Do not refuse or evade a question merely because rankings, popularity, or public facts can change.
- For questions asking who is the biggest, most popular, or number one, state the most likely answer and clearly say which measure you mean (for example, subscribers or views).
- If the user asks for a current/live ranking and you do not have live browsing or current verified data, say that the exact live number may have changed. Still provide the best known answer when reasonably certain; do not tell the user only to search elsewhere.
- Never invent exact current statistics. Separate a stable answer (such as the leading channel) from an unverified live subscriber count.
- If the wording is ambiguous, answer the most common interpretation first, then briefly clarify the measure.
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
  // Supply a fresh date on every request so the model does not guess from stale training data.
  const currentDate = new Intl.DateTimeFormat('en-IN', {
   timeZone: 'Asia/Kolkata',
   weekday: 'long',
   year: 'numeric',
   month: 'long',
   day: 'numeric'
  }).format(new Date());
  const currentDateInstruction = `\\n\\nCURRENT DATE (authoritative, Asia/Kolkata): ${currentDate}. If the user asks today's date, current day, month, or year, answer using this value. Never guess a different date from memory or training data. This value is refreshed for every request.`;
  const replyLanguage = detectReplyLanguage(body.message);
  const turnLanguageInstruction = replyLanguage === 'Bengali'
   ? '\n\nABSOLUTE OUTPUT LANGUAGE RULE FOR THIS TURN: The latest user message is Bengali (including Romanized Bengali/Banglish). Write the entire answer ONLY in standard Bengali using Bengali script. Do not use Latin-letter Banglish. Do not include an English translation, English summary, bilingual explanation, or a second-language version. Keep only unavoidable product names, proper nouns, URLs, code, and technical terms in their original form. Even if conversation history is English or mixed-language, ignore its language and follow this latest Bengali message. Example: "What is your name?" asked in English gets English; "ami tomar nam ki" gets only "তোমার নাম কী?"'
   : replyLanguage === 'English'
    ? '\n\nABSOLUTE OUTPUT LANGUAGE RULE FOR THIS TURN: The latest user message is English. Write the entire answer ONLY in natural English. Do not write Bengali script, do not translate the answer into Bengali, and do not add a second-language version. Keep only unavoidable proper nouns, URLs, code, and technical terms as-is. Ignore the language of conversation history.'
    : '\n\nABSOLUTE OUTPUT LANGUAGE RULE FOR THIS TURN: Detect the language of the latest user message and write the entire answer ONLY in that language and its normal writing system. Do not add translations or bilingual text. Ignore the language of conversation history. For Romanized input, identify the actual language rather than assuming it is English. Keep only unavoidable proper nouns, URLs, code, and technical terms as-is.';
  const messages=[{role:'system',content:SAY_AI_SYSTEM_PROMPT+currentDateInstruction+turnLanguageInstruction},...history,{role:'user',content:userContent}];
  let saved:SavedConfig|null=null;
  if(env.SAY_AI_CONFIG){try{saved=await env.SAY_AI_CONFIG.get<SavedConfig>('private-ai-brain-config','json');}catch{}}
  const active=(saved?.providers||[]).filter(p=>p.enabled&&p.apiKey&&p.model&&p.baseUrl);
  if(active.length){
   const selected=active.find(p=>p.id===saved?.selectedProviderId);
   const liveSearchProvider=active.find(p=>p.type==='gemini');
   const ordered=[...new Map([...(liveSearchProvider?[liveSearchProvider]:[]),...(selected?[selected]:[]),...active].map(p=>[p.id,p])).values()];
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
