import React, { useEffect, useState } from 'react';
import { getMyOrders, Order, createReview } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { useToast } from '../context/ToastContext';
import { Star } from 'lucide-react';

export default function MyOrders() {
  const { isLoggedIn, isLoading } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { addToast } = useToast();

  // Estado para reseñas
  const [isReviewOpen, setIsReviewOpen] = useState(false);
  const [reviewOrderId, setReviewOrderId] = useState<number | null>(null);
  const [reviewRating, setReviewRating] = useState<number>(5);
  const [reviewHover, setReviewHover] = useState<number | null>(null);
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  // Cargar pedidos y activar polling para actualizaciones de estado
  useEffect(() => {
    let intervalId: number | undefined;

    const fetchOrders = async () => {
      if (!isLoggedIn) return;
      try {
        const data = await getMyOrders();
        setOrders(data);
      } finally {
        setLoading(false);
      }
    };

    if (isLoggedIn) {
      void fetchOrders();
      // Polling cada 8 segundos para status en "tiempo real"
      intervalId = window.setInterval(fetchOrders, 8000);
    }

    return () => {
      if (intervalId) window.clearInterval(intervalId);
    };
  }, [isLoggedIn]);

  const openReview = (orderId: number | undefined) => {
    if (!orderId) return;
    setReviewOrderId(orderId);
    setReviewRating(5);
    setReviewHover(null);
    setReviewComment('');
    setIsReviewOpen(true);
  };

  const closeReview = () => {
    setIsReviewOpen(false);
    setReviewOrderId(null);
  };

  const submitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmittingReview(true);
      await createReview({ rating: reviewRating, comment: reviewComment, order_id: reviewOrderId });
      addToast('success', '¡Gracias! Tu reseña fue enviada.');
      closeReview();
    } catch (err: any) {
      addToast('error', 'No se pudo enviar la reseña. Intenta nuevamente.');
    } finally {
      setSubmittingReview(false);
    }
  };

  const formatDate = (iso?: string) => {
    if (!iso) return '';
    try {
      const d = new Date(iso);
      return d.toLocaleString('es-CL', { dateStyle: 'short', timeStyle: 'short' });
    } catch {
      return iso;
    }
  };

  const statusStyle = (status: Order['status']) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'confirmed':
        return 'bg-blue-100 text-blue-800';
      case 'preparing':
        return 'bg-indigo-100 text-indigo-800';
      case 'ready':
        return 'bg-green-100 text-green-800';
      case 'delivered':
        return 'bg-emerald-100 text-emerald-800';
      case 'cancelled':
        return 'bg-gray-200 text-gray-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const statusLabel = (status: Order['status']) => {
    const map: Record<Order['status'], string> = {
      pending: 'Pendiente',
      confirmed: 'Confirmado',
      preparing: 'Preparando',
      ready: 'Listo',
      delivered: 'Entregado',
      cancelled: 'Cancelado',
    };
    return map[status] || status;
  };

  if (isLoading || loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
      </div>
    );
  }

  if (!isLoggedIn) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center flex-col gap-4">
        <p className="text-gray-700">Debes iniciar sesión para ver tus pedidos.</p>
        <div className="flex gap-3">
          <Link to="/login" className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700">Iniciar sesión</Link>
          <Link to="/register" className="px-4 py-2 text-sm font-medium text-red-600 border border-red-600 rounded-md hover:bg-red-50">Registrarse</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Mis pedidos</h1>
      </div>

      {orders.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm p-6 text-center">
          <p className="text-gray-600">Aún no tienes pedidos.</p>
          <button onClick={() => navigate('/')} className="mt-4 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md">Ir al menú</button>
        </div>
      ) : (
        <div className="grid gap-4">
          {orders.map(o => (
            <div key={o.id} className="bg-white rounded-lg shadow-sm p-5">
              {/* Resumen del pedido */}
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="text-sm text-gray-500">Pedido</div>
                  <div className="font-semibold">{o.order_number}</div>
                  <div className="text-xs text-gray-500">{formatDate(o.created_at)}</div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-500">Estado</div>
                  <div className={`inline-flex items-center px-2 py-1 text-xs rounded-full ${statusStyle(o.status)}`}>
                    {statusLabel(o.status)}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-500">Total</div>
                  <div className="font-semibold">${Number(o.total_amount).toLocaleString('es-CL')}</div>
                </div>
              </div>

              {/* Lista de items (resumen) */}
              <div className="mt-4 space-y-2">
                {o.items.map(item => (
                  <div key={item.id} className="flex items-start justify-between">
                    <div className="text-sm">
                      <div className="font-medium text-gray-900">{item.product_name}</div>
                      <div className="text-gray-600">Cantidad: x{item.quantity}</div>
                    </div>
                    <div className="text-sm text-gray-700 font-semibold">
                      ${Number(item.total_price).toLocaleString('es-CL')}
                    </div>
                  </div>
                ))}
              </div>
              {/* Acciones */}
              <div className="mt-4 flex justify-end">
                <button
                  onClick={() => openReview(o.id!)}
                  className="px-3 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
                >
                  Dejar reseña
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
      {/* Modal */}
      <ReviewModal
        open={isReviewOpen}
        onClose={closeReview}
        rating={reviewRating}
        setRating={setReviewRating}
        hover={reviewHover}
        setHover={setReviewHover}
        comment={reviewComment}
        setComment={setReviewComment}
        onSubmit={submitReview}
        submitting={submittingReview}
      />
    </div>
  );
}

// Modal de reseña
function ReviewModal({
  open,
  onClose,
  rating,
  setRating,
  hover,
  setHover,
  comment,
  setComment,
  onSubmit,
  submitting,
}: {
  open: boolean;
  onClose: () => void;
  rating: number;
  setRating: (n: number) => void;
  hover: number | null;
  setHover: (n: number | null) => void;
  comment: string;
  setComment: (s: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  submitting: boolean;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-xl shadow-lg w-full max-w-md mx-4 p-6">
        <h3 className="text-lg font-semibold text-gray-900">Dejar una reseña</h3>
        <p className="text-sm text-gray-600 mt-1">Cuéntanos cómo fue tu experiencia</p>

        {/* Estrellas */}
        <div className="mt-4 flex items-center gap-1">
          {Array.from({ length: 5 }).map((_, i) => {
            const index = i + 1;
            const active = (hover ?? rating) >= index;
            return (
              <button
                key={index}
                type="button"
                onClick={() => setRating(index)}
                onMouseEnter={() => setHover(index)}
                onMouseLeave={() => setHover(null)}
                className="p-1"
                aria-label={`${index} estrellas`}
              >
                <Star className={`w-6 h-6 ${active ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
              </button>
            );
          })}
          <span className="ml-2 text-sm text-gray-600">{rating}/5</span>
        </div>

        {/* Comentario */}
        <form onSubmit={onSubmit} className="mt-4 space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Comentario</label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              required
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
              placeholder="Escribe tu experiencia..."
            />
          </div>
          <div className="flex justify-end gap-2">
            <button type="button" onClick={onClose} className="px-3 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50" disabled={submitting}>Cancelar</button>
            <button type="submit" className="px-3 py-2 text-sm bg-red-600 hover:bg-red-700 text-white rounded-md disabled:opacity-60" disabled={submitting}>
              {submitting ? 'Enviando...' : 'Enviar reseña'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
