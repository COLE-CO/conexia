import { useContext } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { useSidebar } from '../context/SidebarContext';
import {
  LayoutDashboard,
  Briefcase,
  ArrowLeftRight,
  FileText,
  BarChart2,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Bell,
} from 'lucide-react';

const mainItems = [
  { label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
  { label: 'Family Office', icon: Briefcase, path: '/family-office' },
  { label: 'Flujo de Caja', icon: ArrowLeftRight, path: '/flujo-de-caja' },
  { label: 'Facturas', icon: FileText, path: '/facturas' },
  { label: 'Reportes', icon: BarChart2, path: '/reportes' },
];

export default function Sidebar() {
  const { isExpanded, toggle } = useSidebar();
  const { logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="relative flex-shrink-0">
      <aside className={`
        ${isExpanded ? 'w-64' : 'w-[70px]'}
        min-h-screen bg-primary flex flex-col transition-all duration-300
      `}>

        {/* Header */}
        <div className="flex items-center px-4 py-5">
          {isExpanded ? (
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-3">
                <img src="/src/assets/logo-conexia.svg" alt="Conexia" className="w-7 h-7" />
                <span className="text-white font-bold text-lg">Conexia</span>
              </div>
              
            </div>
          ) : (
            <div className="mx-auto">
              <img src="/src/assets/logo-conexia.svg" alt="Conexia" className="w-7 h-7" />
            </div>
          )}
        </div>

        {/* Nav principal */}
        <nav className="flex-1 px-2">
          {mainItems.map(({ label, icon: Icon, path }) => (
            <NavLink
              key={path}
              to={path}
              className={({ isActive }) => `
                flex items-center gap-3 px-3 py-2.5 rounded-lg mb-1 no-underline transition-colors duration-200
                ${!isExpanded ? 'justify-center' : ''}
                ${isActive
                  ? 'bg-primary-hover text-white'
                  : 'text-neutral-border hover:bg-primary-hover hover:text-white'}
              `}
            >
              <Icon size={20} className="flex-shrink-0" />
              {isExpanded && (
                <span className="text-sm whitespace-nowrap">{label}</span>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Sección inferior */}
        <div className="px-2 pb-2 flex flex-col gap-1">

          {/* Notificaciones */}
          <NavLink
            to="/notificaciones"
            className={({ isActive }) => `
              flex items-center gap-3 px-3 py-2.5 rounded-lg no-underline transition-colors duration-200
              ${!isExpanded ? 'justify-center' : ''}
              ${isActive
                ? 'bg-primary-hover text-white'
                : 'text-neutral-border hover:bg-primary-hover hover:text-white'}
            `}
          >
            <Bell size={20} className="flex-shrink-0" />
            {isExpanded && <span className="text-sm whitespace-nowrap">Notificaciones</span>}
          </NavLink>

          {/* Ajustes */}
          <NavLink
            to="/ajustes"
            className={({ isActive }) => `
              flex items-center gap-3 px-3 py-2.5 rounded-lg no-underline transition-colors duration-200
              ${!isExpanded ? 'justify-center' : ''}
              ${isActive
                ? 'bg-primary-hover text-white'
                : 'text-neutral-border hover:bg-primary-hover hover:text-white'}
            `}
          >
            <Settings size={20} className="flex-shrink-0" />
            {isExpanded && <span className="text-sm whitespace-nowrap">Ajustes</span>}
          </NavLink>

          {/* Cerrar sesión */}
          <button
            onClick={handleLogout}
            className={`
              flex items-center gap-3 text-neutral-border bg-transparent border-none cursor-pointer px-3 py-2.5 rounded-lg w-full hover:bg-primary-hover hover:text-white transition-colors duration-200
              ${!isExpanded ? 'justify-center' : ''}
            `}
          >
            <LogOut size={20} className="flex-shrink-0" />
            {isExpanded && <span className="text-sm">Cerrar sesión</span>}
          </button>
        </div>
      </aside>

      {/* Botón toggle flotante */}
      <button
        onClick={toggle}
        className="absolute -right-3 top-6 z-10 bg-white border border-neutral-border rounded-full w-6 h-6 flex items-center justify-center cursor-pointer shadow-md hover:shadow-lg transition-shadow duration-200"
      >
        {isExpanded ? <ChevronLeft size={14} className="text-primary" /> : <ChevronRight size={14} className="text-primary" />}
      </button>
    </div>
  );
}