/**
 * CartContext — manages shopping cart state.
 * Persists cart to localStorage.
 */
import React, { createContext, useContext, useReducer, useEffect } from 'react';

const CartContext = createContext(null);

const cartReducer = (state, action) => {
  switch (action.type) {
    case 'ADD_ITEM': {
      const existing = state.items.find(i => i.id === action.payload.id);
      if (existing) {
        return {
          ...state,
          items: state.items.map(i =>
            i.id === action.payload.id
              ? { ...i, quantity: i.quantity + 1 }
              : i
          ),
        };
      }
      return { ...state, items: [...state.items, { ...action.payload, quantity: 1 }] };
    }
    case 'REMOVE_ITEM':
      return { ...state, items: state.items.filter(i => i.id !== action.payload) };

    case 'UPDATE_QTY': {
      if (action.payload.qty <= 0) {
        return { ...state, items: state.items.filter(i => i.id !== action.payload.id) };
      }
      return {
        ...state,
        items: state.items.map(i =>
          i.id === action.payload.id ? { ...i, quantity: action.payload.qty } : i
        ),
      };
    }
    case 'CLEAR':
      return { ...state, items: [] };

    case 'LOAD':
      return { ...state, items: action.payload };

    default:
      return state;
  }
};

export const CartProvider = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, { items: [] });

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('cart') || '[]');
      if (saved.length > 0) dispatch({ type: 'LOAD', payload: saved });
    } catch { /* ignore */ }
  }, []);

  // Persist cart to localStorage
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(state.items));
  }, [state.items]);

  const addItem    = (item) => dispatch({ type: 'ADD_ITEM', payload: item });
  const removeItem = (id)   => dispatch({ type: 'REMOVE_ITEM', payload: id });
  const updateQty  = (id, qty) => dispatch({ type: 'UPDATE_QTY', payload: { id, qty } });
  const clearCart  = ()    => dispatch({ type: 'CLEAR' });

  const itemCount   = state.items.reduce((sum, i) => sum + i.quantity, 0);
  const subtotal    = state.items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const TAX         = subtotal * 0.05;
  const DELIVERY    = state.items.length > 0 ? 30 : 0;
  const total       = subtotal + TAX + DELIVERY;

  const isInCart    = (id) => state.items.some(i => i.id === id);
  const getQty      = (id) => state.items.find(i => i.id === id)?.quantity || 0;

  return (
    <CartContext.Provider value={{
      items: state.items,
      itemCount, subtotal, total, TAX, DELIVERY,
      addItem, removeItem, updateQty, clearCart,
      isInCart, getQty,
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
};

export default CartContext;
