import React, { useState, useEffect, useRef } from 'react';
import { Upload, Save, Eye, Loader2, X } from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import { getHeroSection, updateHeroSection, createHeroSection, type HeroSection } from '../../services/api';

const HeroSectionAdmin: React.FC = () => {
  const { addToast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [heroSection, setHeroSection] = useState<HeroSection | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [imagePreview, setImagePreview] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    button_text: '',
    button_url: '',
    background_image: null as File | null,
    is_active: true,
  });

  useEffect(() => {
    fetchHeroSection();
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

    setFormData({ ...formData, background_image: file });

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
    setFormData({ ...formData, background_image: null });
    setImagePreview('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const fetchHeroSection = async () => {
    setIsLoading(true);
    try {
      const data = await getHeroSection();
      setHeroSection(data);
      setFormData({
        title: data.title,
        subtitle: data.subtitle,
        button_text: data.button_text,
        button_url: data.button_url,
        background_image: null,
        is_active: data.is_active,
      });
      // Mostrar imagen actual como preview si existe
      if (data.background_image) {
        setImagePreview(data.background_image);
      }
    } catch (error) {
      console.error('Error fetching hero section:', error);
      addToast('error', 'Error al cargar la sección hero');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const heroData = new FormData();
      heroData.append('title', formData.title);
      heroData.append('subtitle', formData.subtitle);
      heroData.append('button_text', formData.button_text);
      heroData.append('button_url', formData.button_url);
      heroData.append('is_active', formData.is_active.toString());

      // Agregar imagen si se seleccionó una nueva
      if (formData.background_image) {
        heroData.append('background_image', formData.background_image);
      }

      if (heroSection) {
        await updateHeroSection(heroSection.id.toString(), heroData);
        addToast('success', 'Hero section actualizado exitosamente');
      } else {
        await createHeroSection(heroData);
        addToast('success', 'Hero section creado exitosamente');
      }

      // Recargar datos
      fetchHeroSection();
    } catch (error) {
      console.error('Error saving hero section:', error);
      addToast('error', 'Error al guardar la sección hero');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-red-500 mx-auto mb-4" />
          <p className="text-gray-600">Cargando hero section...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Hero Section</h1>
        <p className="text-gray-600 mt-2">Configura la primera impresión de tu sitio web</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Form */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Configuración</h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Background Image */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Imagen de fondo
              </label>
              <div
                className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors duration-200 cursor-pointer ${isDragOver
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
                        className="mx-auto h-32 w-full object-cover rounded-lg"
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

            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Título principal *
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                placeholder="Título impactante de tu restaurante"
              />
            </div>

            {/* Subtitle */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Subtítulo
              </label>
              <textarea
                value={formData.subtitle}
                onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                placeholder="Descripción corta que capture la esencia de tu restaurante"
              />
            </div>

            {/* CTA Button */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Texto del botón principal
                </label>
                <input
                  type="text"
                  value={formData.button_text}
                  onChange={(e) => setFormData({ ...formData, button_text: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="Ver Menú"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Enlace del botón
                </label>
                <input
                  type="text"
                  value={formData.button_url}
                  onChange={(e) => setFormData({ ...formData, button_url: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="#productos o URL externa"
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
                Sección visible en el sitio web
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
          <div className="flex items-center gap-2 mb-6">
            <Eye className="text-gray-600" size={20} />
            <h2 className="text-lg font-semibold text-gray-900">Vista Previa</h2>
          </div>

          <div className="relative h-96 rounded-xl overflow-hidden">
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{
                backgroundImage: imagePreview
                  ? `url(${imagePreview})`
                  : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
              }}
            />
            <div className="absolute inset-0 bg-black bg-opacity-50" />

            <div className="relative h-full flex items-center justify-center text-center p-8">
              <div className="max-w-lg">
                <h1 className="text-3xl lg:text-4xl font-bold text-white mb-4">
                  {formData.title || 'Título Principal'}
                </h1>
                {formData.subtitle && (
                  <p className="text-lg text-gray-200 mb-6 leading-relaxed">
                    {formData.subtitle}
                  </p>
                )}
                {formData.button_text && (
                  <button className="bg-red-500 hover:bg-red-600 text-white px-8 py-3 rounded-lg font-medium text-lg transition-colors duration-200">
                    {formData.button_text}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroSectionAdmin;