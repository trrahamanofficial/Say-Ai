import React, { useState, useEffect, useRef } from 'react';
import {
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  MessageSquare,
  Image as ImageIcon,
  Globe,
  BookOpen,
  Clock,
  Settings as SettingsIcon,
  Zap,
  ArrowRight,
  Sparkles
} from 'lucide-react';

import { ScreenType } from '../types';

interface VoiceAssistantViewProps {
  onNavigate: (screen: ScreenType) => void;
  onSendChatMessage: (text: string) => Promise<string>;
  onTriggerImagePrompt: (prompt: string) => void;
}

export const VoiceAssistantView: React.FC<VoiceAssistantViewProps> = ({
  onNavigate,
  onSendChatMessage,
  onTriggerImagePrompt
}) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [lastResponse, setLastResponse] = useState<string>(
    'Tap to Speak to start a live conversation with SAY AI.'
  );
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const recognitionRef = useRef<any>(null);
  const keepAliveRef = useRef(false);
  const busyRef = useRef(false);
  const languageRef = useRef(typeof navigator !== 'undefined' ? navigator.language || 'en-IN' : 'en-IN');

  const voiceCommands = [
    { id: '1', label: 'Open Chat', icon: MessageSquare, action: () => onNavigate('chat') },
    { id: '2', label: 'Generate Image', icon: ImageIcon, action: () => onNavigate('image') },
    { id: '3', label: 'Search Web', icon: Globe, action: () => handleCommandExecution('Search the web for latest AI news') },
    { id: '4', label: 'Tell a Story', icon: BookOpen, action: () => handleCommandExecution('Tell me a short creative sci-fi story about AI') },
    { id: '5', label: 'Get Time', icon: Clock, action: () => handleCommandExecution('What time is it right now?') },
    { id: '6', label: 'Open Settings', icon: SettingsIcon, action: () => onNavigate('settings') },
  ];

  const speakText = (text: string) => new Promise<void>((resolve) => {
    if (!('speechSynthesis' in window)) { resolve(); return; }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = languageRef.current;
    utterance.pitch = 1;
    utterance.rate = 1;
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => { setIsSpeaking(false); resolve(); };
    utterance.onerror = () => { setIsSpeaking(false); resolve(); };
    window.speechSynthesis.speak(utterance);
  });

  const startListening = () => {
    if (!keepAliveRef.current || busyRef.current) return;
    const recognition = recognitionRef.current;
    if (!recognition) return;
    try { recognition.start(); } catch { /* already starting */ }
  };

  const handleLiveUtterance = async (spokenText: string) => {
    const clean = spokenText.trim();
    if (!clean || busyRef.current) return;
    busyRef.current = true;
    setIsThinking(true);
    setLastResponse('SAY AI is thinking...');
    try {
      const reply = await onSendChatMessage(clean);
      setLastResponse(reply);
      await speakText(reply);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'I could not get a response. Please try again.';
      setLastResponse(message);
      await speakText(message);
    } finally {
      setIsThinking(false);
      busyRef.current = false;
      if (keepAliveRef.current) window.setTimeout(startListening, 350);
    }
  };

  const toggleMic = () => {
    if (keepAliveRef.current) {
      keepAliveRef.current = false;
      recognitionRef.current?.stop();
      window.speechSynthesis?.cancel();
      setIsListening(false);
      setIsSpeaking(false);
      setLastResponse('Live voice stopped. Tap to speak again.');
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setLastResponse('Live voice recognition is not supported here. Please open SAY AI in Chrome on Android.');
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      // Use the phone's speech locale. SAY AI's AI prompt replies in the language it receives.
      languageRef.current = navigator.language || 'en-IN';
      recognition.lang = languageRef.current;
      recognition.onstart = () => { setIsListening(true); setTranscript(''); };
      recognition.onend = () => {
        setIsListening(false);
        if (keepAliveRef.current && !busyRef.current) window.setTimeout(startListening, 250);
      };
      recognition.onerror = (event: any) => {
        setIsListening(false);
        if (event?.error === 'not-allowed' || event?.error === 'service-not-allowed') {
          keepAliveRef.current = false;
          setLastResponse('Microphone permission is blocked. Allow microphone access for SAY AI.');
        }
      };
      recognition.onresult = (event: any) => {
        const result = event.results[event.results.length - 1];
        const text = result?.[0]?.transcript || '';
        if (text) setTranscript(text);
        if (result?.isFinal) {
          recognition.stop();
          void handleLiveUtterance(text);
        }
      };
      recognitionRef.current = recognition;
      keepAliveRef.current = true;
      setLastResponse('Listening… speak naturally. SAY AI will answer aloud.');
      recognition.start();
    } catch {
      keepAliveRef.current = false;
      setIsListening(false);
      setLastResponse('Could not start the microphone. Please allow microphone access and try again.');
    }
  };

  useEffect(() => () => {
    keepAliveRef.current = false;
    recognitionRef.current?.stop();
    window.speechSynthesis?.cancel();
  }, []);

  return (
    <div className="flex-1 max-w-4xl mx-auto w-full p-3 sm:p-6 space-y-6">
      {/* Top Banner matching Image 3 */}
      <div className="relative rounded-2xl sm:rounded-3xl p-5 bg-gradient-to-r from-purple-900/90 via-indigo-900/80 to-blue-950/90 border border-purple-500/30 overflow-hidden shadow-[0_0_25px_rgba(147,51,234,0.3)]">
        <div className="absolute top-0 right-0 w-64 h-32 bg-cyan-500/20 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            {/* Waveform icon */}
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-500 to-purple-600 p-0.5 shadow-[0_0_15px_rgba(6,182,212,0.5)] flex-shrink-0">
              <div className="w-full h-full rounded-[14px] bg-[#0c0f30] flex items-center justify-center text-cyan-300">
                <div className="flex items-center gap-0.5 h-5">
                  <span className="w-1 bg-cyan-400 rounded-full h-2 animate-wave-1" />
                  <span className="w-1 bg-cyan-400 rounded-full h-4 animate-wave-2" />
                  <span className="w-1 bg-cyan-400 rounded-full h-3 animate-wave-3" />
                  <span className="w-1 bg-cyan-400 rounded-full h-5 animate-wave-4" />
                </div>
              </div>
            </div>

            <div className="text-left">
              <h2 className="text-lg sm:text-xl font-extrabold text-white tracking-wide">
                Voice Assistant
              </h2>
              <p className="text-xs sm:text-sm text-purple-200/80 mt-0.5">
                Speak Naturally, Get Instant Help
              </p>
            </div>
          </div>

          {/* Microphone neon outline on right */}
          <div className="w-10 h-10 rounded-full bg-cyan-600/20 flex items-center justify-center text-cyan-300 shadow-[0_0_12px_rgba(6,182,212,0.5)]">
            <Mic className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Central Pulsating Microphone Orb matching Image 3 */}
      <div className="relative py-8 sm:py-12 flex flex-col items-center justify-center select-none">
        {/* Animated concentric soundwave arches */}
        <div className="relative flex items-center justify-center">
          {/* Ambient neon radial glows */}
          <div className={`absolute w-64 h-64 rounded-full bg-purple-600/20 blur-3xl transition-all duration-700 ${
            isListening ? 'scale-125 bg-cyan-500/30' : ''
          }`} />

          {/* Outer ring */}
          <div className={`w-52 h-52 sm:w-60 sm:h-60 rounded-full border border-purple-500/20 flex items-center justify-center transition-all ${
            isListening ? 'scale-110 border-cyan-400/50 shadow-[0_0_40px_rgba(6,182,212,0.3)] animate-pulse' : ''
          }`}>
            {/* Middle ring with gradient border */}
            <div className={`w-40 h-40 sm:w-48 sm:h-48 rounded-full p-[2px] bg-gradient-to-tr from-cyan-400 via-purple-500 to-fuchsia-500 flex items-center justify-center transition-all ${
              isListening ? 'shadow-[0_0_30px_rgba(168,85,247,0.6)]' : 'shadow-[0_0_20px_rgba(168,85,247,0.3)]'
            }`}>
              {/* Inner clickable microphone core orb */}
              <button
                onClick={toggleMic}
                aria-label={isListening ? 'Stop listening' : 'Start listening'}
                className={`w-full h-full rounded-full flex items-center justify-center transition-all duration-300 cursor-pointer ${
                  isListening
                    ? 'bg-gradient-to-tr from-[#1b083a] to-[#04162e] scale-95'
                    : 'bg-[#080b26] hover:bg-[#0e133d] hover:scale-105'
                }`}
              >
                <Mic className={`w-14 h-14 sm:w-16 sm:h-16 transition-all ${
                  isListening
                    ? 'text-cyan-400 filter drop-shadow-[0_0_15px_rgba(6,182,212,0.9)] animate-pulse'
                    : 'text-white filter drop-shadow-[0_0_10px_rgba(168,85,247,0.8)]'
                }`} />
              </button>
            </div>
          </div>
        </div>

        {/* Tap to Speak Pill Capsule Button matching Image 3 */}
        <div className="mt-8">
          <button
            onClick={toggleMic}
            className={`px-6 py-3 rounded-full border font-bold text-xs sm:text-sm tracking-wide transition-all shadow-lg flex items-center gap-2 cursor-pointer ${
              isListening
                ? 'bg-gradient-to-r from-red-600 to-pink-600 border-red-400 text-white shadow-[0_0_20px_rgba(239,68,68,0.6)] animate-pulse'
                : 'bg-gradient-to-r from-[#111642] to-[#1a124a] border-cyan-500/40 hover:border-cyan-400 text-white shadow-[0_0_20px_rgba(6,182,212,0.3)] hover:shadow-[0_0_25px_rgba(6,182,212,0.5)]'
            }`}
          >
            <span className={`w-2.5 h-2.5 rounded-full ${
              isListening ? 'bg-white shadow-[0_0_8px_#ffffff]' : 'bg-emerald-400 shadow-[0_0_8px_#10b981]'
            }`} />
            <span>{isListening ? (isThinking ? 'SAY AI is replying…' : 'Live Voice On · Tap to Stop') : 'Tap to Speak'}</span>
            {!isListening && (
              <span className="text-slate-300 text-xs font-normal">
                or say <span className="text-amber-300 font-semibold">"Hey SAY AI"</span>
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Quick Voice Commands (2x3 Grid) matching Image 3 */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 fill-amber-400 text-amber-400" />
            <h3 className="text-sm sm:text-base font-bold text-white">Quick Voice Commands</h3>
          </div>
          <button
            onClick={() => onNavigate('chat')}
            className="text-xs font-semibold text-purple-400 hover:text-purple-300 flex items-center gap-1 cursor-pointer"
          >
            <span>See All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {voiceCommands.map((cmd) => {
            const Icon = cmd.icon;
            return (
              <button
                key={cmd.id}
                onClick={cmd.action}
                className="p-3.5 rounded-2xl bg-[#0c102a]/80 hover:bg-[#131945] border border-purple-900/30 hover:border-purple-500/50 flex flex-col items-center justify-center gap-2 transition-all cursor-pointer shadow-md group hover:-translate-y-0.5"
              >
                <div className="w-9 h-9 rounded-xl bg-purple-950/60 group-hover:bg-purple-900/80 border border-purple-700/30 flex items-center justify-center text-cyan-300 transition-colors">
                  <Icon className="w-4 h-4" />
                </div>
                <span className="text-xs font-semibold text-white group-hover:text-purple-300">
                  {cmd.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Bottom Status Banner matching Image 3 */}
      <div className="rounded-2xl p-4 bg-gradient-to-r from-[#0d143d] to-[#191047] border border-cyan-500/30 flex items-center gap-3.5 shadow-lg">
        {/* Animated frequency equalizer bars */}
        <div className="flex items-center gap-1 h-6 flex-shrink-0 text-cyan-400">
          <span className="w-1 bg-cyan-400 rounded-full h-3 animate-wave-1" />
          <span className="w-1 bg-purple-400 rounded-full h-5 animate-wave-2" />
          <span className="w-1 bg-fuchsia-400 rounded-full h-4 animate-wave-3" />
          <span className="w-1 bg-cyan-400 rounded-full h-6 animate-wave-4" />
          <span className="w-1 bg-purple-400 rounded-full h-2 animate-wave-5" />
        </div>

        <div className="text-left flex-1">
          <p className="text-xs sm:text-sm font-semibold text-white line-clamp-1">
            {transcript ? `"${transcript}"` : lastResponse}
          </p>
          <p className="text-[11px] text-purple-200/70">
            {isThinking ? 'SAY AI is speaking; it will listen again automatically' : isSpeaking ? 'SAY AI is speaking' : isListening ? 'Listening for your next sentence' : 'Tap to start a hands-free voice conversation'}
          </p>
        </div>
      </div>
    </div>
  );
};
