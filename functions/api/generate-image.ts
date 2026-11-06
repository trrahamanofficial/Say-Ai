export async function onRequestPost(): Promise<Response> {
  return new Response(JSON.stringify({ error: 'Image generation is not enabled yet. No sample image will be shown as a generated result.' }), { status: 503, headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' } });
}
