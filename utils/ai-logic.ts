/**
 * Pure helper logic for SAY AI:
 * - Voice command intent routing
 * - Usage quota calculation
 * - Prompt category filtering & validation
 * - API connection status helper
 */

export interface VoiceCommandResult {
  intent: 'chat' | 'image' | 'settings' | 'time' | 'story' | 'search' | 'unknown';
  payload?: string;
  responsePreview: string;
}

export function parseVoiceCommand(transcript: string): VoiceCommandResult {
  const clean = (transcript || '').trim().toLowerCase();

  if (!clean) {
    return {
      intent: 'unknown',
      responsePreview: "I didn't catch that. Tap the microphone and speak again!"
    };
  }

  if (clean.includes('time') || clean.includes('what time') || clean.includes('clock')) {
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    return {
      intent: 'time',
      responsePreview: `The current time is ${timeStr}.`
    };
  }

  if (clean.includes('image') || clean.includes('draw') || clean.includes('picture') || clean.includes('generate')) {
    const prompt = clean.replace(/^(generate image|create picture|draw|picture of|image of)\s*(of|a|an)?\s*/gi, '').trim();
    return {
      intent: 'image',
      payload: prompt || 'A futuristic cybernetic metropolis at dusk with neon reflections',
      responsePreview: `Opening Image Generator${prompt ? ` with prompt: "${prompt}"` : ''}...`
    };
  }

  if (clean.includes('story') || clean.includes('tell me a story') || clean.includes('tale')) {
    return {
      intent: 'story',
      responsePreview: "Once upon a time in the digital cosmos of SAY AI, an inquisitive mind sparked an adventure across galaxies of code..."
    };
  }

  if (clean.includes('chat') || clean.includes('talk') || clean.includes('conversation')) {
    return {
      intent: 'chat',
      responsePreview: "Opening AI Chat. How can I help you today?"
    };
  }

  if (clean.includes('setting') || clean.includes('profile') || clean.includes('account')) {
    return {
      intent: 'settings',
      responsePreview: "Navigating to your settings and preferences."
    };
  }

  if (clean.includes('search') || clean.includes('google') || clean.includes('look up')) {
    return {
      intent: 'search',
      responsePreview: "Searching the knowledge universe for you..."
    };
  }

  return {
    intent: 'chat',
    payload: transcript,
    responsePreview: `Processing: "${transcript}"...`
  };
}

export function calculateUsagePercentage(used: number, limit: number): number {
  if (limit <= 0) return 0;
  const pct = Math.round((used / limit) * 100);
  return Math.min(100, Math.max(0, pct));
}

export function filterPromptsByCategory<T extends { category: string }>(items: T[], category: string): T[] {
  if (!category || category === 'All' || category.toLowerCase() === 'all') {
    return items;
  }
  return items.filter(item => item.category.toLowerCase() === category.toLowerCase());
}

export function formatRelativeTime(timestamp: number | string | Date): string {
  const date = new Date(timestamp);
  const diffSeconds = Math.floor((Date.now() - date.getTime()) / 1000);

  if (diffSeconds < 60) return 'Just now';
  const diffMinutes = Math.floor(diffSeconds / 60);
  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}d ago`;
}
