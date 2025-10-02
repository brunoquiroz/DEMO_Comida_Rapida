import React, { useEffect, useState } from 'react';
import { Plus, Search, Edit, Trash2, ToggleLeft, ToggleRight } from 'lucide-react';
import Modal from '../ui/Modal';
import { Ingredient, getIngredients, createIngredient, updateIngredient, deleteIngredient } from '../../services/api';

interface FormState {
  name: string;
  is_active: boolean;
}

const IngredientManagement: React.FC = () => {
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editing, setEditing] = useState<Ingredient | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [form, setForm] = useState<FormState>({ name: '', is_active: true });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const data = await getIngredients();
      setIngredients(data);
    } finally {
      setIsLoading(false);
    }
  };

  const filtered = ingredients.filter(i => i.name.toLowerCase().includes(searchTerm.toLowerCase()));

  const openModal = (item?: Ingredient) => {
    if (item) {
      setEditing(item);
      setForm({ name: item.name, is_active: item.is_active });
    } else {
      setEditing(null);
      setForm({ name: '', is_active: true });
    }
    setIsModalOpen(true);
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editing) {
      await updateIngredient(editing.id, { name: form.name, is_active: form.is_active });
    } else {
      await createIngredient({ name: form.name, is_active: form.is_active });
    }
    setIsModalOpen(false);
    await fetchData();
  };

  const onDelete = async (id: number) => {
    if (!confirm('¿Eliminar ingrediente?')) return;
    await deleteIngredient(id);
    await fetchData();
  };

  const toggleActive = async (item: Ingredient) => {
    await updateIngredient(item.id, { is_active: !item.is_active });
    await fetchData();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando ingredientes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestión de Ingredientes</h1>
          <p className="text-gray-600">Crea, edita y controla la disponibilidad de ingredientes</p>
        </div>
        <button onClick={() => openModal()} className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg">
          <Plus size={20} /> Nuevo Ingrediente
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Buscar ingredientes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
          />
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6">
        {filtered.length === 0 ? (
          <p className="text-gray-600">No hay ingredientes</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map(item => (
              <div key={item.id} className="border rounded-lg p-4 flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">{item.name}</p>
                  <p className="text-sm text-gray-500">{item.is_active ? 'Disponible' : 'No disponible'}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => toggleActive(item)} className="p-2 rounded hover:bg-gray-100" title="Alternar disponibilidad">
                    {item.is_active ? <ToggleRight className="text-green-600" /> : <ToggleLeft className="text-gray-400" />}
                  </button>
                  <button onClick={() => openModal(item)} className="p-2 text-blue-600 hover:bg-blue-50 rounded" title="Editar">
                    <Edit size={16} />
                  </button>
                  <button onClick={() => onDelete(item.id)} className="p-2 text-red-600 hover:bg-red-50 rounded" title="Eliminar">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editing ? 'Editar Ingrediente' : 'Nuevo Ingrediente'}>
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Nombre *</label>
            <input
              type="text"
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              placeholder="Ej: Lechuga, Tomate, Queso..."
            />
          </div>
          <div className="flex items-center gap-2">
            <input id="active" type="checkbox" checked={form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked })} />
            <label htmlFor="active" className="text-sm text-gray-700">Disponible</label>
          </div>
          <div className="flex gap-3">
            <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg">Cancelar</button>
            <button type="submit" className="flex-1 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg">{editing ? 'Actualizar' : 'Crear'}</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default IngredientManagement; 