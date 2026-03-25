import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SettingsPage from '../pages/SettingsPage';
import { AuthContext } from '../context/AuthContext';
import { updateMe } from '../services/authService';
import type { UserProfile } from '../services/authService';

vi.mock('../services/authService', () => ({
  updateMe: vi.fn(),
}));

const updateMeMock = vi.mocked(updateMe);

const baseUser: UserProfile = {
  id: 7,
  email: 'qa@conexia.com',
  full_name: 'QA Analyst',
  role: 'contador_family_office',
  is_active: true,
  must_change_password: false,
  alert_deadlines_enabled: true,
  alert_balances_enabled: true,
  alert_reports_enabled: false,
};

function renderPage(user: UserProfile = baseUser) {
  const patchUser = vi.fn();
  const setUser = vi.fn();
  const refreshUser = vi.fn().mockResolvedValue(undefined);

  render(
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: true,
        loading: false,
        loginState: vi.fn(),
        logout: vi.fn(),
        refreshUser,
        patchUser,
        setUser,
      }}
    >
      <SettingsPage />
    </AuthContext.Provider>
  );

  return { patchUser, setUser, refreshUser };
}

describe('SettingsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('muestra los datos del usuario activo', () => {
    renderPage();

    expect(screen.getByDisplayValue('QA Analyst')).toBeInTheDocument();
    expect(screen.getByDisplayValue('qa@conexia.com')).toBeInTheDocument();
    expect(screen.getByText(/contador family office/i)).toBeInTheDocument();
  });

  it('permite alternar las alertas desde el perfil', async () => {
    const user = userEvent.setup();
    const { patchUser } = renderPage();

    await user.click(
      screen.getByRole('button', { name: /alternar alertas de vencimientos/i })
    );

    expect(patchUser).toHaveBeenCalledWith({
      alert_deadlines_enabled: false,
    });
  });

  it('guarda los cambios del perfil y muestra confirmacion', async () => {
    const user = userEvent.setup();
    const { setUser } = renderPage();
    const updatedUser: UserProfile = {
      ...baseUser,
      full_name: 'QA Lead',
    };
    updateMeMock.mockResolvedValue(updatedUser);

    const nameInput = screen.getByDisplayValue('QA Analyst');
    await user.clear(nameInput);
    await user.type(nameInput, 'QA Lead');
    await user.click(screen.getByRole('button', { name: /guardar cambios/i }));

    await waitFor(() => {
      expect(updateMeMock).toHaveBeenCalledWith({
        full_name: 'QA Lead',
        email: 'qa@conexia.com',
        alert_deadlines_enabled: true,
        alert_balances_enabled: true,
        alert_reports_enabled: false,
      });
      expect(setUser).toHaveBeenCalledWith(updatedUser);
    });

    expect(
      screen.getByText(/configuraci.n actualizada correctamente/i)
    ).toBeInTheDocument();
  });

  it('recupera el usuario si guardar falla', async () => {
    const user = userEvent.setup();
    const { refreshUser } = renderPage();
    updateMeMock.mockRejectedValue(new Error('save failed'));

    await user.click(screen.getByRole('button', { name: /guardar cambios/i }));

    await waitFor(() => {
      expect(refreshUser).toHaveBeenCalled();
    });

    expect(
      screen.getByText(/no fue posible guardar los cambios/i)
    ).toBeInTheDocument();
  });
});
