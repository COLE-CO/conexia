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
  PanelLeftClose,
  PanelLeftOpen,
} from 'lucide-react';

const navItems = [
  {
    section: 'Principal',
    items: [
      { label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
      { label: 'Family Office', icon: Briefcase, path: '/family-office' },
      { label: 'Flujo de Caja', icon: ArrowLeftRight, path: '/flujo-de-caja' },
      { label: 'Facturas', icon: FileText, path: '/facturas' },
      { label: 'Reportes', icon: BarChart2, path: '/reportes' },
    ],
  },
  {
    section: 'Sistema',
    items: [
      { label: 'Ajustes', icon: Settings, path: '/ajustes' },
    ],
  },
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
    <aside className={`
      ${isExpanded ? 'w-64' : 'w-[70px]'}
      min-h-screen bg-primary flex flex-col transition-all duration-300 flex-shrink-0
    `}>

      {/* Header */}
      <div className="flex items-center justify-between px-4 py-5">
        {isExpanded && (
          <div className="flex items-center gap-3">
            <div className="bg-secondary rounded-lg w-9 h-9 flex items-center justify-center text-white font-bold text-base">
              C
            </div>
            <span className="text-white font-bold text-lg">Conexia</span>
          </div>
        )}
        <button
          onClick={toggle}
          className={`text-white bg-transparent border-none cursor-pointer p-1 ${!isExpanded ? 'mx-auto' : ''}`}
        >
          {isExpanded ? <PanelLeftClose size={20} /> : <PanelLeftOpen size={20} />}
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2">
        {navItems.map(({ section, items }) => (
          <div key={section} className="mb-6">
            {isExpanded && (
              <p className="text-neutral-border text-xs px-2 mb-2 uppercase tracking-wide">
                {section}
              </p>
            )}
            {items.map(({ label, icon: Icon, path }) => (
              <NavLink
                key={path}
                to={path}
                className={({ isActive }) => `
                  flex items-center gap-3 px-3 py-2.5 rounded-lg mb-1 no-underline transition-colors duration-200
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
          </div>
        ))}
      </nav>

      {/* Logout */}
      <div className="p-4">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 text-neutral-border bg-transparent border-none cursor-pointer px-3 py-2.5 rounded-lg w-full hover:bg-primary-hover hover:text-white transition-colors duration-200"
        >
          <LogOut size={20} className="flex-shrink-0" />
          {isExpanded && <span className="text-sm">Cerrar sesión</span>}
        </button>
      </div>
    </aside>
  );
}