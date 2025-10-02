import React from 'react';
import { Heart, Utensils, Settings } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Footer() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const scrollToSection = (sectionId: string) => {
    document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-red-600 rounded-lg p-2">
                <Utensils className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold">FastFood Deluxe</h3>
            </div>
            <p className="text-gray-400 mb-6 max-w-md">
              Comida rápida hecha con estilo y sabor. Cada producto es una experiencia única
              que combina tradición culinaria con innovación urbana.
            </p>
            <div className="text-lg font-semibold text-red-400">
              "Sabores que enamoran, rapidez que sorprende"
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold mb-6">Enlaces rápidos</h4>
            <ul className="space-y-3">
              <li>
                <button
                  onClick={scrollToTop}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  Inicio
                </button>
              </li>
              <li>
                <button
                  onClick={() => scrollToSection('menu')}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  Menú
                </button>
              </li>
              <li>
                <Link
                  to="/admin"
                  className="text-gray-400 hover:text-white transition-colors flex items-center gap-2"
                >
                  <Settings className="w-4 h-4" />
                  Administración
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-lg font-semibold mb-6">Contacto rápido</h4>
            <div className="space-y-3">
              <p className="text-gray-400">
                📞 +57 (300) 123-4567
              </p>
              <p className="text-gray-400">
                📍 Av. Principal 123<br />
                Centro Comercial Plaza
              </p>
              <p className="text-gray-400">
                🕒 Lun - Vie: 11:00 AM - 10:00 PM
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400 text-sm mb-4 md:mb-0">
            © 2025 FastFood Deluxe. Todos los derechos reservados.
          </p>
          <div className="flex items-center gap-2 text-gray-400 text-sm">
            <span>Hecho con</span>
            <Heart className="w-4 h-4 text-red-500 fill-current" />
            <span>para los amantes del buen sabor</span>
          </div>
        </div>
      </div>
    </footer>
  );
}