import { InferenceClient } from '@huggingface/inference';

interface Env { SAY_AI_CONFIG?: KVNamespace }
type VideoConfig = { provider?: 'huggingface'; model?: string; apiKey?: string; enabled?: boolean };
const json = (data: unknown, status = 200) => Response.json(data, { status, headers: { 'Cache-Control': 'no-store' } });

function providerError(error: unknown) {
  const raw = error instanceof Error ? error.message : String(error);
  const value = raw.toLowerCase();
  if (value.includes('401') || value.includes('unauthorized') || value.includes('invalid token'))
    return { status: 502, message: 'Hugging Face rejected the saved token. Replace it in Admin → Video AI with a token that has “Make calls to Inference Providers” permission.' };
  if (value.includes('402') || value.includes('payment') || value.includes('credit') || value.includes('billing'))
    return { status: 402, message: 'Hugging Face inference credits are unavailable or exhausted. Free accounts receive only a small monthly credit; this video model may cost more. No paid fallback was started.' };
  if (value.includes('404') || value.includes('not found') || value.includes('model'))
    return { status: 503, message: 'The selected video model is not currently available through the configured Hugging Face provider. Check that the model is listed for Text-to-Video.' };
  if (value.includes('429') || value.includes('rate limit') || value.includes('queue'))
    return { status: 429, message: 'The video provider is busy or rate-limited. Please wait and try again.' };
  return { status: 502, message: 'Video generation failed: ' + raw.slice(0, 350) };
}

export async function onRequestPost({ request, env }: { request: Request; env: Env }): Promise<Response> {
  try {
    if (!env.SAY_AI_CONFIG) return json({ error: 'Video settings storage is not connected. Check the SAY_AI_CONFIG binding.' }, 503);
    const config = await env.SAY_AI_CONFIG.get<VideoConfig>('private-video-ai-config', 'json');
    if (!config?.enabled) return json({ error: 'Video AI is disabled or not configured. Enable Hugging Face in Admin → Video AI.' }, 503);
    if (!config.apiKey) return json({ error: 'Hugging Face token is missing. Add it in Admin → Video AI.' }, 503);

    const body = await request.json() as { prompt?: unknown; cameraMotion?: unknown; aspectRatio?: unknown };
    const prompt = typeof body.prompt === 'string' ? body.prompt.trim() : '';
    if (!prompt) return json({ error: 'Please enter a video scene prompt.' }, 400);
    if (prompt.length > 1500) return json({ error: 'Video prompt must be 1,500 characters or less.' }, 400);

    const motion = typeof body.cameraMotion === 'string' ? body.cameraMotion : 'Slow Pan';
    const ratio = typeof body.aspectRatio === 'string' && ['16:9', '9:16', '1:1'].includes(body.aspectRatio) ? body.aspectRatio : '16:9';
    const savedModel = (config.model || '').trim();
    const model = !savedModel || savedModel === 'Wan-AI/Wan2.1-T2V-1.3B' ? 'Wan-AI/Wan2.2-TI2V-5B' : savedModel;
    const inputs = [prompt, 'Camera movement: ' + motion + '.', 'Composition aspect ratio: ' + ratio + '.', 'Create a coherent cinematic moving video, not a still image.'].join(' ');

    const client = new InferenceClient(config.apiKey);
    const video = await client.textToVideo({ model, inputs, provider: 'fal-ai' } as Parameters<typeof client.textToVideo>[0]);
    if (!(video instanceof Blob) || video.size === 0) return json({ error: 'The provider returned an empty video result.' }, 502);
    if (video.size > 24 * 1024 * 1024) return json({ error: 'The generated video is too large for this preview. Try a shorter generation.' }, 413);

    const contentType = video.type.startsWith('video/') ? video.type : 'video/mp4';
    const bytes = new Uint8Array(await video.arrayBuffer());
    let binary = '';
    for (let i = 0; i < bytes.length; i += 0x8000) binary += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
    return json({
      success: true,
      videoUrl: 'data:' + contentType + ';base64,' + btoa(binary),
      model,
      provider: 'Hugging Face Inference Providers (Fal AI)',
      sizeBytes: video.size,
      createdAt: Date.now()
    });
  } catch (error) {
    const mapped = providerError(error);
    return json({ error: mapped.message }, mapped.status);
  }
}
