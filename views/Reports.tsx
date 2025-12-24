
import React, { useState, useMemo } from 'react';
import { ICONS } from '../constants';
import { Sale, StockItem, MenuItem } from '../types';

interface ReportsProps {
  sales: Sale[];
  stock: StockItem[];
  menu: MenuItem[];
}

type ViewMode = 'main' | 'daily' | 'audit';

export const Reports: React.FC<ReportsProps> = ({ sales, stock, menu }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('main');

  const stats = useMemo(() => {
    const today = new Date().setHours(0,0,0,0);
    const last7Days = Date.now() - 7 * 24 * 60 * 60 * 1000;
    
    return {
      totalSales: sales.length,
      todaySales: sales.filter(s => s.timestamp >= today).length,
      weekSales: sales.filter(s => s.timestamp >= last7Days).length,
    };
  }, [sales]);

  const consumption = useMemo(() => {
    const usage: Record<string, number> = {};
    sales.forEach(sale => {
      sale.items.forEach(saleItem => {
        const menuItem = menu.find(m => m.id === saleItem.menuItemId);
        if (!menuItem) return;
        menuItem.ingredients.forEach(ing => {
          usage[ing.stockItemId] = (usage[ing.stockItemId] || 0) + (ing.quantity * saleItem.quantity);
        });
      });
    });
    return usage;
  }, [sales, menu]);

  const handleDownload = () => {
    setIsGenerating(true);
    
    // Create CSV Content
    let csvContent = "TDS STOCK MANAGEMENT REPORT\n";
    csvContent += `Generated at: ${new Date().toLocaleString()}\n\n`;
    
    csvContent += "SALES LOG\n";
    csvContent += "Timestamp,Drink Name,Quantity\n";
    sales.forEach(sale => {
      sale.items.forEach(item => {
        const m = menu.find(mi => mi.id === item.menuItemId);
        csvContent += `${new Date(sale.timestamp).toLocaleString()},${m?.name || 'Deleted Item'},${item.quantity}\n`;
      });
    });

    csvContent += "\nINVENTORY STATUS\n";
    csvContent += "Item Name,Type,Unit,Remaining,Alert Threshold,Consumption\n";
    stock.forEach(s => {
      csvContent += `${s.name},${s.type},${s.unit},${s.remainingQuantity},${s.alertThreshold},${consumption[s.id] || 0}\n`;
    });

    // Download Trigger
    setTimeout(() => {
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `TDS_Report_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      setIsGenerating(false);
    }, 1000);
  };

  if (viewMode === 'daily') {
    return (
      <div className="space-y-6 animate-in slide-in-from-right duration-300">
        <div className="flex items-center gap-3">
          <button onClick={() => setViewMode('main')} className="text-tds-green p-2 bg-white rounded-xl shadow-sm border border-tds-green/5">
            {ICONS.Minus}
          </button>
          <h2 className="text-lg font-bold text-tds-green">Daily Sales Log</h2>
        </div>

        <div className="bg-white rounded-3xl border border-tds-green/5 overflow-hidden shadow-sm">
          {sales.length === 0 ? (
            <div className="p-12 text-center text-tds-green/40 italic">No sales logs found.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-tds-green/5 text-[10px] font-bold uppercase text-tds-green/60">
                  <tr>
                    <th className="px-4 py-3">Time</th>
                    <th className="px-4 py-3">Item</th>
                    <th className="px-4 py-3">Qty</th>
                  </tr>
                </thead>
                <tbody className="text-xs">
                  {sales.map((sale) => (
                    <React.Fragment key={sale.id}>
                      {sale.items.map((item, idx) => {
                        const m = menu.find(mi => mi.id === item.menuItemId);
                        return (
                          <tr key={`${sale.id}-${idx}`} className="border-b border-tds-green/5">
                            <td className="px-4 py-3 text-tds-green/40">
                              {idx === 0 ? new Date(sale.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                            </td>
                            <td className="px-4 py-3 font-bold text-tds-deep">{m?.name || 'Deleted Item'}</td>
                            <td className="px-4 py-3">
                              <span className="bg-tds-gold/10 text-tds-green px-2 py-0.5 rounded-full font-bold">
                                x{item.quantity}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (viewMode === 'audit') {
    return (
      <div className="space-y-6 animate-in slide-in-from-right duration-300">
        <div className="flex items-center gap-3">
          <button onClick={() => setViewMode('main')} className="text-tds-green p-2 bg-white rounded-xl shadow-sm border border-tds-green/5">
            {ICONS.Minus}
          </button>
          <h2 className="text-lg font-bold text-tds-green">Inventory Audit</h2>
        </div>

        <div className="space-y-4">
          {stock.map(s => (
            <div key={s.id} className="bg-white p-4 rounded-3xl border border-tds-green/5 shadow-sm">
              <div className="flex justify-between items-center">
                <div>
                  <h4 className="font-bold text-tds-deep">{s.name}</h4>
                  <p className="text-[10px] uppercase font-bold text-tds-green/40 tracking-widest">
                    Lifetime Consumption: <span className="text-tds-gold">{consumption[s.id] || 0} {s.unit}</span>
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-black text-tds-green">{s.remainingQuantity} {s.unit}</p>
                  <p className="text-[10px] font-bold text-tds-green/40 uppercase">Remaining</p>
                </div>
              </div>
              <div className="mt-3 w-full bg-tds-cream rounded-full h-1.5 overflow-hidden">
                <div 
                  className={`h-full transition-all duration-1000 ${s.remainingQuantity <= s.alertThreshold ? 'bg-tds-red' : 'bg-tds-gold'}`}
                  style={{ width: `${Math.min(100, (s.remainingQuantity / (s.remainingQuantity + (consumption[s.id] || 1))) * 100)}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in">
      <h2 className="text-sm font-bold text-tds-green/60 uppercase tracking-widest">Business Performance</h2>
      
      <div className="bg-tds-green rounded-3xl p-6 text-tds-cream shadow-xl relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-125 transition-transform">
          {ICONS.Reports}
        </div>
        <div className="flex items-center gap-3 mb-6">
           <div className="w-12 h-12 rounded-2xl bg-tds-gold/20 flex items-center justify-center text-tds-gold">
              {ICONS.Reports}
           </div>
           <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-tds-gold">TDS Performance</p>
              <h3 className="text-xl font-bold">Overview Report</h3>
           </div>
        </div>

        <div className="grid grid-cols-3 gap-4 border-t border-tds-cream/10 pt-6">
           <div className="text-center">
              <p className="text-2xl font-black">{stats.todaySales}</p>
              <p className="text-[9px] font-bold uppercase tracking-wider text-tds-cream/60">Today</p>
           </div>
           <div className="text-center border-x border-tds-cream/10">
              <p className="text-2xl font-black">{stats.weekSales}</p>
              <p className="text-[9px] font-bold uppercase tracking-wider text-tds-cream/60">7 Days</p>
           </div>
           <div className="text-center">
              <p className="text-2xl font-black">{stats.totalSales}</p>
              <p className="text-[9px] font-bold uppercase tracking-wider text-tds-cream/60">Total</p>
           </div>
        </div>
      </div>

      <section className="space-y-3">
         <h3 className="text-[10px] font-bold text-tds-green/40 uppercase tracking-widest">View Details</h3>
         <button 
           onClick={() => setViewMode('daily')}
           className="w-full bg-white border border-tds-green/10 p-5 rounded-3xl flex items-center justify-between group active:scale-95 transition-transform shadow-sm"
         >
            <div className="flex items-center gap-4">
               <div className="w-10 h-10 rounded-xl bg-tds-gold/10 text-tds-gold flex items-center justify-center">
                  {ICONS.Sales}
               </div>
               <div className="text-left">
                  <p className="font-bold text-tds-deep">Daily Sales Log</p>
                  <p className="text-[10px] text-tds-green/40 font-bold uppercase">Transaction history</p>
               </div>
            </div>
            <div className="text-tds-green/20">
               {ICONS.ArrowRight}
            </div>
         </button>

         <button 
           onClick={() => setViewMode('audit')}
           className="w-full bg-white border border-tds-green/10 p-5 rounded-3xl flex items-center justify-between group active:scale-95 transition-transform shadow-sm"
         >
            <div className="flex items-center gap-4">
               <div className="w-10 h-10 rounded-xl bg-tds-gold/10 text-tds-gold flex items-center justify-center">
                  {ICONS.Stock}
               </div>
               <div className="text-left">
                  <p className="font-bold text-tds-deep">Inventory Audit</p>
                  <p className="text-[10px] text-tds-green/40 font-bold uppercase">Current stock & consumption</p>
               </div>
            </div>
            <div className="text-tds-green/20">
               {ICONS.ArrowRight}
            </div>
         </button>
      </section>

      <section className="space-y-3 pt-4">
         <h3 className="text-[10px] font-bold text-tds-green/40 uppercase tracking-widest">Reports Export</h3>
         <button 
           onClick={handleDownload}
           disabled={isGenerating}
           className="w-full bg-tds-green text-tds-cream p-5 rounded-3xl flex items-center justify-between shadow-lg active:scale-95 transition-all disabled:opacity-50"
         >
            <div className="flex items-center gap-4">
               <div className="w-10 h-10 rounded-xl bg-tds-gold text-tds-deep flex items-center justify-center">
                  {ICONS.Download}
               </div>
               <span className="font-bold">Download Spreadsheet (CSV)</span>
            </div>
            {isGenerating && <div className="w-4 h-4 border-2 border-tds-cream/20 border-t-tds-cream rounded-full animate-spin" />}
         </button>
         <p className="text-[9px] text-center text-tds-green/30 italic">Note: CSV is compatible with Excel, Sheets, and PDF converters.</p>
      </section>

      <div className="p-8 text-center">
         <p className="text-[10px] text-tds-green/30 font-bold uppercase tracking-[3px]">Internal Staff Access Only</p>
      </div>
    </div>
  );
};
