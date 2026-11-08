import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  Mic,
  Paperclip,
  Image as ImageIcon,
  Video,
  Sliders,
  Settings as SettingsIcon,
  MessageSquare,
  Sparkles,
  ArrowRight,
  Volume2,
  Copy,
  Check,
  RotateCcw,
  Bot
} from 'lucide-react';
import { ChatMessage, GeneratedImage, ScreenType } from '../types';

interface ChatViewProps {
  onNavigate: (screen: ScreenType) => void;
  messages: ChatMessage[];
  onSendMessage: (text: string) => Promise<void>;
  onGenerateImage: (prompt: string, category: string) => Promise<void>;
  onGenerateVideo: (prompt: string) => Promise<string>;
  generatedImages: GeneratedImage[];
  latestVideoUrl: string | null;
  isLoading: boolean;
}

export const ChatView: React.FC<ChatViewProps> = ({
  onNavigate,
  messages,
  onSendMessage,
  onGenerateImage,
  onGenerateVideo,
  generatedImages,
  latestVideoUrl,
  isLoading
}) => {
  const [inputText, setInputText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [composerMode, setComposerMode] = useState<'chat' | 'image' | 'video'>('chat');
  const [mediaLoading, setMediaLoading] = useState(false);
  const [mediaStatus, setMediaStatus] = useState('');
  const [chatVideoUrl, setChatVideoUrl] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim() || isLoading) return;
    const msg = inputText.trim();
    setInputText('');
    if (composerMode === 'chat') {
      await onSendMessage(msg);
      return;
    }
    setMediaLoading(true);
    setMediaStatus(composerMode === 'image' ? 'Creating your image…' : 'Creating your video…');
    try {
      if (composerMode === 'image') {
        await onGenerateImage(msg, 'Photorealistic');
        setMediaStatus('Your image is ready. It is also available in your Image Gallery.');
      } else {
        const url = await onGenerateVideo(msg);
        setChatVideoUrl(url);
        setMediaStatus('Your video is ready.');
      }
    } catch (error) {
      setMediaStatus(error instanceof Error ? error.message : 'Media generation failed. Please try again.');
    } finally {
      setMediaLoading(false);
    }
  };

  // Web Speech recognition toggle
  const toggleListening = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert('Speech recognition is not supported in this browser. Please type your message.');
      return;
    }

    if (isListening) {
      setIsListening(false);
      return;
    }

    try {
      const SpeechRecognition = (window as unknown as { SpeechRecognition: any; webkitSpeechRecognition: any }).SpeechRecognition ||
        (window as unknown as { SpeechRecognition: any; webkitSpeechRecognition: any }).webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onstart = () => setIsListening(true);
      recognition.onend = () => setIsListening(false);
      recognition.onerror = () => setIsListening(false);

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          setInputText((prev) => (prev ? `${prev} ${transcript}` : transcript));
        }
      };

      recognition.start();
    } catch {
      setIsListening(false);
    }
  };

  // Text to speech playback
  const handleSpeak = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text.replace(/[#*`_✅🚀❤️]/g, ''));
      utterance.pitch = 1.0;
      utterance.rate = 1.05;
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="flex-1 flex flex-col h-[calc(100vh-65px)] max-w-4xl mx-auto w-full px-2 sm:px-4 py-2">
      {/* 4 Shortcut Pills matching Image 4 */}
      <div className="grid grid-cols-5 gap-1.5 sm:gap-3 py-2 select-none">
        <button
          onClick={() => onNavigate('chat')}
          className="flex flex-col sm:flex-row items-center justify-center gap-1.5 p-2 rounded-2xl bg-gradient-to-r from-purple-700/80 to-indigo-700/80 border border-purple-400/50 shadow-[0_0_15px_rgba(168,85,247,0.4)] text-white text-xs font-semibold cursor-pointer"
        >
          <MessageSquare className="w-4 h-4 text-purple-200" />
          <span className="text-[11px] sm:text-xs">Chat</span>
        </button>

        <button
          onClick={() => onNavigate('image')}
          className="flex flex-col sm:flex-row items-center justify-center gap-1.5 p-2 rounded-2xl bg-[#0c102a]/80 hover:bg-[#12163b] border border-purple-900/30 text-slate-300 hover:text-white text-xs font-medium transition-all cursor-pointer"
        >
          <ImageIcon className="w-4 h-4 text-slate-400" />
          <span className="text-[11px] sm:text-xs text-center">Image Gen</span>
        </button>

        <button
          onClick={() => onNavigate('voice')}
          className="flex flex-col sm:flex-row items-center justify-center gap-1.5 p-2 rounded-2xl bg-[#0c102a]/80 hover:bg-[#12163b] border border-purple-900/30 text-slate-300 hover:text-white text-xs font-medium transition-all cursor-pointer"
        >
          <Mic className="w-4 h-4 text-slate-400" />
          <span className="text-[11px] sm:text-xs text-center">Voice</span>
        </button>

        <button
          onClick={() => onNavigate('settings')}
          className="flex flex-col sm:flex-row items-center justify-center gap-1.5 p-2 rounded-2xl bg-[#0c102a]/80 hover:bg-[#12163b] border border-purple-900/30 text-slate-300 hover:text-white text-xs font-medium transition-all cursor-pointer"
        >
          <SettingsIcon className="w-4 h-4 text-slate-400" />
          <span className="text-[11px] sm:text-xs text-center">Settings</span>
        </button>
      </div>

      {/* Welcome Banner with Robot Artwork matching Image 4 & Image 1 */}
      {messages.length <= 2 && (
        <div className="relative rounded-2xl sm:rounded-3xl p-4 sm:p-5 my-2 bg-gradient-to-r from-[#0d1238] via-[#171146] to-[#120f38] border border-purple-500/30 overflow-hidden shadow-[0_0_25px_rgba(147,51,234,0.2)]">
          <div className="absolute top-0 right-0 w-60 h-40 bg-purple-600/20 rounded-full blur-2xl pointer-events-none" />

          <div className="flex items-center justify-between gap-3 relative z-10">
            <div className="space-y-1.5 max-w-[280px] sm:max-w-md text-left">
              <h2 className="text-xl sm:text-2xl font-black text-white flex items-center gap-1.5">
                <span>Hello!</span>
                <span className="text-xl">👋</span>
              </h2>
              <h3 className="text-lg sm:text-xl font-extrabold tracking-tight">
                <span>I'm </span>
                <span className="text-white">SAY </span>
                <span className="bg-gradient-to-r from-purple-400 to-fuchsia-400 bg-clip-text text-transparent">AI</span>
              </h3>
              <p className="text-xs text-purple-200/80 leading-relaxed">
                Ask me anything... I'm here to help!
              </p>

              <button
                onClick={() => onSendMessage('Tell me all features and capabilities of SAY AI')}
                className="mt-2 inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold text-xs shadow-md active:scale-95 transition-all cursor-pointer"
              >
                <span>Explore More</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Robot character image */}
            <div className="w-24 h-24 sm:w-32 sm:h-32 flex-shrink-0 flex items-center justify-center">
              <img
                src="/assets/extracted/robot-character.png"
                alt="SAY AI Robot Assistant"
                className="w-full h-full object-contain filter drop-shadow-[0_0_15px_rgba(56,189,248,0.7)]"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto space-y-4 px-1 py-3 pr-2">
        {messages.map((msg) => {
          const isUser = msg.sender === 'user';

          return (
            <div
              key={msg.id}
              className={`flex items-end gap-2.5 ${isUser ? 'justify-end' : 'justify-start'}`}
            >
              {/* Assistant avatar on left */}
              {!isUser && (
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-600 via-fuchsia-600 to-cyan-400 p-[1.5px] flex-shrink-0 shadow-[0_0_10px_rgba(168,85,247,0.5)]">
                  <div className="w-full h-full rounded-full bg-[#07091e] flex items-center justify-center text-xs font-bold text-white">
                    <span className="text-[10px] bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">AI</span>
                  </div>
                </div>
              )}

              {/* Message Bubble */}
              <div
                className={`max-w-[85%] sm:max-w-md md:max-w-lg rounded-2xl p-3.5 sm:p-4 text-sm leading-relaxed shadow-lg ${
                  isUser
                    ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-br-none shadow-[0_0_18px_rgba(6,182,212,0.35)]'
                    : 'bg-[#0f143a]/90 text-slate-100 border border-purple-500/25 rounded-bl-none shadow-[0_0_20px_rgba(139,92,246,0.15)] backdrop-blur-md'
                }`}
              >
                {/* Message body text */}
                <div className="whitespace-pre-wrap space-y-1">
                  {msg.text}
                </div>

                {/* Footer timestamp & action icons */}
                <div className={`flex items-center gap-2 mt-2 pt-1 border-t ${
                  isUser ? 'border-cyan-400/20 justify-end text-cyan-100/80' : 'border-purple-800/30 justify-between text-slate-400'
                } text-[11px]`}>
                  <span>{msg.time} {isUser && '✓✓'}</span>

                  {!isUser && (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleSpeak(msg.text)}
                        title="Listen to response"
                        className="p-1 hover:text-white transition-colors cursor-pointer"
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleCopy(msg.id, msg.text)}
                        title="Copy message"
                        className="p-1 hover:text-white transition-colors cursor-pointer"
                      >
                        {copiedId === msg.id ? (
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* User avatar on right */}
              {isUser && (
                <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0 shadow-[0_0_8px_rgba(59,130,246,0.5)]">
                  T
                </div>
              )}
            </div>
          );
        })}

        {/* Typing indicator */}
        {isLoading && (
          <div className="flex items-end gap-2.5 justify-start">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-600 via-fuchsia-600 to-cyan-400 p-[1.5px] flex-shrink-0">
              <div className="w-full h-full rounded-full bg-[#07091e] flex items-center justify-center text-[10px] text-purple-300 font-bold">
                AI
              </div>
            </div>
            <div className="rounded-2xl rounded-bl-none p-3.5 bg-[#0f143a]/90 border border-purple-500/25 flex items-center gap-1.5 shadow-[0_0_15px_rgba(168,85,247,0.2)]">
              <div className="w-2 h-2 rounded-full bg-purple-400 animate-bounce" />
              <div className="w-2 h-2 rounded-full bg-fuchsia-400 animate-bounce [animation-delay:0.2s]" />
              <div className="w-2 h-2 rounded-full bg-cyan-400 animate-bounce [animation-delay:0.4s]" />
              <span className="text-xs text-purple-200/80 ml-2">SAY AI is thinking...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Unified AI composer for chat, image and video creation */}
      <div className="mb-2 grid grid-cols-3 gap-2 rounded-2xl border border-purple-500/20 bg-[#090d29]/80 p-1.5">
        {([
          { id: 'chat', label: 'AI Chat', icon: MessageSquare },
          { id: 'image', label: 'Create Image', icon: ImageIcon },
          { id: 'video', label: 'Create Video', icon: Video }
        ] as const).map((mode) => {
          const Icon = mode.icon;
          const active = composerMode === mode.id;
          return (
            <button key={mode.id} type="button" onClick={() => { setComposerMode(mode.id); setMediaStatus(''); }}
              className={`flex items-center justify-center gap-1.5 rounded-xl px-2 py-2.5 text-[11px] sm:text-xs font-bold transition-all ${active ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}>
              <Icon className="h-4 w-4" /><span>{mode.label}</span>
            </button>
          );
        })}
      </div>
      {mediaStatus && <div role="status" className="mb-2 rounded-xl border border-purple-400/20 bg-purple-950/30 px-3 py-2 text-xs text-purple-100">{mediaStatus}</div>}
      {composerMode === 'image' && generatedImages[0] && (
        <div className="mb-2 overflow-hidden rounded-2xl border border-purple-400/25 bg-[#0b1030]">
          <img src={generatedImages[0].imageUrl} alt={generatedImages[0].prompt} className="max-h-72 w-full object-contain" />
          <div className="flex justify-between gap-2 p-2">
            <span className="line-clamp-1 text-xs text-slate-300">{generatedImages[0].prompt}</span>
            <div className="flex shrink-0 items-center gap-3">
              <a href={generatedImages[0].imageUrl} download="SAY-AI-Image.png" className="text-xs font-semibold text-cyan-300">Download</a>
              <button type="button" onClick={() => onNavigate('image')} className="text-xs font-semibold text-cyan-300">Gallery</button>
            </div>
          </div>
        </div>
      )}
      {composerMode === 'video' && (chatVideoUrl || latestVideoUrl) && (
        <div className="mb-2 overflow-hidden rounded-2xl border border-cyan-400/25 bg-[#0b1030] p-2">
          <video src={chatVideoUrl || latestVideoUrl || undefined} controls playsInline className="max-h-72 w-full rounded-xl bg-black" />
          <div className="flex justify-end gap-2 pt-2">
            <a href={chatVideoUrl || latestVideoUrl || undefined} download="SAY-AI-Video.mp4" className="rounded-lg bg-cyan-500/15 px-3 py-2 text-xs font-semibold text-cyan-200">Download video</a>
          </div>
        </div>
      )}
      {/* Composer Input Bar matching Image 4 & Image 1 left */}
      <form onSubmit={handleSend} className="pb-1 relative z-20">
        <div className="relative rounded-2xl bg-[#090d29]/90 border border-purple-600/40 p-1.5 flex items-center gap-2 shadow-[0_0_25px_rgba(147,51,234,0.25)] focus-within:border-purple-400 focus-within:shadow-[0_0_30px_rgba(168,85,247,0.4)] transition-all">
          {/* Microphone button on left */}
          <button
            type="button"
            onClick={toggleListening}
            aria-label="Voice input"
            className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-all cursor-pointer ${
              isListening
                ? 'bg-red-500 text-white shadow-[0_0_15px_rgba(239,68,68,0.8)] animate-pulse'
                : 'bg-purple-950/60 hover:bg-purple-900/80 text-purple-300 hover:text-white border border-purple-700/30'
            }`}
          >
            <Mic className="w-4 h-4" />
          </button>

          {/* Text input */}
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={isListening ? 'Listening to your voice...' : composerMode === 'image' ? 'Describe the image you want to create…' : composerMode === 'video' ? 'Describe the video you want to create…' : 'Ask SAY AI anything…'}
            disabled={isLoading}
            className="flex-1 bg-transparent text-sm text-white placeholder-slate-400 focus:outline-none px-2 py-1.5"
          />

          {/* Attachment Paperclip */}
          <button
            type="button"
            onClick={() => onNavigate('image')}
            title="Attach or generate images"
            className="p-2 text-slate-400 hover:text-purple-300 transition-colors cursor-pointer"
          >
            <Paperclip className="w-4 h-4" />
          </button>

          {/* Send Button matching round violet gradient in Image 4 */}
          <button
            type="submit"
            disabled={!inputText.trim() || isLoading || mediaLoading}
            aria-label="Send message"
            className="w-10 h-10 rounded-full bg-gradient-to-tr from-purple-600 via-fuchsia-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 disabled:opacity-40 disabled:hover:scale-100 flex items-center justify-center text-white shadow-[0_0_16px_rgba(168,85,247,0.6)] active:scale-95 transition-all cursor-pointer flex-shrink-0"
          >
            <Send className="w-4 h-4 ml-0.5" />
          </button>
        </div>
      </form>
    </div>
  );
};
