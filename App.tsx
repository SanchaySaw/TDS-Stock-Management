
import React, { useState } from 'react';
import { Layout } from './components/Layout';
import { useTdsStore } from './store';
import { Dashboard } from './views/Dashboard';
import { Stock } from './views/Stock';
import { Sales } from './views/Sales';
import { MenuManagement } from './views/MenuManagement';
import { Reports } from './views/Reports';
import { ICONS, COLORS } from './constants';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  
  const store = useTdsStore();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (pin === '1234') { 
      setIsLoggedIn(true);
      setError('');
    } else {
      setError('Invalid Access PIN');
      setPin('');
    }
  };

  const renderView = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard stock={store.stock} sales={store.sales} menu={store.menu} resetData={store.resetData} />;
      case 'stock':
        return (
          <Stock 
            stock={store.stock} 
            addStockItem={store.addStockItem} 
            updateStockQuantity={store.updateStockQuantity}
            deleteStockItem={store.deleteStockItem}
          />
        );
      case 'sales':
        return <Sales menu={store.menu} stock={store.stock} recordSale={store.recordSale} />;
      case 'menu':
        return (
          <MenuManagement 
            menu={store.menu} 
            stock={store.stock} 
            addMenuItem={store.addMenuItem}
            updateMenuItem={store.updateMenuItem}
            deleteMenuItem={store.deleteMenuItem}
          />
        );
      case 'reports':
        return <Reports sales={store.sales} stock={store.stock} menu={store.menu} />;
      default:
        return <Dashboard stock={store.stock} sales={store.sales} menu={store.menu} resetData={store.resetData} />;
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-tds-deep flex flex-col items-center justify-center p-6 text-tds-cream">
        <div className="w-full max-w-sm space-y-8 animate-in fade-in zoom-in duration-500">
          <div className="text-center space-y-2">
            <h1 className="text-4xl font-black tracking-tighter text-tds-gold">TDS</h1>
            <p className="text-xs font-bold uppercase tracking-[0.3em] opacity-40">Stock Management</p>
          </div>

          <div className="bg-white/5 border border-white/10 p-8 rounded-[40px] backdrop-blur-xl shadow-2xl">
            <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-2">
                <label className="block text-[10px] font-black uppercase tracking-widest text-tds-gold text-center">Staff Access PIN</label>
                <input 
                  type="password"
                  inputMode="numeric"
                  maxLength={4}
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  placeholder="••••"
                  className="w-full bg-white/5 border border-white/10 text-center text-3xl font-black py-4 rounded-3xl focus:border-tds-gold outline-none transition-all tracking-[0.5em]"
                  autoFocus
                />
              </div>

              {error && (
                <p className="text-center text-tds-red text-xs font-bold animate-shake">{error}</p>
              )}

              <button 
                type="submit"
                className="w-full bg-tds-gold text-tds-deep font-black py-4 rounded-3xl shadow-xl active:scale-95 transition-all uppercase text-sm tracking-widest"
              >
                Unlock System
              </button>
            </form>
          </div>

          <p className="text-center text-[10px] font-bold opacity-30 uppercase tracking-widest">
            Internal Staff Use Only • v1.0.4
          </p>
        </div>
      </div>
    );
  }

  return (
    <Layout activeTab={activeTab} setActiveTab={setActiveTab}>
      <div className="flex justify-between items-center mb-6">
         <div className="text-xs font-bold uppercase tracking-widest text-tds-green/40">
            Session: Staff Active
         </div>
         <button 
          onClick={() => { if(window.confirm("Logout from TDS Stock?")) setIsLoggedIn(false); }}
          className="text-[10px] font-bold text-tds-red uppercase bg-tds-red/10 px-3 py-1 rounded-full active:scale-95 transition-all"
         >
           Logout
         </button>
      </div>
      <div>
        {renderView()}
      </div>
    </Layout>
  );
};

export default App;
