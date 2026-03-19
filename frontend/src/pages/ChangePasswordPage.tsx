import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { changePassword } from '../services/authService';
import { AuthContext } from '../context/AuthContext';

type ApiErrorResponse = {
  response?: {
    data?: {
      detail?: string;
    };
  };
};

const ChangePasswordPage = () => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { refreshUser } = useContext(AuthContext);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (newPassword !== confirmPassword) {
      setError('Las contraseñas no coinciden.');
      return;
    }
    if (newPassword.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres.');
      return;
    }

    setLoading(true);
    try {
      await changePassword(newPassword);
      await refreshUser();
      navigate('/dashboard');
    } catch (err: unknown) {
      const apiError = err as ApiErrorResponse;
      setError(
        apiError.response?.data?.detail || 'Error al actualizar la contraseña'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex flex-1 bg-primary items-center justify-center relative overflow-hidden">
        <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-white/5" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-white/5" />
        <div className="relative flex flex-col items-center gap-6">
          <img
            src="/logo-conexia.svg"
            alt="Conexia"
            className="w-64 h-64 brightness-0 invert"
          />
          <p className="text-white/60 text-sm tracking-widest uppercase">
            Plataforma Conexia
          </p>
        </div>
      </div>

      <div className="flex-1 lg:flex-[1.4] flex items-center justify-center px-12 bg-neutral-bg">
        <div className="w-full max-w-xl">
          <div className="lg:hidden flex justify-center mb-8">
            <img src="/logo-conexia.svg" alt="Conexia" className="w-24 h-24" />
          </div>

          <div className="bg-neutral-surface rounded-2xl shadow-2xl border border-neutral-border p-10 animate-fade-in-up">
            <h2 className="text-3xl font-bold text-primary mb-2 font-hubot tracking-tight">
              Actualización de Seguridad
            </h2>
            <p className="text-sm text-neutral-muted mb-8">
              Por políticas de Conexia, debes asignar una nueva contraseña
              definitiva antes de continuar.
            </p>

            {error && (
              <div className="bg-danger/10 border border-danger text-danger px-4 py-2 rounded mb-4 text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-neutral-text mb-1">
                  Nueva Contraseña
                </label>
                <input
                  type="password"
                  required
                  className="w-full px-4 py-3 border border-neutral-border rounded-lg bg-neutral-bg focus:outline-none focus:ring-2 focus:ring-secondary/30 focus:border-secondary transition-colors duration-200"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-text mb-1">
                  Confirmar Contraseña
                </label>
                <input
                  type="password"
                  required
                  className="w-full px-4 py-3 border border-neutral-border rounded-lg bg-neutral-bg focus:outline-none focus:ring-2 focus:ring-secondary/30 focus:border-secondary transition-colors duration-200"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-primary hover:bg-primary-hover text-white font-bold py-3 px-4 rounded-lg transition-colors duration-200 disabled:opacity-50 shadow-md mt-2"
              >
                {loading ? 'Actualizando...' : 'Guardar y Continuar'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChangePasswordPage;
