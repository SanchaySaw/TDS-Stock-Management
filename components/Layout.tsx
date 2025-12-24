
import React from 'react';
import { ICONS, COLORS } from '../constants';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, activeTab, setActiveTab }) => {
  const tabs = [
    { id: 'dashboard', label: 'Home', icon: ICONS.Dashboard },
    { id: 'sales', label: 'Sales', icon: ICONS.Sales },
    { id: 'stock', label: 'Stock', icon: ICONS.Stock },
    { id: 'menu', label: 'Menu', icon: ICONS.Menu },
    { id: 'reports', label: 'Reports', icon: ICONS.Reports },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-tds-cream pb-24">
      <header className="bg-tds-green text-tds-cream p-4 sticky top-0 z-50 shadow-lg">
        <div className="flex justify-between items-center max-w-lg mx-auto">
          <h1 className="text-xl font-bold tracking-tight">TDS <span className="text-tds-gold">STOCK</span></h1>
          <div className="w-8 h-8 rounded-full bg-tds-gold/20 flex items-center justify-center border border-tds-gold/30">
            <span className="text-xs font-bold text-tds-gold">JD</span>
          </div>
        </div>
      </header>

      <main className="flex-1 w-full max-w-lg mx-auto p-4 animate-in fade-in duration-500">
        {children}
      </main>

      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-tds-green/10 px-6 py-3 pb-8 z-50 shadow-[0_-4px_10px_rgba(0,0,0,0.05)]">
        <div className="flex justify-between items-center max-w-lg mx-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-col items-center gap-1 transition-all ${
                activeTab === tab.id ? 'text-tds-green scale-110' : 'text-tds-green/40 hover:text-tds-green/60'
              }`}
            >
              <div className={`p-2 rounded-xl transition-colors ${
                activeTab === tab.id ? 'bg-tds-gold/10' : ''
              }`}>
                {tab.icon}
              </div>
              <span className="text-[10px] font-medium uppercase tracking-widest">{tab.label}</span>
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
};
