# SAY AI — Full Project (Cloudflare Pages & Supabase Ready)

An all-in-one AI assistant platform featuring AI Chat, Image Generation, Voice Assistant, API Management, Video Generation, and Dashboards with dark neon glassmorphism aesthetics.

---

## 🚀 Features

1. **Dashboard & Mobile UI**: Exact recreation of approved SAY AI neon violet/cyan glassmorphic designs for both desktop and mobile viewports.
2. **AI Chat**: Powered by Google Gemini 3.8 Flash with Markdown formatting, speech-to-text, audio readout, and conversation threads.
3. **Image Generator**: Prompt-based image creation with style filters (Nature, Fantasy, Anime, Business, Technology), trending prompt inspirations, and high-res image previews.
4. **Voice Assistant**: Central animated pulsating microphone orb, real-time voice speech recognition, text-to-speech audio synthesis, and quick voice shortcuts.
5. **API & Provider Management**: Manage Google Gemini, Cloudflare Workers AI, Supabase, OpenAI, and custom endpoints with live diagnostic ping benchmarking.
6. **Supabase Integration**: PostgreSQL schema with Row Level Security (RLS) policies for user profiles, chat sessions, generated media, and system audit logs.
7. **Cloudflare Pages Deployment**: Native Cloudflare Pages Functions in `/functions/api/` for zero-cold-start global edge execution.

---

## 🛠️ Local Development

```bash
# 1. Install dependencies
npm install

# 2. Start full-stack development server
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🌐 Deploying to Cloudflare Pages

1. Push this repository to GitHub or GitLab.
2. Log in to [Cloudflare Dashboard](https://dash.cloudflare.com) > **Workers & Pages** > **Create application** > **Pages** > **Connect to Git**.
3. Configure build settings:
   - **Framework preset**: `Vite`
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`
4. In **Settings > Environment variables**, configure:
   - `GEMINI_API_KEY`: Your Google Gemini API key.
   - `VITE_SUPABASE_URL`: Your Supabase Project URL (`https://xyz.supabase.co`).
   - `VITE_SUPABASE_ANON_KEY`: Your Supabase Anon Key.
5. Click **Save and Deploy**!

---

## 🗄️ Supabase Database Setup

1. Log in to your [Supabase Dashboard](https://supabase.com/dashboard).
2. Open the **SQL Editor**.
3. Copy the entire contents of `supabase-schema.sql` and click **Run**.
4. All tables (`users_profiles`, `chat_sessions`, `chat_messages`, `generated_images`, `ai_providers`) and Row Level Security policies will be automatically provisioned.

---

## 📦 Project Structure

```
├── functions/               # Cloudflare Pages Functions (Edge API)
│   └── api/
│       ├── chat.ts          # /api/chat
│       └── system-status.ts # /api/system-status
├── public/                  # Static assets & illustrations
│   └── assets/extracted/    # SAY AI extracted graphics
├── src/
│   ├── components/          # Modular React components
│   │   ├── DashboardView.tsx
│   │   ├── ChatView.tsx
│   │   ├── ImageGenView.tsx
│   │   ├── VoiceAssistantView.tsx
│   │   ├── SettingsView.tsx
│   │   ├── HistoryView.tsx
│   │   ├── ApiManagementView.tsx
│   │   ├── VideoGenView.tsx
│   │   ├── SubscriptionView.tsx
│   │   ├── AdminView.tsx
│   │   ├── Header.tsx
│   │   ├── Sidebar.tsx
│   │   ├── BottomNav.tsx
│   │   └── Logo.tsx
│   ├── lib/
│   │   └── supabase.ts      # Supabase client wrapper
│   ├── utils/
│   │   ├── ai-logic.ts      # Decoupled business logic
│   │   └── ai-logic.test.ts # Unit tests
│   ├── App.tsx              # Application shell & state
│   ├── main.tsx
│   └── types.ts             # TypeScript definitions
├── server.ts                # Full-stack Express server
├── supabase-schema.sql      # Supabase SQL schema
└── package.json
```
