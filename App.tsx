
import React, { useState, useCallback } from 'react';
import { Layout } from './components/Layout';
import { useTdsStore } from './store';
import { Dashboard } from './views/Dashboard';
import { Stock } from './views/Stock';
import { Sales } from './views/Sales';
import { MenuManagement } from './views/MenuManagement';
import { Reports } from './views/Reports';
import { ICONS } from './constants';

const ConfirmModal = ({ 
  isOpen, 
  title, 
  message, 
  onConfirm, 
  onCancel 
}: { 
  isOpen: boolean; 
  title: string; 
  message: string; 
  onConfirm: () => void; 
  onCancel: () => void; 
}) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-tds-deep/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-sm rounded-[40px] p-8 shadow-2xl animate-in zoom-in-95 duration-200 border border-tds-green/10">
        <div className="w-16 h-16 bg-tds-red/10 rounded-full flex items-center justify-center text-tds-red mb-6 mx-auto">
          {ICONS.Trash}
        </div>
        <h3 className="text-xl font-black text-tds-deep text-center mb-2">{title}</h3>
        <p className="text-sm text-center text-tds-green/60 mb-8 px-4 leading-relaxed">{message}</p>
        <div className="flex flex-col gap-3">
          <button 
            type="button"
            onClick={onConfirm}
            className="w-full bg-tds-red text-white font-bold py-4 rounded-2xl shadow-lg active:scale-95 transition-all"
          >
            Confirm Delete
          </button>
          <button 
            type="button"
            onClick={onCancel}
            className="w-full bg-tds-cream text-tds-green font-bold py-4 rounded-2xl active:scale-95 transition-all"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [pin, setPin] = useState('');
  const [loginError, setLoginError] = useState('');
  
  // Custom Modal State
  const [modalState, setModalState] = useState<{ 
    isOpen: boolean; 
    title: string; 
    message: string; 
    onConfirm: () => void 
  } | null>(null);

  const store = useTdsStore();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (pin === '1422') { 
      setIsLoggedIn(true);
      setLoginError('');
      setPin('');
    } else {
      setLoginError('Incorrect PIN');
      setPin('');
    }
  };

  const showConfirm = useCallback((title: string, message: string, onConfirmCallback: () => void) => {
    setModalState({ 
      isOpen: true, 
      title, 
      message, 
      onConfirm: () => {
        onConfirmCallback();
        setModalState(null);
      }
    });
  }, []);

  const renderView = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard 
                  stock={store.stock} 
                  sales={store.sales} 
                  menu={store.menu} 
                  resetData={() => showConfirm("Reset System?", "This will delete EVERYTHING permanently.", store.forceReset)} 
                />;
      case 'stock':
        return (
          <Stock 
            stock={store.stock} 
            addStockItem={store.addStockItem} 
            updateStockQuantity={store.updateStockQuantity}
            deleteStockItem={(id) => {
              const item = store.stock.find(s => s.id === id);
              if (!item) return;
              showConfirm(`Delete ${item.name}?`, "This item will be removed from all linked recipes.", () => store.deleteStockItem(id));
            }}
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
            deleteMenuItem={(id) => {
              const item = store.menu.find(m => m.id === id);
              if (!item) return;
              showConfirm(`Delete ${item.name}?`, "This drink will be removed from the sales menu.", () => store.deleteMenuItem(id));
            }}
          />
        );
      case 'reports':
        return <Reports sales={store.sales} stock={store.stock} menu={store.menu} />;
      default:
        return <Dashboard stock={store.stock} sales={store.sales} menu={store.menu} />;
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-tds-deep flex flex-col items-center justify-center p-6 text-tds-cream">
        <div className="w-full max-w-sm space-y-8 animate-in fade-in zoom-in duration-500">
          <div className="text-center space-y-2">
            <h1 className="text-4xl font-black tracking-tighter text-tds-gold">TDS</h1>
            <p className="text-xs font-bold uppercase tracking-[0.3em] opacity-40 text-tds-cream">Inventory Hub</p>
          </div>
          <div className="bg-white/5 border border-white/10 p-8 rounded-[40px] backdrop-blur-xl shadow-2xl">
            <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-2">
                <label className="block text-[10px] font-black uppercase tracking-widest text-tds-gold text-center">Enter PIN</label>
                <input 
                  type="password"
                  inputMode="numeric"
                  maxLength={4}
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  placeholder="••••"
                  className="w-full bg-white/5 border border-white/10 text-center text-3xl font-black py-4 rounded-3xl focus:border-tds-gold outline-none transition-all tracking-[0.5em] text-white"
                  autoFocus
                />
              </div>
              {loginError && <p className="text-center text-tds-red text-xs font-bold animate-pulse">{loginError}</p>}
              <button type="submit" className="w-full bg-tds-gold text-tds-deep font-black py-4 rounded-3xl shadow-xl active:scale-95 transition-all uppercase text-sm tracking-widest">
                Authorize
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Layout activeTab={activeTab} setActiveTab={setActiveTab}>
      <ConfirmModal 
        isOpen={!!modalState?.isOpen} 
        title={modalState?.title || ''} 
        message={modalState?.message || ''} 
        onConfirm={modalState?.onConfirm || (() => {})} 
        onCancel={() => setModalState(null)} 
      />
      <div className="flex justify-between items-center mb-6">
         <div className="text-xs font-bold uppercase tracking-widest text-tds-green/40">Secured Session</div>
         <button 
          onClick={() => showConfirm("Logout?", "Your current login session will end.", () => setIsLoggedIn(false))}
          className="text-[10px] font-bold text-tds-red uppercase bg-tds-red/10 px-3 py-1.5 rounded-full active:scale-95 transition-all"
         >
           Sign Out
         </button>
      </div>
      <div className="animate-in fade-in duration-500 slide-in-from-bottom-2">
        {renderView()}
      </div>
    </Layout>
  );
};

export default App;
