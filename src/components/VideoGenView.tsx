import React, { useState } from 'react';
import { Video, Sparkles, RefreshCw, ArrowRight, Film } from 'lucide-react';
import { ScreenType } from '../types';

interface VideoGenViewProps { onNavigate: (screen: ScreenType) => void; }

export const VideoGenView: React.FC<VideoGenViewProps> = ({ onNavigate }) => {
  const [prompt, setPrompt] = useState('');
  const [cameraMotion, setCameraMotion] = useState('Orbit 360');
  const [aspect, setAspect] = useState('16:9');
  const [provider, setProvider] = useState<'zerogpu' | 'huggingface'>('zerogpu');
  const [isGenerating, setIsGenerating] = useState(false);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [generationMessage, setGenerationMessage] = useState('');

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;
    setIsGenerating(true); setGenerationMessage(''); setVideoUrl(null);
    try {
      const response = await fetch('/api/generate-video', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, cameraMotion, aspectRatio: aspect, provider })
      });
      const data = await response.json();
      if (!response.ok || !data.videoUrl) throw new Error(data.error || 'Video provider is not configured yet.');
      setVideoUrl(data.videoUrl);
      setGenerationMessage('Video generated successfully with ' + (data.provider || 'the selected provider') + '.');
    } catch (error) {
      setGenerationMessage(error instanceof Error ? error.message : 'Video generation failed. Please try again.');
    } finally { setIsGenerating(false); }
  };

  return (
    <div className="flex-1 max-w-4xl mx-auto w-full p-3 sm:p-6 space-y-6">
      <div className="relative rounded-3xl p-5 bg-gradient-to-r from-purple-900/80 via-indigo-900/80 to-blue-950/80 border border-purple-500/30 overflow-hidden shadow-[0_0_25px_rgba(147,51,234,0.3)]">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-fuchsia-600/30 border border-fuchsia-400/40 flex items-center justify-center text-fuchsia-300"><Film className="w-6 h-6" /></div>
          <div><h2 className="text-xl font-bold text-white tracking-tight">AI Video Generator</h2><p className="text-xs text-purple-200/80">Transform creative concepts into cinematic videos</p></div>
        </div>
      </div>

      <div className="rounded-2xl p-4 bg-[#0a0e2a]/80 border border-purple-900/30 space-y-3">
        <label className="text-xs font-semibold text-slate-300">Video Provider</label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <button type="button" onClick={() => setProvider('zerogpu')} className={'py-3 px-3 rounded-xl text-left text-xs font-semibold border ' + (provider === 'zerogpu' ? 'bg-purple-600/30 border-purple-400 text-white' : 'bg-[#0d1238] border-purple-900/40 text-slate-400')}>Free ZeroGPU · LTX Video<span className="block mt-1 text-[10px] font-normal opacity-80">Daily free account GPU quota · queue may apply</span></button>
          <button type="button" onClick={() => setProvider('huggingface')} className={'py-3 px-3 rounded-xl text-left text-xs font-semibold border ' + (provider === 'huggingface' ? 'bg-purple-600/30 border-purple-400 text-white' : 'bg-[#0d1238] border-purple-900/40 text-slate-400')}>Hugging Face Inference API<span className="block mt-1 text-[10px] font-normal opacity-80">Uses available inference credits</span></button>
        </div>
        <p className="text-[11px] leading-relaxed text-amber-200/80">{provider === 'zerogpu' ? 'ZeroGPU free quota is tied to the saved Hugging Face account (5 minutes/day for eligible free accounts). GPU time is not video duration. No paid fallback.' : 'Uses your saved Hugging Face token and available Inference Provider credits. No paid fallback is attempted.'}</p>
      </div>

      <form onSubmit={handleGenerate} className="space-y-4">
        <div className="rounded-2xl bg-[#090d29]/90 border border-purple-600/40 p-4">
          <label className="text-xs font-semibold text-purple-300 flex items-center gap-1.5 mb-2"><Sparkles className="w-4 h-4" />Video Scene Prompt</label>
          <textarea value={prompt} onChange={e => setPrompt(e.target.value)} placeholder="Describe your video scene, lighting, subject and atmosphere..." rows={4} className="w-full bg-transparent text-sm text-white placeholder-slate-400 focus:outline-none resize-none" />
        </div>
        <div className="rounded-2xl p-4 bg-[#0a0e2a]/80 border border-purple-900/30 space-y-3">
          <label className="text-xs font-semibold text-slate-300">Camera Motion</label>
          <div className="grid grid-cols-2 gap-2">{['Orbit 360', 'Slow Pan', 'Zoom In', 'FPV Drone'].map(motion => <button key={motion} type="button" onClick={() => setCameraMotion(motion)} className={'py-2.5 px-3 rounded-xl text-xs font-semibold transition-all ' + (cameraMotion === motion ? 'bg-purple-600 text-white shadow-md' : 'bg-[#0d1238] text-slate-400 hover:text-white')}>{motion}</button>)}</div>
        </div>
        <div className="rounded-2xl p-4 bg-[#0a0e2a]/80 border border-purple-900/30 space-y-3">
          <label className="text-xs font-semibold text-slate-300">Aspect Ratio</label>
          <div className="grid grid-cols-3 gap-2">{['16:9', '9:16', '1:1'].map(ratio => <button key={ratio} type="button" onClick={() => setAspect(ratio)} className={'py-2.5 px-3 rounded-xl text-xs font-semibold transition-all ' + (aspect === ratio ? 'bg-purple-600 text-white shadow-md' : 'bg-[#0d1238] text-slate-400 hover:text-white')}>{ratio}</button>)}</div>
        </div>
        <button type="submit" disabled={!prompt.trim() || isGenerating} className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-fuchsia-600 via-purple-600 to-indigo-600 disabled:opacity-40 text-white font-bold text-sm tracking-wide shadow-[0_0_20px_rgba(217,70,239,0.5)] transition-all flex items-center justify-center gap-2">
          {isGenerating ? <><RefreshCw className="w-5 h-5 animate-spin" />Synthesizing Video...</> : <><Video className="w-5 h-5" />Generate Video<ArrowRight className="w-5 h-5" /></>}
        </button>
      </form>
      {generationMessage && <p role="status" className="rounded-xl border border-purple-500/30 bg-purple-950/30 p-3 text-xs text-purple-200">{generationMessage}</p>}
      <div className="rounded-2xl p-5 bg-[#0a0e2a]/80 border border-purple-900/30 space-y-3">
        <h3 className="text-base font-bold text-white">Video Preview</h3>
        <div className="rounded-2xl overflow-hidden aspect-video bg-black/60 border border-purple-900/40 flex items-center justify-center">
          {videoUrl ? <video src={videoUrl} controls autoPlay loop className="w-full h-full object-cover" /> : <div className="text-center p-6 space-y-2"><Film className="w-12 h-12 text-purple-400/40 mx-auto" /><p className="text-sm font-semibold text-slate-300">No video generated yet</p><p className="text-xs text-slate-500">Enter a prompt and click Generate Video</p></div>}
        </div>
      </div>
    </div>
  );
};
