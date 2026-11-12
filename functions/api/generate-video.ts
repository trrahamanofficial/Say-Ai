type Provider = { id:string; name:string; type:string; model:string; apiKey:string; enabled:boolean; baseUrl:string };
type Env = { SAY_AI_CONFIG?: KVNamespace };
const json=(data:unknown,status=200)=>new Response(JSON.stringify(data),{status,headers:{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store'}});
export async function onRequestPost({request,env}:{request:Request;env:Env}):Promise<Response>{
 try{
  const body=await request.json() as {prompt?:string;cameraMotion?:string;aspectRatio?:string};
  const prompt=String(body.prompt||'').trim();
  if(!prompt)return json({error:'Please enter a video prompt.'},400);
  if(prompt.length>2000)return json({error:'Video prompt is too long (maximum 2,000 characters).'},400);
  if(!env.SAY_AI_CONFIG)return json({error:'Video AI settings storage is not connected. Configure the SAY_AI_CONFIG KV binding.'},503);
  const config=await env.SAY_AI_CONFIG.get<{videoProviders?:Provider[]}>('private-ai-brain-config','json');
  const provider=(config?.videoProviders||[]).find(p=>p.enabled&&p.apiKey&&p.model&&p.baseUrl);
  if(!provider)return json({error:'No Video AI provider is enabled. Add a supported Video AI key in API Management and save settings.'},503);
  if(provider.type!=='replicate')return json({error:'The current Video AI generation workflow supports Replicate predictions. Select the Replicate Video provider and add its API token.'},400);
  const input:Record<string,unknown>={prompt};
  if(body.aspectRatio)input.aspect_ratio=body.aspectRatio;
  const root=provider.baseUrl.replace(/\/$/,'');
  const endpoint=root.endsWith('/predictions')&&provider.model.includes('/')?root.replace(/\/predictions$/,'/models/'+provider.model+'/predictions'):root;
  const response=await fetch(endpoint,{method:'POST',headers:{Authorization:'Bearer '+provider.apiKey,'Content-Type':'application/json'},body:JSON.stringify({input})});
  const data=await response.json() as any;
  if(!response.ok)return json({error:data?.detail||data?.error||'Replicate returned HTTP '+response.status},502);
  if(!data.id)return json({error:'Video provider did not return a prediction ID.'},502);
  if(data.status==='succeeded'){
   const output=Array.isArray(data.output)?data.output[0]:data.output;
   if(typeof output==='string')return json({success:true,videoUrl:output,provider:provider.name});
  }
  if(data.status==='failed'||data.status==='canceled')return json({error:data.error||'Video generation failed at the provider.'},502);
  return json({success:true,pending:true,predictionId:data.id,provider:provider.name},202);
 }catch(error){return json({error:error instanceof Error?error.message:'Video generation failed unexpectedly.'},500);}
}