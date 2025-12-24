
export enum StockType {
  LIQUID = 'Liquid',
  POWDER = 'Powder',
  SOLID = 'Solid',
  PIECE = 'Piece'
}

export type Unit = 'ml' | 'ltr' | 'gm' | 'kg' | 'pcs';

export interface StockItem {
  id: string;
  name: string;
  type: StockType;
  unit: Unit;
  remainingQuantity: number;
  alertThreshold: number;
}

export interface RecipeIngredient {
  stockItemId: string;
  quantity: number;
  unit: Unit;
}

export interface MenuItem {
  id: string;
  name: string;
  imageUrl: string;
  isActive: boolean;
  ingredients: RecipeIngredient[];
}

export interface Sale {
  id: string;
  timestamp: number;
  items: {
    menuItemId: string;
    quantity: number;
  }[];
}

export interface AppState {
  stock: StockItem[];
  menu: MenuItem[];
  sales: Sale[];
}
