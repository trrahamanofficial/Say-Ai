export async function onRequestPost(): Promise<Response> {
  return new Response(JSON.stringify({ error: 'Video generation provider is not connected. Add a supported video API before generating videos.' }), { status: 503, headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' } });
}
