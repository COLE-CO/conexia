import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../services/authService';
import { AuthContext } from '../context/AuthContext';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate(); 
  const { loginState } = useContext(AuthContext); 

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = await login(email, password);
      await loginState(data.access_token);
      navigate('/dashboard');
    } catch (err: any) {
      setError('Credenciales incorrectas o usuario no autorizado.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-bg">
      <div className="bg-neutral-surface p-8 rounded-lg shadow-md w-full max-w-md border border-neutral-border">
        <h2 className="text-2xl font-bold text-center text-primary mb-6 font-hubot">
          Ingreso a Conexia
        </h2>
        
        {error && (
          <div className="bg-danger/10 border border-danger text-danger px-4 py-2 rounded mb-4 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-neutral-text mb-1">Correo Electrónico</label>
            <input
              type="email"
              required
              className="w-full px-3 py-2 border border-neutral-border rounded focus:outline-none focus:border-primary"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-neutral-text mb-1">Contraseña</label>
            <input
              type="password"
              required
              className="w-full px-3 py-2 border border-neutral-border rounded focus:outline-none focus:border-primary"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary hover:bg-primary-hover text-white font-bold py-2 px-4 rounded transition-colors disabled:opacity-50"
          >
            {loading ? 'Ingresando...' : 'Acceder'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;