import React, { useState } from 'react';
import { Video, Sparkles, Play, RefreshCw, Download, ArrowRight, Film, Sliders } from 'lucide-react';
import { ScreenType } from '../types';

interface VideoGenViewProps {
  onNavigate: (screen: ScreenType) => void;
}

export const VideoGenView: React.FC<VideoGenViewProps> = ({ onNavigate }) => {
  const [prompt, setPrompt] = useState('');
  const [cameraMotion, setCameraMotion] = useState('Orbit 360');
  const [aspect, setAspect] = useState('16:9');
  const [isGenerating, setIsGenerating] = useState(false);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [generationMessage, setGenerationMessage] = useState<string>('');

mport React, { useState } from 'react';
import { Video, Sparkles, Play, RefreshCw, Download, ArrowRight, Film, Sliders } from 'lucide-react';
import { ScreenType } from '../types';

interface VideoGenViewProps {
  onNavigate: (screen: ScreenType) => void;
}

export const VideoGenView: React.FC<VideoGenViewProps> = ({ onNavigate }) => {
  const [prompt, setPrompt] = useState('');
  const [cameraMotion, setCameraMotion] = useState('Orbit 360');
  const [aspect, setAspect] = useState('16:9');
  const [isGenerating, setIsGenerating] = useState(false);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [generationMessage, setGenerationMessage] = useState<string>('');

  const sampleVideos = [
    {
      title: 'Neon Cyberpunk Metropolis',
      prompt: 'Cinematic drone shot flying through a glowing violet and cyan futuristic skyline with flying vehicles',
      url: 'https://assets.mixkit.co/videos/preview/mixkit-flying-through-a-futuristic-tunnel-with-lights-41584-large.mp4',
      poster: 'https://images.unsplash.com/photo-1519501025264-65ba15a82390?auto=format&fit=crop&w=800&q=80'
    },
    {
      title: 'Digital Aurora Borealis',
      prompt: 'Ethereal ribbons of luminescent light dancing across starry celestial space clouds',
      url: 'https://assets.mixkit.co/videos/preview/mixkit-rotating-planet-earth-in-the-middle-of-space-41566-large.mp4',
      poster: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80'
    }
  ];

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;
    setIsGenerating(true);
    setGenerationMessage('');
    setVideoUrl(null);
    try {
      const response = await fetch('/api/generate-video', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, cameraMotion, aspectRatio: aspect })
      });
      const data = await response.json();
      if (!response.ok || !data.videoUrl) {
        throw new Error(data.error || 'A video generation provider is not configured yet.');
      }
      setVideoUrl(data.videoUrl);
      setGenerationMessage('Video generated successfully.');
    } catch (error) {
      setGenerationMessage(error instanceof Error ? error.message : 'Video generation is not configured. Add a supported video provider in API Management.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex-1 max-w-4xl mx-auto w-full p-3 sm:p-6 space-y-6">
      {/* Banner */}
      <div className="relative rounded-3xl p-5 bg-gradient-to-r from-purple-900/80 via-indigo-900/80 to-blue-950/80 border border-purple-500/30 overflow-hidden shadow-[0_0_25px_rgba(147,51,234,0.3)]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-fuchsia-600/30 border border-fuchsia-400/40 flex items-center justify-center text-fuchsia-300 shadow-[0_0_15px_rgba(217,70,239,0.5)]">
              <Film className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight">AI Video Generator</h2>
              <p className="text-xs text-purple-200/80">Transform creative concepts into high-definition cinematic video sequences</p>
            </div>
          </div>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleGenerate} className="space-y-4">
        <div className="relative rounded-2xl bg-[#090d29]/90 border border-purple-600/40 p-4 shadow-md focus-within:border-purple-400">
          <label className="text-xs font-semibold text-purple-300 flex items-center gap-1.5 mb-2">
            <Sparkles className="w-4 h-4" />
            <span>Video Scene Prompt</span>
          </label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Describe camera movement, lighting, subject, and cinematic atmosphere..."
            rows={3}
            className="w-full bg-transparent text-sm text-white placeholder-slate-400 focus:outline-none resize-none leading-relaxed"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="rounded-2xl p-4 bg-[#0a0e2a]/80 border border-purple-900/30 space-y-2">
            <label className="text-xs font-semibold text-slate-300">Camera Motion</label>
            <div className="grid grid-cols-2 gap-2">
              {['Orbit 360', 'Slow Pan', 'Zoom In', 'FPV Drone'].map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setCameraMotion(m)}
                  className={`py-2 px-3 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    cameraMotion === m
                      ? 'bg-purple-600 text-white shadow-md'
                      : 'bg-[#0d1238] text-slate-400 hover:text-white'
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-2xl p-4 bg-[#0a0e2a]/80 border border-purple-900/30 space-y-2">
            <label className="text-xs font-semibold text-slate-300">Aspect Ratio</label>
            <div className="grid grid-cols-3 gap-2">
              {['16:9', '9:16', '1:1'].map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setAspect(r)}
                  className={`py-2 px-3 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    aspect === r
                      ? 'bg-purple-600 text-white shadow-md'
                      : 'bg-[#0d1238] text-slate-400 hover:text-white'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={!prompt.trim() || isGenerating}
          className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-fuchsia-600 via-purple-600 to-indigo-600 hover:from-fuchsia-500 hover:to-indigo-500 disabled:opacity-40 text-white font-bold text-sm tracking-wide shadow-[0_0_20px_rgba(217,70,239,0.5)] active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          {isGenerating ? (
            <>
              <RefreshCw className="w-5 h-5 animate-spin" />
              <span>Synthesizing Video Frames...</span>
            </>
          ) : (
            <>
              <Video className="w-5 h-5" />
              <span>Generate Video</span>
              <ArrowRight className="w-5 h-5 ml-1" />
            </>
          )}
        </button>
      </form>

      {generationMessage && (
        <p role="status" className="rounded-xl border border-purple-500/30 bg-purple-950/30 p-3 text-xs text-purple-200">
          {generationMessage}
        </p>
      )}

      {/* Video Preview */}
      <div className="rounded-2xl p-5 bg-[#0a0e2a]/80 border border-purple-900/30 space-y-3">
        <h3 className="text-base font-bold text-white">Video Showcase</h3>
        <div className="rounded-2xl overflow-hidden aspect-video bg-black/60 border border-purple-900/40 relative flex items-center justify-center">
          {videoUrl ? (
            <video
              src={videoUrl}
              controls
              autoPlay
              loop
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="text-center p-6 space-y-2">
              <Film className="w-12 h-12 text-purple-400/40 mx-auto" />
              <p className="text-sm font-semibold text-slate-300">No video generated yet</p>
              <p className="text-xs text-slate-500">Enter a prompt above and click Generate Video</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
