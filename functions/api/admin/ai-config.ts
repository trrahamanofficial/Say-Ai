type Env = { SAY_AI_CONFIG?: KVNamespace; VITE_SUPABASE_URL?: string; VITE_SUPABASE_ANON_KEY?: string };
type Provider = { id:string; name:string; type:string; model:string; apiKey:string; enabled:boolean; baseUrl:string };
type Config = { mode:'brain'|'single'; providers:Provider[]; selectedProviderId:string };
const json=(data:unknown,status=200)=>new Response(JSON.stringify(data),{status,headers:{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store'}});
const defaults:Config={mode:'brain',selectedProviderId:'gemini',providers:[
{id:'gemini',name:'Google Gemini',type:'gemini',model:'gemini-2.5-flash',apiKey:'',enabled:false,baseUrl:'https://generativelanguage.googleapis.com'},
{id:'openai',name:'OpenAI',type:'openai',model:'gpt-4o-mini',apiKey:'',enabled:false,baseUrl:'https://api.openai.com/v1'},
{id:'grok',name:'Grok (xAI)',type:'openai-compatible',model:'grok-3-mini-fast',apiKey:'',enabled:false,baseUrl:'https://api.x.ai/v1'},
{id:'groq',name:'Groq',type:'openai-compatible',model:'llama-3.3-70b-versatile',apiKey:'',enabled:false,baseUrl:'https://api.groq.com/openai/v1'},
{id:'cerebras',name:'Cerebras',type:'openai-compatible',model:'llama-3.3-70b',apiKey:'',enabled:false,baseUrl:'https://api.cerebras.ai/v1'},
{id:'cohere',name:'Cohere',type:'cohere',model:'command-a-03-2025',apiKey:'',enabled:false,baseUrl:'https://api.cohere.com/v2'}
]};
async function isAdmin(request:Request,env:Env){
const auth=request.headers.get('Authorization')||'';
const token=auth.toLowerCase().startsWith('bearer ')?auth.slice(7).trim():'';
const base=env.VITE_SUPABASE_URL||'';
if(!token||!base||!env.VITE_SUPABASE_ANON_KEY)return false;
try{
const url=base.endsWith('/')?base.slice(0,-1):base;
const r=await fetch(url+'/auth/v1/user',{headers:{Authorization:'Bearer '+token,apikey:env.VITE_SUPABASE_ANON_KEY}});
if(!r.ok)return false;
const u=await r.json() as {email?:string};
return (u.email||'').toLowerCase()==='trrahaman.official0.6@gmail.com';
}catch{return false;}
}
export async function onRequest({request,env}:{request:Request;env:Env}):Promise<Response>{
if(!await isAdmin(request,env))return json({error:'Admin access required.'},403);
if(!env.SAY_AI_CONFIG)return json({error:'Global configuration storage is not connected.'},503);
const key='private-ai-brain-config';
if(request.method==='GET'){
const saved=await env.SAY_AI_CONFIG.get<Config>(key,'json');
const cfg=saved||defaults;
return json({...cfg,providers:cfg.providers.map(p=>({...p,apiKeyConfigured:Boolean(p.apiKey),apiKey:''}))});
}
if(request.method==='POST'){
try{
const p=await request.json() as Provider;
if(!p.apiKey||!p.model||!p.baseUrl)return json({error:'API key, model and endpoint are required.'},400);
const start=Date.now();
let response:Response;
if(p.type==='cohere'){
response=await fetch('https://api.cohere.com/v2/chat',{method:'POST',headers:{Authorization:'Bearer '+p.apiKey,'Content-Type':'application/json'},body:JSON.stringify({model:p.model,messages:[{role:'user',content:'Reply with OK.'}]})});
}else if(p.type==='gemini'){
response=await fetch('https://generativelanguage.googleapis.com/v1beta/models/'+encodeURIComponent(p.model)+':generateContent?key='+encodeURIComponent(p.apiKey),{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({contents:[{role:'user',parts:[{text:'Reply with OK.'}]}]})});
}else{
response=await fetch((p.baseUrl.endsWith('/')?p.baseUrl.slice(0,-1):p.baseUrl)+'/chat/completions',{method:'POST',headers:{Authorization:'Bearer '+p.apiKey,'Content-Type':'application/json'},body:JSON.stringify({model:p.model,messages:[{role:'user',content:'Reply with OK.'}],max_tokens:8})});
}
const data=await response.json() as {error?:{message?:string}};
if(!response.ok)return json({error:data.error?.message||'Provider returned HTTP '+response.status},502);
return json({success:true,message:'Connected · '+(Date.now()-start)+' ms'});
}catch(e){return json({error:e instanceof Error?e.message:'Provider test failed.'},502);}
}
if(request.method==='PUT'){
try{
const input=await request.json() as Config;
if(!Array.isArray(input.providers)||!['brain','single'].includes(input.mode))return json({error:'Invalid AI Brain settings.'},400);
const existing=await env.SAY_AI_CONFIG.get<Config>(key,'json');
const previous=new Map((existing?.providers||[]).map(p=>[p.id,p]));
const clean:Config={mode:input.mode,selectedProviderId:String(input.selectedProviderId||''),providers:input.providers.slice(0,6).map(p=>({id:String(p.id),name:String(p.name),type:String(p.type),model:String(p.model),apiKey:String(p.apiKey||previous.get(p.id)?.apiKey||''),enabled:Boolean(p.enabled),baseUrl:String(p.baseUrl)}))};
if(clean.providers.some(p=>!p.id||!p.model||!p.baseUrl))return json({error:'Every provider needs a model and endpoint.'},400);
await env.SAY_AI_CONFIG.put(key,JSON.stringify(clean));
return json({success:true,message:'Settings saved globally.'});
}catch{return json({error:'Invalid settings payload.'},400);}
}
return json({error:'Method not allowed.'},405);
}