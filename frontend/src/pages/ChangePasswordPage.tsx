import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { changePassword } from '../services/authService';
import { AuthContext } from '../context/AuthContext';

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
      
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Error al actualizar la contraseña');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-bg">
      <div className="bg-neutral-surface p-8 rounded-lg shadow-md w-full max-w-md border border-neutral-border">
        <h2 className="text-2xl font-bold text-center text-primary mb-2 font-hubot">
          Actualización de Seguridad
        </h2>
        <p className="text-sm text-neutral-text text-center mb-6">
          Por políticas de Conexia, debes asignar una nueva contraseña definitiva antes de continuar.
        </p>
        
        {error && (
          <div className="bg-danger/10 border border-danger text-danger px-4 py-2 rounded mb-4 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-neutral-text mb-1">Nueva Contraseña</label>
            <input
              type="password"
              required
              className="w-full px-3 py-2 border border-neutral-border rounded focus:outline-none focus:border-primary"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-neutral-text mb-1">Confirmar Contraseña</label>
            <input
              type="password"
              required
              className="w-full px-3 py-2 border border-neutral-border rounded focus:outline-none focus:border-primary"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary hover:bg-primary-hover text-white font-bold py-2 px-4 rounded transition-colors disabled:opacity-50"
          >
            {loading ? 'Actualizando...' : 'Guardar y Continuar'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChangePasswordPage;