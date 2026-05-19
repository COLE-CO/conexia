import { useContext } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import {
  CASH_FLOW_ALLOWED_ROLES,
  NOTIFICATIONS_ALLOWED_ROLES,
} from '../constants/authorization';
import { useCompany } from '../context/CompanyContext';
import { useSidebar } from '../context/SidebarContext';
import {
  LayoutDashboard,
  Briefcase,
  ArrowLeftRight,
  CreditCard,
  FileText,
  BarChart2,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Bell,
} from 'lucide-react';

const mainItems = [
  {
    label: 'Dashboard',
    icon: LayoutDashboard,
    path: '/dashboard',
    roles: ['admin', 'contador_family_office', 'contador_cole_co'],
  },
  {
    label: 'Family Office',
    icon: Briefcase,
    path: '/family-office',
    roles: ['admin', 'contador_family_office'],
  },
  {
    label: 'Flujo de Caja',
    icon: ArrowLeftRight,
    path: '/flujo-de-caja',
    roles: [...CASH_FLOW_ALLOWED_ROLES],
  },
  {
    label: 'Pagos',
    icon: CreditCard,
    path: '/pagos',
    roles: ['admin', 'contador_cole_co'],
  },
  {
    label: 'Facturas',
    icon: FileText,
    path: '/facturas',
    roles: ['admin', 'contador_cole_co'],
  },
  {
    label: 'Reportes',
    icon: BarChart2,
    path: '/reportes',
    roles: ['admin', 'contador_family_office'],
  },
];

export default function Sidebar() {
  const { isExpanded, toggle } = useSidebar();
  const { logout, user } = useContext(AuthContext);
  const { clearActiveCompany } = useCompany();
  const navigate = useNavigate();
  const roleLabel = user?.role?.replaceAll('_', ' ');
  const hasNotificationsAccess =
    !!user?.role &&
    NOTIFICATIONS_ALLOWED_ROLES.includes(
      user.role as 'admin' | 'contador_family_office'
    );
  const hasEnabledAlerts =
    !!user?.alert_deadlines_enabled ||
    !!user?.alert_balances_enabled ||
    !!user?.alert_reports_enabled;
  const canSeeNotifications = hasNotificationsAccess && hasEnabledAlerts;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="relative flex-shrink-0">
      <aside
        className={`
        ${isExpanded ? 'w-64' : 'w-[70px]'}
        min-h-screen bg-primary flex flex-col transition-all duration-300 border-r border-primary-hover/60 shadow-2xl
      `}
      >
        {/* Header */}
        <div className="flex items-center px-4 py-5">
          {isExpanded ? (
            <div className="w-full">
              <div className="flex items-center gap-3">
                <img
                  src="/logo-conexia.svg"
                  alt="Conexia"
                  className="w-7 h-7"
                />
                <span className="text-white font-bold text-lg tracking-tight">
                  Conexia
                </span>
              </div>
              {roleLabel && (
                <div className="mt-2.5 flex items-center gap-1.5 text-[11px] tracking-wide text-neutral-border/90">
                  <span className="w-1.5 h-1.5 rounded-full bg-secondary" />
                  <span className="font-medium truncate">{roleLabel}</span>
                </div>
              )}
            </div>
          ) : (
            <div className="mx-auto">
              <img src="/logo-conexia.svg" alt="Conexia" className="w-7 h-7" />
            </div>
          )}
        </div>

        {/* Nav principal */}
        <nav className="flex-1 px-2">
          {mainItems
            .filter((item) => user?.role && item.roles.includes(user.role))
            .map(({ label, icon: Icon, path }) => (
              <NavLink
                key={path}
                to={path}
                onClick={() => {
                  if (path === '/family-office') {
                    clearActiveCompany();
                  }
                }}
                className={({ isActive }) => `
                  flex items-center gap-3 pl-2.5 pr-3 py-2.5 rounded-lg mb-1 no-underline transition-all duration-200 border-l-2
                  ${!isExpanded ? 'justify-center' : ''}
                  ${
                    isActive
                      ? 'border-secondary bg-primary-hover text-white shadow-lg shadow-black/20'
                      : 'border-transparent text-neutral-border hover:bg-primary-hover hover:text-white hover:translate-x-[1px]'
                  }
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
          {canSeeNotifications && (
            <NavLink
              to="/notificaciones"
              className={({ isActive }) => `
                relative flex items-center gap-3 pl-2.5 pr-3 py-2.5 rounded-lg no-underline transition-all duration-200 border-l-2
                ${!isExpanded ? 'justify-center' : ''}
                ${
                  isActive
                    ? 'border-secondary bg-primary-hover text-white shadow-lg shadow-black/20'
                    : 'border-transparent text-neutral-border hover:bg-primary-hover hover:text-white hover:translate-x-[1px]'
                }
              `}
            >
              <Bell size={20} className="flex-shrink-0" />
              {isExpanded && (
                <span className="text-sm whitespace-nowrap">
                  Notificaciones
                </span>
              )}
            </NavLink>
          )}

          {/* Ajustes */}
          <NavLink
            to="/ajustes"
            className={({ isActive }) => `
              flex items-center gap-3 pl-2.5 pr-3 py-2.5 rounded-lg no-underline transition-all duration-200 border-l-2
              ${!isExpanded ? 'justify-center' : ''}
              ${
                isActive
                  ? 'border-secondary bg-primary-hover text-white shadow-lg shadow-black/20'
                  : 'border-transparent text-neutral-border hover:bg-primary-hover hover:text-white hover:translate-x-[1px]'
              }
            `}
          >
            <Settings size={20} className="flex-shrink-0" />
            {isExpanded && (
              <span className="text-sm whitespace-nowrap">Ajustes</span>
            )}
          </NavLink>

          {/* Cerrar sesión */}
          <button
            onClick={handleLogout}
            className={`
              flex items-center gap-3 text-neutral-border bg-transparent border-none cursor-pointer px-3 py-2.5 rounded-lg w-full hover:bg-primary-hover hover:text-white transition-all duration-200 hover:translate-x-[1px]
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
        aria-label={
          isExpanded ? 'Minimizar barra lateral' : 'Expandir barra lateral'
        }
        className="absolute -right-3 top-6 z-10 bg-white border border-neutral-border rounded-full w-6 h-6 flex items-center justify-center cursor-pointer shadow-md hover:shadow-lg transition-shadow duration-200"
      >
        {isExpanded ? (
          <ChevronLeft size={14} className="text-primary" />
        ) : (
          <ChevronRight size={14} className="text-primary" />
        )}
      </button>
    </div>
  );
}
