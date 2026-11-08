type Env = { OPENROUTER_API_KEY?: string; OPENROUTER_MODEL?: string };
type HistoryItem = { sender?: string; text?: string };
const json = (data: unknown, status = 200) => new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' } });
export async function onRequestPost({ request, env }: { request: Request; env: Env }): Promise<Response> {
  try {
    const body = await request.json() as { message?: string; history?: HistoryItem[] };
    if (typeof body.message !== 'string' || !body.message.trim()) return json({ error: 'Message is required.' }, 400);
    if (!env.OPENROUTER_API_KEY) return json({ error: 'OpenRouter is not configured. Add OPENROUTER_API_KEY as a Cloudflare Pages secret.' }, 503);
    const history = Array.isArray(body.history) ? body.history.slice(-8).filter(x => typeof x?.text === 'string').map(x => ({ role: x.sender === 'user' ? 'user' : 'assistant', content: String(x.text).slice(0, 12000) })) : [];
    const model = env.OPENROUTER_MODEL || 'openrouter/free';
    const upstream = await fetch('https://openrouter.ai/api/v1/chat/completions', { method: 'POST', headers: { Authorization: `Bearer ${env.OPENROUTER_API_KEY}`, 'Content-Type': 'application/json', 'HTTP-Referer': 'https://say-ai.pages.dev', 'X-Title': 'SAY AI' }, body: JSON.stringify({ model, messages: [{ role: 'system', content: 'You are SAY AI, a helpful, friendly personal AI assistant. Be accurate and honest. Use clear concise Markdown when useful.' }, ...history, { role: 'user', content: body.message.trim().slice(0, 12000) }], temperature: 0.7 }) });
    const data = await upstream.json() as { choices?: Array<{ message?: { content?: string | Array<{type?:string;text?:string}> } }>; error?: { message?: string } };
    if (!upstream.ok) return json({ error: data.error?.message || `OpenRouter request failed (${upstream.status}).` }, 502);
    const content = data.choices?.[0]?.message?.content;
    const reply = typeof content === 'string' ? content : Array.isArray(content) ? content.map(p => p.text || '').join('\n') : '';
    if (!reply.trim()) return json({ error: 'OpenRouter returned an empty response. Please try again.' }, 502);
    return json({ success: true, reply, model });
  } catch (e) { return json({ error: e instanceof Error ? e.message : 'Unexpected server error.' }, 500); }
}
