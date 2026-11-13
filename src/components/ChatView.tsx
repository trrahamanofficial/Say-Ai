import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  Mic,
  Paperclip,
  Image as ImageIcon,
  Sliders,
  Settings as SettingsIcon,
  MessageSquare,
  Sparkles,
  ArrowRight,
  Copy,
  Check,
  RotateCcw,
  Bot,
  Plus
} from 'lucide-react';
import { ChatMessage, ScreenType } from '../types';

type ChatAttachment = { name: string; mimeType: string; data: string };

interface ChatViewProps {
  onNavigate: (screen: ScreenType) => void;
  messages: ChatMessage[];
  onSendMessage: (text: string, attachments?: ChatAttachment[]) => Promise<void>;
  onNewChat: () => void;
  isLoading: boolean;
  userName?: string;
}

export const ChatView: React.FC<ChatViewProps> = ({
  onNavigate,
  messages,
  onSendMessage,
  onNewChat,
  isLoading,
  userName = 'Guest User'
}) => {
  const [inputText, setInputText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [selectedCopyId, setSelectedCopyId] = useState<string | null>(null);
  const [attachments, setAttachments] = useState<ChatAttachment[]>([]);
  const [attachmentError, setAttachmentError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'auto' });
  }, [messages, isLoading]);

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if ((!inputText.trim() && attachments.length === 0) || isLoading) return;
    const msg = inputText.trim() || 'Please analyze the attached media.';
    const selectedFiles = attachments;
    setInputText('');
    setAttachments([]);
    setAttachmentError('');
    await onSendMessage(msg, selectedFiles);
  };

  const readFileAsBase64 = (file: File) => new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result).split(',')[1] || '');
    reader.onerror = () => reject(new Error('Could not read ' + file.name));
    reader.readAsDataURL(file);
  });

  const extractVideoFrames = async (file: File): Promise<ChatAttachment[]> => {
    const url = URL.createObjectURL(file);
    const video = document.createElement('video');
    video.muted = true;
    video.playsInline = true;
    video.preload = 'metadata';
    video.src = url;
    try {
      await new Promise<void>((resolve, reject) => {
        video.onloadedmetadata = () => resolve();
        video.onerror = () => reject(new Error('Could not open video ' + file.name));
      });
      const duration = Number.isFinite(video.duration) ? video.duration : 0;
      if (!duration) throw new Error('This video could not be processed.');
      const canvas = document.createElement('canvas');
      const scale = Math.min(1, 960 / Math.max(video.videoWidth, video.videoHeight));
      canvas.width = Math.max(1, Math.round(video.videoWidth * scale));
      canvas.height = Math.max(1, Math.round(video.videoHeight * scale));
      const times = [...new Set([Math.min(0.2, duration / 2), duration / 2, Math.max(0, duration - 0.2)])];
      const frames: ChatAttachment[] = [];
      for (let i = 0; i < times.length; i++) {
        video.currentTime = times[i];
        await new Promise<void>((resolve, reject) => {
          video.onseeked = () => resolve();
          video.onerror = () => reject(new Error('Could not read video frame.'));
        });
        const context = canvas.getContext('2d');
        if (!context) throw new Error('Video preview is not supported on this device.');
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        frames.push({ name: file.name + ' — frame ' + (i + 1), mimeType: 'image/jpeg', data: canvas.toDataURL('image/jpeg', 0.78).split(',')[1] });
      }
      return frames;
    } finally {
      URL.revokeObjectURL(url);
      video.removeAttribute('src');
      video.load();
    }
  };

  const handleFilesSelected = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    event.target.value = '';
    if (!files.length) return;
    setAttachmentError('');
    try {
      const added: ChatAttachment[] = [];
      for (const file of files) {
        if (file.type.startsWith('image/')) {
          if (file.size > 10 * 1024 * 1024) throw new Error(file.name + ' is larger than 10 MB.');
          added.push({ name: file.name, mimeType: file.type || 'image/jpeg', data: await readFileAsBase64(file) });
        } else if (file.type.startsWith('video/')) {
          if (file.size > 30 * 1024 * 1024) throw new Error(file.name + ' is larger than 30 MB.');
          added.push(...await extractVideoFrames(file));
        } else {
          throw new Error('Please select image or video files only.');
        }
      }
      setAttachments(prev => [...prev, ...added]);
    } catch (error) {
      setAttachmentError(error instanceof Error ? error.message : 'Could not attach this file.');
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
    <div className="sayai-chat sayai-screen relative flex-1 flex flex-col min-h-0 h-[calc(100dvh-142px)] max-w-4xl mx-auto w-full px-3 sm:px-4 pt-2 pb-3 sm:pb-4">
      <div className="absolute top-3 right-0 z-30 flex h-12 w-full shrink-0 items-center justify-end px-2 pointer-events-none bg-transparent">
        <button
          type="button"
          onClick={() => { setInputText(''); onNewChat(); }}
          className="pointer-events-auto inline-flex h-10 w-10 items-center justify-center rounded-full border border-cyan-300/30 bg-[#102b40]/95 text-cyan-100 shadow-[0_3px_12px_rgba(34,211,238,.12)] hover:bg-[#16435a] active:scale-95 transition-all"
          aria-label="Start a new chat"
          title="New chat"
        >
          <Plus className="h-5 w-5" />
        </button>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 min-h-0 overflow-y-auto space-y-3 px-1 pt-[4.5rem] pb-3 pr-2 overscroll-contain">
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
                    <img src="/assets/say-ai-logo.svg" alt="SAY AI" className="w-6 h-6 object-contain" />
                  </div>
                </div>
              )}

              {/* Message Bubble */}
              <div
                onClick={() => setSelectedCopyId(prev => prev === msg.id ? null : msg.id)}
                className={`min-w-[5.5rem] max-w-[82%] sm:max-w-md md:max-w-lg rounded-[1.5rem] px-4 py-3 sm:px-4 sm:py-3.5 text-[14px] leading-[1.6] shadow-md break-words cursor-pointer transition-shadow ${
                  isUser
                    ? 'bg-gradient-to-br from-sky-600 to-blue-700 text-white shadow-[0_5px_16px_rgba(14,165,233,0.16)]'
                    : 'bg-[#101f32]/95 text-slate-100 border border-cyan-300/15 shadow-sm'
                }`}
              >
                {/* Message body text */}
                <div className="whitespace-pre-wrap space-y-1">
                  {msg.text}
                </div>
                {isUser && Array.isArray(msg.attachments) && msg.attachments.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {msg.attachments.map((name, index) => <span key={index} className="rounded-lg bg-black/20 px-2 py-1 text-[11px] text-white/85">📎 {name}</span>)}
                  </div>
                )}

                {/* 1-Click Download Card inside chat bubble if message mentions ZIP or source */}
                {!isUser && (msg.text.includes('SAY-AI-FULL-PROJECT.zip') || msg.text.includes('Download') || msg.id === 'msg-2') && (
                  <div className="mt-3 p-2.5 rounded-xl bg-purple-950/80 border border-purple-400/40 shadow-inner flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-xl">📦</span>
                      <div className="truncate">
                        <div className="font-bold text-white text-xs truncate">SAY-AI-FULL-PROJECT.zip</div>
                        <div className="text-[10px] text-purple-300">Complete project source • 1-Click</div>
                      </div>
                    </div>
                    <a
                      href="/SAY-AI-FULL-PROJECT.zip"
                      download="SAY-AI-FULL-PROJECT.zip"
                      className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-purple-600 via-fuchsia-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs flex-shrink-0 shadow-[0_0_10px_rgba(168,85,247,0.5)] active:scale-95 transition-all flex items-center gap-1 cursor-pointer"
                    >
                      <span>Download</span>
                    </a>
                  </div>
                )}

                {/* Copy appears only after the message bubble is tapped */}
                {selectedCopyId === msg.id && (
                  <div className="mt-1 flex justify-end">
                    <button
                      onClick={(event) => { event.stopPropagation(); handleCopy(msg.id, msg.text); setSelectedCopyId(null); }}
                      title="Copy message"
                      aria-label="Copy message"
                      className="rounded-full p-1.5 text-slate-300/85 hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
                    >
                      {copiedId === msg.id ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
                    </button>
                  </div>
                )}
              </div>

              {/* User avatar on right */}
              {isUser && (
                <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0 shadow-[0_0_8px_rgba(59,130,246,0.5)]" aria-label={userName}>{(userName.trim()[0] || 'G').toUpperCase()}</div>
              )}
            </div>
          );
        })}

        {/* Typing indicator */}
        {isLoading && (
          <div className="flex items-end gap-2.5 justify-start">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-600 via-fuchsia-600 to-cyan-400 p-[1.5px] flex-shrink-0">
              <div className="w-full h-full rounded-full bg-[#07091e] flex items-center justify-center">
                <img src="/assets/say-ai-logo.svg" alt="SAY AI" className="w-6 h-6 object-contain" />
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

      {/* 1-Click ZIP Download Bar directly above chat box */}
      <div className="hidden">
        <div className="flex items-center justify-between px-3 py-1.5 rounded-xl bg-gradient-to-r from-purple-950/90 via-[#151042] to-indigo-950/90 border border-purple-500/40 shadow-[0_0_15px_rgba(168,85,247,0.3)]">
          <div className="flex items-center gap-2 text-xs">
            <span className="text-sm">📦</span>
            <span className="font-bold text-white tracking-wide">SAY-AI-FULL-PROJECT.zip</span>
            <span className="text-[10px] text-purple-300 hidden sm:inline">• 9.14 MB Complete Source</span>
          </div>
          <a
            href="/SAY-AI-FULL-PROJECT.zip"
            download="SAY-AI-FULL-PROJECT.zip"
            className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-gradient-to-r from-purple-600 via-fuchsia-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-[11px] shadow-sm active:scale-95 transition-all cursor-pointer"
          >
            <span>⬇ 1-Click Download</span>
          </a>
        </div>
      </div>

      {/* Composer Input Bar matching Image 4 & Image 1 left */}
      <form onSubmit={handleSend} className="pt-1 pb-[max(.5rem,env(safe-area-inset-bottom))] relative z-20">
        <input ref={fileInputRef} type="file" accept="image/*,video/*" multiple className="hidden" onChange={handleFilesSelected} />
        <div className="relative rounded-[1.35rem] bg-[#0b1a2a]/95 border border-cyan-300/20 p-1.5 flex items-center gap-2 shadow-[0_8px_24px_rgba(0,0,0,.22)] focus-within:border-cyan-300/55 focus-within:shadow-[0_0_18px_rgba(34,211,238,.12)] transition-all">
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
            placeholder={isListening ? 'Listening to your voice...' : 'Ask SAY AI anything...'}
            disabled={isLoading}
            className="flex-1 bg-transparent text-sm text-white placeholder-slate-400 focus:outline-none px-1.5 py-1.5 text-[13px]"
          />

          {/* 1-Click ZIP Download button directly in chat box */}
          <a
            href="/SAY-AI-FULL-PROJECT.zip"
            download="SAY-AI-FULL-PROJECT.zip"
            title="Project download"
            className="hidden"
          >
            <span className="text-base leading-none">📦</span>
          </a>

          {/* Choose photos or videos directly from the phone gallery */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            title="Attach photos or videos"
            aria-label="Attach photos or videos"
            className="p-2 text-slate-400 hover:text-cyan-300 transition-colors cursor-pointer"
          >
            <Paperclip className="w-4 h-4" />
          </button>

          {/* Send Button matching round violet gradient in Image 4 */}
          <button
            type="submit"
            disabled={(!inputText.trim() && attachments.length === 0) || isLoading}
            aria-label="Send message"
            className="w-10 h-10 rounded-full bg-gradient-to-tr from-purple-600 via-fuchsia-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 disabled:opacity-40 disabled:hover:scale-100 flex items-center justify-center text-white shadow-[0_0_16px_rgba(168,85,247,0.6)] active:scale-95 transition-all cursor-pointer flex-shrink-0"
          >
            <Send className="w-4 h-4 ml-0.5" />
          </button>
        </div>
        {(attachments.length > 0 || attachmentError) && (
          <div className="mt-2 flex flex-wrap items-center gap-2 px-2">
            {attachments.map((file, index) => (
              <span key={index} className="inline-flex max-w-full items-center gap-1 rounded-lg border border-cyan-300/20 bg-[#10263a] px-2 py-1 text-[11px] text-cyan-100">
                <span className="max-w-[180px] truncate">{file.name}</span>
                <button type="button" onClick={() => setAttachments(prev => prev.filter((_, i) => i !== index))} className="ml-1 text-slate-300" aria-label="Remove attachment">×</button>
              </span>
            ))}
            {attachmentError && <span className="text-xs text-rose-300">{attachmentError}</span>}
          </div>
        )}
      </form>
    </div>
  );
};
