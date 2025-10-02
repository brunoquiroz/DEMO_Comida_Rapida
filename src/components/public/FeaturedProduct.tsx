import React, { useState, useEffect } from 'react';
import { Star, Clock, Users, ShoppingCart } from 'lucide-react';
import { getFeaturedProduct, type FeaturedProduct, type Product } from '../../services/api';
import { useCart } from '../../context/CartContext';

export default function FeaturedProduct() {
  const [featuredData, setFeaturedData] = useState<FeaturedProduct | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const { addItem } = useCart();

  useEffect(() => {
    const fetchFeaturedData = async () => {
      try {
        const data = await getFeaturedProduct();
        setFeaturedData(data);
      } catch (error) {
        console.error('Error fetching featured product data:', error);
        // Datos por defecto si no hay datos en la API
        setFeaturedData({
          id: 1,
          name: 'Combo Familiar Deluxe',
          description: 'El combo perfecto para compartir en familia. Incluye 4 hamburguesas clásicas, papas familiares, 4 bebidas grandes y salsa extra. Una experiencia gastronómica que une a toda la familia.',
          price: 49900,
          original_price: 65000,
          discount_percentage: 23,
          image: 'https://images.pexels.com/photos/1633578/pexels-photo-1633578.jpeg?auto=compress&cs=tinysrgb&w=800',
          image_url: 'https://images.pexels.com/photos/1633578/pexels-photo-1633578.jpeg?auto=compress&cs=tinysrgb&w=800',
          preparation_time: '15-20 min',
          servings: '4 personas',
          rating: 4.9,
          reviews_count: 150,
          discount_amount: 15100,
          discount_percentage_calculated: 23,
          is_active: true,
          created_at: '',
          updated_at: ''
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchFeaturedData();
  }, []);

  const handleAddToCart = async () => {
    if (!featuredData) return;
    
    setIsAdding(true);
    
    try {
      // Convertir FeaturedProduct a Product para el carrito
      const productForCart: Product = {
        id: featuredData.id,
        name: featuredData.name,
        description: featuredData.description,
        price: featuredData.price,
        category: 1, // Categoría por defecto
        category_name: 'Destacados',
        category_icon: '⭐',
        image: featuredData.image,
        image_url: featuredData.image_url,
        is_active: featuredData.is_active,
        tags: [],
        product_ingredients: [], // Sin ingredientes personalizables
        created_at: featuredData.created_at,
        updated_at: featuredData.updated_at
      };

      // Añadir al carrito con configuración por defecto
      addItem(productForCart, 1, {
        includedIngredientIds: [],
        extraIngredientQuantities: {}
      });

      // Mostrar feedback visual
      setTimeout(() => {
        setIsAdding(false);
      }, 1000);
      
    } catch (error) {
      console.error('Error al añadir al carrito:', error);
      setIsAdding(false);
    }
  };

  if (isLoading) {
    return (
      <section className="py-16 bg-gradient-to-br from-red-50 to-orange-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">Cargando producto destacado...</p>
          </div>
        </div>
      </section>
    );
  }

  if (!featuredData) {
    return null;
  }

  return (
    <section className="py-16 bg-gradient-to-br from-red-50 to-orange-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Producto Destacado
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Descubre nuestro plato estrella, preparado con los mejores ingredientes 
            y el toque especial de nuestros chefs.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Image */}
          <div className="relative">
            <img
              src={featuredData.image_url || featuredData.image}
              alt={featuredData.name}
              className="rounded-2xl shadow-2xl w-full h-96 object-cover"
            />
            {featuredData.discount_percentage > 0 && (
              <div className="absolute -top-4 -right-4 bg-red-500 text-white px-4 py-2 rounded-full font-bold">
                ¡OFERTA!
              </div>
            )}
          </div>

          {/* Content */}
          <div className="space-y-6">
            <div className="flex items-center gap-2">
              <div className="flex text-yellow-400">
                {[...Array(Math.floor(featuredData.rating))].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-current" />
                ))}
              </div>
              <span className="text-gray-600">
                {featuredData.rating} ({featuredData.reviews_count}+ reseñas)
              </span>
            </div>

            <h3 className="text-3xl font-bold text-gray-900">
              {featuredData.name}
            </h3>

            <p className="text-gray-600 text-lg leading-relaxed">
              {featuredData.description}
            </p>

            <div className="flex items-center gap-6 text-gray-600">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                <span>{featuredData.preparation_time}</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                <span>{featuredData.servings}</span>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="text-3xl font-bold text-red-500">
                ${featuredData.price.toLocaleString()}
              </div>
              {featuredData.original_price && featuredData.original_price > featuredData.price && (
                <>
                  <div className="text-xl text-gray-400 line-through">
                    ${featuredData.original_price.toLocaleString()}
                  </div>
                  <div className="bg-red-100 text-red-600 px-3 py-1 rounded-full text-sm font-semibold">
                    -{featuredData.discount_percentage_calculated}%
                  </div>
                </>
              )}
            </div>

            <div className="space-y-4">
              <button 
                onClick={handleAddToCart}
                disabled={isAdding}
                className="w-full bg-red-500 hover:bg-red-600 disabled:bg-red-400 text-white py-4 px-6 rounded-xl font-semibold text-lg transition-colors duration-200 shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
              >
                {isAdding ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Añadiendo...
                  </>
                ) : (
                  <>
                    <ShoppingCart className="w-5 h-5" />
                    Añadir al Carrito
                  </>
                )}
              </button>
              <p className="text-center text-gray-500 text-sm">
                🚚 Envío gratis en pedidos superiores a $30.000
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}