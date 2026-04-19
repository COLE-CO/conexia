import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { AuthContext } from '../context/AuthContext';
import { SidebarProvider } from '../context/SidebarContext';
import type { UserProfile } from '../services/authService';

const baseUser: UserProfile = {
  id: 1,
  email: 'qa@conexia.com',
  full_name: 'QA Analyst',
  role: 'contador_cole_co',
  is_active: true,
  must_change_password: false,
  alert_deadlines_enabled: true,
  alert_balances_enabled: false,
  alert_reports_enabled: false,
  reminder_window_start_days: 5,
  reminder_window_end_days: 7,
};

function renderSidebar(user: UserProfile = baseUser) {
  render(
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: true,
        loading: false,
        loginState: vi.fn(),
        logout: vi.fn(),
        refreshUser: vi.fn(),
        patchUser: vi.fn(),
        setUser: vi.fn(),
      }}
    >
      <MemoryRouter initialEntries={['/dashboard']}>
        <SidebarProvider>
          <Sidebar />
        </SidebarProvider>
      </MemoryRouter>
    </AuthContext.Provider>
  );
}

describe('Sidebar', () => {
  it('filtra opciones segun el rol del usuario', () => {
    renderSidebar();

    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.queryByText('Family Office')).not.toBeInTheDocument();
    expect(screen.queryByText('Notificaciones')).not.toBeInTheDocument();
  });

  it('oculta notificaciones cuando todas las alertas estan desactivadas', () => {
    renderSidebar({
      ...baseUser,
      alert_deadlines_enabled: false,
      alert_balances_enabled: false,
      alert_reports_enabled: false,
    });

    expect(screen.queryByText('Notificaciones')).not.toBeInTheDocument();
  });

  it('permite minimizar la barra lateral', async () => {
    const user = userEvent.setup();
    renderSidebar();

    await user.click(
      screen.getByRole('button', { name: /minimizar barra lateral/i })
    );

    expect(screen.queryByText('Dashboard')).not.toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /expandir barra lateral/i })
    ).toBeInTheDocument();
  });
});
