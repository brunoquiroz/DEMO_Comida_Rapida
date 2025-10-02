import React, { useState, useEffect, useRef } from 'react';
import { Save, Loader2, Star, Upload, X } from 'lucide-react';
import { getFeaturedProduct, createFeaturedProduct, updateFeaturedProduct, type FeaturedProduct } from '../../services/api';

interface FormData {
  name: string;
  description: string;
  price: string;
  original_price: string;
  discount_percentage: string;
  image: File | null;
  preparation_time: string;
  servings: string;
  rating: string;
  reviews_count: string;
  is_active: boolean;
}

const FeaturedProductAdmin: React.FC = () => {
  const [featuredProduct, setFeaturedProduct] = useState<FeaturedProduct | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [imagePreview, setImagePreview] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState<FormData>({
    name: '',
    description: '',
    price: '',
    original_price: '',
    discount_percentage: '0',
    image: null,
    preparation_time: '15-20 min',
    servings: '4 personas',
    rating: '4.9',
    reviews_count: '150',
    is_active: true
  });

  useEffect(() => {
    fetchFeaturedProduct();
  }, []);

  const handleImageChange = (file: File) => {
    // Formatos de imagen soportados
    const supportedFormats = [
      'image/jpeg',
      'image/jpg', 
      'image/png',
      'image/gif',
      'image/webp',
      'image/svg+xml',
      'image/bmp',
      'image/tiff',
      'image/tif',
      'image/ico',
      'image/avif'
    ];

    // Tamaño máximo: 10MB
    const maxSize = 10 * 1024 * 1024;

    if (!file) {
      alert('No se seleccionó ningún archivo.');
      return;
    }

    if (!supportedFormats.includes(file.type.toLowerCase())) {
      alert(`Formato de imagen no soportado. Formatos permitidos: JPEG, JPG, PNG, GIF, WebP, SVG, BMP, TIFF, ICO, AVIF`);
      return;
    }

    if (file.size > maxSize) {
      alert('El archivo es demasiado grande. El tamaño máximo permitido es 10MB.');
      return;
    }

    setFormData({ ...formData, image: file });
    
    // Crear preview de la imagen
    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleImageChange(files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleImageChange(files[0]);
    }
  };

  const removeImage = () => {
    setFormData({ ...formData, image: null });
    setImagePreview('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const fetchFeaturedProduct = async () => {
    setIsLoading(true);
    try {
      const data = await getFeaturedProduct();
      if (data) {
        setFeaturedProduct(data);
        setFormData({
          name: data.name,
          description: data.description,
          price: data.price.toString(),
          original_price: data.original_price?.toString() || '',
          discount_percentage: data.discount_percentage.toString(),
          image: null,
          preparation_time: data.preparation_time,
          servings: data.servings,
          rating: data.rating.toString(),
          reviews_count: data.reviews_count.toString(),
          is_active: data.is_active
        });
        // Mostrar imagen actual como preview si existe
        if (data.image) {
          setImagePreview(data.image);
        }
      }
    } catch (error) {
      console.error('Error fetching featured product:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const productData = new FormData();
      productData.append('name', formData.name);
      productData.append('description', formData.description);
      productData.append('price', formData.price);
      productData.append('original_price', formData.original_price);
      productData.append('discount_percentage', formData.discount_percentage);
      productData.append('preparation_time', formData.preparation_time);
      productData.append('servings', formData.servings);
      productData.append('rating', formData.rating);
      productData.append('reviews_count', formData.reviews_count);
      productData.append('is_active', formData.is_active.toString());
      
      // Agregar imagen si se seleccionó una nueva
      if (formData.image) {
        productData.append('image', formData.image);
      }

      if (featuredProduct) {
        await updateFeaturedProduct(featuredProduct.id, productData);
      } else {
        await createFeaturedProduct(productData);
      }

      await fetchFeaturedProduct();
    } catch (error) {
      console.error('Error saving featured product:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const formatPrice = (price: string | number) => {
    const numPrice = typeof price === 'string' ? parseFloat(price) : price;
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
    }).format(numPrice);
  };

  const calculateDiscount = () => {
    const original = parseFloat(formData.original_price);
    const current = parseFloat(formData.price);
    if (original && current && original > current) {
      return Math.round(((original - current) / original) * 100);
    }
    return 0;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando producto destacado...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Producto Destacado</h1>
        <p className="text-gray-600">Configura el producto principal de tu página de inicio</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Form */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Información del producto</h2>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Image */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Imagen del producto
              </label>
              <div
                className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors duration-200 cursor-pointer ${
                  isDragOver
                    ? 'border-red-500 bg-red-50'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
              >
                {imagePreview ? (
                  <div className="space-y-4">
                    <div className="relative inline-block">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="mx-auto h-32 w-32 object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeImage();
                        }}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                      >
                        <X size={16} />
                      </button>
                    </div>
                    <p className="text-sm text-gray-600">
                      Haz clic o arrastra una nueva imagen para cambiarla
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Upload className="mx-auto text-gray-400" size={32} />
                    <p className="text-gray-600">
                      Arrastra una imagen aquí o haz clic para seleccionar
                    </p>
                    <p className="text-sm text-gray-500">
                      Formatos soportados: JPEG, JPG, PNG, GIF, WebP, SVG, BMP, TIFF, ICO, AVIF (máx. 10MB)
                    </p>
                  </div>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/gif,image/webp,image/svg+xml,image/bmp,image/tiff,image/tif,image/ico,image/avif"
                  onChange={handleFileInputChange}
                  className="hidden"
                />
              </div>
            </div>

            {/* Basic Info */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nombre del producto *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                placeholder="Nombre del producto destacado"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Descripción *
              </label>
              <textarea
                required
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                placeholder="Describe por qué este producto es especial"
              />
            </div>

            {/* Pricing */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Precio original (CLP)
                </label>
                <input
                  type="number"
                  value={formData.original_price}
                  onChange={(e) => setFormData({ ...formData, original_price: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="65000"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Precio promocional (CLP) *
                </label>
                <input
                  type="number"
                  required
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="49900"
                />
              </div>
            </div>

            {/* Additional Info */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tiempo de preparación
                </label>
                <input
                  type="text"
                  value={formData.preparation_time}
                  onChange={(e) => setFormData({ ...formData, preparation_time: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="15-20 min"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Porciones
                </label>
                <input
                  type="text"
                  value={formData.servings}
                  onChange={(e) => setFormData({ ...formData, servings: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="4 personas"
                />
              </div>
            </div>

            {/* Rating */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Calificación
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="5"
                  value={formData.rating}
                  onChange={(e) => setFormData({ ...formData, rating: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="4.9"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Número de reseñas
                </label>
                <input
                  type="number"
                  value={formData.reviews_count}
                  onChange={(e) => setFormData({ ...formData, reviews_count: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="150"
                />
              </div>
            </div>

            {/* Active Status */}
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="is_active"
                checked={formData.is_active}
                onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
              />
              <label htmlFor="is_active" className="text-sm font-medium text-gray-700">
                Producto visible en el sitio web
              </label>
            </div>

            <button
              type="submit"
              disabled={isSaving}
              className="w-full flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 disabled:bg-gray-400 text-white py-3 px-4 rounded-lg font-medium transition-colors duration-200"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Guardando...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  Guardar Cambios
                </>
              )}
            </button>
          </form>
        </div>

        {/* Preview */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Vista previa</h2>
          
          <div className="bg-gradient-to-br from-red-50 to-orange-50 rounded-lg p-6">
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                Producto Destacado
              </h3>
              <p className="text-gray-600">
                Descubre nuestro plato estrella, preparado con los mejores ingredientes 
                y el toque especial de nuestros chefs.
              </p>
            </div>

            <div className="space-y-4">
              {/* Image */}
              <div className="relative">
                {imagePreview ? (
                  <img
                    src={imagePreview}
                    alt={formData.name}
                    className="rounded-lg shadow-lg w-full h-48 object-cover"
                  />
                ) : (
                  <div className="rounded-lg shadow-lg w-full h-48 bg-gray-100 flex items-center justify-center">
                    <div className="text-center text-gray-400">
                      <div className="text-4xl mb-2">🍽️</div>
                      <p className="text-sm">Sin imagen</p>
                    </div>
                  </div>
                )}
                {calculateDiscount() > 0 && (
                  <div className="absolute -top-2 -right-2 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                    -{calculateDiscount()}%
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="flex text-yellow-400">
                    {[...Array(5)].map((_, i) => (
                      <Star 
                        key={i} 
                        className={`w-4 h-4 ${i < Math.floor(parseFloat(formData.rating)) ? 'fill-current' : ''}`} 
                      />
                    ))}
                  </div>
                  <span className="text-sm text-gray-600">
                    {formData.rating} ({formData.reviews_count}+ reseñas)
                  </span>
                </div>

                <h4 className="text-xl font-bold text-gray-900">
                  {formData.name || 'Nombre del Producto'}
                </h4>

                <p className="text-gray-600 text-sm">
                  {formData.description || 'Descripción del producto destacado'}
                </p>

                {formData.preparation_time && (
                  <p className="text-sm text-gray-500">
                    ⏱️ {formData.preparation_time}
                  </p>
                )}

                {formData.servings && (
                  <p className="text-sm text-gray-500">
                    👥 {formData.servings}
                  </p>
                )}

                <div className="flex items-center gap-4">
                  <div className="text-xl font-bold text-red-500">
                    {formData.price ? formatPrice(formData.price) : '$0'}
                  </div>
                  {parseFloat(formData.original_price) > parseFloat(formData.price) && (
                    <div className="text-lg text-gray-400 line-through">
                      {formatPrice(formData.original_price)}
                    </div>
                  )}
                  {calculateDiscount() > 0 && (
                    <div className="bg-red-100 text-red-600 px-2 py-1 rounded-full text-xs font-semibold">
                      -{calculateDiscount()}%
                    </div>
                  )}
                </div>

                <button className="w-full bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded-lg font-medium transition-colors duration-200">
                  Ordenar por WhatsApp
                </button>
              </div>
            </div>
          </div>

          {/* Tips */}
          <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h4 className="font-medium text-blue-900 mb-2">💡 Consejos para el Producto Destacado</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Usa imágenes de alta calidad que muestren el producto</li>
              <li>• Destaca los beneficios únicos del producto</li>
              <li>• Incluye precios originales para mostrar el descuento</li>
              <li>• Mantén la descripción clara y atractiva</li>
              <li>• Recomendado: imágenes de 800x600px o superior</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeaturedProductAdmin;