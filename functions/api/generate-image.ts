interface Env {
  AI?: {
    run(
      model: string,
      input: { prompt: string; steps?: number }
    ): Promise<{ image?: string }>;
  };
}

export async function onRequestPost({ request, env }: { request: Request; env: Env }): Promise<Response> {
  try {
    const body = await request.json() as { prompt?: unknown; category?: unknown };
    const prompt = typeof body.prompt === 'string' ? body.prompt.trim() : '';
    const category = typeof body.category === 'string' ? body.category : 'Photorealistic';

    if (!prompt) {
      return Response.json({ error: 'Please enter an image description.' }, { status: 400 });
    }
    if (prompt.length > 2048) {
      return Response.json({ error: 'Image description must be 2048 characters or less.' }, { status: 400 });
    }
    if (!env.AI) {
      return Response.json({
        error: 'Image generation is not connected yet. The Cloudflare Workers AI binding named AI must be added to this Pages project.'
      }, { status: 503 });
    }

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

    const result = await env.AI.run('@cf/black-forest-labs/flux-1-schnell', {
      prompt: finalPrompt,
      steps: 4
    });

    if (!result?.image) {
      return Response.json({ error: 'The image provider returned no image. Please try again.' }, { status: 502 });
    }

    return Response.json({
      success: true,
      imageUrl: `data:image/jpeg;charset=utf-8;base64,${result.image}`,
      prompt,
      category,
      dimensions: '1024x1024',
      createdAt: Date.now()
    }, {
      headers: { 'Cache-Control': 'no-store' }
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown image generation error';
    return Response.json({ error: `Image generation failed: ${message}` }, { status: 500 });
  }
}
