
import React, { useState, useEffect } from 'react';
import { ICONS } from '../constants';
import { StockItem, StockType, Unit } from '../types';

interface StockProps {
  stock: StockItem[];
  addStockItem: (item: Omit<StockItem, 'id'>) => void;
  updateStockQuantity: (id: string, amount: number) => void;
  deleteStockItem: (id: string) => void;
}

const UNIT_MAPPING: Record<string, Unit> = {
  [StockType.LIQUID]: 'ml',
  [StockType.POWDER]: 'gm',
  [StockType.SOLID]: 'gm',
  [StockType.PIECE]: 'pcs'
};

export const Stock: React.FC<StockProps> = ({ stock, addStockItem, updateStockQuantity, deleteStockItem }) => {
  const [showAdd, setShowAdd] = useState(false);
  const [newItem, setNewItem] = useState<Omit<StockItem, 'id'>>({
    name: '',
    type: StockType.LIQUID,
    unit: 'ml',
    remainingQuantity: 0,
    alertThreshold: 0
  });

  const handleTypeChange = (type: StockType) => {
    setNewItem(prev => ({
      ...prev,
      type: type,
      unit: UNIT_MAPPING[type] || 'ml'
    }));
  };

  const handleDelete = (item: StockItem) => {
    if (window.confirm(`Permanently delete "${item.name}"? This removes it from all recipes and inventory lists.`)) {
      deleteStockItem(item.id);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItem.name) return;
    addStockItem(newItem);
    setNewItem({
      name: '',
      type: StockType.LIQUID,
      unit: 'ml',
      remainingQuantity: 0,
      alertThreshold: 0
    });
    setShowAdd(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-sm font-bold text-tds-green/60 uppercase tracking-widest">Inventory List</h2>
        <button 
          onClick={() => setShowAdd(!showAdd)}
          className={`px-4 py-2 rounded-xl flex items-center gap-2 text-xs font-bold transition-all shadow-sm ${
            showAdd ? 'bg-tds-red text-white' : 'bg-tds-green text-tds-cream'
          }`}
        >
          {showAdd ? ICONS.Trash : ICONS.Plus}
          {showAdd ? 'Cancel' : 'Add Item'}
        </button>
      </div>

      {showAdd && (
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-3xl border border-tds-green/10 space-y-4 animate-in slide-in-from-top-4 shadow-xl">
          <div>
            <label className="block text-[10px] font-bold text-tds-green/40 uppercase mb-1">Item Name</label>
            <input 
              type="text" 
              className="w-full bg-tds-cream/50 border border-tds-green/10 p-3 rounded-xl outline-none focus:border-tds-gold transition-colors"
              placeholder="e.g. Oat Milk"
              value={newItem.name}
              onChange={e => setNewItem({...newItem, name: e.target.value})}
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-tds-green/40 uppercase mb-1">Type</label>
              <select 
                className="w-full bg-tds-cream/50 border border-tds-green/10 p-3 rounded-xl outline-none"
                value={newItem.type}
                onChange={e => handleTypeChange(e.target.value as StockType)}
              >
                {Object.values(StockType).map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-tds-green/40 uppercase mb-1">Unit (Auto)</label>
              <div className="w-full bg-tds-cream/20 border border-tds-green/5 p-3 rounded-xl text-tds-green/60 font-black text-sm uppercase">
                {newItem.unit}
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-tds-green/40 uppercase mb-1">Initial Qty</label>
              <input 
                type="number"
                inputMode="numeric" 
                className="w-full bg-tds-cream/50 border border-tds-green/10 p-3 rounded-xl outline-none"
                value={newItem.remainingQuantity || ''}
                onChange={e => setNewItem({...newItem, remainingQuantity: Number(e.target.value)})}
                required
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-tds-green/40 uppercase mb-1">Alert Level</label>
              <input 
                type="number" 
                inputMode="numeric"
                className="w-full bg-tds-cream/50 border border-tds-green/10 p-3 rounded-xl outline-none"
                value={newItem.alertThreshold || ''}
                onChange={e => setNewItem({...newItem, alertThreshold: Number(e.target.value)})}
                required
              />
            </div>
          </div>
          <button type="submit" className="w-full bg-tds-green text-tds-cream p-4 rounded-xl font-bold shadow-lg active:scale-95 transition-all">Save Stock Item</button>
        </form>
      )}

      <div className="space-y-3">
        {stock.length === 0 && (
          <div className="text-center py-12 opacity-30 italic text-sm">No inventory recorded.</div>
        )}
        {stock.map(item => (
          <div key={item.id} className="bg-white p-4 rounded-3xl border border-tds-green/5 shadow-sm transition-all group animate-in fade-in zoom-in duration-300">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="font-bold text-tds-deep text-lg leading-tight">{item.name}</h3>
                <div className="flex gap-2 mt-1">
                  <span className="text-[10px] bg-tds-cream text-tds-green px-2 py-0.5 rounded-full font-bold uppercase tracking-wider border border-tds-green/5">
                    {item.type}
                  </span>
                  {item.remainingQuantity <= item.alertThreshold && (
                    <span className="text-[10px] bg-tds-red/10 text-tds-red px-2 py-0.5 rounded-full font-bold uppercase tracking-wider flex items-center gap-1 border border-tds-red/10">
                      Low Stock
                    </span>
                  )}
                </div>
              </div>
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete(item);
                }}
                className="text-tds-red/40 hover:text-tds-red hover:bg-tds-red/10 p-2.5 rounded-xl transition-all active:scale-90"
                type="button"
                title="Delete Stock Item"
              >
                {ICONS.Trash}
              </button>
            </div>
            
            <div className="flex items-center justify-between bg-tds-cream/30 p-4 rounded-2xl border border-tds-green/5">
              <div className="flex flex-col">
                <span className="text-[10px] uppercase font-bold text-tds-green/40 tracking-wider">Remaining</span>
                <span className={`text-2xl font-black ${item.remainingQuantity <= item.alertThreshold ? 'text-tds-red' : 'text-tds-green'}`}>
                  {item.remainingQuantity} <span className="text-xs font-bold text-tds-green/40 uppercase">{item.unit}</span>
                </span>
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={() => updateStockQuantity(item.id, -100)}
                  className="w-10 h-10 rounded-xl bg-white border border-tds-green/10 flex items-center justify-center text-tds-red font-bold active:scale-90 transition-transform shadow-sm"
                >
                  -
                </button>
                <button 
                  onClick={() => updateStockQuantity(item.id, 100)}
                  className="w-10 h-10 rounded-xl bg-tds-green text-tds-cream flex items-center justify-center font-bold active:scale-90 transition-transform shadow-sm"
                >
                  +
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
