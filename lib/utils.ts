import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
// Add this to the bottom of lib/utils.ts

export async function fetchLivePrice(symbol: string): Promise<number | null> {
  try {
    const apiKey = process.env.NEXT_PUBLIC_FINNHUB_API_KEY;
    
    // TRACER 1: Is the key even there?
    if (!apiKey) {
      console.error("A.E.G.I.S ALERT: YOUR API KEY IS MISSING FROM .ENV.LOCAL");
      return null;
    }

    const response = await fetch(
      `https://finnhub.io/api/v1/quote?symbol=${symbol.toUpperCase()}&token=${apiKey}`
    );

    const data = await response.json();
    
    // TRACER 2: What did the internet just send us?
    console.log(`📡 TELEMETRY RECEIVED FOR ${symbol}:`, data);

    return data.c; // 'c' is the current price
  } catch (error) {
    console.error("PIPE BURST:", error);
    return null;
  }
}