type Provider = { id:string; name:string; type:string; model:string; apiKey:string; enabled:boolean; baseUrl:string };
type Env = { SAY_AI_CONFIG?: KVNamespace };
const json=(data:unknown,status=200)=>new Response(JSON.stringify(data),{status,headers:{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store'}});
const dataUrl=async(blob:Blob)=>{const bytes=new Uint8Array(await blob.arrayBuffer());let binary='';for(let i=0;i<bytes.length;i+=0x8000)binary+=String.fromCharCode(...bytes.subarray(i,i+0x8000));return 'data:'+(blob.type||'image/png')+';base64,'+btoa(binary);};
export async function onRequestPost({request,env}:{request:Request;env:Env}):Promise<Response>{
 try{
  const body=await request.json() as {prompt?:string;category?:string};
  const prompt=String(body.prompt||'').trim();
  if(!prompt)return json({error:'Please enter an image prompt.'},400);
  if(prompt.length>2000)return json({error:'Image prompt is too long (maximum 2,000 characters).'},400);
  if(!env.SAY_AI_CONFIG)return json({error:'Image AI settings storage is not connected. Configure the SAY_AI_CONFIG KV binding.'},503);
  const config=await env.SAY_AI_CONFIG.get<{imageProviders?:Provider[]}>('private-ai-brain-config','json');
  const provider=(config?.imageProviders||[]).find(p=>p.enabled&&p.apiKey&&p.model&&p.baseUrl);
  if(!provider)return json({error:'No Image AI provider is enabled. Add an Image AI key in API Management and save settings.'},503);
  if(provider.type==='stability'){
   const form=new FormData();form.set('prompt',prompt);form.set('output_format','png');
   const response=await fetch(provider.baseUrl.replace(/\/$/,''),{method:'POST',headers:{Authorization:'Bearer '+provider.apiKey,Accept:'image/*'},body:form});
   if(!response.ok){const message=await response.text();return json({error:'Stability AI: '+message.slice(0,500)},502);}
   const blob=await response.blob();return json({success:true,imageUrl:await dataUrl(blob),provider:provider.name});
  }
  if(provider.type==='huggingface'){
   const endpoint=provider.baseUrl.replace(/\/$/,'')+'/'+provider.model;
   const response=await fetch(endpoint,{method:'POST',headers:{Authorization:'Bearer '+provider.apiKey,'Content-Type':'application/json',Accept:'image/png'},body:JSON.stringify({inputs:prompt,options:{wait_for_model:true}})});
   if(!response.ok){const message=await response.text();return json({error:'Hugging Face: '+message.slice(0,500)},502);}
   const blob=await response.blob();if(!blob.type.startsWith('image/'))return json({error:'The selected Hugging Face model did not return an image. Check the model ID and provider.'},502);
   return json({success:true,imageUrl:await dataUrl(blob),provider:provider.name});
  }
  if(provider.type==='replicate'){
   const response=await fetch(provider.baseUrl.replace(/\/$/,''),{method:'POST',headers:{Authorization:'Bearer '+provider.apiKey,'Content-Type':'application/json','Prefer':'wait=20'},body:JSON.stringify({input:{prompt}})});
   const data=await response.json() as any;
   if(!response.ok)return json({error:data?.detail||data?.error||'Replicate returned HTTP '+response.status},502);
   const output=Array.isArray(data.output)?data.output[0]:data.output;
   if(typeof output==='string'&&/^https:\/\//.test(output))return json({success:true,imageUrl:output,provider:provider.name});
   return json({error:'Replicate accepted the image request but it is still processing. Please retry in a moment.'},504);
  }
  return json({error:'Unsupported Image AI provider type: '+provider.type+'. Use Hugging Face, Stability AI, or Replicate.'},400);
 }catch(error){return json({error:error instanceof Error?error.message:'Image generation failed unexpectedly.'},500);}
}