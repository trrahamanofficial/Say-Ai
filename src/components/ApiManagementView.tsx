import React, { useEffect, useState } from 'react';
import { Sliders, CheckCircle2, AlertCircle, RefreshCw, KeyRound, Image as ImageIcon, Video, Brain, Eye, EyeOff, Save, ShieldCheck } from 'lucide-react';
import { AIProviderConfig, MediaProviderConfig, ScreenType } from '../types';

type Tab = 'chat' | 'image' | 'video';
interface ApiManagementViewProps {
  onNavigate: (screen: ScreenType) => void;
  providers: AIProviderConfig[];
  imageProviders: MediaProviderConfig[];
  videoProviders: MediaProviderConfig[];
  onSaveConfig: (chat: AIProviderConfig[], images: MediaProviderConfig[], videos: MediaProviderConfig[]) => Promise<void>;
  onTestProvider: (provider: AIProviderConfig) => Promise<void>;
  isTestingId: string | null;
  isSaving: boolean;
  saveMessage: string;
}
const fieldClass = 'w-full min-w-0 rounded-xl border border-cyan-900/50 bg-[#061526] px-3 py-2.5 text-sm text-white placeholder:text-slate-500 outline-none focus:border-cyan-400';
const labelClass = 'mb-1 block text-[11px] font-semibold uppercase tracking-wide text-slate-400';
export const ApiManagementView: React.FC<ApiManagementViewProps> = ({ providers, imageProviders, videoProviders, onSaveConfig, onTestProvider, isTestingId, isSaving, saveMessage }) => {
  const [tab,setTab]=useState<Tab>('chat');
  const [chat,setChat]=useState<AIProviderConfig[]>(providers);
  const [images,setImages]=useState<MediaProviderConfig[]>(imageProviders);
  const [videos,setVideos]=useState<MediaProviderConfig[]>(videoProviders);
  const [visible,setVisible]=useState<Record<string,boolean>>({});
  useEffect(()=>setChat(providers),[providers]);
  useEffect(()=>setImages(imageProviders),[imageProviders]);
  useEffect(()=>setVideos(videoProviders),[videoProviders]);
  const patchChat=(id:string,patch:Partial<AIProviderConfig>)=>setChat(prev=>prev.map(p=>p.id===id?{...p,...patch}:p));
  const patchImage=(id:string,patch:Partial<MediaProviderConfig>)=>setImages(prev=>prev.map(p=>p.id===id?{...p,...patch}:p));
  const patchVideo=(id:string,patch:Partial<MediaProviderConfig>)=>setVideos(prev=>prev.map(p=>p.id===id?{...p,...patch}:p));
  const toggle=(id:string)=>setVisible(prev=>({...prev,[id]:!prev[id]}));
  const renderMedia=(items:MediaProviderConfig[],update:(id:string,patch:Partial<MediaProviderConfig>)=>void)=>items.map(p=><section key={p.id} className="rounded-2xl border border-cyan-900/40 bg-[#0b1d30] p-4 space-y-3">
    <div className="flex items-center justify-between gap-3"><div><h3 className="font-bold text-white">{p.name}</h3><p className="text-xs text-slate-400">{p.apiKeyConfigured?'API key saved':'API key not added yet'}</p></div><label className="flex items-center gap-2 text-xs text-slate-300"><input type="checkbox" checked={p.enabled} onChange={e=>update(p.id,{enabled:e.target.checked})}/> Enabled</label></div>
    <div><label className={labelClass}>Model</label><input className={fieldClass} value={p.model} onChange={e=>update(p.id,{model:e.target.value})}/></div>
    <div><label className={labelClass}>API endpoint</label><input className={fieldClass} value={p.baseUrl} onChange={e=>update(p.id,{baseUrl:e.target.value})}/></div>
    <div><label className={labelClass}>API key</label><div className="flex gap-2"><input className={fieldClass} type={visible[p.id]?'text':'password'} placeholder={p.apiKeyConfigured?'Saved — leave blank to keep current key':'Paste API key'} value={p.apiKey} onChange={e=>update(p.id,{apiKey:e.target.value})}/><button type="button" onClick={()=>toggle(p.id)} className="shrink-0 rounded-xl border border-cyan-900/50 px-3 text-slate-300" aria-label="Show or hide key">{visible[p.id]?<EyeOff size={18}/>:<Eye size={18}/>}</button></div></div>
  </section>);
  return <div className="sayai-api sayai-screen mx-auto w-full max-w-4xl flex-1 space-y-5 p-3 sm:p-6">
    <header className="rounded-3xl border border-cyan-300/20 bg-gradient-to-br from-[#0d3545] to-[#14274c] p-5">
      <div className="flex items-center gap-3"><div className="rounded-2xl bg-cyan-400/10 p-3 text-cyan-200"><Sliders size={25}/></div><div><h2 className="text-xl font-extrabold text-white">AI API Management</h2><p className="text-xs text-slate-300">Manage Chat, Image and Video AI providers in one place</p></div></div>
      <p className="mt-4 flex items-center gap-2 text-xs text-emerald-200"><ShieldCheck size={15}/> API keys are saved through the secured server endpoint, not in public page code.</p>
    </header>
    <nav className="grid grid-cols-3 gap-2 rounded-2xl border border-cyan-900/40 bg-[#071727] p-2">
      {([{id:'chat',label:'Chat AI',icon:Brain},{id:'image',label:'Image AI',icon:ImageIcon},{id:'video',label:'Video AI',icon:Video}] as const).map(item=>{const Icon=item.icon;return <button key={item.id} type="button" onClick={()=>setTab(item.id)} className={`flex min-h-12 items-center justify-center gap-2 rounded-xl px-2 text-xs font-bold transition-colors ${tab===item.id?'bg-cyan-500 text-[#041522]':'text-slate-300 hover:bg-white/5'}`}><Icon size={17}/>{item.label}</button>})}
    </nav>
    {tab==='chat'&&<div className="space-y-3"><div className="flex items-center justify-between"><h3 className="font-bold text-white">10 Chat AI Providers</h3><span className="text-xs text-cyan-200">{chat.filter(p=>p.apiKeyConfigured||p.apiKey.trim()).length}/10 keys added</span></div>
      {chat.map((p,index)=><section key={p.id} className="rounded-2xl border border-cyan-900/40 bg-[#0b1d30] p-4 space-y-3">
        <div className="flex items-center justify-between gap-3"><div className="flex min-w-0 items-center gap-2"><span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-cyan-500/15 text-xs font-bold text-cyan-200">{index+1}</span><div className="min-w-0"><h3 className="truncate font-bold text-white">{p.name}</h3><p className="text-[11px] text-slate-400">{p.apiKeyConfigured?'Key saved on server':'Not configured'}</p></div></div><label className="flex shrink-0 items-center gap-2 text-xs text-slate-300"><input type="checkbox" checked={p.isEnabled} onChange={e=>patchChat(p.id,{isEnabled:e.target.checked})}/> On</label></div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2"><div><label className={labelClass}>Model</label><input className={fieldClass} value={p.model} onChange={e=>patchChat(p.id,{model:e.target.value})}/></div><div><label className={labelClass}>API endpoint</label><input className={fieldClass} value={p.baseUrl} onChange={e=>patchChat(p.id,{baseUrl:e.target.value})}/></div></div>
        <div><label className={labelClass}>API key</label><div className="flex gap-2"><input className={fieldClass} type={visible[p.id]?'text':'password'} placeholder={p.apiKeyConfigured?'Key already saved — leave blank to keep it':'Paste API key'} value={p.apiKey} onChange={e=>patchChat(p.id,{apiKey:e.target.value})}/><button type="button" onClick={()=>toggle(p.id)} className="shrink-0 rounded-xl border border-cyan-900/50 px-3 text-slate-300" aria-label="Show or hide key">{visible[p.id]?<EyeOff size={18}/>:<Eye size={18}/>}</button></div></div>
        <div className="flex items-center justify-between gap-2"><span className="text-[11px] text-slate-500">Connection: {p.status}</span><button type="button" disabled={isTestingId===p.id||!p.apiKey.trim()} onClick={()=>void onTestProvider(p)} className="flex items-center gap-2 rounded-lg border border-cyan-700/40 px-3 py-2 text-xs font-semibold text-cyan-200 disabled:opacity-40"><RefreshCw size={14} className={isTestingId===p.id?'animate-spin':''}/>{isTestingId===p.id?'Testing':'Test key'}</button></div>
      </section>)}
    </div>}
    {tab==='image'&&<div className="space-y-3"><div><h3 className="font-bold text-white">Image AI Providers</h3><p className="text-xs text-slate-400">Add image-generation API keys and choose which provider is enabled.</p></div>{renderMedia(images,patchImage)}</div>}
    {tab==='video'&&<div className="space-y-3"><div><h3 className="font-bold text-white">Video AI Providers</h3><p className="text-xs text-slate-400">Add video-generation API keys and choose which provider is enabled.</p></div>{renderMedia(videos,patchVideo)}</div>}
    <div className="sticky bottom-20 z-10 rounded-2xl border border-cyan-900/50 bg-[#071727]/95 p-3 backdrop-blur">
      {saveMessage&&<p role="status" className="mb-2 flex items-center gap-2 text-xs text-cyan-100">{saveMessage.startsWith('Saved')?<CheckCircle2 size={15}/>:<AlertCircle size={15} />}{saveMessage}</p>}
      <button type="button" disabled={isSaving} onClick={()=>void onSaveConfig(chat,images,videos)} className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-4 py-3 font-bold text-white shadow-lg disabled:opacity-50"><Save size={17}/>{isSaving?'Saving securely…':'Save all API settings'}</button>
    </div>
  </div>;
};
