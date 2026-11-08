/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  ScreenType,
  ChatMessage,
  ChatSession,
  GeneratedImage,
  AIProviderConfig,
  UserProfile,
  SystemHealth
} from './types';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { BottomNav } from './components/BottomNav';
import { DashboardView } from './components/DashboardView';
import { ChatView } from './components/ChatView';
import { ImageGenView } from './components/ImageGenView';
import { VoiceAssistantView } from './components/VoiceAssistantView';
import { SettingsView } from './components/SettingsView';
import { HistoryView } from './components/HistoryView';
import { ApiManagementView } from './components/ApiManagementView';
import { VideoGenView } from './components/VideoGenView';
import { SubscriptionView } from './components/SubscriptionView';
import { AdminView } from './components/AdminView';
import { NotificationModal } from './components/NotificationModal';
import { isSupabaseConfigured, testSupabaseConnection } from './lib/supabase';
import { X, Smartphone, Monitor } from 'lucide-react';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<ScreenType>(() => { try { const saved=localStorage.getItem('sayai:last-screen'); const allowed:ScreenType[]=['dashboard','chat','image','voice','settings','history','video','api','profile','pro','admin']; return saved&&allowed.includes(saved as ScreenType)?saved as ScreenType:'dashboard'; } catch { return 'dashboard'; } });
  const [isMobileFrame, setIsMobileFrame] = useState(false);
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [unreadNotifications, setUnreadNotifications] = useState(2);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [testingProviderId, setTestingProviderId] = useState<string | null>(null);

  // Initial user profile matching the screenshots
  const [userProfile, setUserProfile] = useState<UserProfile>({
    id: 'usr-default',
    name: 'SAY AI User',
    email: 'trrahaman.official@gmail.com',
    role: 'admin',
    plan: 'Free',
    avatarUrl: '/assets/extracted/user-avatar.png',
    stats: {
      chatUsed: 46,
      chatLimit: 50,
      imagesUsed: 15,
      imagesLimit: 20,
      voiceUsed: 18,
      voiceLimit: 30
    },
    appearance: {
      theme: 'dark',
      brightness: 80
    }
  });

  // System diagnostic state
  const [systemHealth, setSystemHealth] = useState<SystemHealth>({
    backend: true,
    edge: true,
    database: true,
    activeApis: 10,
    latencyMs: 28,
    uptime: '99.99%',
    environment: 'development'
  });

  // Chat messages matching the reference screenshot in Image 4
  const [messages, setMessages] = useState<ChatMessage[]>(() => { try { const saved=localStorage.getItem('sayai:messages'); if(saved){const parsed=JSON.parse(saved);if(Array.isArray(parsed))return parsed as ChatMessage[];} } catch {} return [
    {
      id: 'msg-1',
      sender: 'user',
      text: 'Tell me about SAY AI',
      time: '9:41 PM',
      timestamp: Date.now() - 300000
    },
    {
      id: 'msg-2',
      sender: 'assistant',
      text: `SAY AI is your all-in-one AI assistant! 🚀\n\n✅ AI Chat – Smart & helpful conversation\n✅ Image Generator – Create stunning images\n✅ Voice Assistant – Speak & get answers\n✅ Chat History – Access your past chats\n\n📦 Download SAY-AI-FULL-PROJECT.zip directly below with 1 click!\n\nBuilt with love for a smarter tomorrow! ❤️`,
      time: '9:41 PM',
      timestamp: Date.now() - 240000
    }
  ]; });

  // Initial Chat Sessions
  const [sessions, setSessions] = useState<ChatSession[]>(() => { try { const saved = localStorage.getItem('sayai:sessions'); if (saved) { const parsed = JSON.parse(saved); if (Array.isArray(parsed)) return parsed as ChatSession[]; } } catch {} return [
    {
      id: 'ses-1',
      title: 'AI Assistant Overview',
      lastMessage: 'Built with love for a smarter tomorrow! ❤️',
      timestamp: Date.now() - 120000,
      timeAgo: '2m ago',
      category: 'General',
      messages: messages
    },
    {
      id: 'ses-2',
      title: 'Image Generator Ideas',
      lastMessage: 'A beautiful sunset over mountain lakes...',
      timestamp: Date.now() - 900000,
      timeAgo: '15m ago',
      category: 'Creative',
      messages: []
    },
    {
      id: 'ses-3',
      title: 'Voice Assistant Commands',
      lastMessage: 'Listening for Hey SAY AI trigger...',
      timestamp: Date.now() - 3600000,
      timeAgo: '1h ago',
      category: 'Voice',
      messages: []
    },
    {
      id: 'ses-4',
      title: 'SAY AI Exploration',
      lastMessage: 'Always here for you!',
      timestamp: Date.now() - 7200000,
      timeAgo: '2h ago',
      category: 'Support',
      messages: []
    }
  ]; });// Configured AI Providers
  const [currentSessionId, setCurrentSessionId] = useState<string>(() => {
    try { return localStorage.getItem('sayai:active-session') || 'ses-1'; } catch { return 'ses-1'; }
  });

  const [providers, setProviders] = useState<AIProviderConfig[]>([
    {
      id: 'prov-1',
      name: 'Google Gemini Flash',
      type: 'gemini',
      baseUrl: 'https://generativelanguage.googleapis.com',
      apiKey: '',
      model: 'gemini-3.8-flash',
      isEnabled: true,
      isDefault: false,
      status: 'disconnected',
      pingMs: 0,
      lastTested: 'Just now'
    },
    {
      id: 'prov-2',
      name: 'Cloudflare Workers AI',
      type: 'cloudflare',
      baseUrl: 'https://api.cloudflare.com/client/v4',
      apiKey: '',
      model: '@cf/meta/llama-3.3-70b-instruct',
      isEnabled: true,
      isDefault: false,
      status: 'disconnected',
      pingMs: 0,
      lastTested: '2m ago'
    },
    {
      id: 'prov-3',
      name: 'Supabase PostgreSQL DB',
      type: 'supabase',
      baseUrl: import.meta.env.VITE_SUPABASE_URL || 'https://supabase-edge.sayai.internal',
      apiKey: '',
      model: 'PostgreSQL 16 (RLS)',
      isEnabled: true,
      isDefault: false,
      status: isSupabaseConfigured ? 'disconnected' : 'disconnected',
      pingMs: 0,
      lastTested: 'Just now'
    },
    {
      id: 'prov-openrouter',
      name: 'OpenRouter Free Models',
      type: 'openrouter',
      baseUrl: 'https://openrouter.ai/api/v1',
      apiKey: '',
      model: 'openrouter/free',
      isEnabled: true,
      isDefault: true,
      status: 'disconnected',
      pingMs: 0,
      lastTested: 'Not tested'
    },
    {
      id: 'prov-4',
      name: 'OpenAI GPT-4o Gateway',
      type: 'openai',
      baseUrl: 'https://api.openai.com/v1',
      apiKey: '',
      model: 'gpt-4o',
      isEnabled: false,
      isDefault: false,
      status: 'disconnected',
      pingMs: 0
    }
  ]);

  // User generated images
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([]);

  // Periodically query system health
  useEffect(() => {
    fetch('/api/system-status')
      .then((res) => res.json())
      .then((data) => {
        if (data.backend) {
          setSystemHealth((prev) => ({
            ...prev,
            backend: true,
            edge: true,
            activeApis: data.activeApis || prev.activeApis,
            latencyMs: data.latencyMs || 28
          }));
        }
      })
      .catch(() => {
        // Local fallback is running
      });
  }, []);

  useEffect(() => { try { localStorage.setItem('sayai:last-screen', currentScreen); } catch {} }, [currentScreen]);
  useEffect(() => { try { localStorage.setItem('sayai:active-session', currentSessionId); } catch {} }, [currentSessionId]);
  useEffect(() => { try { localStorage.setItem('sayai:messages', JSON.stringify(messages.slice(-150))); } catch {} }, [messages]);
  useEffect(() => { try { localStorage.setItem('sayai:sessions', JSON.stringify(sessions.slice(0, 60))); } catch {} }, [sessions]);
  useEffect(() => {
    if (!messages.length) return;
    setSessions(prev => {
      const index = prev.findIndex(session => session.id === currentSessionId);
      const latest = messages[messages.length - 1];
      const titleText = messages.find(message => message.sender === 'user')?.text || latest.text;
      const updatedSession: ChatSession = index >= 0
        ? { ...prev[index], messages: messages.slice(-150), lastMessage: (latest.text || '').slice(0, 80), timestamp: Date.now(), timeAgo: 'Just now' }
        : { id: currentSessionId, title: titleText.slice(0, 42) || 'New conversation', lastMessage: (latest.text || '').slice(0, 80), timestamp: Date.now(), timeAgo: 'Just now', category: 'General', messages: messages.slice(-150) };
      const next = [...prev];
      if (index >= 0) next[index] = updatedSession;
      else next.unshift(updatedSession);
      return next;
    });
  }, [messages, currentSessionId]);

  // Handle Chat Send
  const handleSendMessage = async (text: string) => {
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      text,
      time: timeStr,
      timestamp: Date.now()
    };

    setMessages((prev) => [...prev, userMsg]);


    setIsChatLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          history: messages.slice(-4)
        })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || `Chat request failed (${response.status}).`);
      const replyText = data.reply || "The AI provider returned an empty response. Please try again.";

      const aiMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: 'assistant',
        text: replyText,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        timestamp: Date.now()
      };

      setMessages((prev) => [...prev, aiMsg]);

      // Update session title & preview
      setSessions((prev) => {
        const updated = [...prev];
        if (updated.length > 0) {
          updated[0].lastMessage = replyText.slice(0, 50) + '...';
          updated[0].timeAgo = 'Just now';
        }
        return updated;
      });
    } catch (error) {
      const fallbackAiMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: 'assistant',
        text: error instanceof Error ? error.message : 'Could not reach the AI service. Please try again.',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        timestamp: Date.now()
      };
      setMessages((prev) => [...prev, fallbackAiMsg]);
    } finally {
      setIsChatLoading(false);
    }
  };

  // Handle Image Generation
  const handleGenerateImage = async (prompt: string, category: string) => {
    setIsGeneratingImage(true);
    try {
      const res = await fetch('/api/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, category })
      });
      const data = await res.json();
      if (!res.ok || !data.imageUrl) throw new Error(data.error || 'Image generation provider is not configured.');

      const newImg: GeneratedImage = {
        id: `img-${Date.now()}`,
        prompt,
        category,
        imageUrl: data.imageUrl || '/assets/extracted/gen-butterfly.png',
        createdAt: Date.now(),
        dimensions: '1024x1024'
      };

      setGeneratedImages((prev) => [newImg, ...prev]);
    } catch (error) {
      console.error('Image generation unavailable:', error);
    } finally {
      setIsGeneratingImage(false);
    }
  };

  // Test AI Provider
  const handleTestProvider = async (id: string) => {
    setTestingProviderId(id);
    const target = providers.find((p) => p.id === id);
    if (!target) return;

    try {
      const res = await fetch('/api/test-provider', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: target.type, baseUrl: target.baseUrl })
      });
      const data = await res.json();

      setProviders((prev) =>
        prev.map((p) =>
          p.id === id
            ? {
                ...p,
                status: data.status === 'connected' ? 'connected' : 'error',
                pingMs: data.pingMs || 35,
                lastTested: 'Just now'
              }
            : p
        )
      );
    } catch {
      setProviders((prev) =>
        prev.map((p) =>
          p.id === id
            ? { ...p, status: 'error', pingMs: 0, lastTested: 'Just now' }
            : p
        )
      );
    } finally {
      setTestingProviderId(null);
    }
  };

  const handleToggleProvider = (id: string) => {
    setProviders((prev) =>
      prev.map((p) => (p.id === id ? { ...p, isEnabled: !p.isEnabled } : p))
    );
  };

  const handleAddProvider = (newProv: Omit<AIProviderConfig, 'id' | 'status'>) => {
    const created: AIProviderConfig = {
      ...newProv,
      id: `prov-${Date.now()}`,
      status: 'disconnected',
      pingMs: 0,
      lastTested: 'Just now'
    };
    setProviders((prev) => [...prev, created]);
  };

  const handleDownloadProjectZip = () => {
    const a = document.createElement('a');
    a.href = '/SAY-AI-FULL-PROJECT.zip';
    a.download = 'SAY-AI-FULL-PROJECT.zip';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleUpgradePlan = (plan: 'Free' | 'Pro' | 'Enterprise') => {
    setUserProfile((prev) => ({ ...prev, plan }));
  };

  // Render specific active screen component
  const renderScreen = () => {
    switch (currentScreen) {
      case 'dashboard':
        return (
          <DashboardView
            onNavigate={setCurrentScreen}
            onOpenNotifications={() => setIsNotificationOpen(true)}
            onOpenPro={() => setCurrentScreen('pro')}
            userProfile={userProfile}
            systemHealth={systemHealth}
            isMobileFrame={isMobileFrame}
            onToggleMobileFrame={() => setIsMobileFrame(!isMobileFrame)}
            onDownloadProjectZip={handleDownloadProjectZip}
          />
        );
      case 'chat':
        return (
          <ChatView
            onNavigate={setCurrentScreen}
            messages={messages}
            onSendMessage={handleSendMessage}
            isLoading={isChatLoading}
          />
        );
      case 'image':
        return (
          <ImageGenView
            onNavigate={setCurrentScreen}
            generatedImages={generatedImages}
            onGenerateImage={handleGenerateImage}
            isGenerating={isGeneratingImage}
          />
        );
      case 'voice':
        return (
          <VoiceAssistantView
            onNavigate={setCurrentScreen}
            onSendChatMessage={handleSendMessage}
            onTriggerImagePrompt={(prompt) => {
              handleGenerateImage(prompt, 'Fantasy');
            }}
          />
        );
      case 'settings':
      case 'profile':
        return (
          <SettingsView
            onNavigate={setCurrentScreen}
            onOpenPro={() => setCurrentScreen('pro')}
            onLogout={() => setCurrentScreen('dashboard')}
            userProfile={userProfile}
            onUpdateProfile={(updated) => setUserProfile((prev) => ({ ...prev, ...updated }))}
          />
        );
      case 'history':
        return (
          <HistoryView
            onNavigate={setCurrentScreen}
            sessions={sessions}
            onSelectSession={(ses) => {
              setCurrentSessionId(ses.id);
              setMessages(Array.isArray(ses.messages) ? ses.messages : []);
            }}
            onDeleteSession={(id) => {
              setSessions((prev) => prev.filter((s) => s.id !== id));
              if (currentSessionId === id) {
                const nextSession = sessions.find(session => session.id !== id);
                if (nextSession) {
                  setCurrentSessionId(nextSession.id);
                  setMessages(nextSession.messages || []);
                } else {
                  const freshId = `ses-${Date.now()}`;
                  setCurrentSessionId(freshId);
                  setMessages([]);
                }
              }
            }}
          />
        );
      case 'api':
        return (
          <ApiManagementView
            onNavigate={setCurrentScreen}
            providers={providers}
            onToggleProvider={handleToggleProvider}
            onTestProvider={handleTestProvider}
            onAddProvider={handleAddProvider}
            isTestingId={testingProviderId}
          />
        );
      case 'video':
        return <VideoGenView onNavigate={setCurrentScreen} />;
      case 'pro':
        return (
          <SubscriptionView
            onNavigate={setCurrentScreen}
            userProfile={userProfile}
            onUpgradePlan={handleUpgradePlan}
          />
        );
      case 'admin':
        return (
          <AdminView
            onNavigate={setCurrentScreen}
            systemHealth={systemHealth}
            currentUser={userProfile}
          />
        );
      default:
        return (
          <DashboardView
            onNavigate={setCurrentScreen}
            onOpenNotifications={() => setIsNotificationOpen(true)}
            onOpenPro={() => setCurrentScreen('pro')}
            userProfile={userProfile}
            systemHealth={systemHealth}
            isMobileFrame={isMobileFrame}
            onToggleMobileFrame={() => setIsMobileFrame(!isMobileFrame)}
            onDownloadProjectZip={handleDownloadProjectZip}
          />
        );
    }
  };

  return (
    <div className="sayai-app min-h-screen bg-[#07121b] text-white flex flex-col font-sans selection:bg-cyan-500/30 selection:text-cyan-100">
      {/* Top Application Header */}
      <Header
        currentScreen={currentScreen}
        onNavigate={setCurrentScreen}
        isMobileFrame={isMobileFrame}
        onToggleMobileFrame={() => setIsMobileFrame(!isMobileFrame)}
        onOpenNotifications={() => setIsNotificationOpen(true)}
        onOpenPro={() => setCurrentScreen('pro')}
        onOpenMobileMenu={() => setIsMobileDrawerOpen(true)}
        onDownloadProjectZip={handleDownloadProjectZip}
        unreadCount={unreadNotifications}
      />

      {/* Main Container Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Desktop Sidebar (visible on lg screens when not in simulated mobile frame) */}
        {!isMobileFrame && (
          <div className="hidden lg:block">
            <Sidebar
              currentScreen={currentScreen}
              onNavigate={setCurrentScreen}
              onOpenPro={() => setCurrentScreen('pro')}
              onLogout={() => setCurrentScreen('dashboard')}
              onDownloadProjectZip={handleDownloadProjectZip}
            />
          </div>
        )}

        {/* Center Canvas Area */}
        <main className="flex-1 overflow-y-auto flex flex-col items-center justify-start pb-20 sm:pb-8">
          {isMobileFrame ? (
            /* Simulated Mobile Smartphone Frame matching Image 1, 2, 3, 4 */
            <div className="w-full max-w-sm sm:max-w-md my-4 px-2">
              <div className="rounded-[44px] p-3 bg-gradient-to-b from-[#1b204e] via-[#090c29] to-[#040615] border-4 border-purple-500/40 shadow-[0_0_50px_rgba(139,92,246,0.35)] relative overflow-hidden">
                {/* Mobile Camera Notch & Status Bar */}
                <div className="flex items-center justify-between px-6 py-1.5 text-[11px] text-slate-300 select-none">
                  <span className="font-bold">9:41</span>
                  <div className="w-20 h-4 bg-black rounded-full" />
                  <span className="font-semibold">87% 🔋</span>
                </div>

                {/* Mobile Screen Content */}
                <div className="min-h-[680px] max-h-[750px] overflow-y-auto rounded-[32px] bg-[#050614] p-1 flex flex-col justify-between">
                  {renderScreen()}
                  <BottomNav
                    currentScreen={currentScreen}
                    onNavigate={setCurrentScreen}
                    onOpenPro={() => setCurrentScreen('pro')}
                  />
                </div>
              </div>
            </div>
          ) : (
            /* Responsive Full Desktop or Mobile View */
            <div className="w-full flex-1 flex flex-col">
              {renderScreen()}
            </div>
          )}
        </main>
      </div>

      {/* Mobile Bottom Navigation (Visible on small screens) */}
      {!isMobileFrame && (
        <div className="block lg:hidden">
          <BottomNav
            currentScreen={currentScreen}
            onNavigate={setCurrentScreen}
            onOpenPro={() => setCurrentScreen('pro')}
          />
        </div>
      )}

      {/* Mobile Slide-over Drawer Menu */}
      {isMobileDrawerOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex">
          <div className="w-72 bg-[#07091e] h-full flex flex-col justify-between p-4 shadow-2xl relative">
            <button
              onClick={() => setIsMobileDrawerOpen(false)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
            <Sidebar
              currentScreen={currentScreen}
              onNavigate={setCurrentScreen}
              onOpenPro={() => {
                setIsMobileDrawerOpen(false);
                setCurrentScreen('pro');
              }}
              onLogout={() => {
                setIsMobileDrawerOpen(false);
                setCurrentScreen('dashboard');
              }}
              onDownloadProjectZip={handleDownloadProjectZip}
              onCloseMobileDrawer={() => setIsMobileDrawerOpen(false)}
            />
          </div>
          <div className="flex-1" onClick={() => setIsMobileDrawerOpen(false)} />
        </div>
      )}

      {/* Notifications Modal */}
      <NotificationModal
        isOpen={isNotificationOpen}
        onClose={() => setIsNotificationOpen(false)}
        onClear={() => setUnreadNotifications(0)}
        unreadCount={unreadNotifications}
      />
    </div>
  );
}
