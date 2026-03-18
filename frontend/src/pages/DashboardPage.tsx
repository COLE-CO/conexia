import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const DashboardPage = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-neutral-bg p-8">
      <div className="max-w-4xl mx-auto bg-neutral-surface p-7 rounded-2xl shadow-2xl border border-neutral-border animate-fade-in-up">
        <div className="flex items-center justify-between mb-6 pb-5 border-b border-neutral-border">
          <div>
            <h1 className="text-3xl font-bold text-primary font-hubot tracking-tight">
              Bienvenido al Dashboard
            </h1>
            <p className="text-sm text-neutral-muted mt-1">
              Resumen rápido de tu sesión activa en Conexia.
            </p>
          </div>
          <div className="px-3 py-1 rounded-full bg-secondary/15 text-secondary text-xs font-semibold uppercase tracking-wide">
            Activo
          </div>
        </div>

        <div className="bg-neutral-bg border border-neutral-border p-5 rounded-2xl mb-6">
          <p className="text-sm text-neutral-text mb-2"><strong className="text-primary">Usuario:</strong> {user?.full_name}</p>
          <p className="text-sm text-neutral-text mb-2"><strong className="text-primary">Email:</strong> {user?.email}</p>
          <p className="text-sm text-neutral-text mb-2"><strong className="text-primary">Rol:</strong> <span className="uppercase text-primary font-bold">{user?.role}</span></p>
          <p className="text-sm text-neutral-text"><strong className="text-primary">¿Debe cambiar clave?:</strong> {user?.must_change_password ? 'Sí (Bloqueado)' : 'No (Libre)'}</p>
        </div>

        <button 
          onClick={handleLogout}
          className="bg-danger text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors duration-200 shadow-md"
        >
          Cerrar Sesión
        </button>
      </div>
    </div>
  );
};

export default DashboardPage;