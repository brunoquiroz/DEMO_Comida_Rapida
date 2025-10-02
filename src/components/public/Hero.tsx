import React, { useState, useEffect } from 'react';
import { ArrowRight, Play } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getHeroSection, type HeroSection } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export default function Hero() {
  const [heroData, setHeroData] = useState<HeroSection | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { isLoggedIn } = useAuth();

  useEffect(() => {
    const fetchHeroData = async () => {
      try {
        const data = await getHeroSection();
        setHeroData(data);
      } catch (error) {
        console.error('Error fetching hero data:', error);
        // Datos por defecto si no hay datos en la API
        setHeroData({
          id: 1,
          title: 'Sabor que conquista corazones',
          subtitle: 'Descubre la mejor comida rápida de la ciudad. Ingredientes frescos, sabores auténticos y un servicio que te hará volver una y otra vez.',
          button_text: 'Ordenar Ahora',
          button_url: '#menu',
          background_image: 'https://images.pexels.com/photos/1633578/pexels-photo-1633578.jpeg?auto=compress&cs=tinysrgb&w=1200',
          background_image_url: 'https://images.pexels.com/photos/1633578/pexels-photo-1633578.jpeg?auto=compress&cs=tinysrgb&w=1200',
          is_active: true,
          created_at: '',
          updated_at: ''
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchHeroData();
  }, []);

  if (isLoading) {
    return (
      <section className="relative h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-orange-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando...</p>
        </div>
      </section>
    );
  }

  if (!heroData) {
    return null;
  }

  return (
    <section className="relative h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <img
          src={heroData.background_image_url || heroData.background_image}
          alt="Hero background"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black bg-opacity-50"></div>
      </div>

      {/* Top-right auth buttons */}
      <div className="absolute top-4 right-4 z-20 flex gap-3">
        {isLoggedIn && (
          <Link
            to="/my-orders"
            className="px-4 py-2 rounded-md bg-white/90 text-gray-900 font-semibold hover:bg-white transition-colors text-sm"
          >
            Ver pedidos
          </Link>
        )}
        <Link
          to="/login"
          className="px-4 py-2 rounded-md border border-white/60 text-white hover:bg-white/10 transition-colors text-sm font-medium"
        >
          Ir al Admin
        </Link>
        <Link
          to="/register"
          className="px-4 py-2 rounded-md bg-white text-gray-900 font-semibold hover:bg-gray-100 transition-colors text-sm"
        >
          Registrarse
        </Link>
      </div>

      {/* Content */}
      <div className="relative z-10 text-center text-white px-4 max-w-4xl mx-auto">
        <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
          {heroData.title}
        </h1>
        <p className="text-xl md:text-2xl mb-8 text-gray-200 max-w-3xl mx-auto leading-relaxed">
          {heroData.subtitle}
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <a
            href={heroData.button_url}
            className="bg-red-500 hover:bg-red-600 text-white px-8 py-4 rounded-full text-lg font-semibold flex items-center gap-2 transition-all duration-300 transform hover:scale-105 shadow-lg"
          >
            {heroData.button_text}
            <ArrowRight className="w-5 h-5" />
          </a>
        </div>


        {/* Stats */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="text-3xl font-bold mb-2">500+</div>
            <div className="text-gray-300">Clientes Satisfechos</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold mb-2">50+</div>
            <div className="text-gray-300">Platos Únicos</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold mb-2">15min</div>
            <div className="text-gray-300">Tiempo Promedio</div>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 border-2 border-white rounded-full flex justify-center">
          <div className="w-1 h-3 bg-white rounded-full mt-2 animate-pulse"></div>
        </div>
      </div>
    </section>
  );
}