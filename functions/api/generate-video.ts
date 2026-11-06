interface Env { SAY_AI_CONFIG?: KVNamespace }
type VideoConfig = { provider?: 'huggingface'; model?: string; apiKey?: string; enabled?: boolean };
const json = (data: unknown, status = 200) => Response.json(data, { status, headers: { 'Cache-Control': 'no-store' } });

function providerError(status: number, detail: string) {
  const value = detail.toLowerCase();
  if (status === 401 || status === 403 || value.includes('unauthorized') || value.includes('invalid token'))
    return { status: 502, message: 'Hugging Face rejected the saved token. Replace it in Admin → Video AI with a token that has Inference Providers permission.' };
  if (status === 402 || value.includes('payment') || value.includes('credit') || value.includes('billing'))
    return { status: 402, message: 'Hugging Face inference credits are unavailable or exhausted. Free accounts have only a small monthly credit; this model may cost more. No paid fallback was started.' };
  if (status === 404 || value.includes('not found') || value.includes('not supported'))
    return { status: 503, message: 'The selected video model/provider is not currently available. Choose a model supported for Text-to-Video by Hugging Face Inference Providers.' };
  if (status === 429 || value.includes('rate limit') || value.includes('queue'))
    return { status: 429, message: 'The video provider is busy or rate-limited. Please wait and try again.' };
  return { status: 502, message: 'Video generation failed: ' + detail.slice(0, 350) };
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
    const providerModel = model === 'Wan-AI/Wan2.2-TI2V-5B'
      ? 'fal-ai/wan/v2.2-5b/text-to-video'
      : model;
    const inputs = [prompt, 'Camera movement: ' + motion + '.', 'Composition aspect ratio: ' + ratio + '.', 'Create a coherent cinematic moving video, not a still image.'].join(' ');

    const response = await fetch('https://router.huggingface.co/fal-ai/' + providerModel, {
      method: 'POST',
      headers: { Authorization: 'Bearer ' + config.apiKey, 'Content-Type': 'application/json', Accept: 'video/mp4' },
      body: JSON.stringify({ inputs, parameters: { num_frames: 81 } })
    });
    if (!response.ok) {
      const detail = await response.text();
      const mapped = providerError(response.status, detail);
      return json({ error: mapped.message }, mapped.status);
    }

    const video = await response.arrayBuffer();
    if (!video.byteLength) return json({ error: 'The provider returned an empty video result.' }, 502);
    if (video.byteLength > 24 * 1024 * 1024) return json({ error: 'The generated video is too large for this preview. Try a shorter generation.' }, 413);
    const contentType = response.headers.get('content-type')?.startsWith('video/') ? response.headers.get('content-type')! : 'video/mp4';
    const bytes = new Uint8Array(video);
    let binary = '';
    for (let i = 0; i < bytes.length; i += 0x8000) binary += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
    return json({
      success: true,
      videoUrl: 'data:' + contentType + ';base64,' + btoa(binary),
      model,
      provider: 'Hugging Face Inference Providers (Fal AI)',
      sizeBytes: video.byteLength,
      createdAt: Date.now()
    });
  } catch (error) {
    const detail = error instanceof Error ? error.message : String(error);
    return json({ error: 'Video generation request failed: ' + detail.slice(0, 300) }, 502);
  }
}
