type Env = { SAY_AI_CONFIG?: KVNamespace; VITE_SUPABASE_URL?: string; VITE_SUPABASE_ANON_KEY?: string };
type Provider = { id:string; name:string; type:string; model:string; apiKey:string; enabled:boolean; baseUrl:string };
type MediaProvider = Provider & { category:'image'|'video' };
type Config = { mode:'brain'|'single'; providers:Provider[]; imageProviders:MediaProvider[]; videoProviders:MediaProvider[]; selectedProviderId:string };
const corsHeaders:Record<string,string>={'Access-Control-Allow-Origin':'*','Access-Control-Allow-Methods':'GET, POST, PUT, OPTIONS','Access-Control-Allow-Headers':'Content-Type, Authorization','Access-Control-Max-Age':'86400','Vary':'Origin'};
const json=(data:unknown,status=200)=>new Response(JSON.stringify(data),{status,headers:{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store',...corsHeaders}});
export async function onRequestOptions(){return new Response(null,{status:204,headers:corsHeaders});}
const defaults:Config={mode:'brain',selectedProviderId:'gemini',providers:[
{id:'gemini',name:'Google Gemini',type:'gemini',model:'gemini-2.5-flash',apiKey:'',enabled:false,baseUrl:'https://generativelanguage.googleapis.com'},
{id:'openai',name:'OpenAI',type:'openai',model:'gpt-4o-mini',apiKey:'',enabled:false,baseUrl:'https://api.openai.com/v1'},
{id:'grok',name:'Grok (xAI)',type:'openai-compatible',model:'grok-3-mini-fast',apiKey:'',enabled:false,baseUrl:'https://api.x.ai/v1'},
{id:'groq',name:'Groq',type:'openai-compatible',model:'llama-3.3-70b-versatile',apiKey:'',enabled:false,baseUrl:'https://api.groq.com/openai/v1'},
{id:'cerebras',name:'Cerebras',type:'openai-compatible',model:'llama-3.3-70b',apiKey:'',enabled:false,baseUrl:'https://api.cerebras.ai/v1'},
{id:'cohere',name:'Cohere',type:'cohere',model:'command-a-03-2025',apiKey:'',enabled:false,baseUrl:'https://api.cohere.com/v2'},
{id:'anthropic',name:'Anthropic Claude',type:'anthropic',model:'claude-3-5-haiku-latest',apiKey:'',enabled:false,baseUrl:'https://api.anthropic.com/v1'},
{id:'deepseek',name:'DeepSeek',type:'openai-compatible',model:'deepseek-chat',apiKey:'',enabled:false,baseUrl:'https://api.deepseek.com/v1'},
{id:'mistral',name:'Mistral AI',type:'openai-compatible',model:'mistral-small-latest',apiKey:'',enabled:false,baseUrl:'https://api.mistral.ai/v1'},
{id:'together',name:'Together AI',type:'openai-compatible',model:'meta-llama/Llama-3.3-70B-Instruct-Turbo',apiKey:'',enabled:false,baseUrl:'https://api.together.xyz/v1'}
],imageProviders:[
{id:'hf-image',name:'Hugging Face Image',type:'huggingface',category:'image',model:'black-forest-labs/FLUX.1-schnell',apiKey:'',enabled:false,baseUrl:'https://router.huggingface.co/hf-inference/models'},
{id:'stability-image',name:'Stability AI',type:'stability',category:'image',model:'stable-image-core',apiKey:'',enabled:false,baseUrl:'https://api.stability.ai/v2beta/stable-image/generate'},
{id:'replicate-image',name:'Replicate Image',type:'replicate',category:'image',model:'black-forest-labs/flux-schnell',apiKey:'',enabled:false,baseUrl:'https://api.replicate.com/v1/predictions'}
],videoProviders:[
{id:'replicate-video',name:'Replicate Video',type:'replicate',category:'video',model:'minimax/video-01',apiKey:'',enabled:false,baseUrl:'https://api.replicate.com/v1/predictions'},
{id:'runway-video',name:'Runway',type:'runway',category:'video',model:'gen3a_turbo',apiKey:'',enabled:false,baseUrl:'https://api.dev.runwayml.com/v1'},
{id:'luma-video',name:'Luma Dream Machine',type:'luma',category:'video',model:'ray-2',apiKey:'',enabled:false,baseUrl:'https://api.lumalabs.ai/dream-machine/v1'}
]};
async function isAdmin(request:Request,env:Env){
const auth=request.headers.get('Authorization')||'';
const token=auth.toLowerCase().startsWith('bearer ')?auth.slice(7).trim():'';
const base=env.VITE_SUPABASE_URL||'';
if(!token||!base||!env.VITE_SUPABASE_ANON_KEY)return false;
try{
const url=base.endsWith('/')?base.slice(0,-1):base;
const headers={Authorization:'Bearer '+token,apikey:env.VITE_SUPABASE_ANON_KEY};
const userResponse=await fetch(url+'/auth/v1/user',{headers});
if(!userResponse.ok)return false;
const user=await userResponse.json() as {id?:string};
if(!user.id)return false;
const profileResponse=await fetch(url+'/rest/v1/profiles?id=eq.'+encodeURIComponent(user.id)+'&select=role',{headers});
if(!profileResponse.ok)return false;
const rows=await profileResponse.json() as Array<{role?:string}>;
return String(rows?.[0]?.role||'').trim().toLowerCase()==='admin';
}catch{return false;}
}
const cleanProvider=(p:Provider,old:Provider|undefined):Provider=>({id:String(p.id),name:String(p.name),type:String(p.type),model:String(p.model),apiKey:String(p.apiKey||old?.apiKey||''),enabled:Boolean(p.enabled),baseUrl:String(p.baseUrl)});
export async function onRequest({request,env}:{request:Request;env:Env}):Promise<Response>{
if(request.method==='OPTIONS')return new Response(null,{status:204,headers:corsHeaders});
if(!await isAdmin(request,env))return json({error:'Admin access required.'},403);
if(!env.SAY_AI_CONFIG)return json({error:'Global configuration storage is not connected.'},503);
const key='private-ai-brain-config';
if(request.method==='GET'){
const saved=await env.SAY_AI_CONFIG.get<Config>(key,'json');
const cfg=saved?{
...defaults,...saved,
providers:[...(saved.providers||[]),...defaults.providers.filter(d=>!(saved.providers||[]).some(p=>p.id===d.id))],
imageProviders:[...(saved.imageProviders||[]),...defaults.imageProviders.filter(d=>!(saved.imageProviders||[]).some(p=>p.id===d.id))],
videoProviders:[...(saved.videoProviders||[]),...defaults.videoProviders.filter(d=>!(saved.videoProviders||[]).some(p=>p.id===d.id))]
}:defaults;
const mask=(p:Provider)=>({...p,apiKeyConfigured:Boolean(p.apiKey),apiKey:''});
return json({...cfg,providers:cfg.providers.map(mask),imageProviders:cfg.imageProviders.map(mask),videoProviders:cfg.videoProviders.map(mask)});
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
}else if(p.type==='anthropic'){
response=await fetch((p.baseUrl.endsWith('/')?p.baseUrl.slice(0,-1):p.baseUrl)+'/messages',{method:'POST',headers:{'x-api-key':p.apiKey,'anthropic-version':'2023-06-01','Content-Type':'application/json'},body:JSON.stringify({model:p.model,max_tokens:8,messages:[{role:'user',content:'Reply with OK.'}]})});
}else{
const url=p.baseUrl.replace(/\/$/,'');
response=await fetch(url+'/chat/completions',{method:'POST',headers:{Authorization:'Bearer '+p.apiKey,'Content-Type':'application/json'},body:JSON.stringify({model:p.model,messages:[{role:'user',content:'Reply with OK.'}],max_tokens:8})});
}
const data=await response.json() as {error?:{message?:string};message?:string};
if(!response.ok)return json({error:data.message||data.error?.message||'Provider returned HTTP '+response.status},502);
return json({success:true,message:'Connected · '+(Date.now()-start)+' ms'});
}catch(e){return json({error:e instanceof Error?e.message:'Provider test failed.'},502);}
}
if(request.method==='PUT'){
try{
const input=await request.json() as Config;
if(!Array.isArray(input.providers)||!Array.isArray(input.imageProviders)||!Array.isArray(input.videoProviders)||!['brain','single'].includes(input.mode))return json({error:'Invalid AI provider settings.'},400);
const existing=await env.SAY_AI_CONFIG.get<Config>(key,'json');
const previousChat=new Map((existing?.providers||[]).map(p=>[p.id,p]));
const previousImage=new Map((existing?.imageProviders||[]).map(p=>[p.id,p]));
const previousVideo=new Map((existing?.videoProviders||[]).map(p=>[p.id,p]));
const clean:Config={
mode:input.mode,
selectedProviderId:String(input.selectedProviderId||''),
providers:input.providers.slice(0,10).map(p=>cleanProvider(p,previousChat.get(p.id))),
imageProviders:input.imageProviders.slice(0,10).map(p=>({...cleanProvider(p,previousImage.get(p.id)),category:'image' as const})),
videoProviders:input.videoProviders.slice(0,10).map(p=>({...cleanProvider(p,previousVideo.get(p.id)),category:'video' as const}))
};
const all=[...clean.providers,...clean.imageProviders,...clean.videoProviders];
if(all.some(p=>!p.id||!p.name||!p.model||!p.baseUrl))return json({error:'Every provider needs a name, model and endpoint.'},400);
await env.SAY_AI_CONFIG.put(key,JSON.stringify(clean));
return json({success:true,message:'All provider settings saved on the server.',counts:{chat:clean.providers.length,image:clean.imageProviders.length,video:clean.videoProviders.length}});
}catch{return json({error:'Invalid settings payload.'},400);}
}
return json({error:'Method not allowed.'},405);
}