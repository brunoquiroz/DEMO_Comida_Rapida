import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit, Trash2, Hash, Tag } from 'lucide-react';
import { getProductTags, createProductTag, updateProductTag, deleteProductTag } from '../../services/api';
import { ProductTag } from '../../services/api';
import Modal from '../ui/Modal';

interface FormData {
  name: string;
}

const TagManagement: React.FC = () => {
  const [tags, setTags] = useState<ProductTag[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTag, setEditingTag] = useState<ProductTag | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState<FormData>({
    name: ''
  });

  useEffect(() => {
    fetchTags();
  }, []);

  const fetchTags = async () => {
    setIsLoading(true);
    try {
      const tagsData = await getProductTags();
      setTags(tagsData);
    } catch (error) {
      console.error('Error fetching tags:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredTags = tags.filter(tag =>
    tag.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOpenModal = (tag?: ProductTag) => {
    if (tag) {
      setEditingTag(tag);
      setFormData({
        name: tag.name
      });
    } else {
      setEditingTag(null);
      setFormData({
        name: ''
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const tagData = {
        name: formData.name.trim()
      };

      if (editingTag) {
        await updateProductTag(editingTag.id.toString(), tagData);
      } else {
        await createProductTag(tagData);
      }

      await fetchTags();
      setIsModalOpen(false);
    } catch (error) {
      console.error('Error saving tag:', error);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar esta etiqueta? Esto podría afectar a los productos asociados.')) {
      try {
        await deleteProductTag(id.toString());
        await fetchTags();
      } catch (error) {
        console.error('Error deleting tag:', error);
      }
    }
  };

  const suggestedTags = [
    'Vegetariano', 'Vegano', 'Sin Gluten', 'Picante', 'Dulce', 'Salado',
    'Casero', 'Gourmet', 'Tradicional', 'Especial', 'Nuevo', 'Popular',
    'Saludable', 'Light', 'Proteína', 'Orgánico', 'Artesanal', 'Fresco'
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando etiquetas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestión de Etiquetas</h1>
          <p className="text-gray-600">Organiza y clasifica tus productos con etiquetas</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200"
        >
          <Plus size={20} />
          Agregar Etiqueta
        </button>
      </div>

      {/* Search */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Buscar etiquetas..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Tags Grid */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        {filteredTags.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredTags.map((tag) => (
              <div
                key={tag.id}
                className="bg-gray-50 rounded-lg p-4 border border-gray-200 hover:shadow-md transition-shadow duration-200"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Hash className="text-red-500" size={16} />
                    <span className="font-medium text-gray-900">{tag.name}</span>
                  </div>
                  
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenModal(tag)}
                      className="p-1 text-blue-600 hover:bg-blue-50 rounded transition-colors duration-200"
                      title="Editar etiqueta"
                    >
                      <Edit size={14} />
                    </button>
                    <button
                      onClick={() => handleDelete(tag.id)}
                      className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors duration-200"
                      title="Eliminar etiqueta"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Tag className="mx-auto text-gray-400 mb-4" size={48} />
            <h3 className="text-lg font-medium text-gray-900">No hay etiquetas</h3>
            <p className="text-gray-600">
              {searchTerm 
                ? 'No se encontraron etiquetas con el término de búsqueda'
                : 'Comienza creando tu primera etiqueta'
              }
            </p>
          </div>
        )}
      </div>

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingTag ? 'Editar Etiqueta' : 'Nueva Etiqueta'}
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nombre de la Etiqueta *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              placeholder="Ej: Vegetariano, Picante, Sin Gluten..."
            />
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm text-gray-600 mb-3">Etiquetas sugeridas:</p>
            <div className="flex flex-wrap gap-2">
              {suggestedTags.map((suggestedTag, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => setFormData({ ...formData, name: suggestedTag })}
                  className="text-xs px-3 py-1 bg-white border border-gray-300 rounded-full hover:bg-gray-100 transition-colors duration-200"
                >
                  {suggestedTag}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors duration-200"
            >
              {editingTag ? 'Actualizar' : 'Crear'} Etiqueta
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default TagManagement;