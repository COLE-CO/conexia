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
      <div className="max-w-4xl mx-auto bg-neutral-surface p-6 rounded-lg shadow border border-neutral-border">
        <h1 className="text-3xl font-bold text-primary mb-4 font-hubot">
          Bienvenido al Dashboard
        </h1>
        
        <div className="bg-secondary/20 p-4 rounded mb-6">
          <p><strong>Usuario:</strong> {user?.full_name}</p>
          <p><strong>Email:</strong> {user?.email}</p>
          <p><strong>Rol:</strong> <span className="uppercase text-primary font-bold">{user?.role}</span></p>
          <p><strong>¿Debe cambiar clave?:</strong> {user?.must_change_password ? 'Sí (Bloqueado)' : 'No (Libre)'}</p>
        </div>

        <button 
          onClick={handleLogout}
          className="bg-danger text-white px-4 py-2 rounded hover:bg-red-600 transition"
        >
          Cerrar Sesión
        </button>
      </div>
    </div>
  );
};

export default DashboardPage;