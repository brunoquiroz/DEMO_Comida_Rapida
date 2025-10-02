import React from 'react';
import { Link } from 'react-router-dom';
import { Home, ShoppingBag, Star, Phone, Image, Settings, LogOut, Database, Tag, Hash, Package, MessageSquare } from 'lucide-react';

interface SidebarProps {
  activeSection: string;
  setActiveSection: (section: string) => void;
  onLogout: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeSection, setActiveSection, onLogout }) => {
  const menuItems = [
    { id: 'dashboard', name: 'Dashboard', icon: <Home size={20} /> },
    { id: 'products', name: 'Productos', icon: <ShoppingBag size={20} /> },
    { id: 'orders', name: 'Pedidos', icon: <Package size={20} /> },
    { id: 'categories', name: 'Categorías', icon: <Tag size={20} /> },
    { id: 'ingredients', name: 'Ingredientes', icon: <Tag size={20} /> },
    { id: 'tags', name: 'Etiquetas', icon: <Hash size={20} /> },
    { id: 'featured', name: 'Productos Destacados', icon: <Star size={20} /> },
    { id: 'reviews', name: 'Reseñas', icon: <MessageSquare size={20} /> },
    { id: 'contact', name: 'Contacto', icon: <Phone size={20} /> },
    { id: 'hero', name: 'Hero Section', icon: <Image size={20} /> },
    { id: 'settings', name: 'Configuración', icon: <Settings size={20} /> },
    { id: 'django-admin', name: 'Admin Django', icon: <Database size={20} /> },
  ];

  return (
    <div className="w-64 bg-white shadow-md h-full">
      <div className="p-6 border-b border-gray-200">
        <Link
          to="/"
          className="inline-block text-2xl font-bold text-red-600 hover:text-red-700 transition-colors"
        >
          FastFood Deluxe
        </Link>
        <p className="text-sm text-gray-600 mt-1">Panel de Administración</p>
      </div>
      
      <nav className="mt-6 px-4">
        <ul className="space-y-2">
          {menuItems.map((item) => (
            <li key={item.id}>
              <button
                onClick={() => setActiveSection(item.id)}
                className={`w-full flex items-center px-4 py-3 rounded-lg transition-colors duration-200 ${activeSection === item.id ? 'bg-red-50 text-red-600' : 'text-gray-600 hover:bg-gray-100'}`}
              >
                <span className="mr-3">{item.icon}</span>
                {item.name}
              </button>
            </li>
          ))}
          
          <li className="mt-8">
            <button
              onClick={onLogout}
              className="w-full flex items-center px-4 py-3 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors duration-200"
            >
              <span className="mr-3"><LogOut size={20} /></span>
              Cerrar Sesión
            </button>
          </li>
        </ul>
      </nav>
    </div>
  );
};

export default Sidebar;