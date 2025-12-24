
import React from 'react';
import { 
  LayoutDashboard, 
  Package, 
  Coffee, 
  ShoppingCart, 
  BarChart3, 
  AlertTriangle,
  Plus,
  Minus,
  Trash2,
  Edit,
  ChevronRight,
  Download,
  CheckCircle2,
  XCircle
} from 'lucide-react';

export const COLORS = {
  primary: '#0E3B2E',
  deep: '#0A2A21',
  cream: '#F5EEDC',
  gold: '#C6A969',
  error: '#C0392B'
};

export const ICONS = {
  Dashboard: <LayoutDashboard size={20} />,
  Stock: <Package size={20} />,
  Menu: <Coffee size={20} />,
  Sales: <ShoppingCart size={20} />,
  Reports: <BarChart3 size={20} />,
  Warning: <AlertTriangle size={20} />,
  Plus: <Plus size={20} />,
  Minus: <Minus size={20} />,
  Trash: <Trash2 size={20} />,
  Edit: <Edit size={20} />,
  ArrowRight: <ChevronRight size={20} />,
  Download: <Download size={20} />,
  Success: <CheckCircle2 size={20} />,
  Error: <XCircle size={20} />
};

export const INITIAL_STOCK: any[] = [
  { id: 's1', name: 'Whole Milk', type: 'Liquid', unit: 'ml', remainingQuantity: 5000, alertThreshold: 1000 },
  { id: 's2', name: 'Coffee Syrup', type: 'Liquid', unit: 'ml', remainingQuantity: 2500, alertThreshold: 500 },
  { id: 's3', name: 'Chocolate Powder', type: 'Powder', unit: 'gm', remainingQuantity: 1000, alertThreshold: 200 },
  { id: 's4', name: 'Ice Cubes', type: 'Solid', unit: 'gm', remainingQuantity: 10000, alertThreshold: 2000 },
  { id: 's5', name: 'Standard Cup', type: 'Piece', unit: 'pcs', remainingQuantity: 100, alertThreshold: 20 },
  { id: 's6', name: 'Paper Straw', type: 'Piece', unit: 'pcs', remainingQuantity: 150, alertThreshold: 30 },
];

export const INITIAL_MENU: any[] = [
  {
    id: 'm1',
    name: 'Cold Coffee',
    imageUrl: 'https://images.unsplash.com/photo-1517701604599-bb29b565090c?auto=format&fit=crop&q=80&w=400',
    isActive: true,
    ingredients: [
      { stockItemId: 's1', quantity: 200, unit: 'ml' },
      { stockItemId: 's2', quantity: 30, unit: 'ml' },
      { stockItemId: 's4', quantity: 150, unit: 'gm' },
      { stockItemId: 's5', quantity: 1, unit: 'pcs' },
      { stockItemId: 's6', quantity: 1, unit: 'pcs' },
    ]
  },
  {
    id: 'm2',
    name: 'Iced Chocolate',
    imageUrl: 'https://images.unsplash.com/photo-1544145945-f904253d0c71?auto=format&fit=crop&q=80&w=400',
    isActive: true,
    ingredients: [
      { stockItemId: 's1', quantity: 250, unit: 'ml' },
      { stockItemId: 's3', quantity: 40, unit: 'gm' },
      { stockItemId: 's4', quantity: 120, unit: 'gm' },
      { stockItemId: 's5', quantity: 1, unit: 'pcs' },
      { stockItemId: 's6', quantity: 1, unit: 'pcs' },
    ]
  }
];
