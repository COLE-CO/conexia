import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';

import DashboardPage from '../pages/DashboardPage';
import { AuthContext } from '../context/AuthContext';
import type { UserProfile } from '../services/authService';

const navigateMock = vi.fn();
const clearActiveCompanyMock = vi.fn();
const logoutMock = vi.fn();
const useDashboardDataMock = vi.fn();
const useDashboardMetricsMock = vi.fn();

vi.mock('../context/CompanyContext', () => ({
  useCompany: () => ({
    clearActiveCompany: clearActiveCompanyMock,
  }),
}));

vi.mock('../features/dashboard/hooks/useDashboardData', () => ({
  useDashboardData: (canSeeFamilyOfficeDashboard: boolean) =>
    useDashboardDataMock(canSeeFamilyOfficeDashboard),
}));

vi.mock('../features/dashboard/hooks/useDashboardMetrics', () => ({
  useDashboardMetrics: (deadlines: unknown[], dateRange: number) =>
    useDashboardMetricsMock(deadlines, dateRange),
}));

vi.mock('../features/dashboard/components/NoDashboardAccess', () => ({
  default: ({
    fullName,
    role,
    onLogout,
  }: {
    fullName?: string;
    role?: string;
    onLogout: () => void;
  }) => (
    <div>
      <p>Dashboard Operativo</p>
      <p>{fullName}</p>
      <p>{role}</p>
      <button onClick={onLogout}>Cerrar sesión</button>
    </div>
  ),
}));

vi.mock('../features/dashboard/components/DomainSwitcher', () => ({
  default: () => <div>Domain Switcher</div>,
}));

vi.mock('../features/dashboard/components/ColeCoDashboard', () => ({
  default: () => <div>COLE-CO Dashboard</div>,
}));

vi.mock('../features/dashboard/components/FamilyOfficeHeader', () => ({
  default: ({
    onCreateObligation,
  }: {
    onCreateObligation: () => void;
    currentDateText: string;
  }) => <button onClick={onCreateObligation}>Crear obligación</button>,
}));

vi.mock('../features/dashboard/components/DateRangeSelector', () => ({
  default: () => <div>Date Range Selector</div>,
}));

vi.mock('../features/dashboard/components/MetricsGrid', () => ({
  default: () => <div>Metrics Grid</div>,
}));

vi.mock('../features/dashboard/components/ChartsRow', () => ({
  default: () => <div>Charts Row</div>,
}));

vi.mock('../features/dashboard/components/PriorityList', () => ({
  default: () => <div>Priority List</div>,
}));

vi.mock('react-router-dom', async () => {
  const actual =
    await vi.importActual<typeof import('react-router-dom')>(
      'react-router-dom'
    );

  return {
    ...actual,
    useNavigate: () => navigateMock,
  };
});

const baseUser: UserProfile = {
  id: 1,
  email: 'qa@conexia.com',
  full_name: 'QA Analyst',
  role: 'contador_family_office',
  is_active: true,
  must_change_password: false,
  alert_deadlines_enabled: true,
  alert_balances_enabled: true,
  alert_reports_enabled: false,
  reminder_window_start_days: 5,
  reminder_window_end_days: 7,
};

function renderPage(user: UserProfile) {
  render(
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: true,
        loading: false,
        loginState: vi.fn(),
        logout: logoutMock,
        refreshUser: vi.fn(),
        patchUser: vi.fn(),
        setUser: vi.fn(),
      }}
    >
      <MemoryRouter>
        <DashboardPage />
      </MemoryRouter>
    </AuthContext.Provider>
  );
}

describe('DashboardPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useDashboardDataMock.mockReturnValue({
      deadlines: [],
      loading: false,
      error: null,
    });
    useDashboardMetricsMock.mockReturnValue({
      pendingCount: 0,
      completedCount: 0,
      overdueCount: 0,
      upcomingCount: 0,
      urgentItems: [],
      hiddenCount: 0,
      donutData: [],
      barData: [],
    });
  });

  it('muestra acceso restringido y permite cerrar sesion para roles sin dashboard', async () => {
    const user = userEvent.setup();

    renderPage({
      ...baseUser,
      role: 'otro_rol' as UserProfile['role'],
    });

    expect(screen.getByText('Dashboard Operativo')).toBeInTheDocument();
    expect(screen.getByText('QA Analyst')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /cerrar sesi.n/i }));

    expect(logoutMock).toHaveBeenCalled();
    expect(navigateMock).toHaveBeenCalledWith('/login');
  });

  it('redirige a crear obligacion desde el dashboard family office', async () => {
    const user = userEvent.setup();

    renderPage(baseUser);

    await user.click(screen.getByRole('button', { name: /crear obligaci.n/i }));

    expect(clearActiveCompanyMock).toHaveBeenCalled();
    expect(navigateMock).toHaveBeenCalledWith(
      '/family-office?tab=vencimientos&action=new-obligation'
    );
    expect(useDashboardDataMock).toHaveBeenCalledWith(true);
  });
});
