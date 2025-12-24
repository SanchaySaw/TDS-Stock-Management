
import React, { useState, useRef } from 'react';
import { ICONS } from '../constants';
import { MenuItem, StockItem, RecipeIngredient } from '../types';

interface MenuManagementProps {
  menu: MenuItem[];
  stock: StockItem[];
  addMenuItem: (item: Omit<MenuItem, 'id'>) => void;
  updateMenuItem: (id: string, updates: Partial<MenuItem>) => void;
  deleteMenuItem: (id: string) => void;
}

export const MenuManagement: React.FC<MenuManagementProps> = ({ menu, stock, addMenuItem, updateMenuItem, deleteMenuItem }) => {
  const [showAdd, setShowAdd] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [newItem, setNewItem] = useState<Omit<MenuItem, 'id'>>({
    name: '',
    imageUrl: 'https://images.unsplash.com/photo-1544145945-f904253d0c71?auto=format&fit=crop&q=80&w=400',
    isActive: true,
    ingredients: []
  });

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewItem({ ...newItem, imageUrl: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const addIngredientSlot = () => {
    if (stock.length === 0) {
      alert("Please add stock items first!");
      return;
    }
    setNewItem({
      ...newItem,
      ingredients: [...newItem.ingredients, { stockItemId: stock[0]?.id || '', quantity: 0, unit: stock[0]?.unit || 'ml' }]
    });
  };

  const removeIngredientSlot = (idx: number) => {
    const nextIng = [...newItem.ingredients];
    nextIng.splice(idx, 1);
    setNewItem({ ...newItem, ingredients: nextIng });
  };

  const updateIngredientSlot = (idx: number, updates: Partial<RecipeIngredient>) => {
    const nextIng = [...newItem.ingredients];
    const stockItem = stock.find(s => s.id === (updates.stockItemId || nextIng[idx].stockItemId));
    nextIng[idx] = { ...nextIng[idx], ...updates, unit: stockItem?.unit || 'ml' };
    setNewItem({ ...newItem, ingredients: nextIng });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItem.name) {
      alert("Please enter a drink name.");
      return;
    }
    if (newItem.ingredients.length === 0) {
      alert("Please add at least one ingredient to the recipe.");
      return;
    }
    addMenuItem(newItem);
    setShowAdd(false);
    setNewItem({
      name: '',
      imageUrl: 'https://images.unsplash.com/photo-1544145945-f904253d0c71?auto=format&fit=crop&q=80&w=400',
      isActive: true,
      ingredients: []
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-sm font-bold text-tds-green/60 uppercase tracking-widest">Drink Recipes</h2>
        <button 
          onClick={() => setShowAdd(!showAdd)}
          className={`p-2 rounded-xl flex items-center gap-2 text-xs font-bold transition-all ${
            showAdd ? 'bg-tds-red text-white' : 'bg-tds-green text-tds-cream'
          }`}
        >
          {showAdd ? ICONS.Trash : ICONS.Plus}
          {showAdd ? 'Cancel' : 'Create Drink'}
        </button>
      </div>

      {showAdd && (
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-3xl border border-tds-green/10 space-y-6 animate-in slide-in-from-top-4 shadow-xl">
          <div className="flex flex-col gap-4">
             <div className="relative w-full h-48 rounded-2xl bg-tds-cream overflow-hidden border border-tds-green/10 group">
                <img src={newItem.imageUrl} className="w-full h-full object-cover" />
                <button 
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <div className="bg-white/20 p-3 rounded-full text-white mb-2">
                    {ICONS.Edit}
                  </div>
                  <span className="text-white text-xs font-bold uppercase tracking-wider">Upload Photo</span>
                </button>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleImageUpload} 
                  accept="image/*" 
                  className="hidden" 
                />
             </div>
             <div className="space-y-2">
                <label className="block text-[10px] font-bold text-tds-green/40 uppercase">Drink Name</label>
                <input 
                  type="text" 
                  className="w-full bg-tds-cream/50 border border-tds-green/10 p-3 rounded-xl outline-none focus:border-tds-gold"
                  value={newItem.name}
                  onChange={e => setNewItem({...newItem, name: e.target.value})}
                  placeholder="e.g. Vanilla Latte"
                  required
                />
             </div>
          </div>

          <div className="space-y-3">
             <div className="flex justify-between items-center">
                <label className="block text-[10px] font-bold text-tds-green/40 uppercase">Stock Linking (Recipe)</label>
                <button 
                  type="button" 
                  onClick={addIngredientSlot}
                  className="text-xs font-bold text-tds-gold flex items-center gap-1 bg-tds-gold/10 px-3 py-1.5 rounded-full"
                >
                  {ICONS.Plus} Add Ingredient
                </button>
             </div>
             
             {newItem.ingredients.map((ing, idx) => (
                <div key={idx} className="flex gap-2 items-end bg-tds-cream/10 p-2 rounded-2xl border border-tds-green/5">
                   <div className="flex-1">
                      <select 
                        className="w-full bg-white border border-tds-green/10 p-2 rounded-xl text-xs outline-none"
                        value={ing.stockItemId}
                        onChange={e => updateIngredientSlot(idx, { stockItemId: e.target.value })}
                      >
                         {stock.map(s => <option key={s.id} value={s.id}>{s.name} ({s.unit})</option>)}
                      </select>
                   </div>
                   <div className="w-20">
                      <input 
                        type="number" 
                        placeholder="Qty"
                        className="w-full bg-white border border-tds-green/10 p-2 rounded-xl text-xs outline-none"
                        value={ing.quantity || ''}
                        onChange={e => updateIngredientSlot(idx, { quantity: Number(e.target.value) })}
                        required
                      />
                   </div>
                   <button 
                    type="button"
                    onClick={() => removeIngredientSlot(idx)}
                    className="p-2 text-tds-red bg-white border border-tds-red/10 rounded-xl"
                   >
                     {ICONS.Trash}
                   </button>
                </div>
             ))}
             {newItem.ingredients.length === 0 && (
               <div className="p-8 text-center bg-tds-cream/20 rounded-2xl border-2 border-dashed border-tds-green/10 text-xs text-tds-green/40 italic">
                  Link stock items to define how much is consumed per sale.
               </div>
             )}
          </div>

          <button type="submit" className="w-full bg-tds-green text-tds-cream p-4 rounded-xl font-bold shadow-lg active:scale-95 transition-all">Save Recipe</button>
        </form>
      )}

      <div className="space-y-4">
        {menu.length === 0 && (
          <div className="text-center py-12 opacity-30 italic text-sm">No drinks created yet.</div>
        )}
        {menu.map(item => (
          <div key={item.id} className="bg-white rounded-3xl border border-tds-green/5 shadow-sm overflow-hidden flex flex-col group active:scale-[0.99] transition-all">
            <div className="p-4 flex gap-4 border-b border-tds-green/5">
              <div className="w-20 h-20 rounded-2xl overflow-hidden shrink-0 border border-tds-green/5">
                <img src={item.imageUrl} className="w-full h-full object-cover" />
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-tds-deep text-lg leading-tight">{item.name}</h3>
                    <div className={`text-[10px] font-bold uppercase tracking-wider ${item.isActive ? 'text-tds-green' : 'text-tds-green/30'}`}>
                      {item.isActive ? 'Available' : 'Unavailable'}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => updateMenuItem(item.id, { isActive: !item.isActive })}
                      className={`w-8 h-8 rounded-lg flex items-center justify-center border transition-colors ${
                        item.isActive ? 'bg-tds-green border-tds-green text-tds-cream' : 'bg-white border-tds-green/10 text-tds-green/30'
                      }`}
                    >
                      {item.isActive ? ICONS.Success : '•'}
                    </button>
                    <button 
                      onClick={() => { if(confirm(`Permanently delete "${item.name}" recipe?`)) deleteMenuItem(item.id); }} 
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-tds-red/30 hover:text-tds-red hover:bg-tds-red/5 transition-all"
                    >
                       {ICONS.Trash}
                    </button>
                  </div>
                </div>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {item.ingredients.map(ing => {
                    const s = stock.find(st => st.id === ing.stockItemId);
                    return (
                      <span key={ing.stockItemId} className="text-[9px] bg-tds-gold/10 text-tds-green px-2 py-0.5 rounded-full font-bold border border-tds-gold/20">
                        {ing.quantity}{s?.unit} {s?.name}
                      </span>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
