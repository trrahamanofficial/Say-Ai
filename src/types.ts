export type ScreenType =
  | 'dashboard'
  | 'chat'
  | 'image'
  | 'voice'
  | 'history'
  | 'api'
  | 'video'
  | 'pro'
  | 'settings'
  | 'profile'
  | 'admin';

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  time: string;
  timestamp: number;
  attachments?: string[];
  isStreaming?: boolean;
}

export interface ChatSession {
  id: string;
  title: string;
  lastMessage: string;
  timestamp: number;
  timeAgo: string;
  category?: string;
  messages: ChatMessage[];
}

export interface GeneratedImage {
  id: string;
  prompt: string;
  category: string;
  imageUrl: string;
  createdAt: number;
  dimensions?: string;
  aspectRatio?: string;
  likes?: number;
}

export interface TrendingPrompt {
  id: string;
  title: string;
  prompt: string;
  category: string;
  imageUrl: string;
}

export interface VoiceCommandItem {
  id: string;
  label: string;
  icon: string;
  description: string;
  query: string;
}

export interface AIProviderConfig {
  id: string;
  name: string;
  type: 'gemini' | 'openrouter' | 'openai' | 'anthropic' | 'cloudflare' | 'supabase' | 'custom' | 'openai-compatible' | 'cohere';
  baseUrl: string;
  apiKey: string;
  model: string;
  isEnabled: boolean;
  isDefault: boolean;
  status: 'connected' | 'disconnected' | 'testing' | 'error';
  pingMs?: number;
  lastTested?: string;
  notes?: string;
  apiKeyConfigured?: boolean;
}

export interface MediaProviderConfig {
  id: string;
  name: string;
  type: string;
  baseUrl: string;
  apiKey: string;
  model: string;
  enabled: boolean;
  category: 'image' | 'video';
  apiKeyConfigured?: boolean;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  plan: 'Free' | 'Pro' | 'Enterprise';
  avatarUrl: string;
  stats: {
    chatUsed: number;
    chatLimit: number;
    imagesUsed: number;
    imagesLimit: number;
    voiceUsed: number;
    voiceLimit: number;
  };
  appearance: {
    theme: 'dark' | 'light';
    brightness: number;
  };
}

export interface SystemHealth {
  backend: boolean;
  edge: boolean;
  database: boolean;
  activeApis: number;
  latencyMs: number;
  uptime: string;
  environment: 'production' | 'development' | 'cloudflare-pages';
}
