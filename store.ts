
import { useState, useEffect, useCallback } from 'react';
import { AppState, StockItem, MenuItem, Sale, RecipeIngredient } from './types';
import { INITIAL_STOCK, INITIAL_MENU } from './constants';

// Bumped storage key to v5 to reset with the new 'gm' units and ensure deletion works
const STORAGE_KEY = 'tds_stock_mgmt_v5_final';

export function useTdsStore() {
  const [state, setState] = useState<AppState>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return {
          stock: Array.isArray(parsed.stock) ? parsed.stock : [...INITIAL_STOCK],
          menu: Array.isArray(parsed.menu) ? parsed.menu : [...INITIAL_MENU],
          sales: Array.isArray(parsed.sales) ? parsed.sales : []
        };
      } catch (e) {
        console.error("Failed to parse storage", e);
      }
    }
    return {
      stock: [...INITIAL_STOCK],
      menu: [...INITIAL_MENU],
      sales: []
    };
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  const resetData = useCallback(() => {
    if (window.confirm("Reset all data to defaults? This clears all sales history.")) {
      const freshState = {
        stock: [...INITIAL_STOCK],
        menu: [...INITIAL_MENU],
        sales: []
      };
      setState(freshState);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(freshState));
      setTimeout(() => window.location.reload(), 100);
    }
  }, []);

  const addStockItem = useCallback((item: Omit<StockItem, 'id'>) => {
    const newItem = { 
      ...item, 
      id: 's' + Date.now() + Math.random().toString(36).substr(2, 4) 
    };
    setState(prev => ({ 
      ...prev, 
      stock: [...(prev.stock || []), newItem] 
    }));
  }, []);

  const updateStockQuantity = useCallback((id: string, amount: number) => {
    setState(prev => ({
      ...prev,
      stock: (prev.stock || []).map(s => 
        s.id === id ? { ...s, remainingQuantity: Math.max(0, s.remainingQuantity + amount) } : s
      )
    }));
  }, []);

  const deleteStockItem = useCallback((id: string) => {
    setState(prev => {
      // Create fresh copies of arrays
      const currentStock = prev.stock || [];
      const currentMenu = prev.menu || [];
      
      const updatedStock = currentStock.filter(s => s.id !== id);
      const updatedMenu = currentMenu.map(m => ({
        ...m,
        ingredients: (m.ingredients || []).filter(i => i.stockItemId !== id)
      }));

      return {
        ...prev,
        stock: updatedStock,
        menu: updatedMenu
      };
    });
  }, []);

  const addMenuItem = useCallback((item: Omit<MenuItem, 'id'>) => {
    const newItem = { 
      ...item, 
      id: 'm' + Date.now() + Math.random().toString(36).substr(2, 4) 
    };
    setState(prev => ({ 
      ...prev, 
      menu: [...(prev.menu || []), newItem] 
    }));
  }, []);

  const updateMenuItem = useCallback((id: string, updates: Partial<MenuItem>) => {
    setState(prev => ({
      ...prev,
      menu: (prev.menu || []).map(m => m.id === id ? { ...m, ...updates } : m)
    }));
  }, []);

  const deleteMenuItem = useCallback((id: string) => {
    setState(prev => ({
      ...prev,
      menu: (prev.menu || []).filter(m => m.id !== id)
    }));
  }, []);

  const recordSale = useCallback((items: { menuItemId: string, quantity: number }[]) => {
    let canProceed = true;
    const requiredStock: Record<string, number> = {};

    items.forEach(saleItem => {
      const menuItem = (state.menu || []).find(m => m.id === saleItem.menuItemId);
      if (!menuItem) return;

      (menuItem.ingredients || []).forEach(ing => {
        requiredStock[ing.stockItemId] = (requiredStock[ing.stockItemId] || 0) + (ing.quantity * saleItem.quantity);
      });
    });

    for (const [stockId, qty] of Object.entries(requiredStock)) {
      const stockItem = (state.stock || []).find(s => s.id === stockId);
      if (!stockItem || stockItem.remainingQuantity < qty) {
        canProceed = false;
        break;
      }
    }

    if (!canProceed) throw new Error("Insufficient stock for this sale!");

    const updatedStock = (state.stock || []).map(s => {
      const deduction = requiredStock[s.id] || 0;
      return { ...s, remainingQuantity: s.remainingQuantity - deduction };
    });

    const newSale: Sale = {
      id: 'sl' + Date.now() + Math.random().toString(36).substr(2, 4),
      timestamp: Date.now(),
      items
    };

    setState(prev => ({
      ...prev,
      stock: updatedStock,
      sales: [...(prev.sales || []), newSale]
    }));

    return true;
  }, [state.menu, state.stock]);

  return {
    ...state,
    addStockItem,
    updateStockQuantity,
    deleteStockItem,
    addMenuItem,
    updateMenuItem,
    deleteMenuItem,
    recordSale,
    resetData
  };
}
