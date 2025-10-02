import React, { useEffect, useState } from 'react';
import { Star } from 'lucide-react';
import { getReviews, type Review, getSiteConfig, type SiteConfig } from '../../services/api';

export default function Reviews() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [config, setConfig] = useState<SiteConfig | null>(null);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const [data, cfg] = await Promise.all([getReviews(), getSiteConfig()]);
        setReviews(data);
        setConfig(cfg);
      } catch (e) {
        setReviews([]);
      } finally {
        setLoading(false);
      }
    };
    fetchReviews();
  }, []);

  const average = (reviews.reduce((s, r) => s + r.rating, 0) / (reviews.length || 1));

  const formatDate = (iso: string) => {
    try {
      const d = new Date(iso);
      return d.toLocaleDateString('es-CL', { year: 'numeric', month: 'short', day: '2-digit' });
    } catch {
      return iso;
    }
  };

  const Stars = ({ value }: { value: number }) => (
    <div className="flex items-center">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star key={i} className={`w-4 h-4 ${i < value ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
      ))}
    </div>
  );

  if (loading) {
    return (
      <section className="py-20 bg-white" id="reviews">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">Cargando reseñas...</p>
          </div>
        </div>
      </section>
    );
  }

  // Si la configuración global oculta reseñas, no renderizar sección
  if (config && !config.show_reviews) {
    return null;
  }

  return (
    <section className="py-20 bg-white" id="reviews">
      <div className="max-w-7xl mx-auto px-4">
        {/* Encabezado */}
        <div className="text-center mb-10">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900">Reseñas de clientes</h2>
          <p className="mt-3 text-gray-600">Lo que dicen quienes ya probaron nuestros productos</p>
          {reviews.length > 0 && (
            <div className="mt-4 inline-flex items-center gap-3 bg-yellow-50 text-yellow-800 px-4 py-2 rounded-full">
              <Stars value={Math.round(average)} />
              <span className="font-semibold">{average.toFixed(1)}/5</span>
              <span className="text-sm text-yellow-700">({reviews.length} reseñas)</span>
            </div>
          )}
        </div>

        {/* Grilla de reseñas */}
        {reviews.length === 0 ? (
          <div className="bg-white border border-gray-100 rounded-xl shadow-sm p-6 text-center text-gray-600">
            Aún no hay reseñas.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {reviews.map((r) => (
              <div key={r.id} className="bg-white border border-gray-100 rounded-xl shadow-sm p-5 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-3">
                  <div className="font-semibold text-gray-900">{r.username}</div>
                  <Stars value={r.rating} />
                </div>
                <p className="text-gray-700 mb-3">{r.comment}</p>
                <div className="text-xs text-gray-500">{formatDate(r.created_at)}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
