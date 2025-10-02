import React, { useEffect, useState } from 'react';
import { getReviewsAdmin, type Review, getSiteConfig, updateSiteConfig, type SiteConfig, setReviewVisibility } from '../../services/api';
import { RefreshCw, ExternalLink, Eye, EyeOff } from 'lucide-react';

interface ReviewsAdminProps {
  onOpenDjangoAdmin?: () => void;
}

const ReviewsAdmin: React.FC<ReviewsAdminProps> = ({ onOpenDjangoAdmin }) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [config, setConfig] = useState<SiteConfig | null>(null);
  const [toggling, setToggling] = useState(false);
  const [rowToggling, setRowToggling] = useState<Record<number, boolean>>({});

  const load = async () => {
    try {
      const [data, cfg] = await Promise.all([getReviewsAdmin(), getSiteConfig()]);
      setReviews(data);
      setConfig(cfg);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reseñas</h1>
          <p className="text-gray-600">Listado de reseñas aprobadas que se muestran en la página de inicio</p>
        </div>
        <div className="flex gap-2">
          {config && (
            <button
              onClick={async () => {
                try {
                  setToggling(true);
                  const updated = await updateSiteConfig({ show_reviews: !config.show_reviews });
                  setConfig(updated);
                } finally {
                  setToggling(false);
                }
              }}
              className="inline-flex items-center gap-2 px-3 py-2 text-sm rounded-md border border-gray-300 hover:bg-gray-50"
            >
              {config.show_reviews ? <EyeOff className={`w-4 h-4 ${toggling ? 'animate-pulse' : ''}`} /> : <Eye className={`w-4 h-4 ${toggling ? 'animate-pulse' : ''}`} />}
              {config.show_reviews ? 'Ocultar en Home' : 'Mostrar en Home'}
            </button>
          )}
          <button
            onClick={() => { setRefreshing(true); void load(); }}
            className="inline-flex items-center gap-2 px-3 py-2 text-sm rounded-md border border-gray-300 hover:bg-gray-50"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} /> Refrescar
          </button>
          <a
            href="/admin/api/review/"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 px-3 py-2 text-sm rounded-md bg-gray-900 text-white hover:bg-black"
          >
            <ExternalLink className="w-4 h-4" /> Abrir en Django Admin
          </a>
        </div>
      </div>

      {loading ? (
        <div className="bg-white rounded-xl shadow-sm p-6 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto"></div>
          <p className="text-gray-600 mt-2">Cargando reseñas...</p>
        </div>
      ) : reviews.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-6 text-center text-gray-600">No hay reseñas aprobadas aún.</div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Usuario</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Rating</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Comentario</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Fecha</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Visibilidad</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {reviews.map((r) => (
                  <tr key={r.id}>
                    <td className="px-4 py-3 text-sm text-gray-900">{r.username}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{r.rating} / 5</td>
                    <td className="px-4 py-3 text-sm text-gray-700" style={{ maxWidth: 480 }}>
                      <div className="line-clamp-2">{r.comment}</div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">{new Date(r.created_at).toLocaleString('es-CL')}</td>
                    <td className="px-4 py-3 text-sm">
                      {r.is_visible ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-green-700 bg-green-50 border border-green-200">Visible</span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-gray-700 bg-gray-50 border border-gray-200">Oculta</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-right">
                      <button
                        onClick={async () => {
                          const to = !r.is_visible;
                          try {
                            setRowToggling((prev) => ({ ...prev, [r.id]: true }));
                            const resp = await setReviewVisibility(r.id, to);
                            // Actualizar solo la fila afectada para evitar re-render masivo (flicker)
                            setReviews((prev) => prev.map((x) => x.id === r.id ? { ...x, is_visible: resp.is_visible } : x));
                          } catch {
                            // Revertir visual si hubo error
                            setReviews((prev) => prev.map((x) => x.id === r.id ? { ...x, is_visible: r.is_visible } : x));
                          }
                          setRowToggling((prev) => ({ ...prev, [r.id]: false }));
                        }}
                        className={`inline-flex items-center gap-2 px-3 py-2 text-xs rounded-md border disabled:opacity-60 ${r.is_visible ? 'border-gray-300 hover:bg-gray-50' : 'border-green-300 hover:bg-green-50'}`}
                        title={r.is_visible ? 'Ocultar en Home' : 'Mostrar en Home'}
                        disabled={!!rowToggling[r.id]}
                      >
                        {rowToggling[r.id] ? (
                          <span className="inline-flex items-center gap-2"><RefreshCw className="w-4 h-4 animate-spin" />Guardando...</span>
                        ) : (
                          <>
                            {r.is_visible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            {r.is_visible ? 'Ocultar' : 'Mostrar'}
                          </>
                        )}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReviewsAdmin;
