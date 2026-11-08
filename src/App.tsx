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
import { AIBrainControl } from './components/AIBrainControl';
import { VideoGenView } from './components/VideoGenView';
import { SubscriptionView } from './components/SubscriptionView';
import { AdminView } from './components/AdminView';
import { NotificationModal } from './components/NotificationModal';
import { isSupabaseConfigured, testSupabaseConnection, supabase } from './lib/supabase';
import { X, Smartphone, Monitor } from 'lucide-react';

export function AppShell({ profile, onSignOut, adminMode = false }: { profile: UserProfile; onSignOut: () => void; adminMode?: boolean }) {
  // Use the production Pages API for both web and the Capacitor Android app.
  const apiBase = 'https://say-ai.pages.dev';
  const [currentScreen, setCurrentScreen] = useState<ScreenType>(() => {
    try {
      const saved = localStorage.getItem(`sayai-last-screen-${profile.id}`);
      const allowed: ScreenType[] = ['dashboard', 'chat', 'image', 'voice', 'settings', 'history', 'video', 'api', 'profile', 'pro'];
      return saved && allowed.includes(saved as ScreenType) ? saved as ScreenType : 'dashboard';
    } catch { return 'dashboard'; }
  });
  const [isMobileFrame, setIsMobileFrame] = useState(false);
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [unreadNotifications, setUnreadNotifications] = useState(2);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [testingProviderId, setTestingProviderId] = useState<string | null>(null);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);

  // Restore the last active screen after Android resumes or recreates the WebView.
  useEffect(() => {
    try { localStorage.setItem(`sayai-last-screen-${profile.id}`, currentScreen); } catch { /* storage may be unavailable */ }
  }, [profile.id, currentScreen]);

  // Initial user profile matching the screenshots
  const [userProfile, setUserProfile] = useState<UserProfile>(() => {
    try {
      const saved = localStorage.getItem(`sayai-appearance-${profile.id}`);
      const appearance = saved ? JSON.parse(saved) : null;
      return appearance && typeof appearance === 'object'
        ? { ...profile, appearance: { ...profile.appearance, ...appearance } }
        : profile;
    } catch {
      return profile;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(`sayai-appearance-${profile.id}`, JSON.stringify(userProfile.appearance));
    } catch {
      // Appearance still works for this session if browser storage is unavailable.
    }
  }, [profile.id, userProfile.appearance]);

  const updateUserProfile = (updated: Partial<UserProfile>) => {
    setUserProfile((prev) => ({
      ...prev,
      ...updated,
      appearance: updated.appearance
        ? { ...prev.appearance, ...updated.appearance }
        : prev.appearance
    }));
  };

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

  // Chat messages and sessions are loaded from Supabase for the signed-in user.
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [sessions, setSessions] = useState<ChatSession[]>([]);

  useEffect(() => {
    let active = true;
    const loadChatHistory = async () => {
      if (!supabase) return;
      const { data: sessionData } = await supabase.auth.getSession();
      const userId = sessionData.session?.user.id;
      if (!userId) return;
      const { data: rows, error } = await supabase
        .from('chat_sessions')
        .select('id,title,updated_at')
        .eq('user_id', userId)
        .order('updated_at', { ascending: false });
      if (error) { console.error('Could not load chat history:', error.message); return; }
      if (!active) return;
      const loaded: ChatSession[] = (rows || []).map((row: any) => ({
        id: row.id,
        title: row.title || 'New Chat',
        lastMessage: '',
        timestamp: new Date(row.updated_at).getTime(),
        timeAgo: new Date(row.updated_at).toLocaleString(),
        category: 'Chat',
        messages: []
      }));
      setSessions(loaded);
      // Restore the previously open conversation, not just the history list.
      try {
        const savedSessionId = localStorage.getItem(`sayai-last-session-${profile.id}`);
        if (savedSessionId && loaded.some((item) => item.id === savedSessionId)) {
          const { data: savedMessages, error: savedMessagesError } = await supabase
            .from('chat_messages')
            .select('id,role,content,created_at')
            .eq('session_id', savedSessionId)
            .order('created_at', { ascending: true });
          if (!savedMessagesError && active) {
            setMessages((savedMessages || []).map((row: any) => ({
              id: row.id,
              sender: row.role === 'user' ? 'user' : 'assistant',
              text: row.content,
              time: new Date(row.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              timestamp: new Date(row.created_at).getTime()
            })));
            setCurrentSessionId(savedSessionId);
          }
        }
      } catch { /* retain an empty chat if local storage is unavailable */ }
    };
    void loadChatHistory();
    return () => { active = false; };
  }, [profile.id]);

  useEffect(() => {
    try {
      if (currentSessionId) localStorage.setItem(`sayai-last-session-${profile.id}`, currentSessionId);
      else localStorage.removeItem(`sayai-last-session-${profile.id}`);
    } catch { /* storage may be unavailable */ }
  }, [profile.id, currentSessionId]);

  // Configured AI Providers
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
  const [latestGeneratedVideo, setLatestGeneratedVideo] = useState<string | null>(null);

  // Periodically query system health
  useEffect(() => {
    fetch(apiBase + '/api/system-status')
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

  // Save every chat message to the signed-in user's Supabase history.
  const handleSendMessage = async (text: string) => {
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const userMsg: ChatMessage = { id: `msg-${Date.now()}`, sender: 'user', text, time: timeStr, timestamp: Date.now() };
    const priorMessages = messages;
    setMessages((prev) => [...prev, userMsg]);
    setIsChatLoading(true);
    let sessionId = currentSessionId;
    let userId = profile.id;
    try {
      if (supabase) {
        const { data: authData } = await supabase.auth.getSession();
        userId = authData.session?.user.id || profile.id;
        if (!sessionId) {
          const title = text.trim().slice(0, 70) || 'New Chat';
          const { data: created, error } = await supabase.from('chat_sessions')
            .insert({ user_id: userId, title }).select('id').single();
          if (error) throw new Error('Could not create chat history: ' + error.message);
          sessionId = created.id;
          setCurrentSessionId(sessionId);
        }
        const { error: saveUserError } = await supabase.from('chat_messages').insert({
          session_id: sessionId, user_id: userId, role: 'user', content: text
        });
        if (saveUserError) throw new Error('Could not save your message: ' + saveUserError.message);
      }

      const response = await fetch(`${apiBase}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, history: priorMessages.slice(-4) })
      });
      const responseType = response.headers.get('content-type') || '';
      if (!responseType.includes('application/json')) {
        const bodyPreview = (await response.text()).slice(0, 160).replace(/\\s+/g, ' ');
        throw new Error(`Chat API returned a non-JSON response (${response.status}). ${bodyPreview}`);
      }
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || `Chat request failed (${response.status}).`);
      const replyText = data.reply || 'The AI provider returned an empty response. Please try again.';
      const aiMsg: ChatMessage = {
        id: `ai-${Date.now()}`, sender: 'assistant', text: replyText,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), timestamp: Date.now()
      };
      setMessages((prev) => [...prev, aiMsg]);
      if (supabase && sessionId) {
        const { error: saveReplyError } = await supabase.from('chat_messages').insert({
          session_id: sessionId, user_id: userId, role: 'assistant', content: replyText
        });
        if (saveReplyError) console.error('Could not save assistant reply:', saveReplyError.message);
        await supabase.from('chat_sessions').update({ updated_at: new Date().toISOString() }).eq('id', sessionId).eq('user_id', userId);
        const { data: savedSession } = await supabase.from('chat_sessions').select('id,title,updated_at').eq('id', sessionId).single();
        setSessions((prev) => [{
          id: sessionId!, title: savedSession?.title || text.slice(0, 70),
          lastMessage: replyText.slice(0, 100), timestamp: Date.now(),
          timeAgo: 'Just now', category: 'Chat', messages: [...priorMessages, userMsg, aiMsg]
        }, ...prev.filter((item) => item.id !== sessionId)]);
      }
    } catch (error) {
      const errorText = error instanceof Error ? error.message : 'Could not reach the AI service. Please try again.';
      const fallbackAiMsg: ChatMessage = {
        id: `ai-${Date.now()}`, sender: 'assistant', text: errorText,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), timestamp: Date.now()
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
      const res = await fetch(apiBase + '/api/generate-image', {
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
      throw error;
    } finally {
      setIsGeneratingImage(false);
    }
  };

  // Generate a video from the unified chat composer using the existing API route.
  const handleGenerateVideo = async (prompt: string): Promise<string> => {
    const res = await fetch(apiBase + '/api/generate-video', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify({ prompt, cameraMotion: 'Slow Pan', aspectRatio: '16:9' })
    });
    const raw = await res.text();
    let data: { videoUrl?: string; error?: string };
    try { data = JSON.parse(raw); }
    catch { throw new Error('Video service returned an invalid response. Please try again later.'); }
    if (!res.ok || !data.videoUrl) throw new Error(data.error || 'Video generation is not available right now.');
    setLatestGeneratedVideo(data.videoUrl);
    return data.videoUrl;
  };

  // Test AI Provider
  const handleTestProvider = async (id: string) => {
    setTestingProviderId(id);
    const target = providers.find((p) => p.id === id);
    if (!target) return;

    try {
      const res = await fetch(apiBase + '/api/test-provider', {
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
          />
        );
      case 'chat':
        return (
          <ChatView
            onNavigate={setCurrentScreen}
            messages={messages}
            onSendMessage={handleSendMessage}
            onGenerateImage={handleGenerateImage}
            onGenerateVideo={handleGenerateVideo}
            generatedImages={generatedImages}
            latestVideoUrl={latestGeneratedVideo}
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
            onLogout={onSignOut}
            userProfile={userProfile}
            onUpdateProfile={updateUserProfile}
          />
        );
      case 'history':
        return (
          <HistoryView
            onNavigate={setCurrentScreen}
            sessions={sessions}
            onSelectSession={async (ses) => {
              if (!supabase) return;
              const { data, error } = await supabase.from('chat_messages')
                .select('id,role,content,created_at').eq('session_id', ses.id).order('created_at', { ascending: true });
              if (error) { console.error('Could not open chat history:', error.message); return; }
              const restored: ChatMessage[] = (data || []).map((row: any) => ({
                id: row.id, sender: row.role === 'user' ? 'user' : 'assistant',
                text: row.content, time: new Date(row.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                timestamp: new Date(row.created_at).getTime()
              }));
              setMessages(restored);
              setCurrentSessionId(ses.id);
            }}
            onDeleteSession={async (id) => {
              if (supabase) {
                const { error } = await supabase.from('chat_sessions').delete().eq('id', id).eq('user_id', profile.id);
                if (error) { console.error('Could not delete chat history:', error.message); return; }
              }
              setSessions((prev) => prev.filter((item) => item.id !== id));
              if (currentSessionId === id) { setCurrentSessionId(null); setMessages([]); }
            }}
          />
        );
      case 'api':
        return <AIBrainControl />;
      case 'video':
        return <VideoGenView onNavigate={setCurrentScreen} apiBase={apiBase} />;
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
              />
        );
    }
  };

  if (adminMode) {
    return (
      <div className="min-h-screen bg-[#050614] text-white p-3 sm:p-6">
        <div className="mx-auto max-w-7xl">
          <div className="flex items-center justify-between border-b border-purple-900/30 pb-4 mb-6">
            <div><div className="text-xl font-black">SAY AI <span className="text-purple-400">ADMIN</span></div><p className="text-xs text-slate-400 mt-1">Private administration area</p></div>
            <button onClick={onSignOut} className="rounded-xl border border-red-500/30 px-4 py-2 text-sm text-red-300">Logout</button>
          </div>
          <AdminView onNavigate={setCurrentScreen} systemHealth={systemHealth} currentUser={userProfile} />
        </div>
      </div>
    );
  }

  return (
    <div className="sayai-app min-h-screen bg-[#050614] text-white flex flex-col font-sans selection:bg-purple-500/30 selection:text-purple-200" data-sayai-theme={userProfile.appearance.theme}>
      <div className="sayai-app-content flex flex-1 min-h-0 flex-col" style={{ filter: `brightness(${Math.min(100, Math.max(20, userProfile.appearance.brightness))}%)${userProfile.appearance.theme === "light" ? " invert(1) hue-rotate(180deg)" : ""}` }}>
      {/* Top Application Header */}
      <Header
        currentScreen={currentScreen}
        onNavigate={setCurrentScreen}
        isMobileFrame={isMobileFrame}
        onToggleMobileFrame={() => setIsMobileFrame(!isMobileFrame)}
        onOpenNotifications={() => setIsNotificationOpen(true)}
        onOpenPro={() => setCurrentScreen('pro')}
        onOpenMobileMenu={() => setIsMobileDrawerOpen(true)}
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
              onLogout={onSignOut}
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
              onLogout={() => { setIsMobileDrawerOpen(false); onSignOut(); }}
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
