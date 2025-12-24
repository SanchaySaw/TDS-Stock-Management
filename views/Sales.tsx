
import React, { useState } from 'react';
import { ICONS, COLORS } from '../constants';
import { MenuItem, StockItem } from '../types';

interface SalesProps {
  menu: MenuItem[];
  stock: StockItem[];
  recordSale: (items: { menuItemId: string, quantity: number }[]) => boolean;
}

export const Sales: React.FC<SalesProps> = ({ menu, stock, recordSale }) => {
  const [cart, setCart] = useState<Record<string, number>>({});
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error', msg: string } | null>(null);

  const activeMenu = menu.filter(m => m.isActive);

  const updateCart = (menuItemId: string, delta: number) => {
    setCart(prev => {
      const current = prev[menuItemId] || 0;
      const next = Math.max(0, current + delta);
      if (next === 0) {
        const { [menuItemId]: _, ...rest } = prev;
        return rest;
      }
      return { ...prev, [menuItemId]: next };
    });
  };

  const handleCheckout = () => {
    const items = Object.entries(cart).map(([menuItemId, quantity]) => ({ menuItemId, quantity }));
    if (items.length === 0) return;

    try {
      recordSale(items);
      setCart({});
      setFeedback({ type: 'success', msg: 'Sale recorded successfully!' });
      setTimeout(() => setFeedback(null), 3000);
    } catch (e: any) {
      setFeedback({ type: 'error', msg: e.message || 'Error processing sale' });
      setTimeout(() => setFeedback(null), 3000);
    }
  };

  return (
    <div className="space-y-6 pb-32">
      <div className="flex justify-between items-center">
        <h2 className="text-sm font-bold text-tds-green/60 uppercase tracking-widest">Select Menu Items</h2>
        {Object.keys(cart).length > 0 && (
          <button 
            onClick={() => setCart({})}
            className="text-[10px] text-tds-red font-bold uppercase tracking-widest px-3 py-1 bg-tds-red/10 rounded-full"
          >
            Clear Cart
          </button>
        )}
      </div>

      {feedback && (
        <div className={`p-4 rounded-2xl flex items-center gap-3 animate-in slide-in-from-top ${
          feedback.type === 'success' ? 'bg-tds-green text-tds-cream' : 'bg-tds-red text-white'
        }`}>
          {feedback.type === 'success' ? ICONS.Success : ICONS.Error}
          <p className="font-bold text-sm">{feedback.msg}</p>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        {activeMenu.map(item => (
          <div 
            key={item.id} 
            className={`relative rounded-3xl overflow-hidden shadow-sm transition-all border-2 ${
              cart[item.id] ? 'border-tds-gold bg-white' : 'border-transparent bg-white'
            }`}
          >
            <div className="aspect-square relative overflow-hidden" onClick={() => updateCart(item.id, 1)}>
              <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <div className="absolute bottom-3 left-3 right-3">
                <p className="text-white font-bold text-sm leading-tight">{item.name}</p>
              </div>
              {cart[item.id] > 0 && (
                <div className="absolute top-2 right-2 bg-tds-gold text-tds-deep w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shadow-lg">
                  {cart[item.id]}
                </div>
              )}
            </div>
            
            <div className="flex border-t border-tds-green/5">
              <button 
                onClick={() => updateCart(item.id, -1)}
                className="flex-1 py-3 flex justify-center text-tds-red active:bg-tds-red/5 transition-colors disabled:opacity-30"
                disabled={!cart[item.id]}
              >
                {ICONS.Minus}
              </button>
              <div className="w-px bg-tds-green/5" />
              <button 
                onClick={() => updateCart(item.id, 1)}
                className="flex-1 py-3 flex justify-center text-tds-green active:bg-tds-green/5 transition-colors"
              >
                {ICONS.Plus}
              </button>
            </div>
          </div>
        ))}
      </div>

      {Object.keys(cart).length > 0 && (
        <div className="fixed bottom-24 left-4 right-4 max-w-lg mx-auto z-40">
          <button 
            onClick={handleCheckout}
            className="w-full bg-tds-green text-tds-cream p-5 rounded-3xl shadow-2xl flex items-center justify-between group active:scale-[0.98] transition-all"
          >
            <div className="flex flex-col items-start">
              <span className="text-[10px] uppercase font-bold text-tds-gold/80 tracking-widest">Confirm Sale</span>
              <span className="text-lg font-bold">
                {/* Explicitly type accumulator and current value in reduce to fix unknown type error */}
                {Object.values(cart).reduce((a: number, b: number) => a + b, 0)} Items Selected
              </span>
            </div>
            <div className="bg-tds-gold text-tds-deep p-2 rounded-xl group-hover:translate-x-1 transition-transform">
              {ICONS.ArrowRight}
            </div>
          </button>
        </div>
      )}
    </div>
  );
};
