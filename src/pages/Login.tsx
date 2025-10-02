import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { isAdmin } from '../services/auth';

export default function Login() {
  const { login, isLoading } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: '', password: '' });
  const [error, setError] = useState<string | null>(null);

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      await login(form.username, form.password);
      if (isAdmin()) {
        navigate('/admin');
      } else {
        navigate('/');
      }
    } catch (err: any) {
      setError('Credenciales inválidas. Inténtalo nuevamente.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white shadow-sm rounded-lg p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Iniciar sesión</h1>
        <div className="mb-4 p-3 rounded bg-yellow-50 text-yellow-800 text-sm">
          Modo demo: para entrar como <strong>administrador</strong>, usa un usuario que contenga "admin".
          Ejemplo: usuario <code>admin</code> y cualquier contraseña.
        </div>
        {error && (
          <div className="mb-4 p-3 rounded bg-red-50 text-red-700 text-sm">{error}</div>
        )}
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Usuario</label>
            <input
              type="text"
              name="username"
              value={form.username}
              onChange={onChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña</label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={onChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-red-600 hover:bg-red-700 text-white py-2 rounded-md font-semibold"
          >
            {isLoading ? 'Ingresando...' : 'Ingresar'}
          </button>
        </form>
        <p className="text-sm text-gray-600 mt-4">
          ¿No tienes cuenta?{' '}
          <Link to="/register" className="text-red-600 hover:underline">Regístrate</Link>
        </p>
      </div>
    </div>
  );
}
