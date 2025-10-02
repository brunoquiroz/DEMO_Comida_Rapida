import React, { useState, useEffect } from 'react';
import { getProducts, getCategories, calculateProductPrice, getProduct } from '../../services/api';
import { Product as APIProduct, Category } from '../../services/api';
import { useCart } from '../../context/CartContext';

interface ProductModalProps {
  product: APIProduct | null;
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (product: APIProduct, customization: { includedIngredientIds: number[]; extraIngredientQuantities: Record<number, number> }) => void;
}

function ProductModal({ product, isOpen, onClose, onAddToCart }: ProductModalProps) {
  const [included, setIncluded] = useState<number[]>([]);
  const [extraQty, setExtraQty] = useState<Record<number, number>>({}); // ingredientId -> qty
  const [serverBase, setServerBase] = useState<number | null>(null);
  const [serverExtras, setServerExtras] = useState<number | null>(null);
  const [serverTotal, setServerTotal] = useState<number | null>(null);

  useEffect(() => {
    if (product) {
      const defaults = (product.product_ingredients || []).filter(pi => pi.default_included).map(pi => pi.ingredient.id);
      setIncluded(defaults);
      setExtraQty({});
      setServerBase(null);
      setServerExtras(null);
      setServerTotal(null);
    }
  }, [product]);

  useEffect(() => {
    if (!product) return;
    const extraIds = Object.entries(extraQty).filter(([_, qty]) => (qty ?? 0) > 0).map(([id]) => Number(id));
    (async () => {
      try {
        const resp = await calculateProductPrice(product.id, extraIds);
        setServerBase(Number(resp.base_price));
        setServerExtras(Number(resp.extras_total));
        setServerTotal(Number(resp.total));
      } catch (e) {
        setServerBase(null);
        setServerExtras(null);
        setServerTotal(null);
      }
    })();
  }, [product, extraQty]);

  if (!isOpen || !product) return null;

  const toggleIncluded = (id: number) => {
    setIncluded(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const changeExtraQty = (id: number, delta: number) => {
    setExtraQty(prev => {
      const next = { ...prev };
      const newQty = Math.max(0, (next[id] ?? 0) + delta);
      if (newQty === 0) delete next[id]; else next[id] = newQty;
      return next;
    });
  };

  // Función mejorada para calcular el total de extras en tiempo real
  const computeExtrasTotalLocal = () => {
    return (product.product_ingredients || []).reduce((sum, pi) => {
      const qty = extraQty[pi.ingredient.id] ?? 0;
      if (qty <= 0) return sum;
      return sum + Number(pi.extra_cost || 0) * qty;
    }, 0);
  };

  // Función mejorada para calcular el precio total en tiempo real
  const computeUnitPriceLocal = () => {
    const base = Number(product.price) || 0;
    const extrasTotal = computeExtrasTotalLocal();
    return base + extrasTotal;
  };

  // Usar siempre el cálculo local para asegurar actualización en tiempo real
  const basePrice = Number(product.price) || 0;
  const extrasTotal = computeExtrasTotalLocal();
  const unitTotal = computeUnitPriceLocal();

  const formatPrice = (price: number) => new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(price);

  const includedList = (product.product_ingredients || []).filter(pi => pi.default_included);
  const extrasList = (product.product_ingredients || []).filter(pi => pi.is_active && (!pi.default_included || Number(pi.extra_cost) > 0));

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <div className="relative flex-shrink-0">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 bg-white rounded-full p-2 shadow-lg hover:bg-gray-100 transition"
          >
            ✕
          </button>
          {product.image_url || product.image ? (
            <img src={product.image_url || product.image} alt={product.name} className="w-full h-64 object-cover" />
          ) : (
            <div className="w-full h-64 bg-gray-100 flex items-center justify-center">
              <div className="text-center text-gray-400">
                <div className="text-4xl mb-2">🍽️</div>
                <p className="text-sm">Sin imagen</p>
              </div>
            </div>
          )}
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <div className="flex items-start justify-between gap-6 mb-6">
            <div className="flex-1">
              <h3 className="text-2xl font-bold text-gray-900">{product.name}</h3>
              <p className="text-gray-600 mt-1">{product.description}</p>
              {product.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {product.tags.map(tag => (
                    <span key={tag.id} className="bg-red-100 text-red-600 px-2 py-1 rounded-full text-xs font-medium">{tag.name}</span>
                  ))}
                </div>
              )}
              
              {/* Incluidos por defecto - mantener aquí debajo del título */}
              {(product.product_ingredients && product.product_ingredients.length > 0) && includedList.length > 0 && (
                <div className="mt-6">
                  <h4 className="font-semibold text-gray-900 mb-2">Incluidos por defecto</h4>
                  <p className="text-xs text-gray-500 mb-3">Puedes quitar ingredientes sin costo adicional.</p>
                  <div className="flex flex-wrap gap-2">
                    {includedList.map(pi => {
                      const isKept = included.includes(pi.ingredient.id);
                      return (
                        <button
                          key={pi.id}
                          type="button"
                          onClick={() => toggleIncluded(pi.ingredient.id)}
                          className={`px-3 py-1 rounded-full border text-sm transition ${
                            isKept ? 'bg-green-50 text-green-700 border-green-300' : 'bg-white text-gray-600 border-gray-300 line-through'
                          }`}
                          title={isKept ? 'Mantener' : 'Quitar'}
                        >
                          {pi.ingredient.name}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
            
            {/* Sección de extras a la altura del título */}
            {(product.product_ingredients && product.product_ingredients.length > 0) && extrasList.length > 0 && (
              <div className="flex-1 max-w-md">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold text-gray-900">Agrega extras</h4>
                  <span className="text-xs text-gray-500">Precio por unidad</span>
                </div>
                <div className="space-y-3">
                  {extrasList.map(pi => {
                    const qty = extraQty[pi.ingredient.id] ?? 0;
                    const unitPrice = Number(pi.extra_cost);
                    const totalPrice = unitPrice * qty;
                    
                    return (
                      <div key={pi.id} className="flex items-center justify-between border rounded-xl p-3 bg-gray-50">
                        <div className="flex-1">
                          <div className="font-medium text-gray-900">{pi.ingredient.name}</div>
                          <div className="text-xs text-gray-600">
                            <span className="text-xs-600 font-semibold">{formatPrice(unitPrice)}</span> por unidad
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => changeExtraQty(pi.ingredient.id, -1)}
                            className="w-8 h-8 border rounded flex items-center justify-center hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={qty <= 0}
                          >
                            -
                          </button>
                          <span className="w-8 text-center font-medium text-gray-900">{qty}</span>
                          <button
                            type="button"
                            onClick={() => changeExtraQty(pi.ingredient.id, 1)}
                            className="w-8 h-8 border rounded flex items-center justify-center hover:bg-gray-50"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer fijo */}
        <div className="border-t p-4 bg-white flex items-center justify-between flex-shrink-0">
          <div>
            <div className="text-xs text-gray-500 space-y-1">
              <div>Precio base: {formatPrice(basePrice)}</div>
              {extrasTotal > 0 && (
                <div>Extras: {formatPrice(extrasTotal)}</div>
              )}
            </div>
            <div className="text-2xl font-bold text-red-600">{formatPrice(unitTotal)}</div>
          </div>
          <button
            className="bg-red-600 hover:bg-red-700 text-white px-5 py-3 rounded-lg font-semibold transition-colors"
            onClick={() => onAddToCart(product, { includedIngredientIds: included, extraIngredientQuantities: extraQty })}
          >
            Agregar al carrito
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Menu() {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [selectedProduct, setSelectedProduct] = useState<APIProduct | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [products, setProducts] = useState<APIProduct[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { addItem } = useCart();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [productsData, categoriesData] = await Promise.all([
        getProducts(),
        getCategories()
      ]);
      const activeProducts = productsData.filter(product => product.is_active);
      setProducts(activeProducts);
      const allCategory: Category = { id: 0, name: 'Todos', icon: '🍽️', products_count: activeProducts.length };
      setCategories([allCategory, ...categoriesData]);
    } catch (error) {
      console.error('Error fetching menu data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredProducts = activeCategory === 'all' 
    ? products 
    : products.filter(product => product.category.toString() === activeCategory);

  const openModal = async (product: APIProduct) => {
    try {
      const detail = await getProduct(String(product.id));
      setSelectedProduct(detail);
    } catch (e) {
      setSelectedProduct(product);
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedProduct(null);
  };

  const formatPrice = (price: number) => new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(price);

  const handleAddToCart = (product: APIProduct, customization: { includedIngredientIds: number[]; extraIngredientQuantities: Record<number, number> }) => {
    addItem(product, 1, customization);
    closeModal();
  };

  if (isLoading) {
    return (
      <section id="menu" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando menú...</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="menu" className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Nuestro Menú</h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">Descubre nuestros sabores únicos, preparados al momento con los mejores ingredientes</p>
        </div>
        <div className="flex flex-wrap justify-center gap-4 mb-12">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setActiveCategory(category.id === 0 ? 'all' : category.id.toString())}
              className={`px-6 py-3 rounded-full font-semibold transition-all duration-300 ${
                (category.id === 0 && activeCategory === 'all') || category.id.toString() === activeCategory
                  ? 'bg-red-600 text-white shadow-lg transform scale-105'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              <span className="mr-2">{category.icon}</span>
              {category.name}
            </button>
          ))}
        </div>
        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {filteredProducts.map((product) => (
              <div
                key={product.id}
                onClick={() => openModal(product)}
                className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 cursor-pointer group"
              >
                <div className="relative overflow-hidden">
                  {product.image_url || product.image ? (
                    <img src={product.image_url || product.image} alt={product.name} className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-300" />
                  ) : (
                    <div className="w-full h-48 bg-gray-100 flex items-center justify-center group-hover:bg-gray-200 transition-colors duration-300">
                      <div className="text-center text-gray-400">
                        <div className="text-3xl mb-2">🍽️</div>
                        <p className="text-sm">Sin imagen</p>
                      </div>
                    </div>
                  )}
                  {product.tags.length > 0 && (
                    <div className="absolute top-4 left-4 flex gap-1">
                      {product.tags.slice(0, 2).map((tag) => (
                        <span key={tag.id} className="bg-red-600 text-white px-3 py-1 rounded-full text-sm font-medium">{tag.name}</span>
                      ))}
                    </div>
                  )}
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{product.name}</h3>
                  <p className="text-gray-600 mb-4 text-sm line-clamp-2">{product.description}</p>
                  <div className="flex items-center justify-between">
                    <p className="text-2xl font-bold text-red-600">{formatPrice(product.price)}</p>
                    <span className="text-sm text-gray-500">{product.category_name}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🍽️</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No hay productos disponibles</h3>
            <p className="text-gray-600">{activeCategory === 'all' ? 'Aún no hay productos en el menú' : 'No hay productos en esta categoría'}</p>
          </div>
        )}
      </div>

      <ProductModal product={selectedProduct} isOpen={isModalOpen} onClose={closeModal} onAddToCart={handleAddToCart} />
    </section>
  );
}