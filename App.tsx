
import React, { useState, useCallback } from 'react';
import { Layout } from './components/Layout';
import { useTdsStore } from './store';
import { Dashboard } from './views/Dashboard';
import { Stock } from './views/Stock';
import { Sales } from './views/Sales';
import { MenuManagement } from './views/MenuManagement';
import { Reports } from './views/Reports';
import { ICONS } from './constants';
import { User } from './types';

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
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  
  // Auth Form State
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [authError, setAuthError] = useState('');
  
  // Custom Modal State
  const [modalState, setModalState] = useState<{ 
    isOpen: boolean; 
    title: string; 
    message: string; 
    onConfirm: () => void 
  } | null>(null);

  const store = useTdsStore();

  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');

    if (isSignUp) {
      // Sign Up Logic
      if (password !== confirmPassword) {
        setAuthError('Passwords do not match');
        return;
      }
      if (store.users.some(u => u.email === email)) {
        setAuthError('Email already registered');
        return;
      }
      const newUser = store.registerUser({ email, password });
      setCurrentUser(newUser);
      setIsLoggedIn(true);
      resetAuthFields();
    } else {
      // Login Logic
      const user = store.users.find(u => u.email === email && u.password === password);
      // Hardcoded fallback for the original admin request
      if (!user && email === 'admin@tds.com' && password === 'password123') {
        const adminUser = { id: 'admin', email, password };
        setCurrentUser(adminUser);
        setIsLoggedIn(true);
        resetAuthFields();
      } else if (user) {
        setCurrentUser(user);
        setIsLoggedIn(true);
        resetAuthFields();
      } else {
        setAuthError('Invalid email or password');
      }
    }
  };

  const resetAuthFields = () => {
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setAuthError('');
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
      <div className="min-h-screen bg-tds-deep flex flex-col items-center justify-center p-6 text-tds-cream overflow-y-auto">
        <div className="w-full max-w-sm space-y-8 animate-in fade-in zoom-in duration-500 py-10">
          <div className="text-center space-y-2">
            <h1 className="text-4xl font-black tracking-tighter text-tds-gold">TDS</h1>
            <p className="text-xs font-bold uppercase tracking-[0.3em] opacity-40 text-tds-cream">Inventory Hub</p>
          </div>
          
          <div className="bg-white/5 border border-white/10 p-8 rounded-[40px] backdrop-blur-xl shadow-2xl">
            <div className="flex gap-4 mb-8">
              <button 
                onClick={() => { setIsSignUp(false); setAuthError(''); }}
                className={`flex-1 pb-2 text-xs font-black uppercase tracking-widest transition-all border-b-2 ${!isSignUp ? 'text-tds-gold border-tds-gold' : 'text-tds-cream/20 border-transparent'}`}
              >
                Sign In
              </button>
              <button 
                onClick={() => { setIsSignUp(true); setAuthError(''); }}
                className={`flex-1 pb-2 text-xs font-black uppercase tracking-widest transition-all border-b-2 ${isSignUp ? 'text-tds-gold border-tds-gold' : 'text-tds-cream/20 border-transparent'}`}
              >
                Sign Up
              </button>
            </div>

            <form onSubmit={handleAuth} className="space-y-4">
              <div className="space-y-1">
                <label className="block text-[10px] font-black uppercase tracking-widest text-tds-gold pl-1">Email Address</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-tds-gold/40">{ICONS.Mail}</span>
                  <input 
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@tds.com"
                    className="w-full bg-white/5 border border-white/10 text-white pl-12 pr-4 py-3.5 rounded-2xl focus:border-tds-gold outline-none transition-all text-sm font-medium"
                    autoFocus
                    required
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] font-black uppercase tracking-widest text-tds-gold pl-1">Password</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-tds-gold/40">{ICONS.Lock}</span>
                  <input 
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-white/5 border border-white/10 text-white pl-12 pr-4 py-3.5 rounded-2xl focus:border-tds-gold outline-none transition-all text-sm font-medium"
                    required
                  />
                </div>
              </div>

              {isSignUp && (
                <div className="space-y-1 animate-in slide-in-from-top-2 duration-300">
                  <label className="block text-[10px] font-black uppercase tracking-widest text-tds-gold pl-1">Confirm Password</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-tds-gold/40">{ICONS.Lock}</span>
                    <input 
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-white/5 border border-white/10 text-white pl-12 pr-4 py-3.5 rounded-2xl focus:border-tds-gold outline-none transition-all text-sm font-medium"
                      required
                    />
                  </div>
                </div>
              )}

              {authError && <p className="text-center text-tds-red text-xs font-bold animate-pulse pt-2">{authError}</p>}
              
              <button type="submit" className="w-full bg-tds-gold text-tds-deep font-black py-4 mt-4 rounded-3xl shadow-xl active:scale-95 transition-all uppercase text-sm tracking-widest">
                {isSignUp ? 'Create Account' : 'Sign In'}
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
         <div className="flex flex-col">
           <div className="text-xs font-bold uppercase tracking-widest text-tds-green/40">Secured Session</div>
           <div className="text-[10px] font-bold text-tds-gold">{currentUser?.email}</div>
         </div>
         <button 
          onClick={() => showConfirm("Logout?", "Your current login session will end.", () => {
            setIsLoggedIn(false);
            setCurrentUser(null);
          })}
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
