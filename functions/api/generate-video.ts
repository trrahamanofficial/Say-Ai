interface Env { SAY_AI_CONFIG?: KVNamespace }
type VideoConfig = { provider?: 'zerogpu' | 'huggingface'; model?: string; apiKey?: string; enabled?: boolean };
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Max-Age': '86400'
};
const json = (data: unknown, status = 200) => Response.json(data, { status, headers: { ...corsHeaders, 'Cache-Control': 'no-store' } });
export async function onRequestOptions(): Promise<Response> {
  return new Response(null, { status: 204, headers: corsHeaders });
}

function providerError(status: number, detail: string) {
  const value = detail.toLowerCase();
  if (status === 401 || status === 403 || value.includes('unauthorized') || value.includes('invalid token'))
    return { status: 502, message: 'Hugging Face rejected the saved token. Replace it in Admin → Video AI with a token that has Inference Providers permission.' };
  if (status === 402 || value.includes('payment') || value.includes('credit') || value.includes('billing'))
    return { status: 402, message: 'Hugging Face inference credits are unavailable or exhausted. No paid fallback was started.' };
  if (status === 404 || value.includes('not found') || value.includes('not supported'))
    return { status: 503, message: 'The selected video model/provider is not currently available.' };
  if (status === 429 || value.includes('rate limit') || value.includes('queue'))
    return { status: 429, message: 'The video provider is busy or rate-limited. Please wait and try again.' };
  return { status: 502, message: 'Video generation failed: ' + detail.slice(0, 350) };
}

async function generateZeroGpu(prompt: string, motion: string, ratio: string, token: string) {
  // Public Lightricks Gradio Space. This route ONLY calls the free ZeroGPU Space;
  // it never falls back to a paid Inference Provider endpoint.
  const base = 'https://lightricks-ltx-video-distilled.hf.space';
  const dimensions = ratio === '9:16' ? { width: 384, height: 672 } : ratio === '1:1' ? { width: 512, height: 512 } : { width: 704, height: 396 };
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers.Authorization = 'Bearer ' + token;
  const motionGuide: Record<string, string> = {
    'Orbit 360': 'Use a slow smooth camera arc while the subject keeps moving naturally.',
    'Slow Pan': 'Use a gentle tracking pan that follows the subject and keeps it visibly moving.',
    'Zoom In': 'Use a gradual cinematic dolly-in while the subject performs clear natural movement.',
    'FPV Drone': 'Use a smooth low-altitude tracking move with controlled parallax.'
  };
  const cinematicPrompt = [prompt.trim(), 'Photorealistic live-action wildlife cinematography, realistic anatomy and detailed natural fur; not an illustration or stylized animation.', 'Keep the main subject animated throughout: natural breathing, blinking, head movement, body weight shift and tail movement; for an animal, show several slow natural steps.', 'Animate the environment with gently moving leaves and grass, drifting mist and changing natural light. Maintain consistent subject identity, anatomy and background across frames.', motionGuide[motion] || motionGuide['Slow Pan'], 'One continuous cinematic shot, smooth temporal motion, coherent frames, realistic physics, detailed textures and dramatic natural lighting.'].join(' ');
  const data = [
    [cinematicPrompt, 'cartoon, illustration, painting, frozen pose, still image, flicker, morphing, deformed anatomy, extra limbs, blurry, watermark, text', ''].join(' '),
    'worst quality, blurry, distorted, watermark',
    '',
    '',
    dimensions.height,
    dimensions.width,
    'text-to-video',
    3,
    9,
    42,
    true,
    1,
    true
  ];
  const submitted = await fetch(base + '/gradio_api/call/text_to_video', {
    method: 'POST', headers, body: JSON.stringify({ data })
  });
  if (!submitted.ok) {
    const detail = await submitted.text();
    throw new Error(submitted.status === 429
      ? 'Free ZeroGPU is busy or its daily quota is used. Please try again after the queue clears or quota resets.'
      : 'Could not submit to free ZeroGPU (HTTP ' + submitted.status + '): ' + detail.slice(0, 220));
  }
  const submittedData = await submitted.json() as { event_id?: string };
  if (!submittedData.event_id) throw new Error('ZeroGPU did not return a job ID.');
  const result = await fetch(base + '/gradio_api/call/text_to_video/' + encodeURIComponent(submittedData.event_id), {
    headers,
    signal: AbortSignal.timeout(5 * 60 * 1000)
  });
  if (!result.ok) throw new Error('Lost connection while waiting for ZeroGPU (HTTP ' + result.status + ').');
  const raw = await result.text();
  const blocks = raw.split(/\n\n/).filter(Boolean).reverse();
  for (const block of blocks) {
    const event = block.match(/^event:\s*(\S+)/m)?.[1];
    const value = block.match(/^data:\s*(.+)$/m)?.[1];
    if (!event || !value) continue;
    if (event === 'error') throw new Error('ZeroGPU generation failed: ' + value.slice(0, 250));
    if (event === 'complete') {
      const payload = JSON.parse(value) as Array<{ video?: { url?: string } } | number>;
      const videoFile = (payload[0] as { video?: { url?: string; path?: string } })?.video;
      const rawVideoUrl = videoFile?.url || videoFile?.path;
      if (!rawVideoUrl) throw new Error('ZeroGPU returned no video file.');
      // Gradio Spaces commonly return a site-relative file URL. Resolve it against
      // the Space origin; otherwise the app loads it from say-ai.pages.dev (0:00).
      const videoUrl = new URL(rawVideoUrl, base).toString();
      return { videoUrl, provider: 'Hugging Face ZeroGPU · LTX Video', model: 'LTX-Video Distilled', createdAt: Date.now() };
    }
  }
  throw new Error('ZeroGPU job did not finish. Please try again.');
}

export async function onRequestPost({ request, env }: { request: Request; env: Env }): Promise<Response> {
  try {
    if (!env.SAY_AI_CONFIG) return json({ error: 'Video settings storage is not connected. Check the SAY_AI_CONFIG binding.' }, 503);
    const config = await env.SAY_AI_CONFIG.get<VideoConfig>('private-video-ai-config', 'json');
    if (!config?.enabled) return json({ error: 'Video AI is disabled or not configured. Enable Hugging Face in Admin → Video AI.' }, 503);
    if (!config.apiKey) return json({ error: 'Hugging Face token is missing. Add it in Admin → Video AI.' }, 503);

    const body = await request.json() as { prompt?: unknown; cameraMotion?: unknown; aspectRatio?: unknown; provider?: unknown };
    const prompt = typeof body.prompt === 'string' ? body.prompt.trim() : '';
    if (!prompt) return json({ error: 'Please enter a video scene prompt.' }, 400);
    if (prompt.length > 1500) return json({ error: 'Video prompt must be 1,500 characters or less.' }, 400);

    const motion = typeof body.cameraMotion === 'string' ? body.cameraMotion : 'Slow Pan';
    const ratio = typeof body.aspectRatio === 'string' && ['16:9', '9:16', '1:1'].includes(body.aspectRatio) ? body.aspectRatio : '16:9';
    if ((config.provider || 'zerogpu') === 'zerogpu') {
      const result = await generateZeroGpu(prompt, motion, ratio, config.apiKey);
      return json({ success: true, ...result });
    }

    const savedModel = (config.model || '').trim();
    const model = !savedModel || savedModel === 'Wan-AI/Wan2.1-T2V-1.3B' ? 'Wan-AI/Wan2.2-TI2V-5B' : savedModel;
    const providerModel = model === 'Wan-AI/Wan2.2-TI2V-5B' ? 'fal-ai/wan/v2.2-5b/text-to-video' : model;
    const inputs = [prompt, 'Camera movement: ' + motion + '.', 'Composition aspect ratio: ' + ratio + '.', 'Create a coherent cinematic moving video, not a still image.'].join(' ');
    const response = await fetch('https://router.huggingface.co/fal-ai/' + providerModel, {
      method: 'POST',
      headers: { Authorization: 'Bearer ' + config.apiKey, 'Content-Type': 'application/json', Accept: 'video/mp4' },
      body: JSON.stringify({ inputs, parameters: { num_frames: 81 } })
    });
    if (!response.ok) {
      const mapped = providerError(response.status, await response.text());
      return json({ error: mapped.message }, mapped.status);
    }
    const video = await response.arrayBuffer();
    if (!video.byteLength) return json({ error: 'The provider returned an empty video result.' }, 502);
    if (video.byteLength > 24 * 1024 * 1024) return json({ error: 'The generated video is too large for this preview. Try a shorter generation.' }, 413);
    const contentType = response.headers.get('content-type')?.startsWith('video/') ? response.headers.get('content-type')! : 'video/mp4';
    const bytes = new Uint8Array(video);
    let binary = '';
    for (let i = 0; i < bytes.length; i += 0x8000) binary += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
    return json({ success: true, videoUrl: 'data:' + contentType + ';base64,' + btoa(binary), model, provider: 'Hugging Face Inference Providers (Fal AI)', sizeBytes: video.byteLength, createdAt: Date.now() });
  } catch (error) {
    const detail = error instanceof Error ? error.message : String(error);
    return json({ error: 'Video generation request failed: ' + detail.slice(0, 300) }, 502);
  }
}
