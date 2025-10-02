import React, { useState } from 'react';
import { useCart } from '../../context/CartContext';
import { useNavigate } from 'react-router-dom';

export default function CartDrawer() {
  const { items, updateQuantity, removeItem, total, count } = useCart();
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const formatPrice = (price: number) =>
    new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(price);

  const computeItemUnitTotal = (index: number) => {
    const item = items[index];
    const base = item.product.price;
    const extrasTotal = Object.entries(item.customization.extraIngredientQuantities || {}).reduce((sum, [ingredientIdStr, qty]) => {
      const ingredientId = Number(ingredientIdStr);
      if (!qty || qty <= 0) return sum;
      const pi = (item.product.product_ingredients || []).find(pi => pi.ingredient.id === ingredientId);
      if (!pi) return sum;
      return sum + Number(pi.extra_cost || 0) * qty;
    }, 0);
    return base + extrasTotal;
  };

  const renderExtrasSummary = (index: number) => {
    const item = items[index];
    const entries = Object.entries(item.customization.extraIngredientQuantities || {}).filter(([_, qty]) => (qty ?? 0) > 0);
    if (entries.length === 0) return null;
    return (
      <ul className="mt-1 text-xs text-gray-600 space-y-1">
        {entries.map(([ingredientIdStr, qty]) => {
          const ingredientId = Number(ingredientIdStr);
          const pi = (item.product.product_ingredients || []).find(pi => pi.ingredient.id === ingredientId);
          if (!pi) return null;
          return (
            <li key={ingredientId} className="flex justify-between">
              <span>
                {pi.ingredient.name} × {qty}
              </span>
              <span className="text-gray-500">{formatPrice(Number(pi.extra_cost) * Number(qty))}</span>
            </li>
          );
        })}
      </ul>
    );
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="fixed top-16 right-6 bg-red-600 text-white rounded-full shadow-lg px-5 py-4 font-semibold z-40"
      >
        🛒 {count}
      </button>

      {open && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-0 h-full w-full sm:w-[420px] bg-white shadow-xl p-4 overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold">Tu carrito</h3>
              <button onClick={() => setOpen(false)} className="text-gray-600">✕</button>
            </div>

            {items.length === 0 ? (
              <p className="text-gray-600">Tu carrito está vacío</p>
            ) : (
              <>
                <ul className="space-y-4">
                  {items.map((item, index) => (
                    <li key={index} className="flex gap-3">
                      <img
                        src={item.product.image_url || item.product.image}
                        alt={item.product.name}
                        className="w-16 h-16 object-cover rounded"
                      />
                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="font-semibold">{item.product.name}</h4>
                            <p className="text-sm text-gray-600">{formatPrice(computeItemUnitTotal(index))} c/u</p>
                          </div>
                          <button onClick={() => removeItem(index)} className="text-red-600">Eliminar</button>
                        </div>
                        {renderExtrasSummary(index)}
                        <div className="flex items-center justify-between mt-2">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => updateQuantity(index, item.quantity - 1)}
                              className="px-2 py-1 border rounded"
                            >-</button>
                            <span className="w-8 text-center">{item.quantity}</span>
                            <button
                              onClick={() => updateQuantity(index, item.quantity + 1)}
                              className="px-2 py-1 border rounded"
                            >+</button>
                          </div>
                          <div className="font-semibold text-red-600">{formatPrice(computeItemUnitTotal(index) * item.quantity)}</div>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>

                <div className="mt-6 border-t pt-4">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-gray-600">Total</span>
                    <span className="text-xl font-bold text-red-600">{formatPrice(total)}</span>
                  </div>
                  <button
                    onClick={() => { setOpen(false); navigate('/checkout'); }}
                    className="w-full bg-red-600 hover:bg-red-700 text-white py-3 rounded-lg font-semibold"
                  >
                    Ir al checkout
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}