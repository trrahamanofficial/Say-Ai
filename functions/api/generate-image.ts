interface Env {
  SAY_AI_CONFIG?: KVNamespace;
  AI?: { run(model: string, input: { prompt: string; steps?: number }): Promise<{ image?: string }> };
}
export async function onRequestPost({ request, env }: { request: Request; env: Env }): Promise<Response> {
  try {
    const body = await request.json() as { prompt?: unknown; category?: unknown };
    const prompt = typeof body.prompt === 'string' ? body.prompt.trim() : '';
    const category = typeof body.category === 'string' ? body.category : 'Photorealistic';
    if (!prompt) return Response.json({ error: 'Please enter an image description.' }, { status: 400 });
    if (prompt.length > 2048) return Response.json({ error: 'Image description must be 2048 characters or less.' }, { status: 400 });
    const imageConfig = env.SAY_AI_CONFIG ? await env.SAY_AI_CONFIG.get<{ provider?: string; enabled?: boolean; model?: string; apiKey?: string }>('private-image-ai-config', 'json') : null;
    if (imageConfig?.enabled === false) return Response.json({ error: 'Image generation is currently disabled by the administrator.' }, { status: 503 });
    const categoryStyle: Record<string, string> = {
      Photorealistic: 'strict photorealism, real-world photographic image',
      Nature: 'realistic nature and wildlife photography, natural colors and lighting',
      Fantasy: 'photorealistic live-action fantasy scene, physically realistic materials and lighting, not an illustration',
      Anime: 'high-quality anime illustration, expressive colors',
      Business: 'professional photorealistic commercial photography, clean composition',
      Technology: 'photorealistic technology product photography, realistic materials and reflections',
      Cyberpunk: 'photorealistic cinematic cyberpunk scene, realistic neon lighting and physical details'
    };
    const style = categoryStyle[category] || 'strict photorealism, realistic photography';
    const realismDirection = category === 'Anime' ? '' : 'Create a highly photorealistic image as if captured by a professional full-frame DSLR camera. Realistic anatomy, authentic textures, natural imperfections, physically accurate lighting, lifelike shadows, true-to-life colors, fine photographic detail, realistic depth of field. The result must look like an actual photograph, not digital art. Avoid cartoon, anime, illustration, painting, 3D render, CGI, game art, plastic textures, oversaturated colors, and artificial fantasy-art styling.';
    const finalPrompt = `${prompt}. ${style}. ${realismDirection}`;
    let bytes: Uint8Array;
    let contentType = 'image/png';
    if (imageConfig?.provider === 'huggingface') {
      if (!imageConfig.apiKey) return Response.json({ error: 'Hugging Face token is not configured in Image AI Management.' }, { status: 503 });
      const model = imageConfig.model || 'black-forest-labs/FLUX.1-schnell';
      const response = await fetch('https://router.huggingface.co/hf-inference/models/' + model.split('/').map(encodeURIComponent).join('/'), {
        method: 'POST',
        headers: { Authorization: 'Bearer ' + imageConfig.apiKey, 'Content-Type': 'application/json', Accept: 'image/*' },
        body: JSON.stringify({ inputs: finalPrompt })
      });
      if (!response.ok) {
        const detail = (await response.text()).slice(0, 500);
        return Response.json({ error: `Hugging Face image request failed (${response.status}): ${detail}` }, { status: 502 });
      }
      contentType = response.headers.get('content-type')?.split(';')[0] || 'image/png';
      if (!contentType.startsWith('image/')) return Response.json({ error: 'The selected Hugging Face model did not return an image. Check the model ID and provider support.' }, { status: 502 });
      bytes = new Uint8Array(await response.arrayBuffer());
    } else {
      if (!env.AI) return Response.json({ error: 'Cloudflare Workers AI binding AI is not configured.' }, { status: 503 });
      const result = await env.AI.run(imageConfig?.model || '@cf/black-forest-labs/flux-1-schnell', { prompt: finalPrompt, steps: 4 });
      if (!result?.image) return Response.json({ error: 'The image provider returned no image. Please try again.' }, { status: 502 });
      const binary = atob(result.image);
      bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
      contentType = 'image/jpeg';
    }
    let binary = '';
    for (let i = 0; i < bytes.length; i += 0x8000) binary += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
    const imageBase64 = btoa(binary);
    return Response.json({ success: true, imageUrl: `data:${contentType};base64,${imageBase64}`, prompt, category, dimensions: 'provider output', createdAt: Date.now() }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown image generation error';
    return Response.json({ error: `Image generation failed: ${message}` }, { status: 500 });
  }
}
