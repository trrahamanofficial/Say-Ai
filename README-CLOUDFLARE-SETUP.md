# SAY AI — Cloudflare Pages package

This package preserves the existing React UI and visual assets. The Cloudflare Pages Functions provide the real server-side OpenRouter chat route and honest provider status checks.

## Cloudflare Pages build settings
- Framework preset: Vite
- Root directory: `/` (blank)
- Build command: `npm run build`
- Build output directory: `dist`
- Node.js: 22.x (or 20.19+)

## Variables and secrets
Set these in Cloudflare Pages → Settings → Variables and Secrets, for Production (and Preview if used):
- `OPENROUTER_API_KEY` — mark as Secret. Never put this in a `VITE_` variable.
- `VITE_SUPABASE_URL` — `https://ssfxkcylqrmdrkacpive.supabase.co`
- `VITE_SUPABASE_ANON_KEY` — your Supabase publishable/anon key.
- Optional `OPENROUTER_MODEL` — defaults to `openrouter/free`.

Do not add a Supabase service-role key to the frontend or any `VITE_` variable.

## Routes
- `POST /api/chat` — OpenRouter chat; requires `OPENROUTER_API_KEY`.
- `GET /api/system-status` — reports configured services, not fabricated uptime.
- `POST /api/test-provider` — live reachability/auth check for OpenRouter and Supabase; unsupported providers are reported as unavailable.
- `POST /api/generate-image` and `POST /api/generate-video` — return HTTP 503 until a real provider is connected. The UI no longer inserts a stock image and labels it as generated.

## Important limitations
- The existing API Management screen is a UI for provider entries; its per-user key entry is not a secure server-side secret vault and does not dynamically configure Cloudflare secrets. Only the Cloudflare `OPENROUTER_API_KEY` secret powers chat in this package.
- Image/video generation providers are not configured. No fake generation is claimed.
- Chat history persistence/authentication still depends on the existing Supabase frontend configuration and schema; this package does not claim a completed end-to-end auth/database audit.
- Deploy using a Git-connected Cloudflare Pages build or `wrangler pages deploy` with Functions. Uploading only the `dist` folder will omit Functions.

## Deploy
1. Put the contents of this ZIP at the repository root (not inside an extra nested folder).
2. Connect that repository to Cloudflare Pages.
3. Use the build settings above and add the variables/secrets.
4. Deploy, then verify `/api/system-status` and test a chat message.
