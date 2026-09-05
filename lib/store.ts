'use client';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { fetchLivePrice } from './utils';

export const useAppStore = create<any>()(
  persist(
    (set, get) => ({
      profile: {
        name: '',
        email: '',
        twoFactorEnabled: false,
        sharePortfolio: false,
        allowPushNotifications: true,
        riskTolerance: 'medium',
      },
      portfolio: [
        { id: '1', symbol: 'AAPL', shares: 10, averagePrice: 150, currentPrice: 0 },
        { id: '2', symbol: 'MSFT', shares: 15, averagePrice: 310, currentPrice: 0 },
      ],
      watchlist: [],
      initialized: false,
      liveUpdateInterval: null,   // ← NEW: controls real polling

      updateProfile: (updates: any) => set((state: any) => ({
        profile: { ...state.profile, ...updates }
      })),

      updatePrices: async () => {
        const { portfolio, watchlist } = get();

        const updatedPortfolio = await Promise.all(
          portfolio.map(async (item: any) => {
            const price = await fetchLivePrice(item.symbol);
            return (price && price > 0) ? { ...item, currentPrice: price } : item;
          })
        );

        const updatedWatchlist = await Promise.all(
          watchlist.map(async (item: any) => {
            const price = await fetchLivePrice(item.symbol);
            return (price && price > 0) ? { ...item, currentPrice: price } : item;
          })
        );

        set({ 
          portfolio: updatedPortfolio,
          watchlist: updatedWatchlist 
        });
        console.log("✅ A.E.G.I.S: Real market prices updated");
      },

      // ── NEW: Automatic real-world updates every 15 seconds
      startLiveUpdates: () => {
        const state = get();
        if (state.liveUpdateInterval) return; // prevent duplicates

        const interval = setInterval(() => {
          state.updatePrices();
        }, 15000); // 15 seconds — realistic for live market data

        set({ liveUpdateInterval: interval });
        console.log("📡 Live real-market updates started (15s)");
      },

      stopLiveUpdates: () => {
        const state = get();
        if (state.liveUpdateInterval) {
          clearInterval(state.liveUpdateInterval);
          set({ liveUpdateInterval: null });
        }
      },

      initialize: async () => {
        const state = get();
        if (state.initialized) return;
        await state.updatePrices();     // first real load
        state.startLiveUpdates();       // then start auto-refresh
        set({ initialized: true });
      },

      addPortfolioItem: (item: any) => set((state: any) => ({
        portfolio: [...state.portfolio, { ...item, id: Math.random().toString(), addedAt: new Date().toISOString() }]
      })),

      removePortfolioItem: (id: string) => set((state: any) => ({
        portfolio: state.portfolio.filter((i: any) => i.id !== id)
      })),

      addWatchlistItem: (symbol: string) => {
        const upperSymbol = symbol.toUpperCase();
        const newItem = {
          id: Math.random().toString(36).slice(2),
          symbol: upperSymbol,
          currentPrice: 0,
          peRatio: null,
          marketCap: null,
          volume: null,
          alertHigh: null,
          alertLow: null,
        };

        set((state: any) => ({
          watchlist: [...state.watchlist, newItem]
        }));

        // immediate real price for new item
        (async () => {
          const price = await fetchLivePrice(upperSymbol);
          if (price && price > 0) {
            set((state: any) => ({
              watchlist: state.watchlist.map((item: any) =>
                item.symbol === upperSymbol ? { ...item, currentPrice: price } : item
              )
            }));
          }
        })();
      },

      removeWatchlistItem: (id: string) => set((state: any) => ({
        watchlist: state.watchlist.filter((i: any) => i.id !== id)
      })),
    }),

    {
      name: 'financeiq-storage',
      version: 2,
    }
  )
);