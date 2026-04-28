import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';

import { ProtectedRoute } from '../components/ProtectedRoute';
import { AuthContext } from '../context/AuthContext';
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

function renderProtectedRoute(user: UserProfile) {
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
      <MemoryRouter initialEntries={['/flujo-de-caja']}>
        <Routes>
          <Route
            path="/flujo-de-caja"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <div>Vista privada</div>
              </ProtectedRoute>
            }
          />
          <Route path="/dashboard" element={<div>Dashboard</div>} />
        </Routes>
      </MemoryRouter>
    </AuthContext.Provider>
  );
}

describe('ProtectedRoute', () => {
  it('redirige al dashboard cuando el rol no esta autorizado', () => {
    renderProtectedRoute(baseUser);

    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.queryByText('Vista privada')).not.toBeInTheDocument();
  });

  it('permite el acceso cuando el rol esta autorizado', () => {
    renderProtectedRoute({
      ...baseUser,
      role: 'admin',
    });

    expect(screen.getByText('Vista privada')).toBeInTheDocument();
  });
});
