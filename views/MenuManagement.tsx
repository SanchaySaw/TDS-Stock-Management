
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

// Internal type for the form to handle React keys correctly
interface IngredientFormItem extends RecipeIngredient {
  _id: string; // Temporary ID for form rendering
}

export const MenuManagement: React.FC<MenuManagementProps> = ({ menu, stock, addMenuItem, updateMenuItem, deleteMenuItem }) => {
  const [showAdd, setShowAdd] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Local state for the complex "New Item" form
  const [formName, setFormName] = useState('');
  const [formImage, setFormImage] = useState('https://images.unsplash.com/photo-1544145945-f904253d0c71?auto=format&fit=crop&q=80&w=400');
  const [formIngredients, setFormIngredients] = useState<IngredientFormItem[]>([]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const addIngredientSlot = () => {
    if (stock.length === 0) {
      alert("No Inventory! Add items in the Stock tab first.");
      return;
    }
    const newIngredient: IngredientFormItem = {
      _id: Math.random().toString(36).substr(2, 9),
      stockItemId: stock[0].id,
      quantity: 1,
      unit: stock[0].unit
    };
    setFormIngredients(prev => [...prev, newIngredient]);
  };

  const removeIngredientSlot = (id: string) => {
    setFormIngredients(prev => prev.filter(ing => ing._id !== id));
  };

  const updateIngredientSlot = (id: string, updates: Partial<RecipeIngredient>) => {
    setFormIngredients(prev => prev.map(ing => {
      if (ing._id === id) {
        const nextStockId = updates.stockItemId || ing.stockItemId;
        const stockItem = stock.find(s => s.id === nextStockId);
        return { 
          ...ing, 
          ...updates, 
          unit: stockItem ? stockItem.unit : ing.unit 
        };
      }
      return ing;
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      alert("Please enter a name for this drink.");
      return;
    }
    if (formIngredients.length === 0) {
      alert("A recipe needs at least one ingredient. Click '+ Add Ingredient'.");
      return;
    }
    
    // Convert form items back to store items (strip _id)
    const finalIngredients: RecipeIngredient[] = formIngredients.map(({ _id, ...rest }) => ({ ...rest }));

    addMenuItem({
      name: formName,
      imageUrl: formImage,
      isActive: true,
      ingredients: finalIngredients
    });

    // Reset Form
    setShowAdd(false);
    setFormName('');
    setFormImage('https://images.unsplash.com/photo-1544145945-f904253d0c71?auto=format&fit=crop&q=80&w=400');
    setFormIngredients([]);
  };

  return (
    <div className="space-y-6 pb-12">
      <div className="flex justify-between items-center">
        <h2 className="text-sm font-bold text-tds-green/60 uppercase tracking-widest">Recipe Builder</h2>
        <button 
          type="button"
          onClick={() => setShowAdd(!showAdd)}
          className={`px-4 py-2 rounded-xl flex items-center gap-2 text-xs font-bold transition-all shadow-md ${
            showAdd ? 'bg-tds-red text-white' : 'bg-tds-green text-tds-cream'
          }`}
        >
          {showAdd ? ICONS.Trash : ICONS.Plus}
          {showAdd ? 'Discard' : 'New Drink'}
        </button>
      </div>

      {showAdd && (
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-[32px] border border-tds-green/10 space-y-6 animate-in slide-in-from-top-4 shadow-xl">
          <div className="space-y-4">
             <div className="relative w-full h-40 rounded-2xl bg-tds-cream overflow-hidden border border-tds-green/10 group">
                <img src={formImage} className="w-full h-full object-cover" alt="Drink Preview" />
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                >
                  <div className="bg-white/20 p-2 rounded-full text-white mb-2">{ICONS.Edit}</div>
                  <span className="text-white text-[10px] font-bold uppercase tracking-wider">Change Image</span>
                </div>
                <input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/*" className="hidden" />
             </div>
             
             <div className="space-y-2">
                <label className="block text-[10px] font-bold text-tds-green/40 uppercase tracking-widest px-1">Drink Name</label>
                <input 
                  type="text" 
                  className="w-full bg-tds-cream/50 border border-tds-green/10 p-3 rounded-xl outline-none focus:border-tds-gold font-bold text-tds-deep placeholder:font-normal"
                  value={formName}
                  onChange={e => setFormName(e.target.value)}
                  placeholder="e.g. Signature Mocha"
                  required
                />
             </div>
          </div>

          <div className="space-y-4 pt-4 border-t border-tds-green/5">
             <div className="flex justify-between items-center">
                <label className="block text-[10px] font-bold text-tds-green/40 uppercase tracking-widest">Ingredients & Logic</label>
                <button 
                  type="button" 
                  onClick={addIngredientSlot} 
                  className="text-[10px] font-bold text-tds-gold flex items-center gap-1 bg-tds-gold/10 px-3 py-2 rounded-full active:scale-95 transition-all"
                >
                  {ICONS.Plus} Add Ingredient
                </button>
             </div>
             
             <div className="space-y-2">
               {formIngredients.map((ing) => (
                  <div key={ing._id} className="flex gap-2 items-center bg-tds-cream/20 p-2 rounded-2xl border border-tds-green/5 animate-in fade-in slide-in-from-right-2">
                     <div className="flex-1">
                        <select 
                          className="w-full bg-white border border-tds-green/10 p-2.5 rounded-xl text-xs outline-none font-medium"
                          value={ing.stockItemId}
                          onChange={e => updateIngredientSlot(ing._id, { stockItemId: e.target.value })}
                        >
                           {stock.map(s => <option key={s.id} value={s.id}>{s.name} ({s.unit})</option>)}
                        </select>
                     </div>
                     <div className="w-20">
                        <input 
                          type="number" 
                          placeholder="Qty"
                          className="w-full bg-white border border-tds-green/10 p-2.5 rounded-xl text-xs outline-none text-center font-bold"
                          value={ing.quantity || ''}
                          onChange={e => updateIngredientSlot(ing._id, { quantity: Number(e.target.value) || 0 })}
                          required
                        />
                     </div>
                     <button 
                      type="button" 
                      onClick={() => removeIngredientSlot(ing._id)} 
                      className="p-2.5 text-tds-red bg-white border border-tds-red/10 rounded-xl active:scale-90 transition-all"
                     >
                       {ICONS.Trash}
                     </button>
                  </div>
               ))}
               {formIngredients.length === 0 && (
                 <div className="py-6 text-center bg-tds-cream/10 rounded-2xl border-2 border-dashed border-tds-green/5 text-[10px] text-tds-green/30 uppercase font-black tracking-widest">
                    Empty Recipe
                 </div>
               )}
             </div>
          </div>

          <button 
            type="submit" 
            className="w-full bg-tds-green text-tds-cream p-5 rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg active:scale-95 transition-all"
          >
            Create Recipe
          </button>
        </form>
      )}

      <div className="space-y-4">
        {menu.length === 0 && (
          <div className="text-center py-16 opacity-30 italic text-sm">No recipes created yet.</div>
        )}
        {menu.map(item => (
          <div key={item.id} className="bg-white rounded-[32px] border border-tds-green/5 shadow-sm overflow-hidden flex flex-col animate-in fade-in duration-300">
            <div className="p-4 flex gap-4 border-b border-tds-green/5">
              <div className="w-24 h-24 rounded-2xl overflow-hidden shrink-0 border border-tds-green/5 shadow-inner">
                <img src={item.imageUrl} className="w-full h-full object-cover" alt={item.name} />
              </div>
              <div className="flex-1 py-1">
                <div className="flex justify-between items-start">
                  <div className="pr-4">
                    <h3 className="font-bold text-tds-deep text-lg leading-tight mb-1">{item.name}</h3>
                    <div className={`text-[10px] font-black uppercase tracking-widest ${item.isActive ? 'text-tds-green' : 'text-tds-red/50'}`}>
                      {item.isActive ? 'Active on Menu' : 'Inactive'}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      type="button"
                      onClick={() => updateMenuItem(item.id, { isActive: !item.isActive })}
                      className={`w-10 h-10 rounded-xl flex items-center justify-center border transition-all active:scale-90 ${
                        item.isActive ? 'bg-tds-green border-tds-green text-tds-cream' : 'bg-white border-tds-green/10 text-tds-green/20'
                      }`}
                      title={item.isActive ? 'Deactivate' : 'Activate'}
                    >
                      {item.isActive ? ICONS.Success : '•'}
                    </button>
                    <button 
                      type="button"
                      className="w-10 h-10 bg-tds-red/5 text-tds-red flex items-center justify-center rounded-xl active:bg-tds-red active:text-white transition-all shadow-sm active:scale-90"
                      onClick={() => deleteMenuItem(item.id)}
                      aria-label="Delete Recipe"
                    >
                       {ICONS.Trash}
                    </button>
                  </div>
                </div>
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {item.ingredients.map((ing, idx) => {
                    const s = stock.find(st => st.id === ing.stockItemId);
                    // Use composite key for display to avoid duplicate key warnings if same stock item used twice
                    return (
                      <span key={`${ing.stockItemId}-${idx}`} className="text-[9px] bg-tds-cream text-tds-green px-2 py-0.5 rounded-full font-black border border-tds-green/5 uppercase tracking-tighter">
                        {ing.quantity}{s?.unit || ing.unit} {s?.name || 'Item'}
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
