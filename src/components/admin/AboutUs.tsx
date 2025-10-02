import React, { useState, useEffect } from 'react';
import { Upload, Save, Eye, Loader2 } from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import { getAboutSection, updateAboutSection, createAboutSection, type AboutSection } from '../../services/api';

const AboutUs: React.FC = () => {
  const { addToast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [aboutSection, setAboutSection] = useState<AboutSection | null>(null);
  
  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    description: '',
    image_1: '',
    image_2: '',
    years_experience: '',
    is_active: true,
  });

  useEffect(() => {
    fetchAboutSection();
  }, []);

  const fetchAboutSection = async () => {
    setIsLoading(true);
    try {
      const data = await getAboutSection();
      setAboutSection(data);
      setFormData({
        title: data.title,
        subtitle: data.subtitle,
        description: data.description,
        image_1: data.image_1,
        image_2: data.image_2,
        years_experience: data.years_experience.toString(),
        is_active: data.is_active,
      });
    } catch (error) {
      console.error('Error fetching about section:', error);
      addToast('error', 'Error al cargar la sección sobre nosotros');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    
    try {
      const aboutData = new FormData();
      aboutData.append('title', formData.title);
      aboutData.append('subtitle', formData.subtitle);
      aboutData.append('description', formData.description);
      aboutData.append('image_1', formData.image_1);
      aboutData.append('image_2', formData.image_2);
      aboutData.append('years_experience', formData.years_experience);
      aboutData.append('is_active', formData.is_active.toString());
      
      if (aboutSection) {
        await updateAboutSection(aboutSection.id.toString(), aboutData);
        addToast('success', 'Sección sobre nosotros actualizada exitosamente');
      } else {
        await createAboutSection(aboutData);
        addToast('success', 'Sección sobre nosotros creada exitosamente');
      }
      
      // Recargar datos
      fetchAboutSection();
    } catch (error) {
      console.error('Error saving about section:', error);
      addToast('error', 'Error al guardar la sección sobre nosotros');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-red-500 mx-auto mb-4" />
          <p className="text-gray-600">Cargando sección sobre nosotros...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Sobre Nosotros</h1>
        <p className="text-gray-600 mt-2">Configura la sección que cuenta la historia de tu restaurante</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Form */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Configuración</h2>
          
          <form onSubmit={handleSubmit} className="space-y-6">
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
                placeholder="Sobre Nosotros"
              />
            </div>

            {/* Subtitle */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Subtítulo
              </label>
              <input
                type="text"
                value={formData.subtitle}
                onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                placeholder="Descubre nuestra historia"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Descripción *
              </label>
              <textarea
                required
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={6}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                placeholder="Cuenta la historia de tu restaurante, tus valores, y lo que te hace especial..."
              />
            </div>

            {/* Years of Experience */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Años de experiencia
              </label>
              <input
                type="number"
                value={formData.years_experience}
                onChange={(e) => setFormData({ ...formData, years_experience: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                placeholder="15"
              />
            </div>

            {/* Images */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Image 1 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Imagen 1
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-gray-400 transition-colors duration-200">
                  {formData.image_1 ? (
                    <div className="space-y-2">
                      <img
                        src={formData.image_1}
                        alt="Preview 1"
                        className="mx-auto h-24 w-full object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, image_1: '' })}
                        className="text-red-600 hover:text-red-700 text-sm"
                      >
                        Cambiar imagen
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Upload className="mx-auto text-gray-400" size={24} />
                      <p className="text-gray-600 text-sm">Subir imagen 1</p>
                    </div>
                  )}
                </div>
                {!formData.image_1 && (
                  <input
                    type="url"
                    placeholder="URL de la imagen 1"
                    value={formData.image_1}
                    onChange={(e) => setFormData({ ...formData, image_1: e.target.value })}
                    className="mt-2 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  />
                )}
              </div>

              {/* Image 2 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Imagen 2
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-gray-400 transition-colors duration-200">
                  {formData.image_2 ? (
                    <div className="space-y-2">
                      <img
                        src={formData.image_2}
                        alt="Preview 2"
                        className="mx-auto h-24 w-full object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, image_2: '' })}
                        className="text-red-600 hover:text-red-700 text-sm"
                      >
                        Cambiar imagen
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Upload className="mx-auto text-gray-400" size={24} />
                      <p className="text-gray-600 text-sm">Subir imagen 2</p>
                    </div>
                  )}
                </div>
                {!formData.image_2 && (
                  <input
                    type="url"
                    placeholder="URL de la imagen 2"
                    value={formData.image_2}
                    onChange={(e) => setFormData({ ...formData, image_2: e.target.value })}
                    className="mt-2 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  />
                )}
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
          
          <div className="space-y-6">
            {/* Header */}
            <div className="text-center">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                {formData.title || 'Sobre Nosotros'}
              </h2>
              {formData.subtitle && (
                <p className="text-lg text-gray-600">
                  {formData.subtitle}
                </p>
              )}
            </div>

            {/* Content */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Images */}
              <div className="space-y-4">
                {formData.image_1 && (
                  <img
                    src={formData.image_1}
                    alt="Imagen 1"
                    className="w-full h-48 object-cover rounded-lg"
                  />
                )}
                {formData.image_2 && (
                  <img
                    src={formData.image_2}
                    alt="Imagen 2"
                    className="w-full h-48 object-cover rounded-lg"
                  />
                )}
              </div>

              {/* Text Content */}
              <div className="space-y-4">
                <p className="text-gray-600 leading-relaxed">
                  {formData.description || 'Descripción de tu restaurante...'}
                </p>
                
                {formData.years_experience && (
                  <div className="bg-red-50 p-4 rounded-lg">
                    <p className="text-red-600 font-semibold">
                      {formData.years_experience} años de experiencia
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Tips */}
          <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h4 className="font-medium text-blue-900 mb-2">💡 Consejos para la sección Sobre Nosotros</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Cuenta una historia auténtica y personal</li>
              <li>• Destaca tus valores y filosofía</li>
              <li>• Usa imágenes que muestren tu ambiente</li>
              <li>• Menciona logros y reconocimientos</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutUs;