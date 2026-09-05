'use client';

export async function* streamOllama(prompt: string) {
  try {
    const response = await fetch('/api/strategy', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt }),
    });

    if (!response.ok || !response.body) {
      const errorText = await response.text();
      throw new Error(`Strategy API ${response.status}: ${errorText}`);
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value, { stream: true });
      if (chunk) yield chunk;
    }
  } catch (err: any) {
    console.error('🚨 Strategy stream error:', err.message);
    throw err;
  }
}