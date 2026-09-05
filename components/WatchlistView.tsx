'use client';
import { useState, useEffect } from 'react';
import { useAppStore } from '@/lib/store';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Bell, Trash2, TrendingUp, TrendingDown, Plus } from 'lucide-react';

interface WatchlistItem {
  id: string | number;
  symbol: string;
  currentPrice?: number;
  alertHigh?: number;
  alertLow?: number;
}

export function WatchlistView() {
  const { 
    watchlist, 
    addWatchlistItem, 
    removeWatchlistItem,
    addPortfolioItem   // ← now available from store
  } = useAppStore();

  const [newSymbol, setNewSymbol] = useState('');

  // Helper to generate consistent mock fundamentals (same style as PortfolioView)
  const generateHash = (str: string) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    return Math.abs(hash);
  };

  const [simulatedData, setSimulatedData] = useState<Record<string, {
    currentPrice: number;
    change: number;
    isUp: boolean;
    lastFlash: 'up' | 'down' | null;
  }>>({});

  useEffect(() => {
    // Initialize base values + mock fundamentals for new symbols
    const initTimer = setTimeout(() => {
      setSimulatedData(prev => {
        const next = { ...prev };
        let changed = false;

        (watchlist as WatchlistItem[]).forEach((item: WatchlistItem) => {
          if (!next[item.symbol]) {
            changed = true;
            const hashVal = generateHash(item.symbol);
            const isUp = hashVal % 2 === 0;
            const change = (hashVal % 500) / 100;

            next[item.symbol] = {
              currentPrice: item.currentPrice || 150,
              change: change,
              isUp: isUp,
              lastFlash: null,
            };
          }
        });
        return changed ? next : prev;
      });
    }, 0);

    // Real-time price fluctuation (keeps the live breathing feel)
    const interval = setInterval(() => {
      setSimulatedData(prev => {
        const next = { ...prev };
        Object.keys(next).forEach(symbol => {
          const current = next[symbol];
          if (Math.random() > 0.7) return; // slight randomness so not every card ticks together

          const volatility = 0.003;
          const priceChangePercent = (Math.random() - 0.5) * 2 * volatility;

          const newPrice = current.currentPrice * (1 + priceChangePercent);
          const rawNewChange = (current.change * (current.isUp ? 1 : -1)) + (priceChangePercent * 100);

          next[symbol] = {
            currentPrice: newPrice,
            change: Math.abs(rawNewChange),
            isUp: rawNewChange >= 0,
            lastFlash: priceChangePercent >= 0 ? 'up' : 'down'
          };
        });
        return next;
      });
    }, 2500);

    return () => {
      clearInterval(interval);
      clearTimeout(initTimer);
    };
  }, [watchlist]);

  // Flash reset
  useEffect(() => {
    const flashInterval = setInterval(() => {
      setSimulatedData(prev => {
        const resetNext = { ...prev };
        let needsUpdate = false;
        Object.keys(resetNext).forEach(symbol => {
          if (resetNext[symbol].lastFlash !== null) {
            resetNext[symbol] = { ...resetNext[symbol], lastFlash: null };
            needsUpdate = true;
          }
        });
        return needsUpdate ? resetNext : prev;
      });
    }, 800);
    return () => clearInterval(flashInterval);
  }, []);

  const handleAddToWatchlist = (e: React.FormEvent) => {
    e.preventDefault();
    if (newSymbol.trim()) {
      addWatchlistItem(newSymbol.trim().toUpperCase());
      setNewSymbol('');
    }
  };

  const handleAddToPortfolio = (item: WatchlistItem) => {
    const simData = simulatedData[item.symbol] || { currentPrice: item.currentPrice || 150 };
    
    const sharesStr = prompt(`How many shares of ${item.symbol} would you like to add?`, '10');
    const avgPriceStr = prompt(`What was your average purchase price for ${item.symbol}?`, simData.currentPrice.toFixed(2));

    const shares = parseFloat(sharesStr || '0');
    const averagePrice = parseFloat(avgPriceStr || '0');

    if (shares > 0 && averagePrice > 0) {
      addPortfolioItem({
        symbol: item.symbol,
        shares,
        averagePrice,
        currentPrice: simData.currentPrice,   // start with live price
      });
      // Optional: nice feedback
      console.log(`✅ Added ${shares} shares of ${item.symbol} to Portfolio`);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Manage Watchlist</CardTitle>
          <CardDescription>Track stocks, set alerts, and move to portfolio</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAddToWatchlist} className="flex gap-4 max-w-md">
            <Input
              placeholder="Enter symbol (e.g. AAPL)"
              value={newSymbol}
              onChange={(e) => setNewSymbol(e.target.value)}
              className="flex-1"
            />
            <Button type="submit">Add to Watchlist</Button>
          </form>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {(watchlist as WatchlistItem[]).map((item: WatchlistItem) => {
          const simData = simulatedData[item.symbol] || {
            currentPrice: item.currentPrice || 150,
            change: 0,
            isUp: true,
            lastFlash: null
          };

          const isUp = simData.isUp;
          const changeStr = simData.change.toFixed(2);
          const priceStr = simData.currentPrice.toFixed(2);

          // === LIVE FUNDAMENTALS (no more blank/zero fields) ===
          const hashVal = generateHash(item.symbol);
          const peRatio = (18 + (hashVal % 25)).toFixed(1);
          const marketCap = ((hashVal % 2000) * 2.4 + 50).toFixed(1) + 'B';
          const volume = ((hashVal % 50) + 15).toFixed(1) + 'M';

          return (
            <Card key={item.id} className="relative overflow-hidden group border-border/60 hover:border-primary/50 transition-colors">
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(212,175,55,0.05),transparent_60%)] pointer-events-none" />
              <CardContent className="p-6 relative z-10">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-bold text-3xl tracking-tight text-foreground">{item.symbol}</h3>
                    <div className="flex items-center gap-1.5 text-sm mt-1 font-semibold">
                      {isUp ? <TrendingUp className="w-4 h-4 text-success" /> : <TrendingDown className="w-4 h-4 text-destructive" />}
                      <span className={isUp ? 'text-success' : 'text-destructive'}>
                        {isUp ? '+' : '-'}{changeStr}%
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`font-mono font-bold text-2xl transition-colors duration-500 ${
                      simData.lastFlash === 'up' ? 'text-success' :
                      simData.lastFlash === 'down' ? 'text-destructive' : 'text-foreground'
                    }`}>
                      ${priceStr}
                    </div>
                    <div className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold mt-1">Market Price</div>
                  </div>
                </div>

                {/* Fundamentals — now always populated and realistic */}
                <div className="grid grid-cols-3 gap-2 py-4 mb-4 border-t border-border/50 border-b">
                  <div>
                    <div className="text-[10px] text-muted-foreground uppercase tracking-widest">P/E</div>
                    <div className="text-sm font-mono text-foreground font-semibold">{peRatio}</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-muted-foreground uppercase tracking-widest">Mkt Cap</div>
                    <div className="text-sm font-mono text-foreground font-semibold">${marketCap}</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-muted-foreground uppercase tracking-widest">Volume</div>
                    <div className="text-sm font-mono text-foreground font-semibold">{volume}</div>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center text-[11px] font-semibold text-muted-foreground gap-2 uppercase tracking-wide">
                    <Bell className="w-4 h-4 text-primary" />
                    <span>
                      Alerts: {item.alertHigh ? `$${item.alertHigh}` : 'None'} / {item.alertLow ? `$${item.alertLow}` : 'None'}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* NEW: Add to Portfolio */}
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-primary border-primary/30 hover:bg-primary/10"
                      onClick={() => handleAddToPortfolio(item)}
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      Portfolio
                    </Button>

                    {/* Remove from watchlist */}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive hover:text-destructive hover:bg-destructive/10 opacity-0 group-hover:opacity-100 transition-all h-8 w-8"
                      onClick={() => removeWatchlistItem(item.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}

        {watchlist.length === 0 && (
          <div className="col-span-full py-12 text-center text-muted-foreground border-2 border-dashed border-border rounded-lg uppercase tracking-widest text-sm font-semibold">
            System Watchlist is empty. Initialize tracking above.
          </div>
        )}
      </div>
    </div>
  );
}