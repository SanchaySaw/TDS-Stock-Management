
import { useState, useEffect, useCallback } from 'react';
import { AppState, StockItem, MenuItem, Sale } from './types';
import { INITIAL_STOCK, INITIAL_MENU } from './constants';

const STORAGE_KEY = 'tds_stock_mgmt_v10_final';

const getInitialState = (): AppState => {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      return {
        stock: Array.isArray(parsed.stock) ? parsed.stock : JSON.parse(JSON.stringify(INITIAL_STOCK)),
        menu: Array.isArray(parsed.menu) ? parsed.menu : JSON.parse(JSON.stringify(INITIAL_MENU)),
        sales: Array.isArray(parsed.sales) ? parsed.sales : []
      };
    } catch (e) {
      console.error("Failed to parse storage", e);
    }
  }
  return {
    stock: JSON.parse(JSON.stringify(INITIAL_STOCK)),
    menu: JSON.parse(JSON.stringify(INITIAL_MENU)),
    sales: []
  };
};

export function useTdsStore() {
  const [state, setState] = useState<AppState>(getInitialState);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  const forceReset = useCallback(() => {
    const freshState = {
      stock: JSON.parse(JSON.stringify(INITIAL_STOCK)),
      menu: JSON.parse(JSON.stringify(INITIAL_MENU)),
      sales: []
    };
    setState(freshState);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(freshState));
    setTimeout(() => window.location.reload(), 100);
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
      const newStock = (prev.stock || []).filter(s => s.id !== id);
      const newMenu = (prev.menu || []).map(m => ({
        ...m,
        ingredients: (m.ingredients || []).filter(i => i.stockItemId !== id)
      }));
      return { ...prev, stock: newStock, menu: newMenu };
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
        throw new Error(`Insufficient stock for ${stockItem?.name || 'unknown item'}!`);
      }
    }

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
    forceReset
  };
}
