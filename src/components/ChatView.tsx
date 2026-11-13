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
  Volume2,
  Copy,
  Check,
  RotateCcw,
  Bot,
  Plus
} from 'lucide-react';
import { ChatMessage, ScreenType } from '../types';

interface ChatViewProps {
  onNavigate: (screen: ScreenType) => void;
  messages: ChatMessage[];
  onSendMessage: (text: string) => Promise<void>;
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
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'auto' });
  }, [messages, isLoading]);

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim() || isLoading) return;
    const msg = inputText;
    setInputText('');
    await onSendMessage(msg);
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
    <div className="sayai-chat sayai-screen flex-1 flex flex-col min-h-0 h-[calc(100dvh-142px)] max-w-4xl mx-auto w-full px-3 sm:px-4 pt-2 pb-3 sm:pb-4">
      <div className="sticky top-0 z-30 -mx-1 flex items-center justify-between gap-3 border-b border-cyan-300/10 bg-[#071525]/95 px-1 py-2.5 backdrop-blur-xl">
        <div className="text-sm font-semibold text-slate-200">Chat</div>
        <button
          type="button"
          onClick={() => { setInputText(''); onNewChat(); }}
          className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-cyan-300/30 bg-[#10263a] px-4 py-2 text-sm font-semibold text-cyan-100 shadow-sm hover:bg-[#16364e] active:scale-95 transition-all"
          aria-label="Start a new chat"
          title="New chat"
        >
          <Plus className="w-4 h-4" />
          <span>New Chat</span>
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

            {/* Official SAY AI brand mark */}
            <div className="w-24 h-24 sm:w-32 sm:h-32 flex-shrink-0 flex items-center justify-center rounded-[28px] bg-white p-3 shadow-[0_12px_35px_rgba(20,110,220,.18)]">
              <img src="/assets/say-ai-logo.svg" alt="SAY AI logo" className="w-full h-full object-contain" />
            </div>
          </div>
        </div>
      )}

      {/* Messages Scroll Area */}
      <div className="flex-1 min-h-0 overflow-y-auto space-y-3 px-1 py-3 pr-2 overscroll-contain">
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
                className={`max-w-[78%] sm:max-w-md md:max-w-lg rounded-[1.15rem] px-3 py-2.5 sm:px-3.5 sm:py-3 text-[13px] leading-[1.55] shadow-md ${
                  isUser
                    ? 'bg-gradient-to-br from-sky-600 to-blue-700 text-white rounded-br-[5px] shadow-[0_5px_16px_rgba(14,165,233,0.16)]'
                    : 'bg-[#101f32]/95 text-slate-100 border border-cyan-300/15 rounded-bl-[5px] shadow-sm'
                }`}
              >
                {/* Message body text */}
                <div className="whitespace-pre-wrap space-y-1">
                  {msg.text}
                </div>

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

                {/* Footer timestamp & action icons */}
                <div className={`flex items-center gap-2 mt-2 pt-1 border-t ${
                  isUser ? 'border-cyan-400/20 justify-end text-cyan-100/80' : 'border-purple-800/30 justify-between text-slate-400'
                } text-[11px]`}>
                  <span>{msg.time}</span>

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
            disabled={!inputText.trim() || isLoading}
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
