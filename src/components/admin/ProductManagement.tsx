import React, { useState, useEffect, useRef } from 'react';
import { Plus, Search, Edit, Trash2, Eye, EyeOff, Upload, Package, X } from 'lucide-react';
import { getProducts, getCategories, createProduct, updateProduct, deleteProduct, getIngredients } from '../../services/api';
import { Product, Category, Ingredient, ProductIngredient as PI } from '../../services/api';
import Modal from '../ui/Modal';

interface FormData {
  name: string;
  description: string;
  price: string;
  category: string;
  image: File | null;
  tags: string[];
  product_ingredients: Array<{ ingredient_id: number; default_included: boolean; extra_cost: number; is_active: boolean }>; // NUEVO
}

const ProductManagement: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [allIngredients, setAllIngredients] = useState<Ingredient[]>([]); // NUEVO
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [imagePreview, setImagePreview] = useState<string>('');
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState<FormData>({
    name: '',
    description: '',
    price: '',
    category: '',
    image: null,
    tags: [],
    product_ingredients: []
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      // Obtener todos los productos (incluyendo inactivos para administración)
      const response = await fetch('/api/products/', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      const productsData = await response.json();
      const categoriesData = await getCategories();
      const ingredientsData = await getIngredients(); // NUEVO
      setProducts(productsData);
      setCategories(categoriesData);
      setAllIngredients(ingredientsData);
    } catch (error) {
      console.error('Error fetching data:', error);
      // Fallback a la función original si hay error
      try {
        const [productsData, categoriesData, ingredientsData] = await Promise.all([
          getProducts(),
          getCategories(),
          getIngredients()
        ]);
        setProducts(productsData);
        setCategories(categoriesData);
        setAllIngredients(ingredientsData);
      } catch (fallbackError) {
        console.error('Fallback error:', fallbackError);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const filteredProducts = products.filter(product => {
    const matchesCategory = selectedCategory === 'all' || product.category.toString() === selectedCategory;
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleOpenModal = (product?: Product) => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        name: product.name,
        description: product.description,
        price: product.price.toString(),
        category: product.category.toString(),
        image: null,
        tags: product.tags.map(tag => tag.name),
        product_ingredients: (product.product_ingredients || []).map((pi: PI) => ({
          ingredient_id: pi.ingredient.id,
          default_included: pi.default_included,
          extra_cost: pi.extra_cost,
          is_active: pi.is_active
        }))
      });
      if (product.image_url) {
        setImagePreview(product.image_url);
      }
    } else {
      setEditingProduct(null);
      setFormData({
        name: '',
        description: '',
        price: '',
        category: '',
        image: null,
        tags: [],
        product_ingredients: []
      });
      setImagePreview('');
    }
    setIsModalOpen(true);
  };

  const addIngredientToForm = (ingredientId: number) => {
    setFormData(prev => {
      if (prev.product_ingredients.find(pi => pi.ingredient_id === ingredientId)) return prev;
      return {
        ...prev,
        product_ingredients: [...prev.product_ingredients, { ingredient_id: ingredientId, default_included: true, extra_cost: 0, is_active: true }]
      };
    });
  };

  const removeIngredientFromForm = (ingredientId: number) => {
    setFormData(prev => ({
      ...prev,
      product_ingredients: prev.product_ingredients.filter(pi => pi.ingredient_id !== ingredientId)
    }));
  };

  const updateIngredientField = (ingredientId: number, field: 'default_included' | 'extra_cost' | 'is_active', value: boolean | number) => {
    setFormData(prev => ({
      ...prev,
      product_ingredients: prev.product_ingredients.map(pi =>
        pi.ingredient_id === ingredientId ? { ...pi, [field]: value } : pi
      )
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const productData = new FormData();
      productData.append('name', formData.name);
      productData.append('description', formData.description);
      productData.append('price', formData.price);
      productData.append('category', formData.category);
      
      if (editingProduct) {
        productData.append('is_active', editingProduct.is_active.toString());
      }
      
      if (formData.image) {
        productData.append('image', formData.image);
      }
      
      formData.tags.forEach((tag, index) => {
        productData.append(`tag_names[${index}]`, tag);
      });

      // Adjuntar ingredientes como JSON string
      productData.append('product_ingredients', JSON.stringify(formData.product_ingredients));

      if (editingProduct) {
        await updateProduct(editingProduct.id, productData);
      } else {
        await createProduct(productData);
      }

      await fetchData();
      setIsModalOpen(false);
      setFormData({
        name: '',
        description: '',
        price: '',
        category: '',
        image: null,
        tags: [],
        product_ingredients: []
      });
      setImagePreview('');
      setEditingProduct(null);
    } catch (error) {
      console.error('Error saving product:', error);
      alert('Error al guardar el producto. Por favor, intenta de nuevo.');
    }
  };

  const handleImageChange = (file: File) => {
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

  const handleDelete = async (id: number) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este producto?')) {
      try {
        await deleteProduct(id);
        await fetchData();
      } catch (error) {
        console.error('Error deleting product:', error);
        alert('Error al eliminar el producto. Por favor, intenta de nuevo.');
      }
    }
  };

  const toggleActive = async (id: number, currentStatus: boolean) => {
    try {
      const product = products.find(p => p.id === id);
      if (!product) return;

      const productData = new FormData();
      productData.append('name', product.name);
      productData.append('description', product.description);
      productData.append('price', product.price.toString());
      productData.append('category', product.category.toString());
      productData.append('is_active', (!currentStatus).toString());
      product.tags.forEach((tag, index) => {
        productData.append(`tag_names[${index}]`, tag.name);
      });
      // Preservar ingredientes actuales si existen
      if (product.product_ingredients) {
        const payload = product.product_ingredients.map((pi: PI) => ({
          ingredient_id: pi.ingredient.id,
          default_included: pi.default_included,
          extra_cost: pi.extra_cost,
          is_active: pi.is_active
        }));
        productData.append('product_ingredients', JSON.stringify(payload));
      }

      await updateProduct(id, productData);
      await fetchData();
    } catch (error) {
      console.error('Error toggling product status:', error);
      alert('Error al cambiar el estado del producto. Por favor, intenta de nuevo.');
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
    }).format(price);
  };

  const addTag = (tag: string) => {
    if (tag && !formData.tags.includes(tag)) {
      setFormData({ ...formData, tags: [...formData.tags, tag] });
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter(tag => tag !== tagToRemove)
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando productos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestión de Productos</h1>
          <p className="text-gray-600">Administra el menú de tu restaurante</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200"
        >
          <Plus size={20} />
          Agregar Producto
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Buscar productos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Category Filter */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors duration-200 ${
                selectedCategory === 'all'
                  ? 'bg-red-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Todos
            </button>
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id.toString())}
                className={`px-4 py-2 rounded-lg font-medium transition-colors duration-200 ${
                  selectedCategory === category.id.toString()
                    ? 'bg-red-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {category.icon} {category.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredProducts.map((product) => (
          <div
            key={product.id}
            className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-200"
          >
            <div className="relative">
              {product.image_url || product.image ? (
                <img
                  src={product.image_url || product.image}
                  alt={product.name}
                  className="w-full h-48 object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    target.nextElementSibling?.classList.remove('hidden');
                  }}
                />
              ) : null}
              <div className={`w-full h-48 bg-gray-100 flex items-center justify-center ${product.image_url || product.image ? 'hidden' : ''}`}>
                <div className="text-center text-gray-400">
                  <div className="text-3xl mb-2">🍽️</div>
                  <p className="text-sm">Sin imagen</p>
                </div>
              </div>
              <div className="absolute top-2 right-2 flex gap-1 flex-wrap">
                {product.tags.map((tag) => (
                  <span
                    key={tag.id}
                    className="px-2 py-1 bg-red-500 text-white text-xs rounded-full"
                  >
                    {tag.name}
                  </span>
                ))}
              </div>
              {!product.is_active && (
                <div className="absolute inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center">
                  <span className="bg-gray-800 text-white px-3 py-1 rounded-lg text-sm">
                    Inactivo
                  </span>
                </div>
              )}
            </div>
            
            <div className="p-4">
              <h3 className="text-lg font-semibold text-gray-900">{product.name}</h3>
              <p className="text-gray-600 text-sm mt-1 line-clamp-2">{product.description}</p>
              <p className="text-xl font-bold text-red-600 mt-2">
                {formatPrice(product.price)}
              </p>
              <p className="text-sm text-gray-500 mt-1">
                {product.category_name}
              </p>
              
              <div className="flex items-center justify-between mt-4">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => toggleActive(product.id, product.is_active)}
                    className={`p-2 rounded-lg transition-colors duration-200 ${
                      product.is_active
                        ? 'bg-green-100 text-green-600 hover:bg-green-200'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                    title={product.is_active ? 'Desactivar' : 'Activar'}
                  >
                    {product.is_active ? <Eye size={16} /> : <EyeOff size={16} />}
                  </button>
                  <button
                    onClick={() => handleOpenModal(product)}
                    className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors duration-200"
                    title="Editar"
                  >
                    <Edit size={16} />
                  </button>
                  <button
                    onClick={() => handleDelete(product.id)}
                    className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors duration-200"
                    title="Eliminar"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredProducts.length === 0 && (
        <div className="text-center py-12">
          <Package className="mx-auto text-gray-400 mb-4" size={48} />
          <h3 className="text-lg font-medium text-gray-900">No hay productos</h3>
          <p className="text-gray-600">
            {searchTerm || selectedCategory !== 'all'
              ? 'No se encontraron productos con los filtros aplicados'
              : 'Comienza agregando tu primer producto'
            }
          </p>
        </div>
      )}

      {/* Product Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setFormData({
            name: '',
            description: '',
            price: '',
            category: '',
            image: null,
            tags: [],
            product_ingredients: []
          });
          setImagePreview('');
          setEditingProduct(null);
        }}
        title={editingProduct ? 'Editar Producto' : 'Agregar Producto'}
      >
        <form onSubmit={handleSubmit} className="space-y-6">
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
              placeholder="Ej: Hamburguesa Clásica"
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
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              placeholder="Describe los ingredientes y características del producto"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Precio (CLP) *
              </label>
              <input
                type="number"
                required
                min="0"
                step="100"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                placeholder="5500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Categoría *
              </label>
              <select
                required
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              >
                <option value="">Seleccionar categoría</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.icon} {category.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Etiquetas
            </label>
            <div className="space-y-2">
              <div className="flex flex-wrap gap-2">
                {formData.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center gap-1 bg-red-100 text-red-800 px-2 py-1 rounded-full text-sm"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="text-red-600 hover:text-red-800"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
              <input
                type="text"
                placeholder="Agregar etiqueta (presiona Enter)"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    const target = e.target as HTMLInputElement;
                    addTag(target.value.trim());
                    target.value = '';
                  }
                }}
              />
            </div>
          </div>

          {/* Ingredients */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Ingredientes del producto
            </label>
            <div className="bg-gray-50 rounded-lg p-4 space-y-3">
              <div className="flex flex-wrap gap-2">
                {allIngredients.map(ing => {
                  const selected = formData.product_ingredients.find(pi => pi.ingredient_id === ing.id);
                  return (
                    <button
                      key={ing.id}
                      type="button"
                      onClick={() => selected ? removeIngredientFromForm(ing.id) : addIngredientToForm(ing.id)}
                      className={`px-3 py-1 rounded-full border ${selected ? 'bg-red-500 text-white border-red-500' : 'bg-white text-gray-700 border-gray-300'}`}
                      disabled={!ing.is_active && !selected}
                      title={!ing.is_active && !selected ? 'Ingrediente no disponible' : ''}
                    >
                      {ing.name}
                    </button>
                  );
                })}
              </div>

              {formData.product_ingredients.length > 0 && (
                <div className="space-y-2">
                  {formData.product_ingredients.map(pi => {
                    const ing = allIngredients.find(i => i.id === pi.ingredient_id);
                    if (!ing) return null;
                    return (
                      <div key={pi.ingredient_id} className="grid grid-cols-1 md:grid-cols-4 gap-3 items-center bg-white border rounded p-3">
                        <div className="font-medium">{ing.name}</div>
                        <label className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={pi.default_included}
                            onChange={(e) => updateIngredientField(pi.ingredient_id, 'default_included', e.target.checked)}
                          />
                          <span className="text-sm">Incluido por defecto</span>
                        </label>
                        <div>
                          <label className="block text-xs text-gray-600 mb-1">Costo extra (CLP)</label>
                          <input
                            type="number"
                            min={0}
                            step={100}
                            value={pi.extra_cost}
                            onChange={(e) => updateIngredientField(pi.ingredient_id, 'extra_cost', Number(e.target.value))}
                            className="w-full px-2 py-1 border rounded"
                          />
                        </div>
                        <label className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={pi.is_active}
                            onChange={(e) => updateIngredientField(pi.ingredient_id, 'is_active', e.target.checked)}
                          />
                          <span className="text-sm">Activo</span>
                        </label>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => {
                setIsModalOpen(false);
                setFormData({
                  name: '',
                  description: '',
                  price: '',
                  category: '',
                  image: null,
                  tags: [],
                  product_ingredients: []
                });
                setImagePreview('');
                setEditingProduct(null);
              }}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors duration-200"
            >
              {editingProduct ? 'Actualizar' : 'Crear'} Producto
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ProductManagement;