import { NextRequest } from 'next/server';

export const runtime = 'edge'; // fast streaming, no cold-start disk needed

export async function POST(req: NextRequest) {
  const { prompt } = await req.json();

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    return new Response('Missing GROQ_API_KEY environment variable', { status: 500 });
  }

  if (!prompt || typeof prompt !== 'string') {
    return new Response('Missing or invalid "prompt" in request body', { status: 400 });
  }

  let groqResponse: Response;
  try {
    groqResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        // llama-3.3-70b-versatile is Enterprise-only now (404s on standard keys).
        // gpt-oss-20b is fast (~1000 tok/s) and available on the normal developer plan.
        // Swap to 'openai/gpt-oss-120b' for higher quality at lower speed if needed.
        model: 'openai/gpt-oss-20b',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
        stream: true,
      }),
    });
  } catch (err: any) {
    return new Response(`Failed to reach Groq: ${err.message}`, { status: 502 });
  }

  if (!groqResponse.ok || !groqResponse.body) {
    const errText = await groqResponse.text();
    return new Response(`Groq ${groqResponse.status}: ${errText}`, { status: groqResponse.status });
  }

  const encoder = new TextEncoder();
  const decoder = new TextDecoder();

  const stream = new ReadableStream({
    async start(controller) {
      const reader = groqResponse.body!.getReader();
      let buffer = '';

      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() || ''; // keep any partial line for next chunk

          for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed.startsWith('data:')) continue;

            const data = trimmed.slice(5).trim();
            if (data === '[DONE]') {
              controller.close();
              return;
            }

            try {
              const parsed = JSON.parse(data);
              const content = parsed.choices?.[0]?.delta?.content;
              if (content) controller.enqueue(encoder.encode(content));
            } catch {
              // ignore malformed/partial JSON lines
            }
          }
        }
        controller.close();
      } catch (err) {
        controller.error(err);
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'no-cache',
    },
  });
}