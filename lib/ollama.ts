'use client';

export async function* streamOllama(prompt: string) {
  const OLLAMA_URL = 'http://127.0.0.1:11434/api/generate';
  const MODEL = 'gemma2:2b';   // ← this is the tiny safe model we are using

  try {
    const response = await fetch(OLLAMA_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: MODEL,
        prompt: prompt,
        stream: true,
        options: {
          temperature: 0.7,
          num_ctx: 4096,      // safe number for your laptop
        },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Ollama ${response.status}: ${errorText}`);
    }

    const reader = response.body!.getReader();
    const decoder = new TextDecoder();

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value, { stream: true });
      const lines = chunk.split('\n');

      for (const line of lines) {
        if (!line.trim()) continue;
        try {
          const parsed = JSON.parse(line);
          if (parsed.response) {
            yield parsed.response;        // ← this is what StrategyView expects
          }
        } catch (e) {
          // ignore malformed lines
        }
      }
    }
  } catch (err: any) {
    console.error('🚨 Ollama stream error:', err.message);
    throw err;
  }
}