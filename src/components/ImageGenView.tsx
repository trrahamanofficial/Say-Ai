import React, { useEffect, useRef, useState } from 'react';
import {
  Sparkles,
  ArrowRight,
  Download,
  Share2,
  Copy,
  Check,
  RefreshCw,
  X,
  Maximize2,
  Flame,
  Image as ImageIcon
} from 'lucide-react';
import { GeneratedImage, ScreenType } from '../types';

interface ImageGenViewProps {
  onNavigate: (screen: ScreenType) => void;
  generatedImages: GeneratedImage[];
  onGenerateImage: (prompt: string, category: string) => Promise<void>;
  isGenerating: boolean;
}

export const ImageGenView: React.FC<ImageGenViewProps> = ({
  onNavigate,
  generatedImages,
  onGenerateImage,
  isGenerating
}) => {
  const [prompt, setPrompt] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Fantasy');
  const [activeModalImage, setActiveModalImage] = useState<GeneratedImage | null>(null);
  const [copiedPrompt, setCopiedPrompt] = useState(false);
  const [generationError, setGenerationError] = useState('');
  const [generationProgress, setGenerationProgress] = useState(0);
  const previewAfterGeneration = useRef(false);

  useEffect(() => {
    if (!isGenerating) {
      if (!previewAfterGeneration.current) setGenerationProgress(0);
      return;
    }
    setGenerationProgress(4);
    const timer = window.setInterval(() => {
      setGenerationProgress((current) => Math.min(95, current + Math.max(1, Math.round((95 - current) * 0.08))));
    }, 700);
    return () => window.clearInterval(timer);
  }, [isGenerating]);

  useEffect(() => {
    if (previewAfterGeneration.current && generatedImages.length > 0) {
      setGenerationProgress(100);
      setActiveModalImage(generatedImages[0]);
      previewAfterGeneration.current = false;
    }
  }, [generatedImages]);

  const categories = [
    { name: 'Nature', emoji: '🌿' },
    { name: 'Fantasy', emoji: '✨' },
    { name: 'Anime', emoji: '🎭' },
    { name: 'Business', emoji: '💼' },
    { name: 'Technology', emoji: '💻' },
    { name: 'Cyberpunk', emoji: '🏙️' }
  ];

  const trendingPrompts = [
    {
      id: 'trend-1',
      title: 'Beautiful Nature',
      prompt: 'Majestic mountain peaks over crystal alpine lake with pine forests and dramatic sunset',
      category: 'Nature',
    },
    {
      id: 'trend-2',
      title: 'Cute Cat',
      prompt: 'Adorable fluffy ginger kitten wearing an elegant red bowtie in warm soft ambient studio light',
      category: 'Fantasy',
    },
    {
      id: 'trend-3',
      title: 'Futuristic City',
      prompt: 'Neon cybernetic cityscape with soaring glass skyscrapers, flying transports, and violet evening skyline',
      category: 'Technology',
    }
  ];

  // Only show images returned by the live AI image-generation endpoint.
  const allGalleryImages = generatedImages;

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || isGenerating) return;
    setGenerationError('');
    previewAfterGeneration.current = true;
    try {
      await onGenerateImage(prompt, selectedCategory);
    } catch (error) {
      previewAfterGeneration.current = false;
      setGenerationProgress(0);
      setGenerationError(error instanceof Error ? error.message : 'Image generation failed. Please try again.');
    }
  };

  const handleSelectTrending = (p: string, cat: string) => {
    setPrompt(p);
    setSelectedCategory(cat);
  };

  const handleDownload = (imgUrl: string, name: string) => {
    const a = document.createElement('a');
    a.href = imgUrl;
    a.download = `SAY-AI-${name.slice(0, 15).replace(/\s+/g, '-')}.png`;
    a.click();
  };

  return (
    <div className="flex-1 max-w-4xl mx-auto w-full p-3 sm:p-6 space-y-6">
      {/* Top Banner matching Image 2 */}
      <div className="relative rounded-2xl sm:rounded-3xl p-5 bg-gradient-to-r from-purple-900/90 via-indigo-900/80 to-blue-950/90 border border-purple-500/30 overflow-hidden shadow-[0_0_25px_rgba(147,51,234,0.3)]">
        <div className="absolute top-0 right-0 w-64 h-32 bg-purple-500/20 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            {/* Gallery icon */}
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 p-0.5 shadow-[0_0_15px_rgba(168,85,247,0.5)] flex-shrink-0">
              <div className="w-full h-full rounded-[14px] bg-[#0c0f30] flex items-center justify-center text-purple-300">
                <ImageIcon className="w-6 h-6" />
              </div>
            </div>

            <div className="text-left">
              <h2 className="text-lg sm:text-xl font-extrabold text-white tracking-wide">
                Image Generator
              </h2>
              <p className="text-xs sm:text-sm text-purple-200/80 mt-0.5">
                Turn your imagination into stunning images!
              </p>
            </div>
          </div>

          {/* Sparkle magic wand graphic on right */}
          <div className="w-10 h-10 rounded-full bg-purple-600/20 flex items-center justify-center text-fuchsia-300 shadow-[0_0_12px_rgba(217,70,239,0.5)]">
            <Sparkles className="w-5 h-5 animate-spin [animation-duration:8s]" />
          </div>
        </div>
      </div>

      {/* Prompt Input & Character Counter matching Image 2 */}
      <form onSubmit={handleGenerate} className="space-y-3">
        <div className="relative rounded-2xl bg-[#090d29]/90 border border-purple-600/40 p-3.5 shadow-[0_0_20px_rgba(147,51,234,0.15)] focus-within:border-purple-400 focus-within:shadow-[0_0_25px_rgba(168,85,247,0.35)] transition-all">
          <div className="flex items-start gap-2.5">
            <Sparkles className="w-4 h-4 text-purple-400 mt-1 flex-shrink-0" />
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value.slice(0, 500))}
              placeholder="Describe what you want to see..."
              rows={3}
              className="flex-1 bg-transparent text-sm text-white placeholder-slate-400 focus:outline-none resize-none leading-relaxed"
            />
          </div>

          <div className="flex justify-end pt-1">
            <span className="text-[11px] text-slate-400 font-medium">
              {prompt.length}/500
            </span>
          </div>
        </div>

        {generationError && (
          <div role="alert" className="rounded-xl border border-red-500/40 bg-red-950/40 px-4 py-3 text-sm text-red-200">
            {generationError}
          </div>
        )}

        {isGenerating && (
          <div className="rounded-xl border border-purple-500/30 bg-[#0c0f30]/90 p-3 space-y-2" role="status" aria-live="polite">
            <div className="flex items-center justify-between text-xs font-semibold text-purple-100">
              <span>Creating your image...</span>
              <span className="tabular-nums">{generationProgress}%</span>
            </div>
            <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-800">
              <div className="h-full rounded-full bg-gradient-to-r from-purple-600 via-fuchsia-500 to-blue-500 transition-all duration-700" style={{ width: `${generationProgress}%` }} />
            </div>
            <p className="text-[11px] text-slate-400">Estimated progress — the image will open automatically when ready.</p>
          </div>
        )}

        {/* Categories Pills matching Image 2 */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat.name;
            return (
              <button
                key={cat.name}
                type="button"
                onClick={() => setSelectedCategory(cat.name)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-[0_0_12px_rgba(168,85,247,0.5)] border border-purple-300/40'
                    : 'bg-[#0d1238]/80 text-slate-300 hover:text-white border border-purple-900/30 hover:border-purple-600/40'
                }`}
              >
                <span>{cat.name}</span>
                <span>{cat.emoji}</span>
              </button>
            );
          })}
        </div>

        {/* Large Gradient "Generate Image ->" Button matching Image 2 */}
        <button
          type="submit"
          disabled={!prompt.trim() || isGenerating}
          className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-[#7928ca] via-[#8b5cf6] to-[#0070f3] hover:from-[#6b21a8] hover:to-[#0284c7] disabled:opacity-40 text-white font-bold text-sm sm:text-base tracking-wide shadow-[0_0_25px_rgba(147,51,234,0.6)] active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          {isGenerating ? (
            <>
              <RefreshCw className="w-5 h-5 animate-spin" />
              <span>Generating with SAY AI Neural Engine...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5" />
              <span>Generate Image</span>
              <ArrowRight className="w-5 h-5 ml-1" />
            </>
          )}
        </button>
      </form>

      {/* Trending Prompts Section matching Image 2 */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-base">🔥</span>
            <h3 className="text-sm sm:text-base font-bold text-white">Trending Prompts</h3>
          </div>
          <button
            onClick={() => onNavigate('image')}
            className="text-xs font-semibold text-purple-400 hover:text-purple-300 flex items-center gap-1 cursor-pointer"
          >
            <span>See All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {trendingPrompts.map((item) => (
            <div
              key={item.id}
              onClick={() => handleSelectTrending(item.prompt, item.category)}
              className="group relative rounded-2xl overflow-hidden aspect-[4/3] border border-purple-900/30 hover:border-purple-400/60 shadow-lg cursor-pointer transition-all duration-300 hover:-translate-y-1"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-[#171044] via-[#18245a] to-[#071b35] flex items-center justify-center">
                <ImageIcon className="w-12 h-12 text-purple-200/70" />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-[#050614] via-[#050614]/40 to-transparent" />
              <div className="absolute bottom-2.5 left-2.5 right-2.5 flex items-center justify-between">
                <span className="text-xs font-bold text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">
                  {item.title}
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-600/70 text-purple-200 border border-purple-400/30">
                  {item.category}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Your Generated Images Section matching Image 2 */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-base">🖼️</span>
            <h3 className="text-sm sm:text-base font-bold text-white">Your Generated Images</h3>
          </div>
          <button
            onClick={() => onNavigate('image')}
            className="text-xs font-semibold text-purple-400 hover:text-purple-300 flex items-center gap-1 cursor-pointer"
          >
            <span>See All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {allGalleryImages.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-purple-700/40 bg-[#0c102a]/60 px-4 py-8 text-center">
            <ImageIcon className="w-9 h-9 mx-auto text-purple-300/70 mb-2" />
            <p className="text-sm font-semibold text-white">No AI-created images yet</p>
            <p className="text-xs text-slate-400 mt-1">Describe an image above and tap Generate Image. Only images actually returned by the AI will appear here.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {allGalleryImages.map((img) => (
              <div
                key={img.id}
                onClick={() => setActiveModalImage(img)}
                className="group relative rounded-2xl overflow-hidden aspect-[4/3] bg-[#0c102a] border border-purple-900/30 hover:border-purple-400/60 shadow-md cursor-pointer transition-all duration-300 hover:-translate-y-1"
              >
                <img
                  src={img.imageUrl}
                  alt={img.prompt}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2.5">
                  <p className="text-[11px] text-white line-clamp-1">{img.prompt}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Image Detail Modal */}
      {activeModalImage && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="relative max-w-lg w-full bg-[#0c0f30] border border-purple-500/40 rounded-3xl p-5 shadow-[0_0_40px_rgba(147,51,234,0.4)] space-y-4">
            <button
              onClick={() => setActiveModalImage(null)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-full bg-black/40 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="rounded-2xl overflow-hidden aspect-square w-full bg-black/50">
              <img
                src={activeModalImage.imageUrl}
                alt={activeModalImage.prompt}
                className="w-full h-full object-cover"
              />
            </div>

            <div>
              <span className="text-[11px] font-semibold text-purple-300 uppercase tracking-wider">
                {activeModalImage.category}
              </span>
              <p className="text-sm text-white mt-1 leading-relaxed">
                {activeModalImage.prompt}
              </p>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={() => handleDownload(activeModalImage.imageUrl, activeModalImage.prompt)}
                className="flex-1 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-md"
              >
                <Download className="w-4 h-4" />
                <span>Download</span>
              </button>

              <button
                onClick={() => {
                  navigator.clipboard.writeText(activeModalImage.prompt);
                  setCopiedPrompt(true);
                  setTimeout(() => setCopiedPrompt(false), 2000);
                }}
                className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs flex items-center justify-center transition-all cursor-pointer"
              >
                {copiedPrompt ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
