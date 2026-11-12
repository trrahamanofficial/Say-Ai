type Provider = { id:string; name:string; type:string; model:string; apiKey:string; enabled:boolean; baseUrl:string };
type Env = { SAY_AI_CONFIG?: KVNamespace };
const json=(data:unknown,status=200)=>new Response(JSON.stringify(data),{status,headers:{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store'}});
export async function onRequestGet({request,env}:{request:Request;env:Env}):Promise<Response>{
 try{
  const predictionId=new URL(request.url).searchParams.get('id')?.trim()||'';
  if(!predictionId||predictionId.length>200)return json({error:'A valid video prediction ID is required.'},400);
  if(!env.SAY_AI_CONFIG)return json({error:'Video AI settings storage is not connected.'},503);
  const config=await env.SAY_AI_CONFIG.get<{videoProviders?:Provider[]}>('private-ai-brain-config','json');
  const provider=(config?.videoProviders||[]).find(p=>p.enabled&&p.apiKey&&p.type==='replicate');
  if(!provider)return json({error:'No enabled Replicate Video provider is configured.'},503);
  const response=await fetch('https://api.replicate.com/v1/predictions/'+encodeURIComponent(predictionId),{method:'GET',headers:{Authorization:'Bearer '+provider.apiKey,Accept:'application/json'}});
  const data=await response.json() as any;
  if(!response.ok)return json({error:data?.detail||data?.error||'Replicate status check failed ('+response.status+').' },502);
  const status=String(data.status||'unknown');
  if(status==='succeeded'){
   const output=Array.isArray(data.output)?data.output.find((item:any)=>typeof item==='string'):data.output;
   if(typeof output==='string'&&/^https:\/\//.test(output))return json({success:true,status,videoUrl:output,provider:provider.name});
   return json({error:'Replicate finished but did not return a video URL.',status},502);
  }
  if(status==='failed'||status==='canceled')return json({success:false,status,error:data.error||'Video generation failed at the provider.'},502);
  return json({success:true,status,provider:provider.name});
 }catch(error){return json({error:error instanceof Error?error.message:'Could not check video status.'},500);}
}