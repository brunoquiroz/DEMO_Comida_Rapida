import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, CreditCard, ShoppingBag } from 'lucide-react';
import { createOrder, CreateOrderData } from '../services/api';

export default function Checkout() {
  const { items, total, count, clear } = useCart();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    // Datos personales
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    
    // Dirección
    street: '',
    number: '',
    apartment: '',
    city: '',
    region: '',
    postalCode: '',
    
    // Nota adicional
    notes: ''
  });

  const [isProcessing, setIsProcessing] = useState(false);

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
              <span>{pi.ingredient.name} × {qty}</span>
              <span className="text-gray-500">{formatPrice(Number(pi.extra_cost) * Number(qty))}</span>
            </li>
          );
        })}
      </ul>
    );
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    try {
      // Preparar los datos de la orden en el formato que espera el backend
      const orderData: CreateOrderData = {
        customer_name: `${formData.firstName} ${formData.lastName}`,
        customer_phone: formData.phone,
        customer_email: formData.email,
        delivery_street: formData.street,
        delivery_number: formData.number,
        delivery_apartment: formData.apartment || undefined,
        delivery_city: formData.city,
        delivery_region: formData.region,
        notes: formData.notes || undefined,
        items: items.map(item => ({
          product_id: item.product.id.toString(),
          quantity: item.quantity.toString(),
          extras: Object.entries(item.customization.extraIngredientQuantities || {})
            .filter(([_, qty]) => (qty ?? 0) > 0)
            .reduce((acc, [ingredientIdStr, qty]) => {
              acc[ingredientIdStr] = qty!.toString();
              return acc;
            }, {} as { [ingredientId: string]: string }),
          included_ingredients: item.customization.includedIngredientIds?.map(id => id.toString()) || []  // Nuevo campo
        }))
      };

      // Crear la orden en la base de datos
      const createdOrder = await createOrder(orderData);
      
      alert(`¡Pedido #${createdOrder.id} realizado con éxito! Te contactaremos pronto para confirmar la entrega.`);
      clear();
      navigate('/');
    } catch (error) {
      console.error('Error al crear la orden:', error);
      alert('Error al procesar el pedido. Por favor, intenta nuevamente.');
    } finally {
      setIsProcessing(false);
    }
  };

  const isFormValid = () => {
    return formData.firstName && 
           formData.lastName && 
           formData.email && 
           formData.phone && 
           formData.street && 
           formData.number && 
           formData.city && 
           formData.region;
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <ShoppingBag className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Tu carrito está vacío</h2>
          <p className="text-gray-600 mb-6">Agrega algunos productos antes de proceder al checkout</p>
          <button
            onClick={() => navigate('/')}
            className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-semibold"
          >
            Volver al menú
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center mb-8">
          <button
            onClick={() => navigate('/')}
            className="flex items-center text-gray-600 hover:text-gray-900 mr-4"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Volver
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Checkout</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Formulario */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Datos Personales */}
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                  <MapPin className="w-5 h-5 mr-2" />
                  Información Personal
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nombre *
                    </label>
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Apellido *
                    </label>
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Teléfono *
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                    />
                  </div>
                </div>
              </div>

              {/* Dirección de Entrega */}
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Dirección de Entrega
                </h2>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Calle *
                      </label>
                      <input
                        type="text"
                        name="street"
                        value={formData.street}
                        onChange={handleInputChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Número *
                      </label>
                      <input
                        type="text"
                        name="number"
                        value={formData.number}
                        onChange={handleInputChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Departamento/Casa (opcional)
                    </label>
                    <input
                      type="text"
                      name="apartment"
                      value={formData.apartment}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Ciudad *
                      </label>
                      <input
                        type="text"
                        name="city"
                        value={formData.city}
                        onChange={handleInputChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Región *
                      </label>
                      <input
                        type="text"
                        name="region"
                        value={formData.region}
                        onChange={handleInputChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Código Postal
                      </label>
                      <input
                        type="text"
                        name="postalCode"
                        value={formData.postalCode}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Notas Adicionales */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notas adicionales (opcional)
                </label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  rows={3}
                  placeholder="Instrucciones especiales para la entrega, referencias del lugar, etc."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>

              {/* Botón de Pago */}
              <button
                type="submit"
                disabled={!isFormValid() || isProcessing}
                className="w-full bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white py-4 rounded-lg font-semibold text-lg flex items-center justify-center"
              >
                {isProcessing ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Procesando...
                  </>
                ) : (
                  <>
                    <CreditCard className="w-5 h-5 mr-2" />
                    Realizar Pedido - {formatPrice(total)}
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Resumen del Pedido */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Resumen del Pedido
            </h2>
            
            <div className="space-y-4 mb-6">
              {items.map((item, index) => (
                <div key={index} className="flex gap-3 pb-4 border-b border-gray-100 last:border-b-0">
                  <img
                    src={item.product.image_url || item.product.image}
                    alt={item.product.name}
                    className="w-16 h-16 object-cover rounded"
                  />
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900">{item.product.name}</h4>
                    <p className="text-sm text-gray-600">
                      {formatPrice(computeItemUnitTotal(index))} × {item.quantity}
                    </p>
                    {renderExtrasSummary(index)}
                    <div className="mt-2 font-semibold text-red-600">
                      {formatPrice(computeItemUnitTotal(index) * item.quantity)}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t pt-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-600">Subtotal ({count} productos)</span>
                <span className="font-semibold">{formatPrice(total)}</span>
              </div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-600">Envío</span>
                <span className="font-semibold text-green-600">Gratis</span>
              </div>
              <div className="flex justify-between items-center text-xl font-bold text-gray-900 pt-2 border-t">
                <span>Total</span>
                <span className="text-red-600">{formatPrice(total)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}