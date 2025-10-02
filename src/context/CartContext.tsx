import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { Product } from '../services/api';

export interface CartItemCustomization {
  includedIngredientIds: number[];
  extraIngredientQuantities: Record<number, number>; // ingredientId -> qty
}

export interface CartItem {
  product: Product;
  quantity: number;
  customization: CartItemCustomization;
}

interface CartContextValue {
  items: CartItem[];
  addItem: (product: Product, quantity?: number, customization?: Partial<CartItemCustomization>) => void;
  removeItem: (index: number) => void;
  updateQuantity: (index: number, quantity: number) => void;
  clear: () => void;
  count: number;
  total: number;
}

const CartContext = createContext<CartContextValue | undefined>(undefined);

function migrateLegacyCart(raw: string): CartItem[] {
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.map((item: any) => {
      const product: Product = item.product;
      const quantity: number = Number(item.quantity) || 1;
      const customization = item.customization || {};
      const includedLegacy: number[] = Array.isArray(customization.includedIngredientIds) ? customization.includedIngredientIds : [];
      const extraLegacy: number[] = Array.isArray(customization.extraIngredientIds) ? customization.extraIngredientIds : [];
      const extraQuantitiesLegacy: Record<number, number> = customization.extraIngredientQuantities || {};
      // Construir included por defecto si falta
      const defaultIncluded = (product?.product_ingredients || [])
        .filter((pi: any) => pi.default_included)
        .map((pi: any) => pi.ingredient.id);
      const includedIngredientIds = includedLegacy.length ? includedLegacy : defaultIncluded;
      // Migrar ids -> cantidades (1 por cada id)
      const extraIngredientQuantities: Record<number, number> = { ...extraQuantitiesLegacy };
      if (Array.isArray(extraLegacy)) {
        for (const id of extraLegacy) {
          const key = Number(id);
          extraIngredientQuantities[key] = Math.max(1, Number(extraIngredientQuantities[key] || 0));
        }
      }
      return {
        product,
        quantity,
        customization: {
          includedIngredientIds,
          extraIngredientQuantities,
        },
      } as CartItem;
    });
  } catch {
    return [];
  }
}

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>(() => {
    const raw = localStorage.getItem('cart');
    if (!raw) return [];
    return migrateLegacyCart(raw);
  });

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(items));
  }, [items]);

  const addItem = (product: Product, quantity: number = 1, customization?: Partial<CartItemCustomization>) => {
    const defaults: CartItemCustomization = {
      includedIngredientIds: (product.product_ingredients || [])
        .filter(pi => pi.default_included)
        .map(pi => pi.ingredient.id),
      extraIngredientQuantities: {},
    };
    const finalCustomization: CartItemCustomization = {
      includedIngredientIds: customization?.includedIngredientIds ?? defaults.includedIngredientIds,
      extraIngredientQuantities: customization?.extraIngredientQuantities ?? defaults.extraIngredientQuantities,
    };

    setItems(prev => [...prev, { product, quantity, customization: finalCustomization }]);
  };

  const removeItem = (index: number) => {
    setItems(prev => prev.filter((_, i) => i !== index));
  };

  const updateQuantity = (index: number, quantity: number) => {
    if (quantity <= 0) return removeItem(index);
    setItems(prev => prev.map((item, i) => i === index ? { ...item, quantity } : item));
  };

  const clear = () => setItems([]);

  const count = useMemo(() => items.reduce((sum, i) => sum + i.quantity, 0), [items]);

  const computeItemUnitTotal = (item: CartItem) => {
    const base = item.product.price || 0;
    const productIngredients = item.product.product_ingredients || [];
    const extrasTotal = Object.entries(item.customization.extraIngredientQuantities || {}).reduce((sum, [ingredientIdStr, qty]) => {
      const ingredientId = Number(ingredientIdStr);
      const quantity = Number(qty) || 0;
      if (quantity <= 0) return sum;
      const pi = productIngredients.find((pi: any) => pi.ingredient.id === ingredientId);
      if (!pi) return sum;
      return sum + Number(pi.extra_cost || 0) * quantity;
    }, 0);
    return base + extrasTotal;
  };

  const total = useMemo(() => items.reduce((sum, item) => sum + computeItemUnitTotal(item) * item.quantity, 0), [items]);

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, updateQuantity, clear, count, total }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart debe usarse dentro de CartProvider');
  return ctx;
}; 