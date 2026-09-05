'use client';

import { useState } from 'react';
import { useAppStore } from '@/lib/store';
import { streamOllama } from '@/lib/ollama';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Lightbulb, TrendingUp, ShieldAlert, Sparkles, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import ReactMarkdown from 'react-markdown';

interface PortfolioItem {
  id: string | number;
  symbol: string;
  shares: number;
  averagePrice: number;
  currentPrice?: number;
}

export function StrategyView() {
  const { profile, portfolio, updatePrices } = useAppStore();
  const [strategy, setStrategy] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

 const generateStrategy = async () => {
    setLoading(true);
    setError(null);
    setStrategy('');
    
    try {
      // 1. Refresh telemetry before analysis
      await updatePrices(); 
      
      // 2. Get the absolute latest data from the store
      const latestPortfolio = useAppStore.getState().portfolio as PortfolioItem[];
      
      const portfolioContext = latestPortfolio.length > 0 
        ? latestPortfolio.map((p: PortfolioItem) => `${p.symbol} (${p.shares} shares @ current price $${p.currentPrice})`).join(', ')
        : 'No current holdings';
        
      // 3. The Prompt (Check the backticks carefully here)
      const prompt = `You are the A.E.G.I.S Market Intelligence Engine. Your analysis is hyper-institutional, aggressive, and highly quantitative. The user has a ${profile.riskTolerance} risk tolerance. 
Current Portfolio Data: ${portfolioContext}

Output a highly engineered, deeply quantitative markdown evaluation instantly. Include:
1. **System Alpha Analysis:** Base mathematical stability of the current holdings.
2. **Reallocation Telemetry:** A direct bulleted list of 2-3 sector rotations to exploit market inefficiencies.
3. **Risk Containment Protocol:** A specific, actionable risk-hedging mechanism (e.g., options strategy or diversifier).

Format strictly with brutalist markdown headers (###), bold key figures, and sharp bullet points. Do not use conversational filler. Provide hard numbers or actionable heuristics.`;

      // 4. Call your local Qwen bridge
      const responseStream = streamOllama(prompt);

      setLoading(false); 
      
      for await (const text of responseStream) {
        setStrategy((prev) => (prev || '') + text);
      }
      
    } catch (err: any) {
      setError(err.message || 'An error occurred during strategy generation.');
      setLoading(false);
    }
  };
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">AI Investment Strategy</h2>
          <p className="text-muted-foreground">Get personalized insights based on your portfolio and risk tolerance ({profile.riskTolerance}).</p>
        </div>
        <Button onClick={generateStrategy} disabled={loading} size="lg" className="bg-gradient-to-r from-primary to-primary/60 hover:from-primary/90 hover:to-primary/50 text-primary-foreground border-0 shadow-[0_0_15px_rgba(212,175,55,0.4)]">
          <Sparkles className="w-4 h-4 mr-2" />
          {loading ? 'Initializing A.E.G.I.S Core...' : 'Query Quantum Engine'}
        </Button>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <Card className="h-full min-h-[400px]">
            <CardHeader>
              <CardTitle>System Telemetry & Strategy</CardTitle>
            </CardHeader>
            <CardContent>
              {loading && !strategy ? (
                <div className="space-y-4">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-[90%]" />
                  <Skeleton className="h-4 w-[95%]" />
                  <Skeleton className="h-4 w-[80%]" />
                  <div className="pt-4 space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                  </div>
                </div>
              ) : strategy ? (
                <div className="prose prose-sm md:prose-base dark:prose-invert max-w-none 
                  prose-headings:text-primary prose-headings:font-bold prose-headings:tracking-tight 
                  prose-strong:text-success prose-strong:font-bold prose-p:leading-relaxed prose-li:text-foreground">
                  <div className="markdown-body">
                    <ReactMarkdown>{strategy}</ReactMarkdown>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-[300px] text-center text-muted-foreground space-y-4">
                  <Lightbulb className="w-12 h-12 text-muted" />
                  <p>Click &quot;Query Quantum Engine&quot; to initiate quantitative strategy rendering.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center tracking-widest uppercase">
                <TrendingUp className="w-4 h-4 mr-2 text-primary" />
                Active Market Conditions
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm">
              <ul className="space-y-3 font-mono">
                <li className="flex justify-between items-center"><span className="text-muted-foreground">Technology</span> <span className="font-semibold text-success bg-success/10 px-2 py-0.5 rounded">BULLISH</span></li>
                <li className="flex justify-between items-center"><span className="text-muted-foreground">Energy</span> <span className="font-semibold text-warning bg-warning/10 px-2 py-0.5 rounded">NEUTRAL</span></li>
                <li className="flex justify-between items-center"><span className="text-muted-foreground">Fed Rates</span> <span className="font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded">LOCKED</span></li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3 border-b border-border/50 mb-3">
              <CardTitle className="uppercase tracking-widest text-sm">Real-Time Risk</CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-4">
              <div>
                <div className="flex justify-between text-[0.8125rem] mb-1">
                  <span className="text-muted-foreground">Volatility Correlation</span>
                  <span className="font-semibold text-success font-mono">1.12β</span>
                </div>
                <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden">
                  <div className="h-full w-[15%] bg-success shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
                </div>
                
                <div className="flex justify-between text-[0.8125rem] mt-3 mb-1">
                  <span className="text-muted-foreground">Calculated Alpha (α)</span>
                  <span className="font-semibold text-primary font-mono">+4.34%</span>
                </div>
                <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden">
                  <div className="h-full w-[92%] bg-primary shadow-[0_0_8px_rgba(212,175,55,0.8)]" />
                </div>
              </div>
              <div className="border-t border-border/50 pt-4 mt-4">
                <div className="text-[0.75rem] font-semibold text-primary uppercase tracking-widest mb-2">
                  System Override Suggestion
                </div>
                <p className="text-[0.8125rem] leading-relaxed text-foreground/80 font-mono text-xs">
                  &gt; ALERT. SECTOR ROTATION IMMINENT. INITIATE DEFENSIVE UTILITIES ACQUISITION TO HEDGE AGAINST BETA ESCALATION.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}