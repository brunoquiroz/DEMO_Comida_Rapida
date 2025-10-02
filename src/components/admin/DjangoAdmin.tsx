import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Loader2, ExternalLink, ArrowLeft } from 'lucide-react';

interface DjangoAdminProps {
  onBack: () => void;
}

const DjangoAdmin: React.FC<DjangoAdminProps> = ({ onBack }) => {
  const { isLoggedIn, isAdminUser } = useAuth();
  const { addToast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [adminUrl, setAdminUrl] = useState('');

  useEffect(() => {
    // URL del admin de Django
    setAdminUrl('http://localhost:8000/admin/');
  }, []);

  const handleIframeLoad = () => {
    setIsLoading(false);
  };

  const handleIframeError = () => {
    setIsLoading(false);
    addToast('error', 'Error al cargar el panel de administración. Verifica que el servidor Django esté ejecutándose.');
  };

  if (!isLoggedIn || !isAdminUser) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Acceso Denegado
            </h2>
            <p className="text-gray-600 mb-6">
              Necesitas permisos de administrador para acceder al panel de administración.
            </p>
            <button
              onClick={onBack}
              className="bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors duration-200 flex items-center gap-2 mx-auto"
            >
              <ArrowLeft className="w-5 h-5" />
              Volver
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={onBack}
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-semibold transition-colors duration-200 flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Volver
            </button>
            <h1 className="text-xl font-bold text-gray-900">
              Panel de Administración Django
            </h1>
          </div>
          
          <div className="flex items-center gap-4">
            <a
              href={adminUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold transition-colors duration-200 flex items-center gap-2"
            >
              <ExternalLink className="w-4 h-4" />
              Abrir en nueva pestaña
            </a>
          </div>
        </div>
      </div>

      {/* Admin iframe */}
      <div className="relative h-full">
        {isLoading && (
          <div className="absolute inset-0 bg-white flex items-center justify-center z-10">
            <div className="text-center">
              <Loader2 className="w-8 h-8 animate-spin text-red-500 mx-auto mb-4" />
              <p className="text-gray-600">Cargando panel de administración...</p>
            </div>
          </div>
        )}
        
        <iframe
          src={adminUrl}
          className="w-full h-full border-0"
          onLoad={handleIframeLoad}
          onError={handleIframeError}
          title="Django Admin"
          sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-top-navigation"
        />
      </div>
    </div>
  );
};

export default DjangoAdmin; 