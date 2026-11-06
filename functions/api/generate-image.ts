interface Env {
  AI?: {
    run(
      model: string,
      input: { prompt: string; steps?: number }
    ): Promise<{ image?: string }>;
  };
}

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  try {
    const body = await request.json() as { prompt?: unknown; category?: unknown };
    const prompt = typeof body.prompt === 'string' ? body.prompt.trim() : '';
    const category = typeof body.category === 'string' ? body.category : 'General';

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
      Nature: 'beautiful natural scenery, detailed realistic photography',
      Fantasy: 'magical fantasy art, cinematic lighting, intricate details',
      Anime: 'high-quality anime illustration, expressive colors',
      Business: 'professional commercial photography, clean composition',
      Technology: 'futuristic technology concept art, crisp details',
      Cyberpunk: 'cyberpunk neon atmosphere, cinematic violet and blue lighting'
    };
    const style = categoryStyle[category] || '';
    const finalPrompt = style ? `${prompt}. Visual style: ${style}.` : prompt;

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
};
