'use client';

import { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { BookOpen, Newspaper, ExternalLink, ChevronDown, ChevronUp } from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { toast } from 'sonner';

export function NewsEducationView() {
  const { portfolio, watchlist } = useAppStore();
  const [expandedNewsId, setExpandedNewsId] = useState<number | null>(null);

  const simulateLoadingDocument = (title: string, type: string) => {
    toast.promise(
      new Promise((resolve) => setTimeout(resolve, 1500)),
      {
        loading: `Decrypting ${type}: ${title}...`,
        success: () => `${type} Accessed Successfully`,
        error: 'Connection Lost',
      }
    );
  };

  const news = useMemo(() => {
    const symbols = Array.from(new Set([
      ...portfolio.map((p: { symbol: string }) => p.symbol),
      ...watchlist.map((w: { symbol: string }) => w.symbol)
    ]));

    if (symbols.length === 0) {
      return [
        { id: 1, title: 'Fed Signals Potential Rate Cut in Q3', time: '2 hours ago', source: 'Financial Times', snippet: 'Federal Reserve officials have indicated a possible shift...' },
        { id: 2, title: 'Global Markets Stabilize After Week of Volatility', time: '5 hours ago', source: 'Bloomberg', snippet: 'Equities around the world saw stabilization...' },
      ];
    }

    const templates = [
      (sym: string) => ({ title: `${sym} Rallies on Strong Institutional Buying`, source: 'Bloomberg', snippet: `Recent filings indicate that major institutional funds have been aggressively accumulating shares of ${sym}, driving a strong upward momentum across multiple trading sessions...` }),
      (sym: string) => ({ title: `Analysts Upgraded ${sym} Over Favorable Quarter Projections`, source: 'Financial Times', snippet: `Following a comprehensive sector review, leading financial analysts have raised their price targets on ${sym}, citing robust earnings potential and an expanded market share...` }),
      (sym: string) => ({ title: `Market Volatility Has Mild Impact on ${sym} Holdings`, source: 'Reuters', snippet: `Despite broader macroeconomic turbulence, ${sym} has maintained relative stability, providing a defensive buffer for diversified portfolios during recent selloffs...` }),
      (sym: string) => ({ title: `New Emerging Market Strategies Feature ${sym}`, source: 'Wall Street Journal', snippet: `Pioneering investment strategies focused on emerging markets are increasingly incorporating ${sym} as a core allocation to hedge against inflation and secure long-term yield...` }),
      (sym: string) => ({ title: `${sym} Shows Remarkable Resilience Amid Sector Downturn`, source: 'MarketWatch', snippet: `While its direct competitors face significant headwinds, ${sym} has showcased remarkable resilience, with its fundamentals remaining untarnished by the sector's broader challenges...` }),
      (sym: string) => ({ title: `What does the Federal Reserve decision mean for ${sym}?`, source: 'CNBC', snippet: `The latest policy decisions from the Federal Reserve are being closely scrutinized by investors to determine the exact impact on ${sym}'s capital structure and short-term debt obligations...` }),
    ];

    const generated: { id: number; title: string; source: string; snippet: string; time: string; numericTime: number }[] = [];
    let idCounter = 1;
    // Generate deterministic news for their symbols
    symbols.forEach((sym, sIndex) => {
      // Pick 1-2 news articles per symbol deterministically
      const symbolHash = sym.charCodeAt(0) + (sym.charCodeAt(1) || 0) + sIndex;
      const count = (symbolHash % 2) + 1;
      
      for (let i = 0; i < count; i++) {
        const templateIdx = (symbolHash + i * 3) % templates.length;
        const template = templates[templateIdx];
        const timeOffset = (symbolHash + i * 7) % 12 + 1;
        generated.push({
          id: idCounter++,
          ...template(sym),
          time: `${timeOffset} hour${timeOffset > 1 ? 's' : ''} ago`,
          numericTime: timeOffset
        });
      }
    });
    
    // Sort by "time" deterministically
    return generated.sort((a, b) => a.numericTime - b.numericTime);
  }, [portfolio, watchlist]);

  const education = [
    { title: 'Understanding Market Cycles', level: 'Beginner', category: 'Investing 101' },
    { title: 'The Importance of Diversification', level: 'Beginner', category: 'Portfolio Management' },
    { title: 'How to Read a Balance Sheet', level: 'Intermediate', category: 'Fundamental Analysis' },
    { title: 'Options Trading: Calls vs. Puts', level: 'Advanced', category: 'Derivatives' },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card className="flex flex-col h-[600px]">
        <CardHeader>
          <CardTitle>Market Intelligence</CardTitle>
          <CardDescription>Real-time updates tailored to your portfolio</CardDescription>
        </CardHeader>
        <CardContent className="flex-1 overflow-y-auto overflow-x-hidden p-5 pt-0">
          <div className="flex flex-col pr-2">
            {news.map((item) => {
              const isExpanded = expandedNewsId === item.id;
              return (
                <div 
                  key={item.id} 
                  onClick={() => setExpandedNewsId(isExpanded ? null : item.id)}
                  className={`py-4 border-b border-border/50 last:border-0 group cursor-pointer transition-colors hover:bg-muted/30 px-2 -mx-2 rounded-md ${isExpanded ? 'bg-muted/20' : ''}`}
                >
                  <div className="flex justify-between items-start mb-1">
                    <div className={`text-[0.8125rem] font-semibold transition-colors ${isExpanded ? 'text-primary' : 'group-hover:text-primary text-foreground'}`}>
                      {item.title}
                    </div>
                    {isExpanded ? <ChevronUp className="w-4 h-4 text-primary shrink-0 ml-2" /> : <ChevronDown className="w-4 h-4 text-muted-foreground group-hover:text-primary shrink-0 ml-2" />}
                  </div>
                  <div className="text-[0.75rem] text-muted-foreground uppercase tracking-widest">{item.time} • {item.source}</div>
                  
                  {isExpanded && (
                    <div className="mt-3 text-sm text-foreground/80 leading-relaxed border-l-2 border-primary/50 pl-3 py-1">
                      {item.snippet}
                      <div 
                        onClick={(e) => {
                          e.stopPropagation();
                          simulateLoadingDocument(item.title, 'Intelligence Report');
                        }}
                        className="mt-2 flex items-center gap-1 text-[0.75rem] font-bold text-primary hover:underline uppercase tracking-wide cursor-pointer w-fit"
                      >
                        Read Full Assessment <ExternalLink className="w-3 h-3" />
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Card className="flex flex-col h-[600px]">
        <CardHeader>
          <CardTitle>Investor Education</CardTitle>
          <CardDescription>Level up your investing knowledge</CardDescription>
        </CardHeader>
        <CardContent className="flex-1 overflow-y-auto overflow-x-hidden p-5 pt-0">
          <div className="space-y-4 pr-2">
            {education.map((item, idx) => (
              <div 
                key={idx} 
                onClick={() => simulateLoadingDocument(item.title, 'Educational Module')}
                className="bg-card border border-border hover:border-primary/50 relative overflow-hidden p-4 rounded-lg group cursor-pointer transition-all"
              >
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(212,175,55,0.05),transparent_50%)] pointer-events-none" />
                <div className="relative z-10">
                  <div className="text-[0.8125rem] font-bold text-foreground mb-1 group-hover:text-primary transition-colors">{item.title}</div>
                  <p className="text-[0.75rem] text-muted-foreground uppercase tracking-widest">{item.category}</p>
                  <div className="flex justify-between items-center mt-4">
                    <span className={`px-2 py-1 rounded-[4px] text-[0.7rem] font-mono font-bold uppercase tracking-widest border ${
                      item.level === 'Beginner' ? 'bg-success/10 text-success border-success/30' :
                      item.level === 'Intermediate' ? 'bg-warning/10 text-warning border-warning/30' :
                      'bg-destructive/10 text-destructive border-destructive/30'
                    }`}>
                      {item.level}
                    </span>
                    <button className="bg-primary text-primary-foreground border-none px-4 py-1.5 rounded-md text-[0.75rem] font-bold uppercase tracking-widest cursor-pointer opacity-0 group-hover:opacity-100 transition-all shadow-[0_0_15px_rgba(212,175,55,0.4)]">
                      Read
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}