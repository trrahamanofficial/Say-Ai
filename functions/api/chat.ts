const trimSlash=(s:string)=>s.endsWith('/')?s.slice(0,-1):s;
type P={id:string;name:string;type:string;model:string;apiKey:string;enabled:boolean;baseUrl:string};
type C={mode:'brain'|'single';selectedProviderId:string;providers:P[]};
type Env={SAY_AI_CONFIG?:KVNamespace};
type H={sender?:string;text?:string};
const corsHeaders:Record<string,string>={'Access-Control-Allow-Origin':'*','Access-Control-Allow-Methods':'POST, OPTIONS','Access-Control-Allow-Headers':'Content-Type, Authorization','Access-Control-Max-Age':'86400'};
const out=(x:unknown,s=200)=>new Response(JSON.stringify(x),{status:s,headers:{'Content-Type':'application/json','Cache-Control':'no-store',...corsHeaders}});
export async function onRequestOptions(){return new Response(null,{status:204,headers:corsHeaders});}
const identity='You are SAY AI, created by TR OFFICIAL Team. CRITICAL LANGUAGE RULE: Identify the language AND writing style of the latest user message before answering. Understand Bengali written in Latin letters (Banglish/Benglish transliteration) as Bengali, not English or gibberish. Examples of Banglish: "Ekhon kon video besi viral hocche" means "এখন কোন ভিডিও বেশি ভাইরাল হচ্ছে?"; "kemon acho" means "কেমন আছো?"; "amar kotha bujhte parcho?" means "আমার কথা বুঝতে পারছো?". Understand common spelling variations and informal phonetic spellings without asking the user to translate. If the user writes Banglish in Latin letters, reply in clear, natural Banglish using Latin letters. If the user writes Bengali script, reply in Bengali script. If the user writes English, reply in English. Apply the same rule to Urdu, Arabic, and every other language: reply in the language and script/style the user used. Never answer with a generic clarification when the intent is understandable. For questions about current or viral trends, clearly say if you cannot access live/current data; do not pretend to know today\'s trend. If anyone asks who created, made, built, or developed you, answer in the same language and writing style as the question while keeping the creator name exactly "TR OFFICIAL Team". Examples: English: "I was created by TR OFFICIAL Team." Bengali: "আমাকে TR OFFICIAL Team তৈরি করেছে।" Banglish: "Amake TR OFFICIAL Team toiri koreche." Urdu: "مجھے TR OFFICIAL Team نے بنایا ہے۔" Arabic: "تم إنشائي بواسطة TR OFFICIAL Team." Keep this identity consistent in single-provider and multi-AI Brain responses. Be helpful, direct, accurate, and concise.';
async function ask(p:P,prompt:string,history:H[]){
 if(!p.apiKey?.trim())throw Error('API key is missing from server storage.');
 if(p.type==='cohere'){
  const r=await fetch('https://api.cohere.com/v2/chat',{method:'POST',headers:{Authorization:'Bearer '+p.apiKey,'Content-Type':'application/json'},body:JSON.stringify({model:p.model,messages:[{role:'system',content:identity},...history.map(h=>({role:h.sender==='user'?'user':'assistant',content:String(h.text||'').slice(0,2500)})),{role:'user',content:prompt}],max_tokens:700,temperature:0.3})});
  const d=await r.json() as any;
  if(!r.ok)throw Error(d.message||d.error?.message||'Cohere HTTP '+r.status);
  const text=(d.message?.content||[]).map((v:any)=>v.text||'').join('');
  if(!text.trim())throw Error('Cohere returned an empty response.');
  return text;
 }
 if(p.type==='gemini'){
  const contents=[...history.map(h=>({role:h.sender==='user'?'user':'model',parts:[{text:String(h.text||'').slice(0,5000)}]})),{role:'user',parts:[{text:prompt}]}];
  const r=await fetch('https://generativelanguage.googleapis.com/v1beta/models/'+encodeURIComponent(p.model)+':generateContent?key='+encodeURIComponent(p.apiKey),{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({contents,systemInstruction:{parts:[{text:identity}]}})});
  const d=await r.json() as any;
  if(!r.ok)throw Error(d.error?.message||'Gemini HTTP '+r.status);
  const text=d.candidates?.[0]?.content?.parts?.map((v:any)=>v.text||'').join('')||'';
  if(!text.trim())throw Error('Provider returned an empty response.');
  return text;
 }
 const r=await fetch(trimSlash(p.baseUrl)+'/chat/completions',{method:'POST',headers:{Authorization:'Bearer '+p.apiKey,'Content-Type':'application/json'},body:JSON.stringify({model:p.model,messages:[{role:'system',content:identity},...history.map(h=>({role:h.sender==='user'?'user':'assistant',content:String(h.text||'').slice(0,5000)})),{role:'user',content:prompt}],temperature:0.6})});
 const d=await r.json() as any;
 if(!r.ok)throw Error(d.error?.message||p.name+' HTTP '+r.status);
 const v=d.choices?.[0]?.message?.content;
 const text=typeof v==='string'?v:Array.isArray(v)?v.map((z:any)=>z.text||'').join(''):'';
 if(!text.trim())throw Error('Provider returned an empty response.');
 return text;
}
export async function onRequestPost({request,env}:{request:Request;env:Env}){
 try{
  const b=await request.json() as {message?:string;history?:H[]};
  if(!b.message?.trim())return out({error:'Message is required.'},400);
  const c=await env.SAY_AI_CONFIG?.get<C>('private-ai-brain-config','json');
  if(!c)return out({error:'AI Brain is not configured in your Personal Admin Dashboard.'},503);
  const active=(c.providers||[]).filter(p=>p.enabled&&p.apiKey&&p.model);
  const chosen=c.mode==='single'?active.filter(p=>p.id===c.selectedProviderId):active;
  if(!chosen.length)return out({error:'No enabled provider has a saved API key. Open AI Brain settings, confirm the provider shows “API key saved on server”, and save settings again.'},503);
  const results=await Promise.all(chosen.map(async p=>{
   const t=Date.now();
   try{return {id:p.id,name:p.name,reply:await ask(c.mode==='single'&&p.type==='cohere'?{...p,model:'command-r7b-12-2024'}:p,b.message!.trim().slice(0,10000),c.mode==='single'?[]:(Array.isArray(b.history)?b.history.slice(-4):[])),ms:Date.now()-t};}
   catch(e){return {id:p.id,name:p.name,error:e instanceof Error?e.message:'Provider failed',ms:Date.now()-t};}
  }));
  const good=results.filter(x=>'reply'in x&&x.reply?.trim());
  if(!good.length){
   const details=results.map(x=>x.name+': '+('error'in x?x.error:'No response')).join(' | ');
   return out({error:'All enabled providers failed. '+details,providerResults:results},502);
  }
  if(c.mode==='single'||good.length===1)return out({success:true,reply:good[0].reply,mode:c.mode,providerResults:results});
  const joined=good.map(x=>'['+x.name+']\\n'+x.reply).join('\\n\\n---\\n\\n');
  const brain=chosen.find(p=>p.id===c.selectedProviderId)||chosen[0];
  let final='';
  try{final=await ask(brain,'Combine these independent AI answers into one accurate, useful response. Resolve contradictions carefully and do not invent facts.\\n\\n'+joined,[]);}catch{}
  return out({success:true,reply:final.trim()||joined,mode:'brain',providerResults:results});
 }catch(e){return out({error:e instanceof Error?e.message:'Unexpected chat error.'},500);}
}
