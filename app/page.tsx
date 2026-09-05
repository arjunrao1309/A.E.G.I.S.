'use client';

import { useState } from 'react';
import { LayoutDashboard, Briefcase, Eye, Lightbulb, UserCog, AlertTriangle } from 'lucide-react';
import { DashboardOverview } from '@/components/DashboardOverview';
import { PortfolioView } from '@/components/PortfolioView';
import { WatchlistView } from '@/components/WatchlistView';
import { StrategyView } from '@/components/StrategyView';
import { SettingsView } from '@/components/SettingsView';
import { Toaster } from 'sonner';

type ViewType = 'home' | 'overview' | 'portfolio' | 'watchlist' | 'strategy' | 'settings';

function AegisLogo({ className = "", textSize = "text-xl", hideDots = false }: { className?: string, textSize?: string, hideDots?: boolean }) {
  return (
    <div className={`filter drop-shadow-[0_0_15px_rgba(212,175,55,0.6)] ${className}`}>
      <span 
        className={`font-black ${textSize} tracking-[0.1em] text-transparent bg-clip-text bg-gradient-to-br from-yellow-100 via-yellow-400 to-yellow-700`}
        style={{
          fontFamily: "'Arial Black', Impact, sans-serif",
          textShadow: '0 0 10px rgba(253, 224, 71, 0.4), 0 0 25px rgba(212,175,55,0.8)',
          backgroundImage: 'radial-gradient(circle, #fde047 1px, transparent 1px), radial-gradient(circle, #d4af37 1px, transparent 1px)',
          backgroundSize: '4px 4px',
          backgroundPosition: '0 0, 2px 2px',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
        }}
      >
        A.E.G.I.S
      </span>
    </div>
  );
}

export default function Home() {
  const [activeView, setActiveView] = useState<ViewType>('home');

  const navItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'portfolio', label: 'Portfolio', icon: Briefcase },
    { id: 'watchlist', label: 'Watchlist', icon: Eye },
    { id: 'strategy', label: 'AI Strategy', icon: Lightbulb },
    { id: 'settings', label: 'Settings', icon: UserCog },
  ] as const;

  const renderView = () => {
    switch (activeView) {
      case 'overview': return <DashboardOverview />;
      case 'portfolio': return <PortfolioView />;
      case 'watchlist': return <WatchlistView />;
      case 'strategy': return <StrategyView />;
      case 'settings': return <SettingsView />;
      default: return null;
    }
  };

  if (activeView === 'home') {
    return (
      <div className="flex flex-col min-h-screen bg-black text-white items-center justify-center p-6 relative overflow-hidden font-sans">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(212,175,55,0.08)_0%,rgba(0,0,0,1)_70%)]" />
        <div className="z-10 text-center max-w-3xl flex flex-col items-center">
          <AegisLogo textSize="text-6xl md:text-8xl" className="mb-2" />
          <p className="text-lg md:text-xl text-primary/80 tracking-widest font-mono mb-2 uppercase mt-8">
            Programmed & Developed by: Arjun
          </p>
          <p className="text-sm text-destructive uppercase tracking-widest font-bold mb-12 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" /> For institutional use only, prototype 1.2
          </p>
          <button 
            onClick={() => setActiveView('overview')}
            className="group relative inline-flex items-center justify-center px-8 py-4 font-bold text-black bg-primary rounded-md overflow-hidden transition-all hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(212,175,55,0.4)]"
          >
            <span className="absolute inset-0 w-full h-full -mt-1 rounded-lg opacity-30 bg-gradient-to-b from-transparent via-transparent to-black" />
            <span className="relative flex items-center gap-2 uppercase tracking-widest text-sm">
              Initialize System <LayoutDashboard className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </span>
          </button>
        </div>
        <div className="absolute bottom-8 text-xs text-muted-foreground uppercase tracking-widest">
          An Innovation to Financial Brilliance
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden font-sans">
      {/* Sidebar */}
      <aside className="w-[240px] bg-card text-card-foreground flex-col py-6 border-r border-border hidden md:flex">
        <div className="px-6 pb-8 flex items-center gap-3 font-bold text-xl tracking-tight text-primary cursor-pointer" onClick={() => setActiveView('home')}>
          <AegisLogo textSize="text-2xl" hideDots />
        </div>
        <nav className="flex-1 flex flex-col px-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveView(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 text-sm rounded-md transition-all mb-1 ${
                  isActive 
                    ? 'bg-primary/10 text-primary font-semibold' 
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                }`}
              >
                <Icon className={`w-5 h-5`} />
                {item.label}
              </button>
            );
          })}
        </nav>
        <div className="px-6 py-4 mt-auto">
          <div className="inline-block text-[10px] bg-success/10 text-success border border-success/20 px-2 py-1 rounded tracking-[0.05em] uppercase font-semibold">
            AES-256 Encrypted
          </div>
          <div className="text-[11px] mt-2 text-muted-foreground font-mono">2FA: ACTIVE</div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden bg-background">
        {/* Mobile Header */}
        <header className="md:hidden flex items-center justify-between p-4 bg-card border-b border-border">
          <div className="font-bold tracking-tight text-primary">
            <AegisLogo textSize="text-xl" hideDots />
          </div>
          <select 
            value={activeView} 
            onChange={(e) => setActiveView(e.target.value as ViewType)}
            className="text-sm bg-muted p-2 rounded-md border border-border outline-none focus:ring-1 focus:ring-primary"
          >
            {navItems.map(item => <option key={item.id} value={item.id}>{item.label}</option>)}
          </select>
        </header>

        <div className="flex-1 overflow-y-auto overflow-x-hidden">
          <div className="flex flex-col gap-6 p-6 lg:p-8 max-w-[1400px] mx-auto min-h-max">
            <header className="flex justify-between items-end mb-4 border-b border-border/50 pb-4">
              <div>
                <h1 className="text-3xl font-bold text-foreground tracking-tight">{navItems.find(i => i.id === activeView)?.label}</h1>
                <p className="text-sm text-muted-foreground mt-1">Real-time stability and risk analysis</p>
              </div>
            </header>
            {renderView()}
          </div>
        </div>
      </main>
      <Toaster />
    </div>
  );
}
