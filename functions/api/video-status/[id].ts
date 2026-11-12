type Provider = { type:string; apiKey:string; enabled:boolean };
type Env = { SAY_AI_CONFIG?: KVNamespace };
export async function onRequestGet({params,env}:{params:{id:string};env:Env}):Promise<Response>{
 const json=(data:unknown,status=200)=>new Response(JSON.stringify(data),{status,headers:{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store'}});
 try{
  const id=String(params.id||'');
  if(!/^[a-zA-Z0-9_-]{5,80}$/.test(id))return json({error:'Invalid video job ID.'},400);
  const config=env.SAY_AI_CONFIG?await env.SAY_AI_CONFIG.get<{videoProviders?:Provider[]}>('private-ai-brain-config','json'):null;
  const provider=(config?.videoProviders||[]).find(p=>p.enabled&&p.type==='replicate'&&p.apiKey);
  if(!provider)return json({error:'Replicate Video provider is no longer enabled.'},503);
  const response=await fetch('https://api.replicate.com/v1/predictions/'+encodeURIComponent(id),{headers:{Authorization:'Bearer '+provider.apiKey}});
  const data=await response.json() as any;
  if(!response.ok)return json({error:data?.detail||'Could not check video generation status.'},502);
  if(data.status==='succeeded'){const output=Array.isArray(data.output)?data.output[0]:data.output;if(typeof output!=='string')return json({error:'Video provider completed without a video URL.'},502);return json({status:'succeeded',videoUrl:output});}
  if(data.status==='failed'||data.status==='canceled')return json({status:data.status,error:data.error||'Video generation failed.'},502);
  return json({status:data.status||'processing'});
 }catch{return json({error:'Could not check video generation status.'},500);}
}