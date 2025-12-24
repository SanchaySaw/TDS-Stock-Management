
import React from 'react';
import { ICONS, COLORS } from '../constants';
import { StockItem, Sale, MenuItem } from '../types';

interface DashboardProps {
  stock: StockItem[];
  sales: Sale[];
  menu: MenuItem[];
  resetData?: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ stock, sales, menu, resetData }) => {
  const lowStock = stock.filter(s => s.remainingQuantity <= s.alertThreshold);
  
  const today = new Date().setHours(0,0,0,0);
  const todaysSales = sales.filter(s => s.timestamp >= today);
  const totalItemsSoldToday = todaysSales.reduce((acc, s) => acc + s.items.reduce((sum, i) => sum + i.quantity, 0), 0);

  return (
    <div className="space-y-6">
      <section>
        <h2 className="text-sm font-bold text-tds-green/60 uppercase tracking-widest mb-4">Live Insights</h2>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-tds-green text-tds-cream p-5 rounded-3xl shadow-xl relative overflow-hidden group">
            <div className="absolute -right-4 -bottom-4 opacity-10 group-hover:scale-110 transition-transform">
              {ICONS.Sales}
            </div>
            <p className="text-3xl font-bold mb-1">{totalItemsSoldToday}</p>
            <p className="text-xs font-medium text-tds-gold uppercase tracking-wider">Drinks Sold Today</p>
          </div>
          <div className="bg-white border border-tds-green/10 p-5 rounded-3xl shadow-sm">
            <p className="text-3xl font-bold text-tds-green mb-1">{stock.length}</p>
            <p className="text-xs font-medium text-tds-green/60 uppercase tracking-wider">Active Inventory</p>
          </div>
        </div>
      </section>

      {lowStock.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-tds-red uppercase tracking-widest flex items-center gap-2">
              {ICONS.Warning} Low Stock Alerts
            </h2>
            <span className="bg-tds-red text-white text-[10px] px-2 py-0.5 rounded-full font-bold">
              {lowStock.length}
            </span>
          </div>
          <div className="space-y-3">
            {lowStock.map(item => (
              <div key={item.id} className="bg-white border-l-4 border-tds-red p-4 rounded-2xl shadow-sm flex items-center justify-between group">
                <div>
                  <h3 className="font-bold text-tds-deep">{item.name}</h3>
                  <p className="text-xs text-tds-red font-medium">
                    {item.remainingQuantity} {item.unit} remaining
                  </p>
                </div>
                <div className="w-10 h-10 rounded-full bg-tds-red/10 flex items-center justify-center text-tds-red group-active:scale-95 transition-transform">
                  {ICONS.Warning}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      <section>
        <h2 className="text-sm font-bold text-tds-green/60 uppercase tracking-widest mb-4">Recent Sales Activity</h2>
        <div className="bg-white rounded-3xl border border-tds-green/5 overflow-hidden">
          {sales.slice(-5).reverse().map((sale, idx) => (
            <div key={sale.id} className={`p-4 flex items-center justify-between ${idx !== 4 ? 'border-b border-tds-green/5' : ''}`}>
              <div>
                <div className="flex gap-1 flex-wrap">
                  {sale.items.map(si => {
                    const menuItem = menu.find(m => m.id === si.menuItemId);
                    return (
                      <span key={si.menuItemId} className="bg-tds-gold/10 text-tds-green text-[10px] px-2 py-0.5 rounded-full font-bold">
                        {si.quantity}x {menuItem?.name || 'Unknown'}
                      </span>
                    );
                  })}
                </div>
                <p className="text-[10px] text-tds-green/40 mt-1 uppercase font-medium">
                  {new Date(sale.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
              <div className="text-tds-green/20">
                {ICONS.ArrowRight}
              </div>
            </div>
          ))}
          {sales.length === 0 && (
            <div className="p-12 text-center text-tds-green/40 italic text-sm">
              No sales recorded yet today.
            </div>
          )}
        </div>
      </section>

      {resetData && (
        <section className="pt-8 border-t border-tds-green/5">
           <button 
            onClick={resetData}
            className="w-full py-4 text-[10px] font-bold text-tds-red/40 uppercase tracking-widest border border-tds-red/10 rounded-2xl hover:bg-tds-red hover:text-white transition-all"
           >
             Emergency: Reset System Data
           </button>
        </section>
      )}
    </div>
  );
};
